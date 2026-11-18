# FootWear

A full-stack sneaker store, built as a B.Tech final-year project.

FootWear is a single-page React storefront backed by Supabase. Shoppers browse the
catalogue, filter by brand, category and price, pick a size, and check out with
**Cash on Delivery**. Every order is placed in one database transaction that prices
the cart from the database, snapshots the products, reduces per-size stock and
clears the cart. Store admins get a separate dashboard for products, inventory and
order fulfilment.

The interesting part of the project is not the storefront — it is the backend
contract behind it: row-level security instead of a custom API, an atomic order
function instead of multi-step client writes, and an adapter layer that keeps the
UI identical whether it is talking to Supabase or to an offline demo backend.

---

## At a glance

| | |
|---|---|
| **Type** | Single-page e-commerce app, no custom server |
| **Frontend** | React 19, Vite 8, React Router 7, CSS Modules |
| **Backend** | Supabase — Postgres, Auth, Storage |
| **Auth** | Email + password, session persisted in the browser |
| **Payments** | Cash on Delivery only (no gateway) |
| **Catalogue** | 15 products, 6 brands, 4 categories, 6 sizes each |
| **Access control** | Postgres Row Level Security, enforced per table |
| **Deploy** | Static build on Vercel, SPA rewrite via `vercel.json` |

---

## What it does

### Shopper

- Landing page with featured products, brand strip and category entry points.
- Collection page with text search, category filter, multi-brand select, price
  range, four sort orders and a mobile filter drawer.
- Product page with a gallery, per-size stock, quantity stepper and related
  products. Sold-out sizes are disabled, not hidden.
- Cart as a full page and as a slide-in drawer, with quantity updates, removal,
  live totals and a free-delivery threshold.
- Checkout with validated delivery details, order summary and a single
  **Place COD order** action.
- Order history and an order detail page with a status timeline.
- Register, sign in, sign out, and a session that survives a refresh.

### Admin

- Dashboard with revenue, order count, pending count, active product count,
  recent orders and a low-stock list.
- Product CRUD with per-size stock, image upload, featured/active toggles and a
  delete confirmation.
- Order list with status filters and inline status updates
  (`pending → confirmed → shipped → delivered`, or `cancelled`).

### Both

- Route guards: checkout, cart, orders and admin pages require sign-in; admin
  pages require the `admin` role.
- Loading skeletons, empty states and error states throughout.
- Responsive from 390 px up to desktop, with no horizontal overflow.

---

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| UI | React 19 + JavaScript | Component model, no TypeScript requirement for the course |
| Build | Vite 8 | Fast dev server, static production build |
| Routing | React Router 7 | Nested routes and route guards |
| Styling | CSS Modules + CSS variables | Scoped styles, one token file, no UI framework |
| Icons | Lucide React | Small, tree-shakeable icon set |
| Backend | Supabase | Postgres, Auth and Storage with no server to run |
| Client SDK | `@supabase/supabase-js` | Talks to PostgREST, GoTrue and Storage directly |

---

## Architecture

```
React pages / components
        │
        ▼
src/services/*        authService · productService · cartService
        │             orderService · storageService
        ▼
src/lib/dataClient.js  ── picks one adapter ──┐
        │                                     │
        ├── supabaseAdapter.js  ──► Supabase (Postgres + RLS, Auth, Storage)
        └── localAdapter.js     ──► localStorage (offline demo, seeded)
```

- **Pages** compose components and call hooks or services. No SQL, no Supabase
  calls.
- **Services** are the only place that touches `dataClient`. They return plain
  data or throw a readable error.
- **`dataClient.js`** owns the single Supabase client and picks an adapter at
  startup. Both adapters implement the same contract (`auth`, `products`, `cart`,
  `orders`, `storage`), so no page ever branches on which backend is active.
- **Demo mode** kicks in when the two `VITE_SUPABASE_*` variables are empty. The
  app then runs entirely from `localStorage`, with the same catalogue, accounts
  and flows — useful for grading without a hosted backend.

### Data flow for checkout

1. The cart lives in `public.cart_items`, one row per user/product/size.
2. Checkout calls one RPC, `public.place_order(name, phone, address)`.
3. Inside a single transaction the function re-checks availability, prices the
   cart from `public.products` (the client never sends a price), inserts the
   order and its items, decrements `public.product_sizes.stock`, and clears the
   cart.
4. The order detail page reads the order with its items embedded by PostgREST.

---

## Data model

| Table | Purpose |
|---|---|
| `profiles` | One row per auth user: `full_name`, `phone`, `role` (`customer` / `admin`) |
| `products` | Catalogue: name, slug, description, brand, category, integer price, image URL, featured/active flags |
| `product_sizes` | Stock per size, unique on (`product_id`, `size`) |
| `cart_items` | Per-user cart lines, unique on (`user_id`, `product_id`, `size`) |
| `orders` | Header: user, status, total, payment method, delivery details |
| `order_items` | Snapshot of name, image, size, quantity and unit price at purchase time |

Full DDL, indexes, policies, the trigger and `place_order` live in
[`supabase/schema.sql`](supabase/schema.sql). Sample data lives in
[`supabase/seed.sql`](supabase/seed.sql).

