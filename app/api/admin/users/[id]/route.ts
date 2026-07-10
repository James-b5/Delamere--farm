import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAccess, badRequestResponse, serverErrorResponse } from '@/lib/api-utils';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdminAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { role: incomingRole, isActive, name } = body;
    const role = incomingRole === 'OTHER' ? 'MODERATOR' : incomingRole;

    const data: any = {};
    if (role !== undefined) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;
    if (name !== undefined) data.name = name;

    if (Object.keys(data).length === 0) {
      return badRequestResponse('No valid fields to update');
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update user:', error);
    return serverErrorResponse('Failed to update user');
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await checkAdminAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return serverErrorResponse('Failed to delete user');
  }
}
