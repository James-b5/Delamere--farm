import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      bookingDate,
      numberOfPeople,
      notes,
      userId 
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !bookingDate) {
      return NextResponse.json(
        { error: 'Name, email, phone, and booking date are required' },
        { status: 400 }
      );
    }

    // Create booking in database
    const booking = await prisma.booking.create({
      data: {
        userId: userId || null,
        name,
        email,
        phone,
        bookingDate: new Date(bookingDate),
        numberOfPeople: numberOfPeople || 1,
        notes: notes || null,
        status: 'PENDING',
      },
    });

    // Send confirmation email to customer
    await sendBookingConfirmationEmail(email, name, {
      bookingDate,
      numberOfPeople,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Booking request submitted successfully! Check your email for confirmation.',
        bookingId: booking.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to submit booking. Please try again.' },
      { status: 500 }
    );
  }
}

// GET bookings for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
