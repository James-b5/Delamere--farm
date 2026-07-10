import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPrismaFallback } from '@/lib/prisma-safe';
import { safeJsonParse, serverErrorResponse } from '@/lib/api-utils';

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
          images: true,
          videos: true,
          specs: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      [],
      'fetch public products',
    );

    const formatted = (products as Array<Record<string, any>>).map((p: any) => {
      const images = safeJsonParse<string[]>(p.images, []);
      const normalizedImages = (images.length ? images : []).map((src) => {
        if (!src) return '/images/product-placeholder.svg';
        if (typeof src === 'string' && src.includes('via.placeholder.com')) {
          return '/images/product-placeholder.svg';
        }
        return src;
      });

      return {
        ...p,
        images: normalizedImages.length ? normalizedImages : ['/images/product-placeholder.svg'],
        videos: safeJsonParse<string[]>(p.videos, []),
        specs: safeJsonParse<Record<string, any>>(p.specs, {}),
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch public products:', error);
    return serverErrorResponse('Failed to fetch products');
  }
}
