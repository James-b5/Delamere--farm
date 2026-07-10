import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { checkAdminOrModeratorAccess, badRequestResponse, serverErrorResponse } from '@/lib/api-utils';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(posts);
  } catch (e) {
    return serverErrorResponse('Failed to fetch articles');
  }
}

export async function POST(request: Request) {
  try {
    const user = await checkAdminOrModeratorAccess(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body?.title) return badRequestResponse('Title is required');

    const slug = slugify(body.title + '-' + Date.now().toString().slice(-4));
    const generatedId = `blogpost-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    // Moderators create drafts: published=false
    const created = await prisma.blogPost.create({
      data: {
        id: generatedId,
        title: body.title,
        slug,
        excerpt: body.excerpt || null,
        content: body.content || body.excerpt || '',
        author: user.id,
        published: false,
        coverImage: body.imageUrl || null,
      },
    });
    // sync tags if provided
    if (body.tags) await import('@/lib/article-utils').then(m => m.syncTagsForPost(created.id, body.tags));
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('Moderator article create error', e);
    return serverErrorResponse('Failed to create article');
  }
}
