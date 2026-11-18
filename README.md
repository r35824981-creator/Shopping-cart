# FootWear

A sneaker shopping cart built with React, Vite and Supabase. Customers browse the
collection, pick a size, add items to a cart, check out with **Cash on Delivery**,
and follow their orders. Admins manage products, stock, images and order statuses
from a dashboard.

## Stack

- React 19 + JavaScript (Vite)
- React Router 7
- Plain CSS Modules with design tokens (`src/styles/tokens.css`)
- Lucide React icons
- Supabase for authentication, PostgreSQL and storage (`@supabase/supabase-js`)
- A built-in demo backend on `localStorage` so the app runs without any backend

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Demo mode (no backend needed)

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are empty, the app uses
`src/lib/localAdapter.js` and seeds sample data in the browser. The login page
shows one-click demo buttons.

| Role     | Email                 | Password    |
| -------- | --------------------- | ----------- |
| Customer | `demo@footwear.dev`   | `demo1234`  |
| Admin    | `admin@footwear.dev`  | `admin1234` |

The demo data lives under `footwear.demo.state.v1` in `localStorage`. Remove that
key (DevTools → Application → Local Storage) to reseed the store.

### Demo accounts in the live project

The same two accounts exist in the Supabase project, so you can sign in without
registering:

| Role     | Email                 | Password    |
| -------- | --------------------- | ----------- |
| Customer | `demo@footwear.dev`   | `demo1234`  |
| Admin    | `admin@footwear.dev`  | `admin1234` |

The customer has two sample orders. New accounts created through the Register
page start with the `customer` role.

### Connect a real Supabase project

1. Copy `.env.example` to `.env` and fill in the two values from
   Project Settings → API in the Supabase dashboard. Never commit `.env`.
2. Run `supabase/schema.sql` in the Supabase SQL editor. It creates the tables,
   row-level security policies, the profile trigger, the storage bucket and the
   atomic `place_order` function.
3. Optionally run `supabase/seed.sql` to load the same 15 products the demo
   backend uses.
4. In Authentication → Sign In / Providers → Email, turn **Confirm email** off
   for a local demo (otherwise new accounts wait on a confirmation mail).
5. Under Authentication → URL Configuration, set the Site URL to
   `http://localhost:5173`.
6. Register an account through the app, then promote it to admin:

   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

Restart `npm run dev` after changing `.env`.

## Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the Vite dev server             |
| `npm run build`   | Production build into `dist/`         |
| `npm run preview` | Serve the production build locally    |

## Project structure

```
supabase/schema.sql           Database schema, RLS and place_order function
supabase/seed.sql             Optional sample catalogue (15 products)
src/
  components/
    admin/                   Admin-only components (stat cards, product form)
    cart/                    Cart line and summary components
    checkout/                Order summary
    layout/                  Navbar, Footer, admin layout, route guards
    product/                 Cards, grid, filters, gallery, size selector
    ui/                      Primitives: Button, Input, Modal, Drawer, ...
  context/                   Auth, cart and toast providers
  hooks/                     Data-fetching and document title hooks
  lib/                       Adapters, seed data, constants
  pages/                     One component per route
  routes/                    Route table and guards
  services/                  Data access for auth, products, cart, orders, storage
  styles/                    tokens.css and global.css
  utils/                     Formatting, cart totals, validators, slugify
```

## Features

- Public storefront with hero, featured products, category links and a sticky
  navbar with search.
- Product listing with text search, category, multi-brand and price filters,
  sorting, and a mobile filter drawer.
- Product detail with gallery views, per-size stock, quantity stepper and related
  products.
- Authentication (register, login, logout, session persistence) and role-based
  route guards.
- Cart page and slide-in cart drawer with quantity updates, removal and totals.
- COD checkout with validated delivery details and atomic order placement
  (stock is reduced, cart cleared, prices snapshotted into the order).
- Order history and order detail with a tracking timeline.
- Admin dashboard with revenue/order/stock metrics and low-stock alerts.
- Admin product CRUD with per-size stock, image upload and active/featured
  toggles.
- Admin order list with status filters and inline status updates.
- Loading skeletons, empty states and error states across the app.
- Responsive layouts from 390px to desktop.

## Notes

- All prices are whole rupees and formatted with `Intl.NumberFormat('en-IN')`.
- Delivery is free over ₹4,999; otherwise ₹149.
- Cash on Delivery is the only payment method, by design.

## Deploy to Vercel

The app is a static Vite build, and `vercel.json` rewrites every route to
`index.html` so React Router works on refresh.

1. Push the repository to GitHub.
2. In Vercel: **Add New → Project**, then import the repository.
3. Framework preset: **Vite**. Build command `npm run build`, output directory
   `dist` (Vercel detects both automatically).
4. Add the environment variables under **Settings → Environment Variables**, for
   Production and Preview:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Deploy, then copy the deployment URL.
6. In Supabase: **Authentication → URL Configuration**. Set the Site URL to the
   deployment URL and add `https://your-app.vercel.app/**` to the redirect URLs.

Environment variables are read at build time, so redeploy after changing them.

### Supabase free-tier note

Free projects pause after about a week without activity. Open the dashboard (or
make one request) before a demo to wake the project up.

