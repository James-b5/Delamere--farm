import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/middleware/requireRole';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

import stream from 'stream';

// GET: Generate PDF report of orders
export const GET = requireRole(['ADMIN'], async (session) => {
  const orders = await prisma.order.findMany({
    include: { OrderItem: { include: { Product: true } }, User: true },
    orderBy: { createdAt: 'desc' },
  });

  const normalizedOrders = orders.map((order: any) => {
    const { OrderItem, User, ...rest } = order;
    return { ...rest, items: OrderItem ?? [], user: User ?? null };
  });

  // Create PDF in memory
  const doc = new PDFDocument();
  const buffers: Buffer[] = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {});

  doc.fontSize(20).text('Delamere Farm Order Report', { align: 'center' });
  doc.moveDown();
  normalizedOrders.forEach((order: any, idx: number) => {
    doc.fontSize(12).text(`${idx + 1}. Order ID: ${order.id}`);
    doc.text(`   User: ${order.user?.email ?? 'N/A'}`);
    doc.text(`   Total: KES ${order.totalAmount.toFixed(2)}`);
    doc.text(`   Status: ${order.status}`);
    doc.text(`   Date: ${order.createdAt.toLocaleString()}`);
    doc.moveDown(0.5);
  });
  doc.end();

  const pdfBuffer = Buffer.concat(buffers);
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="orders_report.pdf"',
    },
  });
});
