export async function safeQuery(fn: () => Promise<any>, fallback: any) {
  try {
    return await fn();
  } catch (err) {
    // Log but don't throw so prerender can continue
    // eslint-disable-next-line no-console
    console.error('Prisma query failed (safeQuery)', err);
    return fallback;
  }
}

export default safeQuery;
