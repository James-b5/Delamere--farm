#!/usr/bin/env node
const fs = require('fs').promises;
const path = require('path');

async function readJson(file) {
  const txt = await fs.readFile(file, 'utf8');
  return JSON.parse(txt);
}

async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

async function backup(file) {
  const bak = `${file}.${Date.now()}.bak`;
  await fs.copyFile(file, bak);
  return bak;
}

async function dedupeFiles(files) {
  const seen = new Set();
  for (const file of files) {
    const abs = path.resolve(file);
    try {
      const arr = await readJson(abs);
      if (!Array.isArray(arr)) {
        console.warn(`${file}: not an array, skipping`);
        continue;
      }

      const originalCount = arr.length;
      const filtered = arr.filter((item) => {
        if (!item || !item.id) return true; // keep malformed entries
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      if (filtered.length !== originalCount) {
        const bak = await backup(abs);
        await writeJson(abs, filtered);
        console.log(`Cleaned ${file}: ${originalCount} -> ${filtered.length} (backup: ${bak})`);
      } else {
        console.log(`No change for ${file}`);
      }
    } catch (err) {
      console.error(`Failed processing ${file}:`, err.message || err);
    }
  }
}

const targetFiles = ['products.json', 'products-local.json', 'products-final.json'];
dedupeFiles(targetFiles).catch((e) => {
  console.error(e);
  process.exit(1);
});
