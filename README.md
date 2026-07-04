# AI Mock Interview Platform

AI Mock Interview is a full-stack interview preparation app built with Next.js, Clerk, Gemini, Drizzle, Neon, and Tailwind CSS.

## Features

- Role-specific AI interview generation
- Interview modes: technical, behavioral, system design, DSA, frontend, backend, ML, and HR
- Resume, selected mode, and skill-context grounding
- Browser speech-to-text answer capture
- Server-side Gemini answer evaluation
- Rubric scoring across correctness, completeness, clarity, tradeoffs, and communication
- Per-question coaching tips and improved answers
- Overall readiness report and category scores
- Personalized practice-plan generation
- Authenticated per-user interview ownership checks
- AI trace storage for model, prompt version, latency, token metadata, and payloads
- Local demo mode when `DATABASE_URL` or `GEMINI_API_KEY` is not configured

## Tech Stack

- Next.js 15
- React 19
- Clerk authentication
- Gemini API
- Neon Postgres
- Drizzle ORM
- Tailwind CSS
- Shadcn-style UI primitives
- Zod validation

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
DATABASE_URL=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Do not expose `DATABASE_URL` or `GEMINI_API_KEY` with `NEXT_PUBLIC_`.

The app can run without `DATABASE_URL` and `GEMINI_API_KEY` for demos:
- Missing `DATABASE_URL`: interviews, profile context, answers, reports, and practice plans are stored in browser localStorage.
- Missing `GEMINI_API_KEY`: generation, scoring, and practice plans use the local fallback engine.
- Clerk keys are still required for authenticated dashboard access.

## Production Setup

1. Create a Clerk app and copy the publishable key plus secret key into `.env.local`.
2. Create a Neon Postgres project and copy the pooled connection string into `DATABASE_URL`.
3. Add a Gemini API key to `GEMINI_API_KEY`.
4. Run `npm run db:push` to create/update the database schema.
5. Run `npm run build` before deployment.

## Database

The schema lives in `utils/schema.js`.

For existing databases, apply:

```bash
drizzle/0001_ai_platform_upgrade.sql
```

Then run:

```bash
npm run db:push
```

If the old database URL was ever committed publicly, rotate the Neon password before deploying.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality Checks

```bash
npm run lint
npm run format:check
npm run build
```

CI runs install, lint, format check, and build through GitHub Actions.

## Architecture

The client never imports Gemini or Drizzle directly. Browser components call authenticated API routes:

- `GET /api/interviews`
- `POST /api/interviews`
- `GET /api/interviews/:id`
- `DELETE /api/interviews/:id`
- `GET /api/interviews/:id/answers`
- `POST /api/interviews/:id/answers`
- `GET /api/interviews/:id/feedback`
- `GET /api/interviews/:id/report`
- `POST /api/interviews/:id/practice-plan`
- `GET /api/profile`
- `PUT /api/profile`

Server modules under `utils/server` handle auth, validation, ownership checks, AI calls, traces, scoring, reports, and practice plans.
