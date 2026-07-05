import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess, serverErrorResponse } from '@/lib/api-utils';
import { getAnalyticsSummary } from '@/lib/analytics-store';

export async function GET(req: Request) {
  const user = await checkAdminAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totalUsers, activeUsers, totalOrders, totalProducts, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.product.count({ where: { deleted: false } }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }).then((r: { _sum: { totalAmount: number | null } }) => r._sum.totalAmount ?? 0),
    ]);

    const analyticsSummary = getAnalyticsSummary();

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      checkoutStarted: analyticsSummary.checkoutStarted,
      checkoutCompleted: analyticsSummary.checkoutCompleted,
      whatsappClicks: analyticsSummary.whatsappClicks,
      conversionRate: analyticsSummary.conversionRate,
      ordersOverTime: [],
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return serverErrorResponse('Failed to fetch analytics');
  }
}
