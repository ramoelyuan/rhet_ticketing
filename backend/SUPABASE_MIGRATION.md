# Migrate database to Supabase – step by step

Follow these steps in order. The app is already set up to use Supabase once you have a connection string.

---

## Step 1: Create a Supabase project

1. Go to **https://supabase.com** and sign in (or create an account).
2. Click **New project**.
3. Choose your **organization** (or create one).
4. Set **Project name** (e.g. `rhet-ticketing`).
5. Set a **Database password** and **save it somewhere safe** (you need it for the connection string).
6. Pick a **region** close to you.
7. Click **Create new project** and wait until the project is ready (1–2 minutes).

---

## Step 2: Get your database connection string

1. In the Supabase dashboard, open your project.
2. Click the **Settings** (gear) icon in the left sidebar.
3. Go to **Database**.
4. Scroll to **Connection string**.
5. Select the **URI** tab.
6. Copy the connection string. It looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
7. Replace **`[YOUR-PASSWORD]`** with the database password you set in Step 1.

---

## Step 3: Run the schema in Supabase

1. In the Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file **`backend/db/schema.sql`** on your computer, copy **all** of its contents, and paste into the SQL Editor.
4. Click **Run** (or press Ctrl+Enter).
5. Confirm it runs without errors (you should see “Success. No rows returned”).

---

## Step 4: Run the seed in Supabase

1. In the same **SQL Editor**, click **New query** again (new tab).
2. Open **`backend/db/seed.sql`** on your computer, copy **all** of its contents, and paste into the editor.
3. Click **Run**.
4. Confirm it runs without errors.

You now have tables and seed data (categories + users: employee, tech1, tech2, admin – password `Password123!`).

---

## Step 5: Update your app’s `.env`

1. Open **`backend/.env`** in your project.
2. Replace the current **`DATABASE_URL`** line with your Supabase connection string from Step 2.

Example:

```env
DATABASE_URL=postgresql://postgres.xxxxx:YourPasswordHere@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

Keep your other variables (e.g. `PORT`, `JWT_SECRET`, `UPLOAD_DIR`) as they are.

3. Save the file.

---

## Step 6: Restart the backend and test

1. Stop your backend if it’s running (Ctrl+C in the terminal).
2. Start it again, e.g.:
   ```bash
   cd backend
   npm run dev
   ```
3. Open your app in the browser and **log in** with one of the seed accounts (e.g. `admin@company.com` / `Password123!`).

If login works and you see data, the migration is done.

---

## Checklist

| Step | What you did |
|------|----------------|
| 1 | Created Supabase project and saved DB password |
| 2 | Copied Database URI and replaced `[YOUR-PASSWORD]` |
| 3 | Ran `backend/db/schema.sql` in Supabase SQL Editor |
| 4 | Ran `backend/db/seed.sql` in Supabase SQL Editor |
| 5 | Set `DATABASE_URL` in `backend/.env` to the Supabase URI |
| 6 | Restarted backend and tested login |

---

## If something goes wrong

- **`ENOTFOUND db.xxxxx.supabase.co`**  
  The direct database host is not resolving. Use the **Session pooler** URL instead:
  1. In Supabase: **Settings** → **Database** → **Connection string**.
  2. Choose **Session mode** (or **Connection pooling**).
  3. Copy the **URI** – it should look like  
     `postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`  
     (host must be **pooler.supabase.com**, not `db....supabase.co`).
  4. Put that URI in `backend/.env` as `DATABASE_URL`, then restart the backend.

  Also check the project is **not paused**: in the Supabase dashboard, if you see “Project paused”, click **Restore project**.

- **“Connection refused” or “timeout”**  
  Double-check the connection string, password, and that the Supabase project is running. Ensure the URL contains `supabase` (the app enables SSL automatically for Supabase).

- **“relation does not exist”**  
  The schema did not run correctly. Run **Step 3** again (all of `schema.sql`).

- **Login fails**  
  Run **Step 4** again so seed users exist. Confirm you’re using `Password123!` for the seed accounts.

- **SSL errors**  
  The backend is already configured to use SSL when `DATABASE_URL` contains `supabase`. If you still see SSL errors, say what you see and we can adjust.
