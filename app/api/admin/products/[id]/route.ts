import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminOrModeratorAccess, badRequestResponse, serverErrorResponse } from '@/lib/api-utils';

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
      // Handle FormData for file uploads
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

    // Validate required fields
    if (!name || !description || price === undefined || stock === undefined) {
      return badRequestResponse('Missing required fields: name, description, price, stock');
    }

    // Validate price and stock are numbers
    if (typeof price !== 'number' || typeof stock !== 'number') {
      return badRequestResponse('Price and stock must be numbers');
    }

    if (price < 0 || stock < 0) {
      return badRequestResponse('Price and stock cannot be negative');
    }

    // Process new images if provided
    let processedImages = images;
    if (Array.isArray(images) && images.length > 0 && images[0] instanceof File) {
      processedImages = [];
      for (const file of images) {
        const buffer = await (file as File).arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUrl = `data:${(file as File).type};base64,${base64}`;
        (processedImages as string[]).push(dataUrl);
      }
    }

    // Process new videos if provided
    let processedVideos = videos;
    if (Array.isArray(videos) && videos.length > 0 && videos[0] instanceof File) {
      processedVideos = [];
      for (const file of videos) {
        const buffer = await (file as File).arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUrl = `data:${(file as File).type};base64,${base64}`;
        (processedVideos as string[]).push(dataUrl);
      }
    }

    // Process new documents if provided
    let processedDocuments = documents;
    if (Array.isArray(documents) && documents.length > 0 && documents[0] instanceof File) {
      processedDocuments = [];
      for (const file of documents) {
        const buffer = await (file as File).arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const dataUrl = `data:${(file as File).type};base64,${base64}`;
        (processedDocuments as string[]).push(dataUrl);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        category: category || null,
        breed: breed || null,
        healthStatus: healthStatus || null,
        ageOrWeight: ageOrWeight || null,
        images: JSON.stringify(processedImages),
        videos: JSON.stringify(processedVideos),
        documents: JSON.stringify(processedDocuments),
      },
    });

    // Parse JSON fields before returning
    return NextResponse.json({
      ...updated,
      images: updated.images ? JSON.parse(updated.images) : [],
      videos: updated.videos ? JSON.parse(updated.videos) : [],
      documents: updated.documents ? JSON.parse(updated.documents) : [],
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

    // Parse JSON fields
    return NextResponse.json({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      videos: product.videos ? JSON.parse(product.videos) : [],
      documents: product.documents ? JSON.parse(product.documents) : [],
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

    // Soft delete by setting deleted flag
    const updated = await prisma.product.update({
      where: { id },
      data: { deleted: true },
    });

    return NextResponse.json({
      ...updated,
      images: updated.images ? JSON.parse(updated.images) : [],
      videos: updated.videos ? JSON.parse(updated.videos) : [],
      documents: updated.documents ? JSON.parse(updated.documents) : [],
    });
  } catch (error) {
    console.error('Product delete error:', error);
    return serverErrorResponse('Failed to delete product');
  }
}
