// Minimal Prisma ESM config — rely on Prisma's built-in .env loader
export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};
