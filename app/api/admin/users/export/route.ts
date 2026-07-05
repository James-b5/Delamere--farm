import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminOrModeratorAccess, serverErrorResponse } from '@/lib/api-utils';
import { stringify } from 'csv-stringify/sync';

/**
 * Export users as CSV.
 * Optional query param: ids=comma,separated,list
 */
export async function GET(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const idsParam = url.searchParams.get('ids');
    const whereClause = idsParam
      ? { id: { in: idsParam.split(',') } }
      : {};
    const users = await prisma.user.findMany({
      where: whereClause,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const csv = stringify(users, {
      header: true,
      columns: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
    });
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="users.csv"',
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return serverErrorResponse('Export failed');
  }
}
