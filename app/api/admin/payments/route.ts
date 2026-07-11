import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { checkAdminOrModeratorAccess, serverErrorResponse, badRequestResponse } from '@/lib/api-utils';

const PAYMENT_STORE_PATH = path.join(process.cwd(), 'data', 'payments-store.json');

async function readPaymentsStore() {
  try {
    const raw = await fs.readFile(PAYMENT_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error: any) {
    if (error?.code === 'ENOENT') return [];
    console.error('Failed to read payments store:', error);
    return [];
  }
}

async function writePaymentsStore(payments: any[]) {
  await fs.mkdir(path.dirname(PAYMENT_STORE_PATH), { recursive: true });
  await fs.writeFile(PAYMENT_STORE_PATH, JSON.stringify(payments, null, 2));
}

function formatPayment(payment: any) {
  return {
    id: payment.id,
    orderId: payment.orderId,
    userId: payment.userId,
    user: payment.user || { name: 'Unknown', email: 'N/A' },
    provider: payment.provider || 'UNKNOWN',
    amount: Number(payment.amount ?? 0),
    status: payment.status || 'PENDING',
    transactionId: payment.transactionId,
    errorMessage: payment.errorMessage,
    createdAt: payment.createdAt || new Date().toISOString(),
    updatedAt: payment.updatedAt || payment.createdAt || new Date().toISOString(),
  };
}

// GET: List all payments
export async function GET(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payments = await readPaymentsStore();
    return NextResponse.json(payments.map(formatPayment));
  } catch (error) {
    console.error('Failed to fetch payments:', error);
    return serverErrorResponse('Failed to fetch payments');
  }
}

// POST: Create a payment record
export async function POST(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body?.amount || !body?.status) {
      return badRequestResponse('Amount and status are required');
    }

    const payments = await readPaymentsStore();
    const payment = {
      id: body.id || randomUUID(),
      orderId: body.orderId || null,
      userId: body.userId || null,
      user: body.user || null,
      provider: body.provider || 'UNKNOWN',
      amount: Number(body.amount),
      status: String(body.status).toUpperCase(),
      transactionId: body.transactionId || null,
      errorMessage: body.errorMessage || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    payments.unshift(payment);
    await writePaymentsStore(payments);
    return NextResponse.json(formatPayment(payment), { status: 201 });
  } catch (error) {
    console.error('Failed to create payment:', error);
    return serverErrorResponse('Failed to create payment');
  }
}

// PATCH: Update a payment record
export async function PATCH(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body?.id) {
      return badRequestResponse('Payment ID is required');
    }

    const payments = await readPaymentsStore();
    const index = payments.findIndex((payment: any) => payment.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const updated = {
      ...payments[index],
      ...body,
      updatedAt: new Date().toISOString(),
      amount: Number(body.amount ?? payments[index].amount),
      status: body.status ? String(body.status).toUpperCase() : payments[index].status,
    };

    payments[index] = updated;
    await writePaymentsStore(payments);
    return NextResponse.json(formatPayment(updated));
  } catch (error) {
    console.error('Failed to update payment:', error);
    return serverErrorResponse('Failed to update payment');
  }
}

// DELETE: Remove a payment record
export async function DELETE(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return badRequestResponse('Payment ID is required');
    }

    const payments = await readPaymentsStore();
    const filtered = payments.filter((payment: any) => payment.id !== id);
    if (filtered.length === payments.length) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    await writePaymentsStore(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete payment:', error);
    return serverErrorResponse('Failed to delete payment');
  }
}
