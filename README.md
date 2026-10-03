# E-commerce Business Finance

A mobile-first commerce and finance workspace for a small, owner-operated business that sources products locally and sells them through social media. Track stock, customer orders, supplier payables, business and personal spending, and financial performance in one application.

## Features

- Supplier and product inventory management, including cost and selling prices.
- Product image uploads through ImageKit.
- Customer sales with delivery status, payments, cancellation, and supplier payable tracking.
- Business expenses, personal expenses, recurring obligations, and other income.
- Dashboard and date-range reports for revenue, cost of goods sold, gross profit, net profit, cash flow, and outstanding payables.
- Email/password authentication, Google sign-in, protected application pages, and protected API mutations.

## Technology

- Next.js App Router and TypeScript
- Tailwind CSS
- Prisma ORM 7 with PostgreSQL
- Better Auth
- ImageKit
- Zod, React Hook Form, date-fns, Recharts, and Lucide React
- pnpm

## Requirements

- Node.js 20.9 or newer
- pnpm 12.3.4 (the version pinned in `package.json`)
- A PostgreSQL database
- ImageKit credentials for product image uploads
- Google OAuth credentials to enable Google sign-in

## Local setup

1. Install dependencies:

   ```powershell
   pnpm install
   ```

2. Create a local environment file and set its values:

   ```powershell
   Copy-Item .env.example .env
   ```

   Required for the core app:

   - `DATABASE_URL`: PostgreSQL connection string used by Prisma and the application.
   - `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET`: Better Auth base URL and signing secret.

   Configure Google sign-in with `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. The Google OAuth redirect URI should be:

   ```text
   http://localhost:3000/api/auth/callback/google
   ```

   Configure product uploads with `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`, `IMAGEKIT_PUBLIC_KEY`, and `IMAGEKIT_PRIVATE_KEY`. The private key must remain server-side and must never be exposed to browser code.

3. Generate the Prisma Client, apply the committed migrations, and seed the starter categories in a new database:

   ```powershell
   pnpm exec prisma generate
   pnpm exec prisma migrate deploy
   pnpm exec prisma db seed
   ```

   Run the seed once for a new database; it creates the default expense, income, and product categories.

4. Start the development server:

   ```powershell
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000), create an account, and sign in.

Do not commit `.env` or put secret values in source code, logs, or client-side configuration. `.env.example` contains variable names only.

## Common commands

```powershell
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
pnpm start
```

To create a migration after changing `prisma/schema.prisma` during development:

```powershell
pnpm exec prisma migrate dev --name describe_the_change
pnpm exec prisma generate
```

Use `pnpm exec prisma migrate deploy` to apply committed migrations in a deployment environment. Do not use `prisma db push` as the normal migration workflow.

## Financial model

- Revenue is based on delivered sales.
- Each sale line preserves the unit cost used when the sale was recorded, so later inventory price changes do not rewrite historical cost of goods sold.
- Gross profit is revenue minus cost of goods sold.
- Net profit is gross profit minus business expenses plus other business income.
- Personal expenses and personal income are reported separately from business net profit.
- Monetary values are stored as database decimals; authoritative financial calculations run on the server.

## Project structure

```text
src/
  app/                 App Router pages and Route Handlers
  components/          Shared UI, forms, charts, and app navigation
  lib/
    services/          Server-side domain and financial operations
    storage/           ImageKit upload and media helpers
prisma/
  migrations/          Database migration history
  schema.prisma        PostgreSQL data model
```

Route Handlers authenticate and validate requests before calling server-side services. Prisma access and authoritative financial calculations stay on the server.

## Production notes

- Configure production PostgreSQL, Better Auth, Google OAuth, and ImageKit credentials in the deployment environment.
- A transactional email provider is not yet configured. In development, password-reset links are written to the server console; password-reset emails are not delivered in production until a provider is integrated.
- Apply schema changes through Prisma migrations and run the production build before deployment.
