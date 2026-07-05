# Deploying Delamere Farm to Vercel

This guide shows how to deploy the Delamere Farm Next.js application to Vercel using the existing project configuration.

## 1. What this deployment needs

- Node.js 20+ compatible environment
- PostgreSQL database accessible from production
- Prisma migrations and schema
- Environment variables for auth, email, storage, and payments
- Optional AWS S3, Resend email, IntaSend payments

## 2. Recommended local pre-checks

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run TypeScript and lint checks:

   ```bash
   npm run build
   npm run lint
   ```

3. Run critical tests if available:

   ```bash
   npm test
   npm run test:e2e
   ```

4. Verify the site locally:

   ```bash
   npm run dev
   ```

## 3. Required environment variables

Set these variables in Vercel environment settings under `Production` (and `Preview` if needed).

### Server-side variables

- `DATABASE_URL`
  - Production PostgreSQL connection string
  - Example: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`

- `JWT_SECRET`
  - Used by custom JWT auth helpers
  - Choose a strong random secret

- `NEXTAUTH_SECRET`
  - Required by NextAuth
  - Use a secure random string

- `RESEND_API_KEY`
  - Optional if using Resend for email delivery

- `ADMIN_EMAIL`
  - Email address for admin/system notifications

- `AWS_REGION`
  - AWS region used by S3 uploads

- `AWS_ACCESS_KEY_ID`
  - AWS IAM access key ID for S3

- `AWS_SECRET_ACCESS_KEY`
  - AWS IAM secret access key for S3

- `AWS_S3_BUCKET`
  - S3 bucket name for media uploads

- `INTASEND_SECRET_KEY`
  - IntaSend payment gateway secret key

- `INTASEND_BASE_URL`
  - IntaSend API base URL

- `INTASEND_WEBHOOK_SECRET`
  - Webhook signing secret for IntaSend callbacks

### Client-side variables

These are used by the frontend, so they must be prefixed with `NEXT_PUBLIC_`.

- `NEXT_PUBLIC_WHATSAPP_LINK`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_WHATSAPP_QR`
- `NEXT_PUBLIC_GA_ID`

## 4. Vercel project settings

1. Sign in to Vercel and create a new project.
2. Connect the GitHub repository for `Delamere Farm`.
3. Choose the root project folder if necessary.
4. In the Vercel dashboard, open `Settings > Environment Variables`.
5. Add each variable from Section 3 with the correct value.
6. Use the same variables for `Production` and `Preview` if deployed for staging.

## 5. Build settings

Vercel should auto-detect this as a Next.js app.

- Build command: `npm run build`
- Install command: `npm install`
- Output directory: (leave blank)

If you want the CLI instead of the dashboard, run:

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 6. Database migration on deploy

Because this app uses Prisma, run migrations against the production database before or after deployment.

### Option A: Run once from a safe environment

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

### Option B: Use Vercel post-deploy command

If you want Vercel to run migrations automatically, add a custom build hook or script that executes:

```bash
npx prisma migrate deploy --schema=prisma/schema.prisma
```

> Note: Do not run `prisma migrate dev` in production.

## 7. Verifying the deployment

After deployment:

- Visit the Vercel deployment URL.
- Confirm the homepage loads and API routes respond.
- Log in to the admin/dashboard pages.
- Verify dynamic features like bookings, product uploads, and payments.
- Check that email and media upload features are working if those services are enabled.

## 8. Troubleshooting

### Common issues

- **`DATABASE_URL` missing or inaccessible**
  - Verify the production DB connection string and network access.

- **Auth errors**
  - Confirm `JWT_SECRET` and `NEXTAUTH_SECRET` are defined and stable.

- **Email delivery failing**
  - Confirm `RESEND_API_KEY` and `ADMIN_EMAIL` are configured.

- **S3 upload errors**
  - Confirm `AWS_S3_BUCKET`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY`.

- **Payment webhook/checkout issues**
  - Confirm IntaSend secrets and webhook URLs are correct.

## 9. Useful commands

```bash
npm install
npm run build
npx prisma migrate deploy --schema=prisma/schema.prisma
npm run start
```

## 10. Notes specific to this project

- The app uses `next/font` with Geist, which works natively on Vercel.
- The app depends on `next` 16 and `react` 19.
- Make sure `DATABASE_URL` is a Postgres URL; Prisma is configured for PostgreSQL.
- If the app uses S3 uploads, verify the `AWS_*` variables before enabling media upload features.

---

This guide is the recommended deployment path for Delamere Farm on Vercel.
