# AGENT.md — Class Portal handoff

Last updated: 2026-11-08

This file is the source of truth for any agent continuing work on this project. Read it before changing code. Update the **Status** and **Change log** sections whenever you change files.

## What this project is

A private class website for about 72 students. Students log in with a Student ID and password. Content admins post announcements, assignments, homework, exams, and class updates. The Head Admin also manages students, subjects, attendance, and class settings.

Stack:

- Next.js 14.2.15 (App Router) + React 18 + TypeScript
- Tailwind CSS
- Supabase Auth + Postgres + Row Level Security
- Deploy target: Vercel (Hobby). Cron in `vercel.json` hits `/api/cron/generate-reminders` daily at 03:00 UTC.
- PWA: `public/manifest.json`, `public/sw.js`, `public/offline.html`

There is no AI, no email service, and no file-upload storage. Attachments and memory photos are URL text fields. Photo files belong in Google Drive (or any host that gives an https link). Students cannot self-register. Password reset is done by the Head Admin.

App root (run all commands here):

`C:\Users\ankit\Downloads\class-portalnew\class-portal`

The parent folder `class-portalnew` is only a download wrapper. Do not treat it as the Next.js root.

## Status (as of 2026-11-08)

| Item | State |
| --- | --- |
| Source code | Glassmorphic purple/rainbow UI, class information table, memories (photo links only), and save fixes added on 2026-11-08. |
| `npm install` | Done on 2026-11-08. 400 packages installed. `npm run dev` is ready once `.env.local` exists. |
| Node | v24.18.0, npm 11.16.0, on Windows (PowerShell) |
| `.env.local` | **Filled on 2026-11-08.** URL, publishable key, secret key, domain `studentportal.local`, and `CRON_SECRET` are set. The owner first pasted them into `.env.local.example`; they were moved into `.env.local`, and the example file was restored to placeholders. Do not commit `.env.local`. Do not print the secret key or `CRON_SECRET`. |
| Supabase project | Project URL is set (`https://deodkggjomjruwbgkvev.supabase.co`). First `schema.sql` run succeeded. Head Admin can sign in. Do not re-run the full `schema.sql`. Run `supabase/add-class-information.sql` once if the information table is still missing, and run `supabase/add-class-memories.sql` once so Memories can save. Photo files are not stored in Supabase; only link text is. |
| Head Admin user | Created. UID `412e7fa0-d430-4487-baaf-621243ccc85d`. Login Student ID `HEADADMIN`. |
| Git | **Not initialized** inside `class-portal`. |
| GitHub / Vercel | **Not connected.** |
| Local dev server | Not started. Do not start it until `.env.local` has real Supabase values. |

Nothing has been deployed. The owner still needs to create the Supabase project and paste keys. Agents must not invent keys, commit secrets, or push to a remote unless the owner asks.

## How login works

Students type a Student ID, never an email. The app turns that ID into a fake email for Supabase Auth:

`studentIdToEmail()` in `lib/auth/studentId.ts`

Example: Student ID `CS2024001` becomes `cs2024001@studentportal.local` when `NEXT_PUBLIC_STUDENT_ID_EMAIL_DOMAIN=studentportal.local`.

The Head Admin's first account must use the same domain. README default:

- Email: `headadmin@studentportal.local`
- Student ID stored in `profiles`: `HEADADMIN`
- Login on the website: Student ID `HEADADMIN` plus the password chosen in Supabase Auth

Later accounts are created in the website at `/admin/students`. That calls `app/api/admin/create-user/route.ts`, which uses the **service role** key. New students get `must_change_password = true` and are forced to `/change-password` by `middleware.ts`.

Roles: `student`, `content_admin`, `head_admin`. Students who open `/admin/*` are redirected to `/dashboard`.

## Environment variables

File: `.env.local` (gitignored). Same five names must be set in Vercel before the first deploy.

