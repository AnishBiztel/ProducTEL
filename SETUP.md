# Setup: real login, shared data, and settings

This app now has real login (work email + password), a shared database so
your whole team sees the same clients, and a Settings page to change your
password anytime.

## 1. Create a Supabase project

1. Go to https://supabase.com and sign up (free tier is enough).
2. Click **New Project**. Pick any name and a database password (save it).
3. Wait ~2 minutes for it to provision.

## 2. Create the database schema

1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Paste the full contents of `supabase-setup.sql` (in this folder) and run it.
   This creates the `clients` table, the `profiles` (roles), `client_activity`
   (audit log), `comments`, and `workspace_settings` (default templates) tables,
   the private `client-files` storage bucket, and every RLS policy needed.

**Already have an older ProducTEL database?** Just re-run this same file — every
statement uses `IF NOT EXISTS` / `DROP POLICY IF EXISTS`, so it only adds what's
missing and won't touch your existing clients.

**Note on roles:** the very first person to sign up becomes an **admin**
automatically; everyone after that is a **member**. Admins can permanently
delete clients from Trash, manage teammates' roles, and edit the default
requirement-gathering/GTD templates (all from Settings). If your team already
has accounts and nobody ended up admin, promote yourself directly in
**Table Editor → profiles** by setting your row's `role` to `admin`.

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

## 6. Locking sign-in to your team (invite-only)

The login screen is sign-in only — there's no self-signup — so access is
controlled entirely by which accounts exist in Supabase. To set up your team:

1. **Authentication → Providers → Email → turn off "Allow new users to sign
   up."** This closes the door completely; from now on, accounts only exist
   if created directly in step 2.
2. **Authentication → Users → Add user**, once for each teammate:
   - anish@biztel.ai
   - chetak@biztel.ai
   - pugazh@biztel.ai
   Set the password to `BIZTEL2026` for all three to start (or a different
   one per person if you'd rather). Check "Auto Confirm User" so they don't
   need to click an email confirmation link.
3. That's it — the `@biztel.ai` domain check and the profile/role setup
   (`supabase-setup.sql`, already run) apply automatically the moment each
   account is created, exactly as if they'd signed up themselves. The first
   of the three to log in becomes admin.
4. Since `BIZTEL2026` is a shared starting password, it's worth having each
   person change it the first time they log in — click the gear icon in the
   nav rail → Settings → Change password. That's already built in; no
   further setup needed.

## 7. File attachments

The setup script creates a private `client-files` Storage bucket for you. If
uploads fail with a "bucket not found" error, create it manually: **Storage →
New bucket → name it `client-files`, leave it private**, then re-run
`supabase-setup.sql` so the access policies get attached to it.

## 8. Changing your password

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
