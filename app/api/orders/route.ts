import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';
import { recordAnalyticsEvent } from '@/lib/analytics-store';

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
