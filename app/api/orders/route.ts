import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { recordAnalyticsEvent } from '@/lib/analytics-store';
import { checkAdminOrModeratorAccess } from '@/lib/api-utils';

export const POST = async (req: Request) => {
  // Authenticate user
  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { items, shippingInfo } = body;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Cart items required' }, { status: 400 });
  }

  try {
    const totalAmount = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
    const order = await prisma.order.create({
      data: {
        id: `order-${Date.now()}`,
        userId: payload.userId,
        totalAmount,
        status: 'PENDING',
      },
    });

    await prisma.orderItem.createMany({
      data: items.map((i: any) => ({
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        orderId: order.id,
        productId: String(i.productId),
        quantity: i.quantity,
        price: i.price,
      })),
    });

    recordAnalyticsEvent('checkout_completed', { orderId: order.id, total: totalAmount, userId: payload.userId });
    return NextResponse.json(order);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
};

// DELETE: allow order owner or admin/moderator to hard-delete an order
export const DELETE = async (req: Request) => {
  // Try to authenticate via token first
  const token = getTokenFromRequest(req);
  const payload = token ? verifyToken(token) : null;

  // Parse orderId from body or query
  let orderId: string | null = null;
  try {
    const body = await req.json().catch(() => null);
    if (body && body.orderId) orderId = String(body.orderId);
  } catch (e) {
    // ignore
  }
  if (!orderId) {
    try {
      const { searchParams } = new URL(req.url);
      orderId = searchParams.get('orderId');
    } catch (e) {
      // ignore
    }
  }

  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId }, select: { id: true, userId: true } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // If user is owner, allow
    if (payload && payload.userId && payload.userId === order.userId) {
      await prisma.$transaction([
        prisma.orderItem.deleteMany({ where: { orderId } }),
        prisma.order.delete({ where: { id: orderId } }),
      ]);
      return NextResponse.json({ success: true, orderId });
    }

    // Otherwise check admin/moderator access
    const admin = await checkAdminOrModeratorAccess(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { orderId } }),
      prisma.order.delete({ where: { id: orderId } }),
    ]);
    return NextResponse.json({ success: true, orderId });
  } catch (e) {
    console.error('Failed to delete order:', e);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
};
