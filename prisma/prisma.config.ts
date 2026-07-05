// Do not load dotenv here; Next/Turbopack will provide env at build/runtime.

/**
 * Returns runtime Prisma client options suitable for Prisma v7.
 * This moves the connection URL out of schema.prisma and supplies
 * it at client construction time so Migrate and the client use the
 * correct runtime configuration.
 */
export function getPrismaClientOptions() {
  const url = process.env.DATABASE_URL;

  const options: any = {
    log: ['error'],
  };

  if (url) {
    options.datasources = { db: { url } };
  }

  return options;
}

export default getPrismaClientOptions;
