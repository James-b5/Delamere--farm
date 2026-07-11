import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomBytes } from 'crypto';
import path from 'path';

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_BUCKET;

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

function getObjectKey(originalName: string) {
  const ext = path.extname(originalName) || '';
  return `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
}

async function uploadFileToSupabase(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  if (!supabaseUrl || !supabaseKey || !supabaseBucket) {
    throw new Error('Supabase storage is not fully configured. Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET.');
  }

  const key = getObjectKey(originalName);
  const url = `${supabaseUrl}/storage/v1/object/${supabaseBucket}/${encodeURIComponent(key)}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': mimeType,
      'x-upsert': 'true',
    },
    body: new Uint8Array(buffer),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase upload failed: ${response.status} ${body}`);
  }

  return `${supabaseUrl}/storage/v1/object/public/${supabaseBucket}/${encodeURIComponent(key)}`;
}

async function uploadFileToS3(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  const ext = path.extname(originalName);
  const key = `${randomBytes(16).toString('hex')}${ext}`;
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error('AWS_S3_BUCKET not set');

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read',
  });

  await s3.send(cmd);
  return `https://${bucket}.s3.amazonaws.com/${key}`;
}

export async function uploadFile(buffer: Buffer, originalName: string, mimeType: string): Promise<string> {
  if (supabaseUrl && supabaseKey && supabaseBucket) {
    return await uploadFileToSupabase(buffer, originalName, mimeType);
  }

  if (process.env.AWS_S3_BUCKET) {
    return await uploadFileToS3(buffer, originalName, mimeType);
  }

  throw new Error('No external storage configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET, or AWS_S3_BUCKET and AWS credentials.');
}
