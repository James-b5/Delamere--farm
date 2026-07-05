import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminOrModeratorAccess, serverErrorResponse } from '@/lib/api-utils';

/**
 * Bulk delete products.
 * Expects JSON body: { ids: string[] }
 */
export async function POST(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ success: true, deletedCount: ids.length });
  } catch (error) {
    console.error('Bulk delete error:', error);
    return serverErrorResponse('Bulk delete failed');
  }
}
