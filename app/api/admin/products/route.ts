import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminOrModeratorAccess, badRequestResponse, safeJsonParse, serverErrorResponse } from '@/lib/api-utils';

function collectFileInputs(formData: FormData, key: string): File[] {
  return formData.getAll(key).filter((item): item is File => item instanceof File);
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

// GET: List products
export async function GET(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { deleted: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        images: true,
        videos: true,
        specs: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const formattedProducts = products.map((p: any) => {
      const metadata = parseProductMetadata(p.specs);

      return {
        ...p,
        ...metadata,
        images: p.images ? JSON.parse(p.images) : [],
        videos: p.videos ? JSON.parse(p.videos) : [],
        documents: metadata.documents ?? [],
      };
    });

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return serverErrorResponse('Failed to fetch products');
  }
}

// POST: Create product with file uploads
export async function POST(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const contentType = req.headers.get('content-type') || '';

    let name: string | undefined;
    let description: string | undefined;
    let price: number | undefined;
    let stock: number | undefined;
    let category: string | undefined;
    let breed: string | null = null;
    let healthStatus: string | null = null;
    let ageOrWeight: string | null = null;
    let images: string[] = [];
    let videos: string[] = [];
    let documents: string[] = [];

    if (contentType.includes('application/json')) {
      const body = await req.json();
      name = body.name;
      description = body.description;
      price = typeof body.price === 'number' ? body.price : parseFloat(body.price?.toString?.() ?? 'NaN');
      stock = typeof body.stock === 'number' ? body.stock : parseInt(body.stock?.toString?.() ?? 'NaN');
      category = body.category;
      breed = body.breed ?? null;
      healthStatus = body.healthStatus ?? null;
      ageOrWeight = body.ageOrWeight ?? null;
      images = Array.isArray(body.images) ? body.images : [];
      videos = Array.isArray(body.videos) ? body.videos : [];
      documents = Array.isArray(body.documents) ? body.documents : [];
    } else {
      const formData = await req.formData();
      name = formData.get('name') as string;
      description = formData.get('description') as string;
      price = parseFloat(formData.get('price') as string);
      stock = parseInt(formData.get('stock') as string);
      category = formData.get('category') as string;
      breed = (formData.get('breed') as string) || null;
      healthStatus = (formData.get('healthStatus') as string) || null;
      ageOrWeight = (formData.get('ageOrWeight') as string) || null;

      const imageFiles = collectFileInputs(formData, 'images');
      if (imageFiles.length > 0) {
        if (imageFiles.length > 10) {
          return badRequestResponse('Maximum 10 images allowed');
        }

        for (const file of imageFiles) {
          if (!file.type.startsWith('image/')) {
            return badRequestResponse(`Invalid file type: ${file.name}. Only images are allowed.`);
          }

          if (file.size > 15 * 1024 * 1024) {
            return badRequestResponse(`File ${file.name} is too large. Maximum 15MB allowed.`);
          }

          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const dataUrl = `data:${file.type};base64,${base64}`;
          images.push(dataUrl);
        }
      }

      const videoFiles = collectFileInputs(formData, 'videoFiles');
      if (videoFiles.length > 0) {
        if (videoFiles.length > 5) {
          return badRequestResponse('Maximum 5 video files allowed');
        }

        for (const file of videoFiles) {
          if (!file.type.startsWith('video/')) {
            return badRequestResponse(`Invalid file type: ${file.name}. Only video files are allowed.`);
          }

          if (file.size > 15 * 1024 * 1024) {
            return badRequestResponse(`File ${file.name} is too large. Maximum 15MB allowed.`);
          }

          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const dataUrl = `data:${file.type};base64,${base64}`;
          videos.push(dataUrl);
        }
      }

      formData.getAll('videos').forEach((video) => {
        const url = video.toString().trim();
        if (url) {
          try {
            new URL(url);
            videos.push(url);
          } catch {
            console.warn(`Invalid video URL: ${url}`);
          }
        }
      });

      if (videos.length > 8) {
        return badRequestResponse('Maximum 8 videos allowed (files + URLs)');
      }

      const documentFiles = collectFileInputs(formData, 'documents');
      if (documentFiles.length > 0) {
        if (documentFiles.length > 5) {
          return badRequestResponse('Maximum 5 documents allowed');
        }

        for (const file of documentFiles) {
          const ALLOWED_DOC_TYPES = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
          ];

          if (!ALLOWED_DOC_TYPES.includes(file.type)) {
            return badRequestResponse(`Invalid file type: ${file.name}. Only PDF, Word, and TXT documents are allowed.`);
          }

          if (file.size > 15 * 1024 * 1024) {
            return badRequestResponse(`File ${file.name} is too large. Maximum 15MB allowed.`);
          }

          const buffer = await file.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const dataUrl = `data:${file.type};base64,${base64}`;
          documents.push(dataUrl);
        }
      }
    }

    if (!name || !description || price === undefined || stock === undefined || isNaN(price) || isNaN(stock)) {
      return badRequestResponse('Missing or invalid required fields: name, description, price, stock');
    }

    if (price <= 0) {
      return badRequestResponse('Price must be greater than 0');
    }

    if (stock < 0) {
      return badRequestResponse('Stock cannot be negative');
    }

    const allVideos = [...videos];

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        images: JSON.stringify(images),
        videos: JSON.stringify(allVideos),
        specs: buildSpecsPayload({
          category,
          breed,
          healthStatus,
          ageOrWeight,
          documents,
        }),
      },
    });

    const metadata = parseProductMetadata(product.specs);

    return NextResponse.json(
      {
        ...product,
        ...metadata,
        images: product.images ? JSON.parse(product.images) : [],
        videos: product.videos ? JSON.parse(product.videos) : [],
        documents: metadata.documents ?? [],
      },
      { status: 201 }
    );
  } catch (error) {
    const details = error instanceof Error ? `${error.message}${error.stack ? '\n' + error.stack : ''}` : String(error);
    console.error('Failed to create product:', error);
    return serverErrorResponse('Failed to create product', undefined, process.env.NODE_ENV !== 'production' ? details : undefined);
  }
}
