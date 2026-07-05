import { NextResponse } from 'next/server';
import { checkAdminOrModeratorAccess, serverErrorResponse } from '@/lib/api-utils';

// GET: List all payments
export async function GET(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Dynamically import Prisma at runtime to avoid issues where the
    // static import may be undefined due to module load ordering.
    let prisma;
    try {
      ({ prisma } = await import('@/lib/prisma'));
    } catch (impErr) {
      console.error('Failed to import prisma in payments route:', impErr);
      return serverErrorResponse('Internal server error');
    }

    const payments = await (prisma as any).payment.findMany({
      include: { 
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform the response to match the frontend interface
    const formattedPayments = payments.map((p: any) => ({
      id: p.id,
      orderId: p.orderId,
      userId: p.orderId ? p.order?.userId : undefined,
      user: p.order?.user || { name: 'Unknown', email: 'N/A' },
      provider: p.provider,
      amount: p.amount,
      status: p.status,
      transactionId: p.transactionId,
      errorMessage: p.errorMessage,
      createdAt: p.createdAt,
    }));

    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return serverErrorResponse('Failed to fetch payments');
  }
}
