# Nova Mobile — Premium Smartphone Store (Full Stack)

A complete MERN e-commerce application for a smartphone store: dynamic product catalog with
color/storage variants, cart, checkout, order emails, an admin panel that controls the entire
store, and a database-driven chatbot.

**Stack:** React + React Router (Vite) · Node.js + Express · MongoDB + Mongoose · Nodemailer · JWT

---

## 1. Project Overview

- `/client` — React storefront + admin panel (Vite)
- `/server` — Express REST API, MongoDB models, email service, chatbot logic

Nothing about products, brands, or prices is hard-coded in the frontend or the chatbot — everything
is read live from MongoDB through the API. The admin panel is the only way products, brands,
categories, colors, storage, and orders are managed.

---

## 2. Requirements

- Node.js 18+ and npm
- A MongoDB database (local install, Docker, or a free MongoDB Atlas cluster)
- An SMTP account for sending email (Gmail App Password, SendGrid, Mailgun, Postmark, etc.)

---

## 3. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/smartphone-store
# or an Atlas URI: mongodb+srv://user:pass@cluster.mongodb.net/smartphone-store

JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=you@example.com
SMTP_PASS=your-app-password
STORE_EMAIL=owner@example.com
STORE_NAME="Nova Mobile"

DELIVERY_FEE=5.99
FREE_DELIVERY_THRESHOLD=200
```

Generate a strong `JWT_SECRET`, e.g.: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### Seed sample data (optional but recommended for first run)

```bash
npm run seed
```

This creates sample brands, categories and phones (with color/storage variants) so the storefront
isn't empty.

### Create your admin account

```bash
npm run create-admin -- --name "Store Owner" --email owner@example.com --password "A-Strong-Password-123"
```

### Run the API

```bash
npm run dev      # nodemon, auto-restart
# or
npm start
```

The API runs at `http://localhost:5000`. Health check: `GET /api/health`.

---

## 4. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The storefront runs at `http://localhost:5173` and proxies `/api` requests to `http://localhost:5000`
(configured in `vite.config.js`). Admin panel: `http://localhost:5173/admin/login`.

### Production build

```bash
npm run build
npm run preview   # preview the production build locally
```

Deploy the contents of `client/dist` to any static host (Vercel, Netlify, S3+CloudFront, Nginx),
and point it at your deployed API by adjusting the proxy/base URL for production, or by serving
both from the same origin behind a reverse proxy.

---

## 5. SMTP Setup

The email service (`server/services/emailService.js`) sends:

1. An HTML notification to `STORE_EMAIL` whenever a new order is placed.
2. An HTML confirmation to the customer's email whenever a new order is placed.
3. An optional status-update email to the customer whenever an admin changes an order's status
   from the admin panel (checkbox: "Notify customer by email").

**If SMTP is not configured**, the server does not crash — it logs the email content to the
console instead, so you can develop without real credentials and wire up SMTP later.

For Gmail: enable 2-Step Verification, then generate an "App Password" and use that as `SMTP_PASS`
(not your regular password).

---

## 6. Chatbot

The chatbot (`server/controllers/chatController.js`) answers using **live MongoDB data only** —
brand names, prices, colors, storage, and 5G support are all queried from the database per message.
Nothing about specific phones is hard-coded.

Admin can control the chatbot from `/admin/chatbot`:

- Enable/disable
- Welcome message
- Quick questions shown before the first reply
- FAQs (simple keyword-matched fallback answers)
- Store info / delivery info (used in relevant answers)

---

## 7. Admin Panel — what it controls

Everything in the spec is manageable without touching code, from `/admin`:

- **Products**: add/edit/delete/hide/show/duplicate, full spec sheet, unlimited color variants
  (name + hex + images + stock + SKU), unlimited storage variants (capacity + price + old price +
  stock + SKU), tags, badges (NEW/SALE/POPULAR/BEST_SELLER/LIMITED/FEATURED)
- **Brands**: add/edit/delete/hide, logo, description, featured flag
- **Categories**: add/edit/delete
- **Orders**: view all orders, filter by status/search, view full order detail, change status
  (NEW → CONFIRMED → PROCESSING → READY → DELIVERED / CANCELLED) with optional customer email
- **Dashboard**: total products/orders, pending/completed/cancelled counts, revenue, low stock,
  today's orders, recent orders, popular phones
- **Chatbot settings**: enable/disable, welcome message, quick questions, FAQs, store/delivery info

---

## 8. Development Commands Reference

**Server** (`/server`):
```bash
npm run dev           # start with nodemon
npm start              # start production
npm run seed            # populate sample brands/categories/products
npm run create-admin -- --name "X" --email x@x.com --password "Pass1234"
```

**Client** (`/client`):
```bash
npm run dev       # start Vite dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
```

---

## 9. Deployment Notes

- Backend: deploy to any Node host (Render, Railway, Fly.io, a VPS with PM2, etc.). Set all `.env`
  variables in the host's environment/secrets manager — never commit `.env`.
- Database: MongoDB Atlas is the simplest managed option.
- Frontend: deploy `client/dist` as a static site, and set `CLIENT_URL` on the backend to your
  deployed frontend origin (for CORS), and update the frontend's API base URL / proxy for
  production (e.g. via an environment-specific `vite.config.js` proxy or a reverse proxy that
  serves `/api` and the static frontend from the same origin).
- Set `NODE_ENV=production` on the backend in production.

---

## 10. Troubleshooting

- **"MongoDB connection error"** — check `MONGODB_URI`, confirm your IP is allow-listed if using
  Atlas, and confirm the database user's credentials.
- **Emails not arriving** — check the server console; if SMTP isn't configured the email is logged
  instead of sent. Confirm `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` and that your provider
  allows SMTP access (Gmail requires an App Password, not your normal password).
- **401 errors in the admin panel** — your JWT may have expired; log in again. Confirm `JWT_SECRET`
  is set and hasn't changed since the token was issued.
- **CORS errors** — confirm `CLIENT_URL` in the backend `.env` matches the exact origin the
  frontend is served from.
- **Empty storefront** — run `npm run seed` in `/server`, or add products from `/admin/products/new`.

---

## 11. Security Notes

- Passwords are hashed with bcrypt (12 rounds); never stored in plain text.
- Admin routes are protected by JWT (`middleware/auth.js`); unauthenticated requests are rejected.
- SMTP credentials and the JWT secret live only in `server/.env`, which is never sent to the
  frontend and is excluded from this project via `.gitignore`.
- Order prices are always recomputed server-side from the database at checkout — the client's
  submitted prices are never trusted.
- Rate limiting is applied to the login endpoint, the chatbot endpoint, and the API as a whole.
