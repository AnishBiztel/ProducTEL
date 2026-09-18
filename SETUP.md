# Setup: real login, shared data, and settings

This app now has real login (work email + password), a shared database so
your whole team sees the same clients, and a Settings page to change your
password anytime.

## 1. Create a Supabase project

1. Go to https://supabase.com and sign up (free tier is enough).
2. Click **New Project**. Pick any name and a database password (save it).
3. Wait ~2 minutes for it to provision.

## 2. Create the database table

1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Paste the full contents of `supabase-setup.sql` (in this folder) and run it.
   This creates the shared `clients` table (including the Requirement
   Gathering and Overview fields) and the security rules that let any
   signed-in user read and write it.

## 3. Get your API keys

1. Go to **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
   (The anon key is meant to be public in frontend code — it's not a secret.
   The actual access control comes from the database rules you just created.)

## 4. Run it locally

```
cp .env.example .env
```

Open `.env` and paste in your Project URL and anon key. Then:

```
npm install
npm run dev
```

Open the local URL it prints. You'll see a login screen — sign up with your
`@biztel.ai` email to create your first account. (Signups are restricted to
that domain in the app itself; see the note below on locking this down
server-side too.)

## 5. Deploy it for real

Push this folder to a GitHub repo (see GIT_UPLOAD.md), then import it in
**Vercel** or **Netlify**. When setting it up, add two environment variables
in their dashboard:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

(same values as your `.env`). The platform builds and deploys automatically
from there, and rebuilds every time you push.

## 6. Managing who can sign in

The app only lets `@biztel.ai` emails through on the sign-up form, but that's
a frontend check only — anyone could bypass it by calling Supabase directly.
For real enforcement, once your team is set up:

- **Authentication → Providers → Email → disable "Allow new users to sign up"**

Then add teammates manually from **Authentication → Users → Add user**, or
keep signups open if `@biztel.ai`-only is enough protection for your case.

## 7. Changing your password

Click the gear icon next to your email at the bottom of the sidebar. That
opens Settings, where you can set a new password anytime — no need to come
back here or ask me to rebuild anything.

## Notes

- Email confirmation is on by default — new sign-ups get a confirmation email
  before they can log in. Turn this off in **Authentication → Providers →
  Email** if you want frictionless internal signups.
- **Export** in the sidebar still works as a JSON backup of everything in the
  shared database, independent of Supabase.
- Realtime sync is enabled by the last line in `supabase-setup.sql`. If a
  teammate's changes aren't showing up live, check **Database → Replication**
  and make sure the `clients` table is included.