Relationships: `profiles` 1→N `orders` and `cart_items`; `products` 1→N
`product_sizes`, `cart_items` and `order_items`; `orders` 1→N `order_items`.

---

## Security model

There is no custom API, so Postgres is the security boundary. The browser holds
only a publishable key, which is safe to ship; every read and write is filtered by
Row Level Security.

- **Profiles** — you can read and update your own row; admins can read all. The
  update policy pins `role = 'customer'`, so a user cannot promote themselves.
- **Products / sizes** — public read for active products; writes require
  `public.is_admin()`.
- **Cart items** — strictly scoped to `auth.uid()`.
- **Orders** — customers read their own; only admins update status. Orders cannot
  be inserted from the client at all; `place_order` is the only path.
- **Order items** — readable only through a parent order you own, or as an admin.
- **Storage** — the `product-images` bucket is public-read; upload, replace and
  delete require admin.
- **Triggers** — `handle_new_user` creates the profile row and is revoked from the
  API roles, so it can only fire as a trigger.

A trigger rather than a client-side insert matters here: Supabase creates the
`auth.users` row inside its own transaction, and with email confirmation enabled
the client never receives a session, so an RLS-guarded insert would fail.

`auth.uid()` and `is_admin()` are wrapped in `(select ...)` inside policies so
Postgres evaluates them once per query instead of once per row.

---

## Getting started

**Requirements:** Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open the URL Vite prints — usually <http://localhost:5173>.

### Connect your own Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env` and fill in both values from
   **Project Settings → API**:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
   The publishable key is designed for the browser. Never put the secret /
   `service_role` key in a `VITE_` variable.
3. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor. It creates
   the tables, indexes, policies, the profile trigger, the `product-images`
   bucket and `place_order`.
4. Optionally run [`supabase/seed.sql`](supabase/seed.sql) for the sample
   catalogue.
5. In **Authentication → Sign In / Providers → Email**, turn **Confirm email**
   off for a demo. Otherwise new accounts must click a mailed link first, and the
   built-in mailer is rate-limited.
6. Set **Authentication → URL Configuration → Site URL** to your dev or deployed
   URL.
7. Register an account in the app, then promote it:
   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

Restart `npm run dev` after changing `.env` — Vite reads env vars at startup.

### Demo accounts

The same two accounts exist in the local demo backend and in the provisioned
Supabase project:

| Role | Email | Password |
|---|---|---|
| Customer | `demo@footwear.dev` | `demo1234` |
| Admin | `admin@footwear.dev` | `admin1234` |

In demo mode the login page also shows one-click **Customer demo** / **Admin
demo** buttons. Demo data lives under `footwear.demo.state.v1` in
`localStorage`; remove that key to reseed.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |

---

## Project structure

```
supabase/
  schema.sql                   Tables, indexes, RLS, trigger, place_order, storage
  seed.sql                     Sample catalogue (15 products, 90 size rows)
public/                        Static files served as-is
src/
  components/
    admin/                     Stat cards, product form
    cart/                      Cart line and summary
    checkout/                  Order summary
    layout/                    Navbar, footer, admin shell
    product/                   Cards, grid, filters, gallery, size selector
    ui/                        Button, Input, Select, Modal, Drawer, Toast, ...
  context/                     Auth, cart and toast providers
  hooks/                       Data fetching and document title
  lib/                         dataClient, supabaseAdapter, localAdapter, seed data
  pages/                       One component per route (+ pages/admin/)
  routes/                      Route table, ProtectedRoute, AdminRoute
  services/                    authService, productService, cartService,
                               orderService, storageService
  styles/                      tokens.css, global.css
  utils/                       Money formatting, cart totals, validators, slugify
vercel.json                    SPA rewrite for static hosting
```

---

## Deployment

The app is a static Vite build. `vercel.json` rewrites every path to
`index.html` so React Router survives a refresh.

1. Push to GitHub.
2. In Vercel: **Add New → Project** and import the repository.
3. Preset **Vite** — build `npm run build`, output `dist`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` under
   **Settings → Environment Variables** for Production and Preview.
5. Deploy, then add the deployment URL as the Supabase **Site URL**.

Vite inlines environment variables at build time, so redeploy after changing
them. On the free Supabase plan, projects pause after about a week of inactivity
— open the dashboard before a demo to wake it.

---

## Implementation notes

- **Integer money.** INR has no paise here, so prices are whole-rupee integers and
  formatted with `Intl.NumberFormat('en-IN')`. No floating-point drift.
- **Prices come from the database.** Checkout never trusts a client-supplied
  price, and each order item stores the unit price at purchase time, so later
  price changes never rewrite history.
- **Delivery rule in one place.** Free over ₹4,999, otherwise ₹149 — mirrored in
  `src/utils/cart.js` and `place_order`, with a comment linking the two.
- **Per-size stock.** Stock lives on `product_sizes`, not on the product, and is
  re-checked inside the checkout transaction.
- **Roles, not a second login.** Customers and admins share one auth system; the
  `admin` role unlocks routes and database writes.
- **Adapter over abstraction.** The demo backend is not a mock bolted on for
  screenshots — it implements the full contract, which keeps the UI honest.

## Out of scope

Online payments, shipping integration, email notifications, product reviews,
multi-currency and i18n. Cash on Delivery only, by design.
