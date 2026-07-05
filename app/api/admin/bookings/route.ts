import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminOrModeratorAccess, badRequestResponse, serverErrorResponse } from '@/lib/api-utils';

function normalizeBooking(booking: any) {
  const { User, ...rest } = booking;
  return { ...rest, user: User ?? null };
}

// GET: List all bookings
export async function GET(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      include: { User: true },
      orderBy: { bookingDate: 'desc' },
    });
    return NextResponse.json(bookings.map(normalizeBooking));
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return serverErrorResponse('Failed to fetch bookings');
  }
}

// PATCH: Update booking fields
export async function PATCH(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await req.json();
    const { id, name, email, phone, bookingDate, numberOfPeople, notes, status } = payload;
    if (!id) {
      return badRequestResponse('Booking ID required');
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (bookingDate !== undefined) updateData.bookingDate = new Date(bookingDate);
    if (numberOfPeople !== undefined) updateData.numberOfPeople = Number(numberOfPeople);
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return badRequestResponse('No valid booking fields to update');
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: updateData,
      include: { User: true },
    });

    return NextResponse.json(normalizeBooking(updated));
  } catch (error) {
    console.error('Failed to update booking:', error);
    return serverErrorResponse('Failed to update booking');
  }
}

// DELETE: Delete a booking
export async function DELETE(req: Request) {
  const user = await checkAdminOrModeratorAccess(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return badRequestResponse('Booking ID required');
    }

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Booking deleted' });
  } catch (error) {
    console.error('Failed to delete booking:', error);
    return serverErrorResponse('Failed to delete booking');
  }
}
