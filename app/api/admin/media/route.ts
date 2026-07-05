import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { withPrismaFallback } from '@/lib/prisma-safe';
import { checkAdminOrModeratorAccess, badRequestResponse, serverErrorResponse } from '@/lib/api-utils';
import { type NextRequest } from 'next/server';
import { uploadFile } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
// Simple logger that prefixes with request ID and timestamp
const log = (id: string, ...msg: any[]) => console.log(`[MediaUpload] ${id} - ${new Date().toISOString()}`, ...msg);

// Helper to save uploaded files
async function saveFile(file: File, folder: string): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // If S3 is configured, upload to S3 and return the public URL
  if (process.env.AWS_S3_BUCKET) {
    try {
      return await uploadFile(buffer, file.name, file.type || 'application/octet-stream');
    } catch (e) {
      const errMsg = (e as any)?.message ?? String(e);
      console.warn('S3 upload failed, falling back to local storage:', errMsg);
      // continue to local storage fallback
    }
  }

  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const filePath = `${process.cwd()}/public/uploads/${folder}/${fileName}`;
  await require('fs').promises.mkdir(`${process.cwd()}/public/uploads/${folder}`, { recursive: true });
  await require('fs').promises.writeFile(filePath, buffer);
  return `/uploads/${folder}/${fileName}`;
}

/** GET: List media items (public) */
export async function GET(req: NextRequest) {
  try {
    const media = await withPrismaFallback(
      () => prisma.media.findMany({ orderBy: { order: 'asc' } }),
      [],
      'fetch media list',
    );
    return NextResponse.json(media);
  } catch (e) {
    console.error('Media list error:', e);
    return serverErrorResponse('Failed to fetch media');
  }
}

/** POST: Upload media (images or videos) */
export async function POST(req: NextRequest) {
  const requestId = uuidv4();
  log(requestId, 'POST start');
  try { log(requestId, 'headers', Object.fromEntries((req as any).headers.entries())); } catch (e) { log(requestId, 'headers-err', (e as any)?.message ?? String(e)); }
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    log(requestId, 'unauthorized access');
    return NextResponse.json({ error: 'Unauthorized', requestId }, { status: 401 });
  }

  try {
    let formData: any;
    try {
      formData = await req.formData();
    } catch (inner) {
      try {
        const raw = await req.text();
        log(requestId, 'formData-parse-failed', (inner as any)?.message ?? String(inner), 'raw-preview', raw ? raw.substring(0, 2000) : '<empty>');
      } catch (rerr) {
        log(requestId, 'formData-parse-failed-could-not-read-raw', (rerr as any)?.message ?? String(rerr));
      }
      throw inner;
    }
    const type = (formData.get('type') as string)?.toUpperCase(); // IMAGE or VIDEO
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const order = Number(formData.get('order') ?? 0);
    const file = formData.get('file') as File;

    if (!type || !file) {
      log(requestId, 'missing type or file');
      return badRequestResponse('Missing type or file', requestId);
    }

    // Validate type
    if (!['IMAGE', 'VIDEO'].includes(type)) {
      log(requestId, 'invalid media type', type);
      return badRequestResponse('Invalid media type', requestId);
    }

    // Size validation
    const maxSize = type === 'VIDEO' ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxSize) {
      log(requestId, 'file too large', file.size);
      return badRequestResponse(`File exceeds maximum size of ${type === 'VIDEO' ? '50' : '15'} MB`, requestId);
    }

    const folder = type === 'VIDEO' ? 'videos' : 'images';
    const url = await saveFile(file, folder);
    log(requestId, 'file saved', url);

    const media = await prisma.media.create({
      data: { type: type as any, url, title, description, order },
    });
    log(requestId, 'media record created', media.id);
    try { revalidatePath('/'); } catch (e) { /* ignore revalidation errors */ }
    return NextResponse.json(media, { status: 201 });
  } catch (e) {
    log(requestId, 'upload error', e);
    console.error('Media upload error:', e);
    return serverErrorResponse('Failed to upload media', requestId);
  }
}

/** DELETE: Soft‑delete media by ID */
export async function DELETE(req: Request) {
  const requestId = uuidv4();
  log(requestId, 'DELETE start');
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized', requestId }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return badRequestResponse('Missing media id', requestId);

    await prisma.media.delete({ where: { id: Number(id) } });
    try { revalidatePath('/'); } catch (e) {}
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Media delete error:', e);
    return serverErrorResponse('Failed to delete media', requestId);
  }
}

/** PATCH: Update media metadata (title, description, order) */
export async function PATCH(req: NextRequest) {
  const requestId = uuidv4();
  log(requestId, 'PATCH start');
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    log(requestId, 'unauthorized access');
    return NextResponse.json({ error: 'Unauthorized', requestId }, { status: 401 });
  }

  try {
    // Debug: capture raw body for troubleshooting
    const raw = await req.text();
    log(requestId, 'raw-body', raw ? raw.substring(0, 2000) : '<empty>');
    const body = raw ? JSON.parse(raw) : {};
    const { id, title, description, order } = body as { id?: number; title?: string; description?: string; order?: number };
    if (!id) return badRequestResponse('Missing media id', requestId);

    const data: any = {};
    if (typeof title !== 'undefined') data.title = title;
    if (typeof description !== 'undefined') data.description = description;
    if (typeof order !== 'undefined') data.order = Number(order);

    const updated = await prisma.media.update({ where: { id: Number(id) }, data });
    log(requestId, 'media updated', updated.id);
    try { revalidatePath('/'); } catch (e) {}
    return NextResponse.json(updated);
  } catch (e) {
    log(requestId, 'update error', e);
    console.error('Media update error:', e);
    return serverErrorResponse('Failed to update media', requestId);
  }
}

