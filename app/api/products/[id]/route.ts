import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, context: { params: any }) {
  try {
    // `params` can be a Promise in some Next versions; await to ensure we have the value
    const params = await context.params;
    const { id } = params || {};

    if (!id) {
      return NextResponse.json({ error: 'Missing product id' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        stock: true,
        category: true,
        breed: true,
        healthStatus: true,
        ageOrWeight: true,
        images: true,
        videos: true,
        specs: true,
        createdAt: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const safeParse = (val: unknown, fallback: any) => {
      try {
        if (!val) return fallback;
        return JSON.parse(val as unknown as string);
      } catch {
        return fallback;
      }
    };

    const parsedImages = safeParse(product.images, []);
    const parsedSpecs = safeParse(product.specs, {});
    const formatted = {
      ...product,
      images: parsedImages,
      image: parsedImages[0] || '/images/placeholder.jpg',
      videos: safeParse(product.videos, []),
      documents: Array.isArray(parsedSpecs.documents) ? parsedSpecs.documents : [],
      features: [],
      characteristics: parsedSpecs,
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch product by id:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
