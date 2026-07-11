import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminOrModeratorAccess, serverErrorResponse } from '@/lib/api-utils';

// Use broader types for handler params to satisfy Next.js internal type checks
export async function PATCH(request: Request | NextRequest, context: any) {
  try {
    const user = await checkAdminOrModeratorAccess(request as Request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = (context?.params && context.params.id) || (context?.params && (await context.params)?.id);
    const body = await (request as Request).json();

    const existing = await prisma.blogPost.findUnique({ where: { id } });
    if (!existing) return new NextResponse('Not found', { status: 404 });

    const data: any = { ...body };
    // if publishing now, set publishedAt
    if (body.published === true && !existing.published) {
      data.publishedAt = new Date();
      if (user) {
        // record who published
        data.publishedById = user.id;
        data.publishedBy = user.name || user.email || user.id;
      }
    }
    if (body.published === false && existing.published) {
      data.publishedAt = null;
      data.publishedById = null;
      data.publishedBy = null;
    }

    const updated = await prisma.blogPost.update({ where: { id }, data });
    if (body.tags) await import('@/lib/article-utils').then(m => m.syncTagsForPost(id, body.tags));
    return NextResponse.json(updated);
  } catch (e) {
    console.error('Admin article PATCH error', e);
    return serverErrorResponse('Failed to update article');
  }
}
export async function GET(request: Request | NextRequest, context: any) {
  try {
    const user = await checkAdminOrModeratorAccess(request as Request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = context?.params?.id ?? ((context?.params && (await context.params))?.id) ?? null;
    if (!id) return new NextResponse('Bad request', { status: 400 });
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return new NextResponse('Not found', { status: 404 });
    return NextResponse.json(post);
  } catch (e) {
    console.error('Admin article GET error', e);
    return serverErrorResponse('Failed to fetch article');
  }
}

export async function DELETE(request: Request | NextRequest, context: any) {
  try {
    const user = await checkAdminOrModeratorAccess(request as Request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = context?.params?.id ?? ((context?.params && (await context.params))?.id) ?? null;
    if (!id) return new NextResponse('Bad request', { status: 400 });
    await prisma.blogPost.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error('Admin article DELETE error', e);
    return serverErrorResponse('Failed to delete article');
  }
}
