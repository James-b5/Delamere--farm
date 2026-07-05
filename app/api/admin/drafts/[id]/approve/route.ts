import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess, badRequestResponse, serverErrorResponse } from '@/lib/api-utils';

export async function POST(request: Request | NextRequest, context: any) {
  try {
    const user = await checkAdminAccess(request as Request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await (request as Request).json();
    const comment = body?.comment || '';

    // create review
    const id = context?.params?.id ?? ((context?.params && (await context.params))?.id) ?? null;
    if (!id) return badRequestResponse('Missing id');

    const createdReview = await prisma.draftReview.create({ data: { postId: id, reviewer: user.id, comment } });

    // publish the post and record publisher
    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return new NextResponse('Not found', { status: 404 });

    const updated = await prisma.blogPost.update({ where: { id }, data: {
      published: true,
      publishedAt: new Date(),
      publishedById: user.id,
      publishedBy: user.name || user.email || user.id,
    }});

    return NextResponse.json({ review: createdReview, post: updated });
  } catch (e) {
    console.error('Approve draft error', e);
    return serverErrorResponse('Failed to approve draft');
  }
}
