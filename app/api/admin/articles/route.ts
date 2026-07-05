import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { checkAdminAccess, badRequestResponse, serverErrorResponse } from '@/lib/api-utils';
import { syncTagsForPost } from '@/lib/article-utils';

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
    const user = await checkAdminAccess(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!body?.title) return badRequestResponse('Title is required');

    const slug = slugify(body.title + '-' + Date.now().toString().slice(-4));
    const created = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt || null,
        content: body.content || body.excerpt || '',
        author: user.id,
        published: body.published ?? true,
        publishedAt: body.published ? new Date() : null,
        coverImage: body.imageUrl || null,
      },
    });
    // handle tags if provided
    if (body.tags) await syncTagsForPost(created.id, body.tags);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('Article create error', e);
    return serverErrorResponse('Failed to create article');
  }
}
