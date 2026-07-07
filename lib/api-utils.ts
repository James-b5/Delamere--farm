import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';
import { verifyToken, authOptions } from '@/lib/auth';

export type AllowedRole = 'ADMIN' | 'MODERATOR';

/**
 * Extract JWT token from Authorization header
 */
function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Check if user has ADMIN access
 * Returns user object if authorized, null otherwise
 */
export async function checkAdminAccess(request?: Request) {
  let userId: string | null = null;

  // Try to get token from request header
  if (request) {
    const token = getTokenFromRequest(request);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }
  }

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, id: true, name: true, email: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return user;
}

/**
 * Check if user has ADMIN or OTHER access
 * Returns user object if authorized, null otherwise
 */
export async function checkAdminOrModeratorAccess(request?: Request) {
  let userId: string | null = null;
  let role: string | null = null;

  // Try to get token from Authorization header
  if (request) {
    const token = getTokenFromRequest(request);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
        role = decoded.role;
      }
    }
  }

    // Fallback: try NextAuth session or cookie JWT when token missing
    if (!userId) {
      try {
        // Try getServerSession first (App Router)
        const session = await getServerSession(authOptions);
        if (session?.user) {
          // @ts-ignore
          userId = session.user.id ?? null;
          // @ts-ignore
          role = session.user.role ?? null;
        }
      } catch (e) {
        // ignore and try cookie-based token
      }

      if (!userId && request) {
        try {
          // Try to extract the NextAuth JWT from cookies (works for App Router and API routes)
          // `getToken` accepts an object with `req` in Node/Next contexts
          // @ts-ignore
          const nextAuthToken: any = await getToken({ req: request as any, secret: process.env.NEXTAUTH_SECRET });
          if (nextAuthToken) {
            // NextAuth uses `sub` for the user id and includes custom claims (e.g., role)
            userId = nextAuthToken.sub ?? null;
            role = nextAuthToken.role ?? role;
          }
        } catch (e) {
          // ignore
        }
      }
    }

  if (!userId) {
    return null;
  }

  // If we already have the role from token/session, verify it directly
  if (role && (role === 'ADMIN' || role === 'MODERATOR')) {
    return { id: userId, role: role as 'ADMIN' | 'MODERATOR' };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, id: true, name: true, email: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return null;
  }

  return user;
}

/**
 * Check if user has specific role access
 * Returns user object if authorized, null otherwise
 */
export async function checkRoleAccess(allowedRoles: AllowedRole[], request?: Request) {
  let userId: string | null = null;

  // Try to get token from request header
  if (request) {
    const token = getTokenFromRequest(request);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.userId;
      }
    }
  }

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, id: true },
  });

  if (!user || !allowedRoles.includes(user.role as AllowedRole)) {
    return null;
  }

  return user;
}

/**
 * Return unauthorized error response
 */
export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/**
 * Return forbidden error response
 */
export function forbiddenResponse() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

/**
 * Return bad request error response
 */
export function badRequestResponse(message: string = 'Bad Request', requestId?: string) {
  const payload: any = { error: message };
  if (requestId) payload.requestId = requestId;
  return NextResponse.json(payload, { status: 400 });
}

export function safeJsonParse<T>(value: unknown, fallback: T): T {
  try {
    if (value === null || value === undefined) {
      return fallback;
    }
    if (typeof value === 'string' && value.trim() === '') {
      return fallback;
    }
    return JSON.parse(value as string) as T;
  } catch {
    return fallback;
  }
}

/**
 * Return server error response
 */
export function serverErrorResponse(message: string = 'Internal Server Error', requestId?: string) {
  const payload: any = { error: message };
  if (requestId) payload.requestId = requestId;
  return NextResponse.json(payload, { status: 500 });
}
