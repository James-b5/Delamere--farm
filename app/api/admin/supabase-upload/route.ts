import { NextResponse } from 'next/server';
import { checkAdminOrModeratorAccess } from '@/lib/api-utils';

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_BUCKET;

if (!SUPABASE_URL || !SUPABASE_KEY || !SUPABASE_BUCKET) {
  console.warn('Supabase upload route is configured without all required env vars.');
}

export async function POST(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY || !SUPABASE_BUCKET) {
    return NextResponse.json({ error: 'Supabase storage not configured' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { folder, originalName, contentType } = body as { folder: string; originalName: string; contentType: string };

    if (!folder || !originalName || !contentType) {
      return NextResponse.json({ error: 'Missing required upload parameters' }, { status: 400 });
    }

    const key = `${folder}/${Date.now()}-${encodeURIComponent(originalName)}`;
    const signedUrl = `${SUPABASE_URL}/storage/v1/object/sign/${SUPABASE_BUCKET}/${encodeURIComponent(key)}`;
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${encodeURIComponent(key)}`;

    const response = await fetch(signedUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contentType, upsert: true }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      return NextResponse.json({ error: `Supabase sign URL failed: ${response.status} ${text}` }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json({ signedUrl: data.signedURL, publicUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create Supabase upload signature', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
