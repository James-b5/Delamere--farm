import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  const p = path.join(process.cwd(), 'data', 'migration-current.json');
  try {
    const raw = await fs.readFile(p, 'utf8');
    return new Response(raw, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 404 });
  }
}
