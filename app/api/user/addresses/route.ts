import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getEmailFromRequest(request?: Request) {
  if (!request) {
    // Try server session without request (getServerSession may work without argument in some setups)
    const session = await getServerSession(authOptions);
    return session?.user?.email ?? null;
  }

  // Prefer next-auth session
  const session = await getServerSession(authOptions);
  if (session?.user?.email) return session.user.email;

  // Fallback to Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  return payload?.email ?? null;
}

// GET - list addresses for current user
export async function GET(request: Request) {
  const email = await getEmailFromRequest(request);
  if (!email) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email }, include: { addresses: true } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(user.addresses ?? []);
}

// POST - create address
export async function POST(request: Request) {
  const email = await getEmailFromRequest(request);
  if (!email) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const { label, address } = await request.json();
  if (!label || !address) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // compute order as current max + 1
  const maxOrder = await prisma.address.aggregate({ _max: { order: true }, where: { userId: user.id } });
  const order = (maxOrder._max.order ?? 0) + 1;

  const created = await prisma.address.create({ data: { userId: user.id, label, address, order } });
  return NextResponse.json(created);
}

// PUT - update address (expects { id, label, address, isDefault, order })
export async function PUT(request: Request) {
  const email = await getEmailFromRequest(request);
  if (!email) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const { id, label, address, isDefault, order } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (isDefault) {
    // unset others
    await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  }

  const updated = await prisma.address.update({ where: { id }, data: { label, address, isDefault: !!isDefault, order: order ?? undefined } });
  return NextResponse.json(updated);
}

// DELETE - delete address by id query param
export async function DELETE(request: Request) {
  const email = await getEmailFromRequest(request);
  if (!email) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await prisma.address.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
