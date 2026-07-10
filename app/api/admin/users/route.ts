import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { checkAdminOrModeratorAccess, serverErrorResponse, badRequestResponse } from '@/lib/api-utils';
import { type NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const isModeratorRequest = user?.role === 'MODERATOR';
    const where = isModeratorRequest
      ? {
          role: {
            notIn: ['ADMIN'],
          },
        }
      : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return serverErrorResponse('Failed to fetch users');
  }
}

// Create new user (admin only)
export async function POST(req: Request) {
  const admin = await checkAdminOrModeratorAccess(req);
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { name, email, role: incomingRole, isActive } = await req.json();
    // Normalize legacy 'OTHER' to 'MODERATOR' so admin selections wire correctly
    const role = incomingRole === 'OTHER' ? 'MODERATOR' : incomingRole;
    if (!email || !role) {
      return badRequestResponse('Email and role are required');
    }
    const passwordHash = randomBytes(16).toString('hex');
    const newUser = await prisma.user.create({
      data: { name, email, role, isActive: isActive ?? true, passwordHash },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return serverErrorResponse('Failed to create user');
  }
}

export {};
