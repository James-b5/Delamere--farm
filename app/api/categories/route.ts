import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    if (!prisma || !prisma.category || typeof prisma.category.findMany !== 'function') {
      console.error('Prisma client or Category model unavailable');
      return NextResponse.json([]);
    }
    const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(cats);
  } catch (err) {
    console.error('Failed to fetch categories', err);
    return NextResponse.json([], { status: 500 });
  }
}
