import { randomBytes } from 'crypto';
import path from 'path';

const normalizeEnv = (value?: string | null) => {
  if (!value) return null;
  let trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  if (!trimmed || trimmed.toLowerCase() === 'false' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
    return null;
  }
  return trimmed;
};

const isPlaceholderValue = (value: string | null | undefined) => {
  if (!value) return true;
  const normalized = value.toLowerCase();
  return normalized.includes('your-') || normalized.includes('placeholder') || normalized.includes('changeme') || normalized.includes('example') || normalized.includes('replace-with');
};

const supabaseUrl = normalizeEnv(process.env.SUPABASE_URL)?.replace(/\/+$/, '');
const supabaseKey = normalizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabaseBucket = normalizeEnv(process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_BUCKET);

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseKey && supabaseBucket && !isPlaceholderValue(supabaseUrl) && !isPlaceholderValue(supabaseKey) && !isPlaceholderValue(supabaseBucket));

function getObjectKey(originalName: string) {
  const ext = path.extname(originalName) || '';
  return `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
}

async function uploadFileToSupabase(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase storage is not fully configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.');
  }

  const key = getObjectKey(originalName);
  const url = `${supabaseUrl}/storage/v1/object/${supabaseBucket}/${encodeURIComponent(key)}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${supabaseKey}`,
    'Content-Type': mimeType,
    'x-upsert': 'true',
  };
  if (supabaseKey) {
    headers.apikey = supabaseKey;
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body: new Uint8Array(buffer),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase upload failed: ${response.status} ${body}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${encodeURIComponent(key)}`;
}

export async function uploadFile(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  if (isSupabaseConfigured()) {
    return await uploadFileToSupabase(buffer, originalName, mimeType);
  }

  throw new Error('No Supabase storage configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.');
}
