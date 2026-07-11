import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminOrModeratorAccess } from '@/lib/api-utils';
import { getAnalyticsSummary } from '@/lib/analytics-store';

export async function GET(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await Promise.allSettled([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.product.count({ where: { deleted: false } }),
      prisma.order.aggregate({ _sum: { totalAmount: true } }).then((r: { _sum: { totalAmount: number | null } }) => r._sum.totalAmount ?? 0),
    ]);

    const [totalUsers, activeUsers, totalOrders, totalProducts, totalRevenue] = results.map((result) =>
      result.status === 'fulfilled' ? result.value : 0
    );

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
    const analyticsSummary = getAnalyticsSummary();
    return NextResponse.json({
      totalUsers: 0,
      activeUsers: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalRevenue: 0,
      checkoutStarted: analyticsSummary.checkoutStarted,
      checkoutCompleted: analyticsSummary.checkoutCompleted,
      whatsappClicks: analyticsSummary.whatsappClicks,
      conversionRate: analyticsSummary.conversionRate,
      ordersOverTime: [],
    });
  }
}
