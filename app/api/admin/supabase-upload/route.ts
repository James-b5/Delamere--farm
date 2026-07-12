import { NextResponse } from 'next/server';
import { checkAdminOrModeratorAccess } from '@/lib/api-utils';

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

const SUPABASE_URL = normalizeEnv(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)?.replace(/\/+$/, '');
const SUPABASE_KEY = normalizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
const SUPABASE_BUCKET = normalizeEnv(process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_BUCKET);
const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY && SUPABASE_BUCKET && !isPlaceholderValue(SUPABASE_URL) && !isPlaceholderValue(SUPABASE_KEY) && !isPlaceholderValue(SUPABASE_BUCKET));

console.warn({
  SUPABASE_URL: Boolean(SUPABASE_URL),
  SUPABASE_KEY: Boolean(SUPABASE_KEY),
  SUPABASE_BUCKET: Boolean(SUPABASE_BUCKET),
  bucketName: SUPABASE_BUCKET,
});

if (!SUPABASE_URL || !SUPABASE_KEY || !SUPABASE_BUCKET) {
  console.warn('Supabase upload route is configured without all required env vars.');
}

export async function POST(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isConfigured) {
    return NextResponse.json({ error: 'Supabase storage not configured' }, { status: 500 });
  }

  try {
    const url = new URL(req.url);
    const body = await req.json();
    const { folder, originalName, contentType, debug } = body as {
      folder: string;
      originalName: string;
      contentType: string;
      debug?: boolean;
    };

    const debugEnabled = debug === true || url.searchParams.get('debug') === 'true';

    if (!folder || !originalName || !contentType) {
      return NextResponse.json({ error: 'Missing required upload parameters' }, { status: 400 });
    }

    const sanitizedFolder = folder.replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
    const sanitizedFileName = originalName.replace(/\\/g, '/').split('/').pop() ?? originalName;
    const key = `${sanitizedFolder}/${Date.now()}-${sanitizedFileName}`;
    const encodedKey = key.split('/').map((segment) => encodeURIComponent(segment)).join('/');
    const signUrl = `${SUPABASE_URL}/storage/v1/object/upload/sign/${SUPABASE_BUCKET}/${encodedKey}`;
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/${encodedKey}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    };
    if (SUPABASE_KEY) {
      headers.apikey = SUPABASE_KEY;
    }

    const response = await fetch(signUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ contentType, upsert: true, expiresIn: 60 }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      return NextResponse.json({
        error: `Supabase sign URL failed: ${response.status} ${text}`,
        debug: debugEnabled
          ? {
              userId: user.id ?? null,
              bucket: SUPABASE_BUCKET,
              key,
              signUrl,
              status: response.status,
              statusText: response.statusText,
            }
          : undefined,
      }, { status: 502 });
    }

    const data = await response.json() as { signedURL?: string; signedUrl?: string; url?: string; token?: string };
    const signedUploadUrl = data.signedURL || data.signedUrl || (data.url ? `${SUPABASE_URL}/storage/v1${data.url}` : null);

    if (!signedUploadUrl) {
      return NextResponse.json({
        error: 'Supabase sign URL response was missing the upload URL',
        debug: debugEnabled
          ? {
              userId: user.id ?? null,
              bucket: SUPABASE_BUCKET,
              key,
              signUrl,
              responseBody: data,
            }
          : undefined,
      }, { status: 502 });
    }

    return NextResponse.json({
      signedUrl: signedUploadUrl,
      publicUrl,
      debug: debugEnabled
        ? {
            userId: user.id ?? null,
            bucket: SUPABASE_BUCKET,
            key,
            signUrl,
            publicUrl,
          }
        : undefined,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to create Supabase upload signature',
      details: error instanceof Error ? error.message : String(error),
      debug: true,
    }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({
    supabaseUrl: Boolean(SUPABASE_URL),
    supabaseKey: Boolean(SUPABASE_KEY),
    supabaseBucket: Boolean(SUPABASE_BUCKET),
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ?? null,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : null,
      NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ? 'SET' : null,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : null,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : null,
      SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET ?? null,
      SUPABASE_BUCKET: process.env.SUPABASE_BUCKET ?? null,
    },
  });
}
