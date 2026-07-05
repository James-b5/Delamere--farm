import { NextResponse } from 'next/server';
import { seedFallbackPrismaStore } from '@/lib/prisma';

export async function POST() {
  try {
    seedFallbackPrismaStore();
    return NextResponse.json({ success: true, message: 'Fallback data seeded successfully.' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
