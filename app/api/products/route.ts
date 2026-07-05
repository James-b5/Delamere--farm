import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPrismaFallback } from '@/lib/prisma-safe';
import { serverErrorResponse } from '@/lib/api-utils';

// Public GET: List all products with their media
export async function GET() {
  try {
    const products = await withPrismaFallback(
      () => prisma.product.findMany({
        where: { deleted: false },
        orderBy: { createdAt: 'desc' },
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
          documents: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      [],
      'fetch public products',
    );

    const formatted = (products as Array<Record<string, any>>).map((p: any) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      videos: p.videos ? JSON.parse(p.videos) : [],
      documents: p.documents ? JSON.parse(p.documents) : [],
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch public products:', error);
    return serverErrorResponse('Failed to fetch products');
  }
}
