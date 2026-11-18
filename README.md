# FootWear

A sneaker shopping cart built with React, Vite and InsForge. Customers browse the
collection, pick a size, add items to a cart, check out with **Cash on Delivery**,
and follow their orders. Admins manage products, stock, images and order statuses
from a dashboard.

## Stack

- React 19 + JavaScript (Vite)
- React Router 7
- Plain CSS Modules with design tokens (`src/styles/tokens.css`)
- Lucide React icons
- InsForge for authentication, PostgreSQL and storage (`@insforge/sdk`)
- A built-in demo backend on `localStorage` so the app runs without any backend

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Demo mode (no backend needed)

When `VITE_INSFORGE_URL` and `VITE_INSFORGE_ANON_KEY` are empty, the app uses
`src/lib/localAdapter.js` and seeds sample data in the browser. The login page
shows one-click demo buttons.

| Role     | Email                 | Password    |
| -------- | --------------------- | ----------- |
| Customer | `demo@footwear.dev`   | `demo1234`  |
| Admin    | `admin@footwear.dev`  | `admin1234` |

The demo data lives under `footwear.demo.state.v1` in `localStorage`. Remove that
key (DevTools → Application → Local Storage) to reseed the store.

### Connect a real InsForge project

1. Copy `.env.example` to `.env` and fill in the two values from your InsForge
   dashboard. Never commit `.env`.
2. Run `insforge/schema.sql` in the InsForge SQL editor. It creates the tables,
   row-level security policies, storage policies and the atomic `place_order`
   function.
3. Create the `product-images` storage bucket (public read) if the SQL editor
   cannot create buckets for you.
4. Register an account through the app, then promote it to admin:

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
insforge/schema.sql          Database schema, RLS and place_order function
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
