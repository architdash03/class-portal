# Class Portal

A private class management website for ~72 students, built with Next.js, TypeScript, Tailwind CSS, and Supabase. No AI features, no paid services.

---

## 1. What's inside

- **Students** log in with a Student ID + password and can view announcements, assignments, homework, exams, class updates ("What Was Taught"), "What Did I Miss?", their own attendance, and notifications.
- **Content Admins** can create/edit/delete announcements, assignments, homework, exams, and class updates.
- **Head Admin** can additionally manage students, content admins, subjects, attendance, and class-wide settings (including WhatsApp links).
- Security is enforced by Supabase **Row Level Security** — even if someone edits the URL or inspects network requests, they cannot read or write data outside their role/class.

---

## 2. One-time setup

### Step 1 — Install dependencies

```bash
npm install
```

### Step 2 — Create your Supabase project

1. Go to [supabase.com](https://supabase.com) → sign in → **New Project**.
2. Name it, set a database password (save it somewhere safe), pick your region, click **Create**.
3. Wait ~2 minutes for it to finish provisioning.

### Step 3 — Run the database schema

1. In your Supabase project, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `supabase/schema.sql` from this project, copy **all of it**, and paste it into the SQL editor.
4. Click **Run**. You should see "Success. No rows returned."

This creates every table, all security policies, indexes, one default class ("B.Tech CSE" — rename this later in Settings), and an automatic-notification trigger for new announcements.

### Step 4 — Get your API keys

1. In Supabase, go to **Project Settings → API**.
2. Copy the **Project URL**.
3. Copy the **anon public** key.
4. Copy the **service_role** key (keep this one secret — never share it or commit it).

### Step 5 — Environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=<your project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
NEXT_PUBLIC_STUDENT_ID_EMAIL_DOMAIN=studentportal.local
SUPABASE_SERVICE_ROLE_KEY=<your service_role key>
CRON_SECRET=<any random string — run: openssl rand -hex 32>
```

`.env.local` is already excluded from git via `.gitignore`. Never commit it.

### Step 6 — Create your Head Admin account

Because the Head Admin is the only one who can create other accounts, the very first one has to be created manually:

1. In Supabase, go to **Authentication → Users → Add user → Create new user**.
   - Email: `headadmin@studentportal.local` (must end in whatever domain you set in `NEXT_PUBLIC_STUDENT_ID_EMAIL_DOMAIN`)
   - Password: choose a strong one, save it somewhere safe.
   - Check **Auto Confirm User**.
2. Copy the new user's **UID** (shown in the users list).
3. Go to **SQL Editor** and run (replace the two placeholder values):

```sql
insert into profiles (auth_user_id, full_name, student_id, email, role, class_id, is_active)
select
  '<paste the UID here>',
  'Head Admin',
  'HEADADMIN',
  'headadmin@studentportal.local',
  'head_admin',
  id,
  true
from classes
limit 1;
```

That's it — you now have one working Head Admin account. Every other account (students and content admins) can be created **from inside the website** at `/admin/students` once you're logged in as Head Admin — no more manual SQL needed.

### Step 7 — Run it locally

```bash
npm run dev
```

Visit `http://localhost:3000`, log in with Student ID `HEADADMIN` and the password you chose, and you'll land on the Head Admin dashboard.

---

## 3. Adding your real students

Once logged in as Head Admin:

1. Go to **Students** in the sidebar.
2. Click **+ Add**, enter their name, a Student ID (e.g. their roll number), and a temporary password.
3. Repeat for all ~72 students (or content admins, using the role dropdown).
4. Share each student's ID and temporary password with them individually. There's no self-registration by design — this keeps the class private.

Students can't change their own password from inside the app yet (v1 keeps this simple). If a student forgets their password, the Head Admin can reset it from the Students page — this uses the same secure server-side flow as account creation.

---

## 4. Setting up class info

As Head Admin, go to **Settings**:

- Rename the class ("B.Tech CSE" is just a placeholder from setup).
- Paste your WhatsApp group invite link and WhatsApp channel link — these appear as buttons on every student's dashboard.

Go to **Subjects** to add your actual subjects (e.g. Mathematics, Physics) — these show up as dropdowns everywhere else (assignments, exams, attendance, etc.).

---

## 5. Testing checklist

Before handing this to your class, test:

- [ ] Log in as Head Admin → create one test student account → log out.
- [ ] Log in as that test student → confirm you land on `/dashboard`, not the admin area.
- [ ] Try visiting `/admin/dashboard` while logged in as the student — you should get redirected back to `/dashboard`.
- [ ] As Head Admin, add an announcement → log in as the student → check the notification bell shows an unread notification.
- [ ] As Head Admin/Content Admin, add an assignment with a due date → check it shows up on the student dashboard with the right "Due in X days" label.
- [ ] As a student, mark an assignment complete → confirm the status updates and admins can see the completion count.
- [ ] As Head Admin, mark attendance for a date → log in as the student → confirm they see it, and confirm a *different* student does not see it.
- [ ] Test on your phone (or resize your browser) to confirm the layout holds up on mobile.

---

## 6. Deploying (free)

### Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
```

Create a new repository on [github.com](https://github.com), then:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

**Double-check `.env.local` is NOT in this commit** — run `git status` and confirm it's not listed. It shouldn't be, because it's in `.gitignore`.

### Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub → **Add New Project**.
2. Import your repository.
3. Before deploying, click **Environment Variables** and add the same 5 variables from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_STUDENT_ID_EMAIL_DOMAIN`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CRON_SECRET`
4. Click **Deploy**.

Vercel will build your site and give you a live URL (e.g. `your-class.vercel.app`) — share this with your class.

The `vercel.json` file in this project automatically sets up a daily cron job (3 AM) that generates reminder notifications for assignments/homework/exams — no extra setup needed, it activates automatically on deploy (Vercel's free Hobby plan supports this).

### Redeploying after changes

Any time you push to the `main` branch on GitHub, Vercel redeploys automatically.

---

## 7. Notes on free-tier limits

- **Supabase free tier**: 500MB database, 1GB file storage, 50,000 monthly active users, projects pause after 1 week of inactivity (just visit the dashboard to wake it up — takes a few seconds). This is far more than enough for 72 students.
- **Vercel free (Hobby) tier**: generous bandwidth/build limits for a project this size, and now supports daily cron jobs.
- No paid APIs, SMS, or WhatsApp automation are used anywhere in this project.

---

## 8. Installing it as an app (free — no app store needed)

This project is a PWA (Progressive Web App). Once it's deployed to Vercel (HTTPS is required for this to work — `localhost` also works for testing), anyone can install it to their phone's home screen like a real app, for free:

**On Android (Chrome):** open the site → tap the ⋮ menu → **Add to Home screen** (or Chrome may show an "Install app" banner automatically).

**On iPhone (Safari):** open the site → tap the Share icon → **Add to Home Screen**.

Once installed, it opens full-screen with its own icon and no browser address bar, and keeps working (showing a simple offline page) if the connection briefly drops.

Share this as one line to your class: *"Open [your-site].vercel.app in your browser, then Add to Home Screen — it'll work like an app."* No Play Store, no App Store, no fees.

If you ever wanted a real Play Store / App Store listing instead, the same code can be wrapped with a free tool called Capacitor — but that requires the store fees mentioned earlier (Google: $25 one-time, Apple: $99/year), which most classes don't need.

---

## 9. What's intentionally simple in v1

- File attachments use direct URL fields, not file upload UI — this keeps things reliable without needing to wire up Supabase Storage buckets/policies right away. If you want real file uploads, this is the cleanest thing to add next.
- Browser push notifications are not included — the in-app notification bell is the reliable, tested channel, per the original spec's priority.
- No calendar grid view for exams (list + upcoming cards only) — kept intentionally simple.
- Password reset for students goes through the Head Admin (no self-service "forgot password" email flow), since this avoids needing an email-sending service.

None of these are technical limitations — they're intentional scope choices for a fast, reliable v1. Let me know if you'd like any of them built out further.

