# Getting this onto GitHub

The easiest way — no software to install, all in your browser.

## 1. Create the repository

1. Go to https://github.com and sign up if you don't have an account.
2. Click the **+** icon (top right) → **New repository**.
3. Name it something like `client-tracker`.
4. Set it to **Private** (this has your company's client data logic in it).
5. Don't check any of the "Initialize with..." boxes.
6. Click **Create repository**.

## 2. Upload the files

1. On the new (empty) repo page, click **"uploading an existing file"**
   (it's a link in the instructions GitHub shows you).
2. Unzip the project file I gave you, so you have a folder with all these
   files and subfolders inside it (`src/`, `package.json`, etc.) — NOT the
   zip file itself.
3. Drag that folder's **contents** (select everything inside it, not the
   outer folder) into the GitHub upload box. Same drag-and-drop motion as
   Netlify.
4. Scroll down, add a short commit message like "Initial commit", and click
   **Commit changes**.

That's it — your code is now on GitHub.

## 3. Connect it to Vercel or Netlify for auto-deploy

1. Go to **vercel.com** (or netlify.com) and sign in — you can sign in
   directly with your GitHub account, which makes this step faster.
2. Click **Add New Project** (Vercel) or **Import from Git** (Netlify).
3. Pick the `client-tracker` repository you just created.
4. Before deploying, add these two environment variables (same values as
   your local `.env` file):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click Deploy.

From now on, whenever you want to update the live site: repeat step 2 above
(drag new files into the GitHub upload page, or use "Add file → Upload
files" on an existing repo to replace things), and Vercel/Netlify will
automatically rebuild and redeploy within a minute or two. No more manual
zip-and-drag to Netlify's Deploys tab.

## A note on skill-building (optional, for later)

The proper way developers do this is with Git installed on their computer —
`git add`, `git commit`, `git push` — which gives you version history, the
ability to undo changes, and branches. It's worth learning eventually since
it's a real, valuable skill, but the web-upload method above works perfectly
fine for now and gets you the exact same result.
