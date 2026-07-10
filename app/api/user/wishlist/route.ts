import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

async function getEmailFromRequest(request: Request) {
  // Prefer next-auth session
  const session = await getServerSession(authOptions);
  if (session?.user?.email) return session.user.email;

  // Fallback to Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  return payload?.email ?? null;
}

// GET - list wishlist items for current user
export async function GET(request: Request) {
  const email = await getEmailFromRequest(request);
  if (!email) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email }, include: { Wishlist: { include: { Product: true } } } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(user.Wishlist ?? []);
}

// POST - toggle wishlist item (expects { productId })
export async function POST(request: Request) {
  const email = await getEmailFromRequest(request);
  if (!email) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const { productId } = await request.json();
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const existing = await prisma.wishlist.findUnique({ where: { userId_productId: { userId: user.id, productId } } });
  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return NextResponse.json({ removed: true });
  }

  const created = await prisma.wishlist.create({ data: { userId: user.id, productId } });
  return NextResponse.json(created);
}

// DELETE - remove wishlist item by productId query param
export async function DELETE(request: Request) {
  const email = await getEmailFromRequest(request);
  if (!email) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'Missing productId' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await prisma.wishlist.deleteMany({ where: { userId: user.id, productId } });
  return NextResponse.json({ success: true });
}
