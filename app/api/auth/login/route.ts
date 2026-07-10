import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken, verifyToken } from '@/lib/auth';

function logLoginDebug(request: Request, payload: any) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    console.log('[auth/login] content-type:', request.headers.get('content-type'));
    console.log('[auth/login] auth header present:', !!authHeader);
    if (authHeader) {
      console.log('[auth/login] auth header (trim):', authHeader.length > 200 ? authHeader.slice(0, 200) + '...[truncated]' : authHeader);
    }
    console.log('[auth/login] payload preview:', payload ? { email: payload.email } : null);
  } catch (e) {
    console.error('[auth/login] debug log failed', e);
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let payload: { email?: string; password?: string } = {};

    if (contentType.includes('application/json')) {
      const rawBody = await request.text();
      if (rawBody) {
        try {
          payload = JSON.parse(rawBody);
        } catch {
          return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400 }
          );
        }
      }
    } else {
      const rawBody = await request.text();
      console.log('login-route-content-type', contentType);
      console.log('login-route-raw-body', rawBody);
      if (rawBody) {
        const params = new URLSearchParams(rawBody);
        payload = {
          email: params.get('email') || '',
          password: params.get('password') || '',
        };
      }
    }

    console.log('login-route-payload', payload);
    logLoginDebug(request, payload);
    const { email, password } = payload;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required', payload },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    const passwordMatch = await verifyPassword(password, user.passwordHash || '');
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create token
    const token = createToken(user.id, user.email, user.role);
    try {
      const decoded = verifyToken(token);
      console.log('[auth/login] token created. decoded:', decoded);
    } catch (e) {
      console.log('[auth/login] token created but decoding failed', e);
    }

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
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login. Please try again.' },
      { status: 500 }
    );
  }
}
