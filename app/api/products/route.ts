import { NextResponse } from 'next/server';
import { getFallbackStoreSnapshot, prisma } from '@/lib/prisma';
import { withPrismaFallback } from '@/lib/prisma-safe';
import { safeJsonParse, serverErrorResponse } from '@/lib/api-utils';

// Public GET: List all products with their media
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const debugEnabled = url.searchParams.get('debug') === 'true';

    const supabaseUrl = Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL);
    const supabaseBucket = Boolean(process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_BUCKET);
    const supabaseKeySet = Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

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

    const fallbackProducts = Array.isArray((getFallbackStoreSnapshot() as any)?.product)
      ? (getFallbackStoreSnapshot() as any).product.filter((item: any) => item && item.deleted !== true)
      : [];

    const sourceProducts = Array.isArray(products) && products.length > 0
      ? products
      : fallbackProducts;

    const formatted = (sourceProducts as Array<Record<string, any>>).map((p: any) => {
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

    if (debugEnabled) {
      return NextResponse.json({
        products: formatted,
        debug: {
          supabaseUrl,
          supabaseBucket,
          supabaseKeySet,
        },
      });
    }

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch public products:', error);
    return serverErrorResponse('Failed to fetch products');
  }
}
