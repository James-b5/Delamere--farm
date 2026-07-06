import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess } from '@/lib/api-utils';

export async function GET(req: Request) {
  const user = await checkAdminAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // PostgreSQL: group orders by date (YYYY-MM-DD)
  const result = (await prisma.$queryRaw`
    SELECT DATE("createdAt") as date, SUM("totalAmount") as total, COUNT(*) as count
    FROM "Order"
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `) as Array<{ date: string; total: number; count: number }>;

  return NextResponse.json(result);
}
