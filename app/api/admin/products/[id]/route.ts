import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';
import { checkAdminOrModeratorAccess, badRequestResponse, safeJsonParse, serverErrorResponse } from '@/lib/api-utils';

async function fileToStorageOrDataUrl(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.AWS_S3_BUCKET || process.env.SUPABASE_URL) {
    try {
      return await uploadFile(buffer, file.name, file.type || 'application/octet-stream');
    } catch (error) {
      console.warn('File upload to external storage failed, storing as data URL instead:', error);
    }
  }

  const base64 = buffer.toString('base64');
  return `data:${file.type};base64,${base64}`;
}

function parseProductMetadata(specs?: string | null) {
  const parsed = safeJsonParse<Record<string, any>>(specs, {});

  return {
    category: typeof parsed.category === 'string' ? parsed.category : null,
    breed: typeof parsed.breed === 'string' ? parsed.breed : null,
    healthStatus: typeof parsed.healthStatus === 'string' ? parsed.healthStatus : null,
    ageOrWeight: typeof parsed.ageOrWeight === 'string' ? parsed.ageOrWeight : null,
    documents: Array.isArray(parsed.documents) ? parsed.documents : [],
  };
}

function buildSpecsPayload(values: Record<string, any>) {
  const payload: Record<string, any> = {};

  if (typeof values.category === 'string' && values.category.trim()) {
    payload.category = values.category.trim();
  }
  if (typeof values.breed === 'string' && values.breed.trim()) {
    payload.breed = values.breed.trim();
  }
  if (typeof values.healthStatus === 'string' && values.healthStatus.trim()) {
    payload.healthStatus = values.healthStatus.trim();
  }
  if (typeof values.ageOrWeight === 'string' && values.ageOrWeight.trim()) {
    payload.ageOrWeight = values.ageOrWeight.trim();
  }
  if (Array.isArray(values.documents)) {
    payload.documents = values.documents;
  }

  return JSON.stringify(payload);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const contentType = req.headers.get('content-type');

    let data: any;

    if (contentType?.includes('application/json')) {
      data = await req.json();
    } else {
      const formData = await req.formData();
      data = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: formData.get('price'),
        stock: formData.get('stock'),
        category: formData.get('category'),
        breed: formData.get('breed'),
        healthStatus: formData.get('healthStatus'),
        ageOrWeight: formData.get('ageOrWeight'),
        images: formData.getAll('images'),
        videos: formData.getAll('videos'),
        documents: formData.getAll('documents'),
      };
    }

    const { name, description, price, stock, category, breed, healthStatus, ageOrWeight, images = [], videos = [], documents = [] } = data;

    if (!name || !description || price === undefined || stock === undefined) {
      return badRequestResponse('Missing required fields: name, description, price, stock');
    }

    if (typeof price !== 'number' || typeof stock !== 'number') {
      return badRequestResponse('Price and stock must be numbers');
    }

    if (price < 0 || stock < 0) {
      return badRequestResponse('Price and stock cannot be negative');
    }

    let processedImages = images;
    if (Array.isArray(images) && images.length > 0) {
      processedImages = [];
      for (const item of images) {
        if (item instanceof File) {
          (processedImages as string[]).push(await fileToStorageOrDataUrl(item));
          continue;
        }
        if (typeof item === 'string') {
          (processedImages as string[]).push(item);
        }
      }
    }

    let processedVideos = videos;
    if (Array.isArray(videos) && videos.length > 0) {
      processedVideos = [];
      for (const item of videos) {
        if (item instanceof File) {
          (processedVideos as string[]).push(await fileToStorageOrDataUrl(item));
          continue;
        }
        if (typeof item === 'string') {
          (processedVideos as string[]).push(item);
        }
      }
    }

    let processedDocuments = documents;
    if (Array.isArray(documents) && documents.length > 0) {
      processedDocuments = [];
      for (const item of documents) {
        if (item instanceof File) {
          (processedDocuments as string[]).push(await fileToStorageOrDataUrl(item));
          continue;
        }
        if (typeof item === 'string') {
          (processedDocuments as string[]).push(item);
        }
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        images: JSON.stringify(processedImages),
        videos: JSON.stringify(processedVideos),
        specs: buildSpecsPayload({
          category,
          breed,
          healthStatus,
          ageOrWeight,
          documents: processedDocuments,
        }),
      },
    });

    const metadata = parseProductMetadata(updated.specs);

    return NextResponse.json({
      ...updated,
      ...metadata,
      images: updated.images ? JSON.parse(updated.images) : [],
      videos: updated.videos ? JSON.parse(updated.videos) : [],
      documents: metadata.documents ?? [],
    });
  } catch (error) {
    console.error('Product update error:', error);
    return serverErrorResponse('Failed to update product');
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const metadata = parseProductMetadata(product.specs);

    return NextResponse.json({
      ...product,
      ...metadata,
      images: product.images ? JSON.parse(product.images) : [],
      videos: product.videos ? JSON.parse(product.videos) : [],
      documents: metadata.documents ?? [],
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    return serverErrorResponse('Failed to fetch product');
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const updated = await prisma.product.update({
      where: { id },
      data: { deleted: true },
    });

    const metadata = parseProductMetadata(updated.specs);

    return NextResponse.json({
      ...updated,
      ...metadata,
      images: updated.images ? JSON.parse(updated.images) : [],
      videos: updated.videos ? JSON.parse(updated.videos) : [],
      documents: metadata.documents ?? [],
    });
  } catch (error) {
    console.error('Product delete error:', error);
    return serverErrorResponse('Failed to delete product');
  }
}
