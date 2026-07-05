import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function getExtFromContentType(ct: string, fallback = '.jpg') {
  if (!ct) return fallback;
  if (ct.includes('png')) return '.png';
  if (ct.includes('jpeg') || ct.includes('jpg')) return '.jpg';
  if (ct.includes('svg')) return '.svg';
  if (ct.includes('gif')) return '.gif';
  return fallback;
}

async function tryFetchBuffer(url: string, retries = 2, maxBytes = 5 * 1024 * 1024) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const cl = res.headers.get('content-length');
      if (cl && Number(cl) > maxBytes) throw new Error('Too large');
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > maxBytes) throw new Error('Too large');
      return { buffer, contentType: res.headers.get('content-type') || '' };
    } catch (e) {
      if (attempt === retries) throw e;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw new Error('Failed to fetch');
}

async function main() {
  console.log('CLI: migrating external images to public/uploads...');
  await fs.mkdir(path.join(process.cwd(), 'public', 'uploads'), { recursive: true });
  const products = await prisma.product.findMany();

  async function processProduct(p: any) {
    const imgs: string[] = Array.isArray(p.images) ? p.images : (p.images ? JSON.parse(p.images) : []);
    let migrated = 0;
    const newImgs: string[] = [];
    for (let i = 0; i < imgs.length; i++) {
      const img = imgs[i];
      if (typeof img === 'string' && img.startsWith('http')) {
        try {
          const { buffer, contentType } = await tryFetchBuffer(img, 2, 5 * 1024 * 1024);
          const ext = getExtFromContentType(contentType, path.extname(img) || '.jpg');
          const filename = `${slugify(p.name)}-${i}-${Date.now()}${ext}`;
          const outPath = path.join(process.cwd(), 'public', 'uploads', filename);
          await fs.writeFile(outPath, buffer);
          newImgs.push(`/uploads/${filename}`);
          migrated++;
        } catch (e) {
          newImgs.push(img);
        }
      } else {
        newImgs.push(img);
      }
    }
    if (migrated > 0) {
      await prisma.product.update({ where: { id: p.id }, data: { images: JSON.stringify(newImgs) } });
      console.log(`Updated ${p.name}: migrated ${migrated} images`);
    }
    return { id: p.id, name: p.name, migrated };
  }

  // process with concurrency
  const CONCURRENCY = 4;
  const queue: any[] = [...products];
  const workers: Promise<any>[] = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push((async () => {
      while (queue.length) {
        const p = queue.shift();
        if (!p) break;
        await processProduct(p);
      }
    })());
  }
  await Promise.all(workers);
  await prisma.$disconnect();
  console.log('CLI migration complete.');
}

main().catch((e) => { console.error(e); process.exit(1); });
