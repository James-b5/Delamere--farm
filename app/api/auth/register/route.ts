import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, isValidEmail, isStrongPassword, createToken } from '@/lib/auth';
import { sendAdminNotification } from '@/lib/email';

export async function POST(request: Request) {
  try {
    let payload;
    try {
      payload = await request.json();
    } catch (err) {
      console.error('JSON parse error:', err);
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    console.log('Registration payload:', payload);
    const { name, email, password, confirmPassword, phone } = payload;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered. Please login.' },
        { status: 409 }
      );
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    // Determine role: first registered user becomes ADMIN
    const existingCount = await prisma.user.count();
    const role = existingCount === 0 ? 'ADMIN' : 'USER';
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        phone: phone || null,
        role,
      },
    });

    // Create token
    const token = createToken(user.id, user.email, user.role);

    // Send notification to admin (optional)
    await sendAdminNotification(
      'New User Registration',
      `${name} (${email}) has registered on Delamere Farm`
    );

    return NextResponse.json(
      {
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register. Please try again.' },
      { status: 500 }
    );
  }
}
