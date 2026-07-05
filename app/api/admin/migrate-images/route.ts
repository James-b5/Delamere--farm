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

// Simple concurrency pool
async function mapWithConcurrency<T, R>(items: T[], pool: number, fn: (t: T) => Promise<R>) {
  const results: R[] = [];
  const executing: Promise<void>[] = [];
  for (const item of items) {
    const p = (async () => {
      const r = await fn(item);
      results.push(r);
    })();
    executing.push(p);
    if (executing.length >= pool) {
      await Promise.race(executing);
      // remove fulfilled
      for (let i = executing.length - 1; i >= 0; i--) {
        if ((executing[i] as any).resolved) executing.splice(i, 1);
      }
    }
  }
  await Promise.all(executing);
  return results;
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
      // small backoff
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
  throw new Error('Failed to fetch');
}

const LOG_PATH = path.join(process.cwd(), 'data', 'migration-log.json');

async function appendLog(entry: any) {
  try {
    await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
    let arr: any[] = [];
    try {
      const raw = await fs.readFile(LOG_PATH, 'utf8');
      arr = JSON.parse(raw);
    } catch {
      arr = [];
    }
    arr.push(entry);
    await fs.writeFile(LOG_PATH, JSON.stringify(arr, null, 2));
  } catch (e) {
    // ignore logging errors
    console.error('Log write failed', e);
  }
}

export async function POST(req: Request) {
  const host = req.headers.get('host') || '';
  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(uploadsDir, { recursive: true });

  const CURRENT_PATH = path.join(process.cwd(), 'data', 'migration-current.json');
  // initialize current run file
  try {
    await fs.writeFile(CURRENT_PATH, JSON.stringify({ ts: new Date().toISOString(), status: 'running', progress: [] }, null, 2));
  } catch (e) {
    // ignore
  }

  const products = await prisma.product.findMany();
  const summary: any[] = [];

  // process products in parallel with limited concurrency
  await mapWithConcurrency(products, 4, async (p) => {
    const record: any = { id: p.id, name: p.name, migrated: 0, skipped: 0, items: [] };
    try {
      const imgs: string[] = Array.isArray(p.images) ? p.images : (p.images ? JSON.parse(p.images) : []);
      if (!imgs || imgs.length === 0) {
        summary.push(record);
        // update current
        const cur = JSON.parse(await fs.readFile(CURRENT_PATH, 'utf8'));
        cur.progress.push({ id: p.id, name: p.name, migrated: 0, skipped: 0 });
        await fs.writeFile(CURRENT_PATH, JSON.stringify(cur, null, 2));
        return;
      }
      const newImgs: string[] = [];
      for (let i = 0; i < imgs.length; i++) {
        const img = imgs[i];
        const start = Date.now();
        if (typeof img === 'string' && img.startsWith('http')) {
          try {
            // small rate limit pause
            await new Promise(r => setTimeout(r, 120));
            const { buffer, contentType } = await tryFetchBuffer(img, 2, 5 * 1024 * 1024);
            const ext = getExtFromContentType(contentType, path.extname(img) || '.jpg');
            const filename = `${slugify(p.name)}-${i}-${Date.now()}${ext}`;
            const outPath = path.join(uploadsDir, filename);
            await fs.writeFile(outPath, buffer);
            newImgs.push(`/uploads/${filename}`);
            const duration = Date.now() - start;
            record.migrated++;
            record.items.push({ original: img, local: `/uploads/${filename}`, elapsedMs: duration, ok: true });
          } catch (e: any) {
            const duration = Date.now() - start;
            newImgs.push(img);
            record.skipped++;
            record.items.push({ original: img, error: String(e?.message || e), elapsedMs: duration, ok: false });
          }
        } else {
          newImgs.push(img);
        }
      }
      if (record.migrated > 0) {
        await prisma.product.update({ where: { id: p.id }, data: { images: JSON.stringify(newImgs) } });
      }
    } catch (e) {
      const err: any = e;
      record.error = String(err?.message ?? err);
    }
    summary.push(record);
    // update current progress file
    try {
      const curRaw = await fs.readFile(CURRENT_PATH, 'utf8');
      const cur = JSON.parse(curRaw);
      cur.progress.push(record);
      await fs.writeFile(CURRENT_PATH, JSON.stringify(cur, null, 2));
    } catch (e) {
      // ignore
    }
  });

  const logEntry = { ts: new Date().toISOString(), host: req.headers.get('host'), summary };
  await appendLog(logEntry);
  // finalize current run
  try {
    await fs.writeFile(CURRENT_PATH, JSON.stringify({ ts: new Date().toISOString(), status: 'done', summary }, null, 2));
  } catch (e) {
    // ignore
  }

  await prisma.$disconnect();
  return new Response(JSON.stringify({ success: true, summary }), { status: 200 });
}