| Name | Where it is used | Secret? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server Supabase clients | Public project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser and server; RLS still applies | Public anon key |
| `NEXT_PUBLIC_STUDENT_ID_EMAIL_DOMAIN` | `lib/auth/studentId.ts`. Default `studentportal.local` | No |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/admin.ts` and admin API routes only | **Yes. Never prefix with NEXT_PUBLIC_. Never commit.** |
| `CRON_SECRET` | Protects `app/api/cron/generate-reminders/route.ts` | **Yes. Random string. Never commit.** |

On Windows PowerShell, create the random cron secret with:

```powershell
[guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
```

Copy the example file with:

```powershell
Copy-Item .env.local.example .env.local
```

Supabase UI path for the keys (new dashboard): **Project Settings → API** (or **API Keys**). You need:

- Project URL
- `anon` / public key (may be labeled "publishable" in newer dashboards — use the anon/public client key this app expects, not a secret key)
- `service_role` key (secret)

If the dashboard shows only new `sb_publishable_...` / `sb_secret_...` keys and no JWT anon/service_role keys, open the legacy **anon** and **service_role** JWT keys. This app uses `@supabase/supabase-js` and `@supabase/ssr` and expects those JWT keys.

## Database

One-time script: `supabase/schema.sql`

Run the **entire file** once in the Supabase SQL Editor. It creates tables, RLS policies, indexes, a notification trigger, one class row (`B.Tech CSE`), and one `class_settings` row. Success message is typically "Success. No rows returned."

As of 2026-11-08, public policies are dropped and recreated at the start of the policy section, so running the file again no longer fails with "policy already exists." Table creates use `if not exists`, and the class seed only inserts when `classes` is empty. Still avoid casual re-runs after real student data exists; re-running resets security policies to this file's version.

After the schema, create the Head Admin in **Authentication → Users → Add user**, with **Auto Confirm** checked, then insert the matching `profiles` row. Exact SQL is in `README.md` section "Create your Head Admin account". Replace the UID and keep the email domain identical to `NEXT_PUBLIC_STUDENT_ID_EMAIL_DOMAIN`.

## Local run

From `class-portal`:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. Log in with Student ID `HEADADMIN`.

Useful scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`.

## Deploy path (do this only when the owner asks)

1. Confirm `.env.local` is gitignored and not staged.
2. `git init` inside `class-portal` only, commit, create a GitHub repo, push `main`.
3. Import that repo on Vercel. Framework preset: Next.js. Root directory is the repo root if the repo is `class-portal` itself.
4. Add the same 5 environment variables in Vercel for Production (and Preview if they want preview deploys).
5. Deploy. `vercel.json` registers the cron. Vercel sends `Authorization: Bearer <CRON_SECRET>` to cron routes; the route must already check that header. Verify `app/api/cron/generate-reminders/route.ts` before relying on it.
6. Share the `*.vercel.app` URL. Students can Add to Home Screen (PWA). HTTPS is required; localhost is only for testing install.

Supabase free tier pauses after about a week of inactivity. Opening the Supabase dashboard wakes it.

## Map of important files

- `middleware.ts` — auth gate, forced password change, admin role gate
- `lib/supabase/client.ts` — browser client (anon key)
- `lib/supabase/server.ts` — cookie-based server client
- `lib/supabase/admin.ts` — service role client (server only)
- `lib/auth/studentId.ts` — Student ID → email
- `lib/auth/getProfile.ts` — current user's profile
- `app/login/page.tsx` — login UI
- `app/api/admin/create-user/route.ts` — Head Admin creates one account
- `app/api/admin/bulk-create-students/route.ts` — bulk add
- `app/api/admin/reset-password/route.ts` — Head Admin resets a password
- `app/api/cron/generate-reminders/route.ts` — daily reminder job
- `app/admin/students/page.tsx` — student management
- `app/admin/settings/page.tsx` — class name, WhatsApp links
- `app/admin/information/page.tsx` — editable class information table
- `components/information/InfoEditor.tsx` — add, edit, and delete information rows
- `app/memories/page.tsx` — student gallery of class memories
- `app/admin/memories/page.tsx` — admins add memories and photo links
- `components/memories/MemoriesEditor.tsx` — memory form; converts Google Drive share links
- `lib/memories/photoUrl.ts` — turns a Drive file link into a display URL
- `supabase/schema.sql` — full database
- `supabase/add-class-information.sql` — one-time script for a database that already exists
- `supabase/add-class-memories.sql` — one-time script for memories. Do not re-run `schema.sql`.
- `README.md` — owner-facing setup (keep this accurate if behavior changes)
- `.env.local.example` — variable names only

## Rules for later agents

- Update this file's Status and Change log in the same session as any code, schema, or config change.
- Do not commit `.env.local`, service role keys, or `CRON_SECRET`.
- Do not add paid services, AI features, or a public sign-up page unless the owner asks.
- Do not re-run `schema.sql` against a database that already has students.
- Do not change the email-domain trick without updating existing Auth users. IDs and the domain must stay in sync.
- Windows shell is PowerShell. Use `Copy-Item`, not `cp`, unless Git Bash is confirmed.
- Do not start a second `npm run dev` if one is already running.
- After UI changes, verify in the browser (login, student vs admin routes) before saying the task is done.
- Owner asked for step-by-step explanations in chat. Keep chat explanations in plain language. Keep this file factual and current.

## Change log

- **2026-11-08** — Setup agent read the project, confirmed Node v24.18.0 / npm 11.16.0, ran `npm install` (400 packages, exit 0), and created this file. No application source was edited. npm printed a warning that `next@14.2.15` has a security advisory (https://nextjs.org/blog/security-update-2025-12-11). Do not upgrade Next unless the owner asks; stay on the patched 14.x line if you do.
- **2026-11-08** — Owner saved Supabase URL, publishable key (`sb_publishable_...`), secret key (`sb_secret_...`), and a 64-character `CRON_SECRET` into `.env.local.example` by mistake. Values were copied to `.env.local` and the example file was restored to placeholders. App source was not changed. Next step is to confirm `schema.sql` has been run, create the Head Admin, then `npm run dev`.
- **2026-11-08** — Owner's second SQL Run failed with `42710` (policy "Anyone logged in can read their own class" already exists). `supabase/schema.sql` now drops existing `public` policies before creating them again. Local dev server was already started at http://localhost:3000. Head Admin is still not created.
- **2026-11-08** — Owner confirmed the first schema run already succeeded. Do not ask them to run `schema.sql` again. Next step is the Head Admin auth user plus the `profiles` insert.
- **2026-11-08** — Owner created the Head Admin auth user. UID `412e7fa0-d430-4487-baaf-621243ccc85d`. They still need to run the `profiles` insert, then sign in at http://localhost:3000 with Student ID `HEADADMIN`.
- **2026-11-08** — Owner signed in. UI restyled to a purple glass / rainbow look, including the login page. Admin links are a top bar on every screen size. Class information table added (`class_information`). Subjects no longer send a `created_by` column they do not have. Empty date fields are saved as null, and a save that changes zero rows now shows an error. Owner must run `supabase/add-class-information.sql` once.
- **2026-11-08** — Memories section added at `/memories` and `/admin/memories`. Tables `class_memories` and `memory_photos` store title, story, date, and image URLs only. Owner must run `supabase/add-class-memories.sql` once. Do not re-run `schema.sql`.
- **2026-11-08** — Memories admin copy simplified to: paste a photo link when one exists. No Drive script in the page.
