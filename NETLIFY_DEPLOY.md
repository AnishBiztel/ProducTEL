# ProducTEL — Netlify + Supabase deployment

## Netlify

1. Push this folder to GitHub.
2. In Netlify, choose **Add new site → Import an existing project**.
3. Select the GitHub repository.
4. Netlify will use `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add these environment variables in **Site configuration → Environment variables**:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

6. Deploy the site.

The SPA redirect is already included so direct navigation to `/settings` or other client-side routes does not return a 404.

## Supabase

Run `supabase-setup.sql` in **SQL Editor**. Then create the team users under **Authentication → Users**. The application only accepts the `@biztel.ai` domain.

For the initial team password, use the agreed internal password when creating users and have each user change it immediately after first login. Do not commit real passwords or Supabase service-role keys into GitHub or Netlify.

## Production environment

Never put `SUPABASE_SERVICE_ROLE_KEY` in the Vite frontend. Only the public anon key belongs in the frontend environment.
