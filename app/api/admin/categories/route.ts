import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess, badRequestResponse, serverErrorResponse } from '@/lib/api-utils';

export async function GET() {
  const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(cats);
}

export async function POST(request: Request) {
  try {
    const user = await checkAdminAccess(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    if (!body?.name) return badRequestResponse('Name is required');
    const slug = (body.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const created = await prisma.category.create({ data: { name: body.name, slug } });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('Create category error', e);
    return serverErrorResponse('Failed to create category');
  }
}
