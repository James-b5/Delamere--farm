import fs from 'fs/promises';
import path from 'path';

const LOG_PATH = path.join(process.cwd(), 'data', 'migration-log.json');

export async function GET() {
  try {
    const raw = await fs.readFile(LOG_PATH, 'utf8');
    const arr = JSON.parse(raw);
    return new Response(JSON.stringify({ success: true, logs: arr }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ success: true, logs: [] }), { status: 200 });
  }
}
