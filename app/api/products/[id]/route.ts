import { NextResponse } from 'next/server';
import { getFallbackStoreSnapshot, prisma } from '@/lib/prisma';

export async function GET(req: Request, context: { params: any }) {
  try {
    // `params` can be a Promise in some Next versions; await to ensure we have the value
    const url = new URL(req.url);
    const debugEnabled = url.searchParams.get('debug') === 'true';

    const params = await context.params;
    let id = params?.id;
    if (Array.isArray(id)) {
      id = id[0];
    }

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid product id' }, { status: 400 });
    }

    const slugify = (value: string) =>
      value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const lookupBySlug = async (slug: string) => {
      const products = await prisma.product.findMany({
        where: { deleted: false },
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
        },
      });

      const matchedProduct = products.find((product: { name?: string | null }) => slugify(product.name || '') === slug) || null;
      if (matchedProduct) {
        return matchedProduct;
      }

      const fallbackProducts = Array.isArray((getFallbackStoreSnapshot() as any)?.product)
        ? (getFallbackStoreSnapshot() as any).product.filter((item: any) => item && item.deleted !== true)
        : [];

      return fallbackProducts.find((product: { name?: string | null }) => slugify(product.name || '') === slug) || null;
    };

    let product = await prisma.product.findFirst({
      where: { id, deleted: false },
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
      },
    });

    if (!product) {
      const fallbackProducts = Array.isArray((getFallbackStoreSnapshot() as any)?.product)
        ? (getFallbackStoreSnapshot() as any).product.filter((item: any) => item && item.deleted !== true)
        : [];
      const fallbackMatch = fallbackProducts.find((item: any) => item.id === id);
      if (fallbackMatch) {
        product = fallbackMatch;
      } else {
        product = await lookupBySlug(id);
      }
    }

    if (!product) {
      const response = { error: 'Product not found' } as any;
      if (debugEnabled) {
        response.debug = {
          productId: id,
          supabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
          supabaseBucket: Boolean(process.env.SUPABASE_STORAGE_BUCKET || process.env.SUPABASE_BUCKET),
          supabaseKeySet: Boolean(
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
            process.env.SUPABASE_ANON_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          ),
        };
      }
      return NextResponse.json(response, { status: 404 });
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
      images: Array.isArray(parsedImages) ? parsedImages : [],
      image: Array.isArray(parsedImages) && parsedImages[0] ? parsedImages[0] : '/images/placeholder.jpg',
      videos: safeParse(product.videos, []),
      documents: Array.isArray(parsedSpecs.documents) ? parsedSpecs.documents : [],
      features: [],
      characteristics: parsedSpecs && typeof parsedSpecs === 'object' ? parsedSpecs : {},
    };

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Failed to fetch product by id:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
