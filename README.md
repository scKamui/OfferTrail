# OfferTrail

OfferTrail is a modern job application tracker built with Next.js, Clerk, Neon Postgres, and Drizzle ORM. This version recreates the original PHP and MySQL project in a stack designed for deployment on Vercel.

I added short comments throughout the source code to explain what each important section does and why it exists. Files such as `package.json` cannot contain comments because JSON does not allow them, so this guide explains those files instead.

## What the first version can do

- Create an account and sign in with Clerk
- Protect private pages and application data
- Add, edit, and delete job applications
- Search by company or position
- Filter by application status
- Track saved, applied, screening, interview, offer, rejected, and withdrawn stages
- Record an upcoming interview or follow-up date
- View upcoming steps on a calendar
- Work on phones, tablets, and desktop screens

## Technology choices

| Tool | What it does |
| --- | --- |
| Next.js | Builds the pages, server code, and navigation |
| TypeScript | Checks data types before the code runs |
| Clerk | Handles accounts, sign-in, sessions, and user profiles |
| Neon | Hosts the PostgreSQL database |
| Drizzle ORM | Defines the database and writes type-safe queries |
| Zod | Validates form input on the server |
| Tailwind CSS | Supplies utility classes used by the visual design |
| Vercel | Builds and hosts the deployed website |

## Project map

```text
src/
├── actions/
│   └── applications.ts       # Secure create, update, and delete operations
├── app/
│   ├── (app)/                # Signed-in application pages
│   ├── (auth)/               # Clerk sign-in and sign-up pages
│   ├── globals.css           # Shared visual styles
│   ├── layout.tsx            # Fonts, metadata, and Clerk provider
│   └── page.tsx              # Public landing page
├── components/               # Reusable interface pieces
├── db/
│   ├── index.ts              # Lazy Neon database connection
│   └── schema.ts             # PostgreSQL table and enum definitions
├── lib/
│   ├── applications.ts       # Read queries
│   ├── constants.ts          # Shared statuses and labels
│   └── validation.ts         # Zod form rules
└── proxy.ts                  # Protects signed-in routes with Clerk
```

## Run it locally

### 1. Install the packages

Open a terminal in this folder and run:

```bash
npm install
```

### 2. Create the environment file

Copy `.env.example` to a new file named `.env.local`.

```bash
cp .env.example .env.local
```

Never commit `.env.local`. It contains private keys and is already ignored by Git.

### 3. Set up Clerk

1. Create a Clerk application at [clerk.com](https://clerk.com).
2. Copy the publishable key and secret key.
3. Replace the matching placeholder values in `.env.local`.
4. Keep `/sign-in` and `/sign-up` as the authentication paths.

### 4. Set up Neon

1. Create a PostgreSQL database at [neon.tech](https://neon.tech), or add Neon from the Vercel Marketplace.
2. Copy its pooled connection string.
3. Use it as `DATABASE_URL` in `.env.local`.

### 5. Create the database tables

Generate a migration whenever the schema changes:

```bash
npm run db:generate
```

Apply pending migrations to the database:

```bash
npm run db:migrate
```

You can inspect database rows with Drizzle Studio:

```bash
npm run db:studio
```

### 6. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## How a request moves through the app

1. A visitor requests a page.
2. `src/proxy.ts` asks Clerk to protect private routes.
3. A Server Component gets the signed-in Clerk user ID.
4. Read queries include that user ID so users only receive their own rows.
5. Forms call Server Actions using POST requests.
6. The Server Action checks Clerk again, validates the form with Zod, and changes the database.
7. Next.js refreshes the dashboard with the latest data.

The second Clerk check is intentional. A Server Action is still a network endpoint, so hiding a button is not enough security by itself.

## Deploy to Vercel

1. Push this project to GitHub.
2. Import the repository into Vercel.
3. Add Clerk and Neon through the Vercel Marketplace, or add their environment variables manually.
4. Run the database migration against the production database.
5. Deploy the project.
6. Add the Vercel production domain to Clerk's allowed domains.

Vercel automatically recognizes the Next.js build settings.

## Useful checks

```bash
npm run lint
npm run typecheck
npm run build
```

Run all three before pushing a major change.

## Good next features

- Timeline history for status changes
- Interview contacts and notes
- Email or calendar reminders
- Resume and cover letter uploads
- Kanban board view
- Application analytics and response rates
- Tags and saved filters
- CSV import and export

Build these after the first version is connected, tested, and deployed. A small reliable application is easier to learn from than a large unfinished one.
