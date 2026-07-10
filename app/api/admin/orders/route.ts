import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminOrModeratorAccess, badRequestResponse, serverErrorResponse } from '@/lib/api-utils';
import { verifyToken } from '@/lib/auth';

// Debug helper: log incoming auth headers and token decode results to server console
function logAuthDebug(request: Request) {
  try {
    const method = (request as any).method || 'UNKNOWN';
    const url = (request as any).url || '';
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    console.log('[admin/orders] incoming request', method, url);
    console.log('[admin/orders] authorization header present:', !!authHeader);
    if (authHeader) {
      console.log('[admin/orders] authorization header (trim):', authHeader.length > 200 ? authHeader.slice(0, 200) + '...[truncated]' : authHeader);
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
          const decoded = verifyToken(token);
          console.log('[admin/orders] token decoded:', decoded);
        } catch (err) {
          console.log('[admin/orders] token verify error:', err && (err as Error).message ? (err as Error).message : String(err));
        }
      }
    } else {
      console.log('[admin/orders] no authorization header — request may rely on session/cookie');
    }
  } catch (e) {
    // best-effort logging
    console.error('[admin/orders] logAuthDebug failed', e);
  }
}

function normalizeOrder(order: any) {
  const { OrderItem, User, ...rest } = order;
  return { ...rest, items: OrderItem ?? [], user: User ?? null };
}

/**
 * Admin Orders API
 * GET   - list all orders (supports optional CSV export via ?format=csv)
 * PATCH - update order status (body: { orderId, status })
 */

// GET handler – list orders, optionally CSV
export async function GET(req: Request) {
  logAuthDebug(req);
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    const orders = await prisma.order.findMany({
      include: { OrderItem: { include: { Product: true } }, User: true },
      orderBy: { createdAt: 'desc' },
    });

    const normalizedOrders = orders.map(normalizeOrder);

    if (format === 'csv') {
      const header = ['Order ID', 'User Email', 'Total', 'Status', 'Created At'];
      const rows = normalizedOrders.map((o: any) => [
        o.id,
        o.user?.email ?? '',
        o.totalAmount.toFixed(2),
        o.status,
        o.createdAt.toISOString(),
      ].join(','));
      const csv = [header.join(','), ...rows].join('\n');
      return new NextResponse(csv, {
        status: 200,
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="orders.csv"' },
      });
    }

    return NextResponse.json(normalizedOrders);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return serverErrorResponse('Failed to fetch orders');
  }
}

// PATCH handler – update order status
export async function PATCH(req: Request) {
  logAuthDebug(req);
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return badRequestResponse('orderId and status required');
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { OrderItem: { include: { Product: true } }, User: true },
    });
    return NextResponse.json(normalizeOrder(updated));
  } catch (error) {
    console.error('Failed to update order:', error);
    return serverErrorResponse('Failed to update order');
  }
}

// DELETE handler – remove an order (admin only)
export async function DELETE(req: Request) {
  logAuthDebug(req);
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) return badRequestResponse('orderId required');

    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error('Failed to delete order:', error);
    return serverErrorResponse('Failed to delete order');
  }
}
