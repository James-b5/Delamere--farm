// middleware/requireRole.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

type Role = "ADMIN" | "MODERATOR" | "USER";

/**
 * Higher‑order function to protect API routes with role‑based access control.
 * Usage: export async function GET(req) { return requireRole(["ADMIN"], async () => { ... })(req); }
 */
export function requireRole(allowedRoles: Role[], handler: (session: any) => Promise<any>) {
  return async (req: Request) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    // Fetch user's role from DB
    const user = await (await import("@/lib/prisma")).prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!allowedRoles.includes(user.role as Role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(session);
  };
}
