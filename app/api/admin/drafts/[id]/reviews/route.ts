import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess, badRequestResponse, serverErrorResponse } from '@/lib/api-utils';

export async function GET(request: Request | NextRequest, context: any) {
  try {
    await checkAdminAccess(request as Request);
    const id = context?.params?.id ?? ((context?.params && (await context.params))?.id) ?? null;
    if (!id) return badRequestResponse('Missing id');
    const reviews = await prisma.draftReview.findMany({ where: { postId: id }, orderBy: { createdAt: 'desc' } });
    const enriched = await Promise.all(reviews.map(async (r: any) => {
      const user = await prisma.user.findUnique({ where: { id: r.reviewer } }).catch(() => null);
      return { ...r, reviewerName: user?.name || user?.email || r.reviewer };
    }));
    return NextResponse.json(enriched);
  } catch (e) {
    return serverErrorResponse('Failed to fetch reviews');
  }
}

export async function POST(request: Request | NextRequest, context: any) {
  try {
    const user = await checkAdminAccess(request as Request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await (request as Request).json();
    if (!body?.comment) return badRequestResponse('Comment is required');
    const id = context?.params?.id ?? ((context?.params && (await context.params))?.id) ?? null;
    if (!id) return badRequestResponse('Missing id');
    const created = await prisma.draftReview.create({ data: { postId: id, reviewer: user.id, comment: body.comment } });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('Create review error', e);
    return serverErrorResponse('Failed to create review');
  }
}
