# Client & Spec Tracker

Internal tool for tracking client deployments, requirement gathering, specs,
and go-to-deployment checklists — built for BIZTEL AI's client solutions workflow.

## Stack
- React + Vite (frontend)
- Supabase (auth + shared Postgres database, live sync)

## Setup
See `SETUP.md` for the full walkthrough (Supabase project, schema, env vars, deployment).

## Local development
```
cp .env.example .env   # fill in your Supabase URL + anon key
npm install
npm run dev
```
