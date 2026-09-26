# CoreDesk

Internal client & deployment tracker for BIZTEL AI's client solutions
workflow — pipeline tracking, requirement gathering, specs, go-to-deployment
checklists, and now a full production feature set: roles, an audit trail,
file attachments, comments, soft delete, and a dashboard.

## Stack
- React + Vite (frontend)
- Supabase (auth, Postgres, Storage, Realtime)

## Features
- **Product workspace** (new) — an Idea & Feature Inbox, a Now/Next/Later
  Roadmap board, a PRD/notes pad on every item, a Changelog/release tracker,
  and a Hardware/BOM tracker for physical prototypes
- **Dashboard** — kanban board + sortable table across all clients, CSV export,
  and a live digest of overdue actions, stuck deals, and stale contacts
- **Roles** — first sign-up becomes admin; the `@biztel.ai` domain restriction
  and admin-only permanent-delete are enforced in the database, not just the UI
- **Activity log** — every stage change, issue toggle, and spec status change
  is recorded automatically per client
- **Comments** — threaded discussion with @mentions on each client and each spec
- **File attachments** — upload specs, decks, and photos per client (Supabase Storage)
- **Time-in-stage** — see how long a client has sat in its current pipeline stage
- **Soft delete** — deleted clients land in Trash and can be restored; only
  admins can permanently delete
- **Customizable templates** — admins can edit the default requirement-gathering
  questions and GTD checklist used for every new client (Settings)
- **JSON backup** — export/import the full client list independent of Supabase

## Setup
See `SETUP.md` for the full walkthrough (Supabase project, schema, storage
bucket, env vars, deployment). If you're upgrading an existing CoreDesk
install, just re-run the updated `supabase-setup.sql` — it's safe to run
again and will add the new tables/columns without touching existing data.

## Local development
```
cp .env.example .env   # fill in your Supabase URL + anon key
npm install
npm run dev
```
