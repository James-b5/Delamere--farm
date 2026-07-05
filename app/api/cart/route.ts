import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - fetch current user's cart items
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { cartItems: { include: { product: true } } },
  });

  return NextResponse.json(user?.cartItems ?? []);
}

// POST - add or update a cart item
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { productId, quantity } = await request.json();
  if (!productId || !quantity) {
    return NextResponse.json({ error: 'Missing productId or quantity' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

    // Validate stock before adding to cart
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    if (product.stock <= 0) {
      return NextResponse.json({ error: 'Product out of stock' }, { status: 400 });
    }
    // Optional: enforce quantity does not exceed stock
    if (quantity > product.stock) {
      return NextResponse.json({ error: `Requested quantity exceeds stock (${product.stock})` }, { status: 400 });
    }
    // Upsert cart item
    const cartItem = await prisma.cartItem.upsert({
      where: { userId_productId: { userId: user.id, productId } },
      update: { quantity },
      create: { userId: user.id, productId, quantity },
      include: { product: true },
    });

  return NextResponse.json(cartItem);
}

// DELETE - remove a cart item (expects ?productId=... query param)
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await prisma.cartItem.delete({
    where: { userId_productId: { userId: user.id, productId } },
  });

  return NextResponse.json({ success: true });
}
