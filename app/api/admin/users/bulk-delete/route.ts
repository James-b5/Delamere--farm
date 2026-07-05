import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminOrModeratorAccess, badRequestResponse, serverErrorResponse } from '@/lib/api-utils';

// Bulk delete users - admin only
export async function POST(req: Request) {
  const admin = await checkAdminOrModeratorAccess(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return badRequestResponse('ids array is required');
    }
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bulk delete failed:', error);
    return serverErrorResponse('Bulk delete failed');
  }
}

export {};
