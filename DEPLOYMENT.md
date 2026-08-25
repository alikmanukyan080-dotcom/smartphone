# Deploying Nova Mobile to a Real Domain (Free Tier)

This uses 3 free services: **MongoDB Atlas** (database), **Render** (backend API),
**Vercel** (frontend). You need your own free accounts on each — I can't create these
for you, since they require your email/verification.

---

## Step 1 — Push your project to GitHub

Render and Vercel both deploy by connecting to a GitHub repo.

1. Create a free account at https://github.com if you don't have one.
2. Create a new repository (e.g. `nova-mobile-store`).
3. In VS Code terminal, from the project root:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/nova-mobile-store.git
   git push -u origin main
   ```

---

## Step 2 — Database: MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free).
2. Create a free **M0 cluster** (any provider/region is fine).
3. **Database Access** → Add a database user (username + password — save these).
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
   — needed since Render's IP isn't fixed on the free tier.
5. **Connect** → **Drivers** → copy the connection string, it looks like:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/smartphone-store?retryWrites=true&w=majority
   ```
   Replace `USERNAME`/`PASSWORD` with what you created, and keep `/smartphone-store` as the database name.

Keep this string — it's your `MONGODB_URI`.

---

## Step 3 — Backend: Render

1. Go to https://render.com and sign up (free, can use GitHub login).
2. **New** → **Web Service** → connect your GitHub repo.
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Under **Environment**, add these variables (Environment tab → Add Environment Variable):
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | (from Step 2) |
   | `JWT_SECRET` | any long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | *(fill in after Step 4 — your Vercel URL)* |
   | `SMTP_HOST` | your SMTP host, or leave blank for now |
   | `SMTP_PORT` | `587` |
   | `SMTP_SECURE` | `false` |
   | `SMTP_USER` | your SMTP user, or leave blank |
   | `SMTP_PASS` | your SMTP password, or leave blank |
   | `STORE_EMAIL` | your store's email, or leave blank |
   | `STORE_NAME` | `Nova Mobile` |
   | `DELIVERY_FEE` | `5.99` |
   | `FREE_DELIVERY_THRESHOLD` | `200` |
5. Click **Create Web Service**. Wait for the build to finish.
6. Copy your live backend URL, e.g. `https://nova-mobile-api.onrender.com`.

**Note:** the free tier sleeps after 15 minutes of inactivity — the first request after
a sleep takes 30-60 seconds to wake up. This is normal on free hosting.

### Seed data + create your admin (one-time, from Render's Shell tab)

In Render, open your service → **Shell** tab, then run:
```bash
npm run seed
npm run create-admin -- --name "Store Owner" --email owner@example.com --password "StrongPass123"
```

---

## Step 4 — Frontend: Vercel

1. Go to https://vercel.com and sign up (free, can use GitHub login).
2. **Add New** → **Project** → import the same GitHub repo.
3. Settings:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite (should auto-detect)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
4. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://nova-mobile-api.onrender.com/api` (your Render URL from Step 3 + `/api`) |
5. Click **Deploy**.
6. Copy your live frontend URL, e.g. `https://nova-mobile-store.vercel.app`.

### Go back and finish Render's CLIENT_URL

7. Back in Render → your service → Environment → set `CLIENT_URL` to your Vercel URL
   from step 6 (e.g. `https://nova-mobile-store.vercel.app`) — this is required for CORS
   to allow your frontend to talk to your backend. Save — Render will redeploy automatically.

---

## Step 5 — Connect your own domain

- **On Vercel:** Project → Settings → Domains → add your domain, follow the DNS
  instructions Vercel gives you (usually a CNAME or A record at your domain registrar).
- **On Render:** you can also add a custom domain for the API (e.g. `api.yourdomain.com`)
  under your service → Settings → Custom Domain, if you'd rather not expose the
  `onrender.com` URL. If you do this, update `VITE_API_URL` on Vercel to match, and
  `CLIENT_URL` on Render to match your final frontend domain.

---

## Checklist after deployment

- [ ] Visit your Vercel URL — homepage loads, shows seeded phones
- [ ] `/admin/login` — log in with the admin you created in Step 3
- [ ] Add a product from the admin panel — confirm it appears on the storefront
- [ ] Place a test order — confirm it appears in Admin → Orders
- [ ] If SMTP is configured, confirm the order email arrives

If any step throws an error, copy the exact error message here and I'll help you fix it.
