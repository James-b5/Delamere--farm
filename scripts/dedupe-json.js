const fs = require('fs');
const path = require('path');

const files = [
  'products.json',
  'products-local.json',
  'products-final.json',
  'migrate-result.json',
  'migrate-result2.json',
  'data/migration-current.json',
  'data/migration-log.json'
].map(f => path.join(__dirname, '..', f));

function dedupeArrayById(arr) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    if (item && typeof item === 'object' && item.id) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    } else {
      out.push(item);
    }
  }
  return out;
}

for (const file of files) {
  try {
    if (!fs.existsSync(file)) {
      console.log('skip (not found):', file);
      continue;
    }
    const raw = fs.readFileSync(file, 'utf8');
    let data = JSON.parse(raw);
    let changed = false;

    if (Array.isArray(data)) {
      // If array of objects with id at top level, dedupe
      if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null && 'id' in data[0]) {
        const deduped = dedupeArrayById(data);
        if (deduped.length !== data.length) {
          data = deduped;
          changed = true;
        }
      } else {
        // Probably an array of runs (migration-log) where each run has a 'summary' array
        const newArr = data.map(run => {
          if (run && run.summary && Array.isArray(run.summary)) {
            const before = run.summary.length;
            const deduped = dedupeArrayById(run.summary);
            if (deduped.length !== before) {
              run.summary = deduped;
              changed = true;
            }
          }
          return run;
        });
        data = newArr;
      }
    } else if (data && typeof data === 'object') {
      // If object contains arrays that likely need dedupe
      const keys = Object.keys(data);
      for (const k of keys) {
        if (Array.isArray(data[k])) {
          const arr = data[k];
          if (arr.length > 0 && typeof arr[0] === 'object' && 'id' in arr[0]) {
            const deduped = dedupeArrayById(arr);
            if (deduped.length !== arr.length) {
              data[k] = deduped;
              changed = true;
            }
          }
        }
      }
    }

    if (changed) {
      fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
      console.log('cleaned:', file);
    } else {
      console.log('no change:', file);
    }
  } catch (err) {
    console.error('error processing', file, err && err.message);
  }
}

console.log('done');
