export async function withPrismaFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  context = 'Prisma operation',
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[prisma-fallback] ${context} failed; returning fallback value. ${message}`);
    return fallback;
  }
}
