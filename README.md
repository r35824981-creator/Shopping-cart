# FootWear

**A full-stack sneaker store with no custom server, where the database enforces security and a single atomic transaction places every order.**

Built by [Rakesh Rout](https://github.com/) as a B.Tech (CSE) final-year project.

FootWear is a single-page React storefront backed by Supabase. Shoppers browse a catalogue, filter by brand, category and price, pick a size and check out with Cash on Delivery. Store admins get their own dashboard for products, inventory and order fulfilment.

The storefront is the visible part. The interesting part is the backend design behind it.

---

## Highlights

| | |
|---|---|
| **Security in the database** | There is no custom API. Postgres Row Level Security protects every table, so the browser can safely hold a publishable key. |
| **Atomic checkout** | One database function places each order in a single transaction. It re-checks stock, prices the cart from the database, snapshots the products, reduces per-size stock and clears the cart. |
| **Prices are never trusted from the client** | The client never sends a price. Each order item stores the unit price at purchase time, so later price changes never rewrite order history. |
| **Swappable backend** | A service and adapter layer lets the UI run unchanged on Supabase or on a fully offline demo backend. |
| **Role-based access** | Customers and admins share one auth system. The admin role unlocks both protected routes and database writes. |

---

## Features

### Shopper
- Landing page with featured products, brand strip and category entry points
- Collection page with text search, category filter, multi-brand select, price range, four sort orders and a mobile filter drawer
- Product page with gallery, per-size stock, quantity stepper and related products. Sold-out sizes are disabled, not hidden
- Cart as both a full page and a slide-in drawer, with live totals and a free-delivery threshold
- Checkout with validated delivery details and a single **Place COD order** action
- Order history and order detail pages with a status timeline
- Register, sign in and sign out, with a session that survives a refresh

### Admin
- Dashboard with revenue, order count, pending orders, active products, recent orders and a low-stock list
- Product CRUD with per-size stock, image upload, featured/active toggles and delete confirmation
- Order management with status filters and inline updates (pending → confirmed → shipped → delivered, or cancelled)

### Across the app
- Route guards: cart, checkout and orders require sign-in, and admin pages require the admin role
- Loading skeletons, empty states and error states throughout
- Responsive from 390 px up to desktop, with no horizontal overflow

---

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19, JavaScript |
| Build | Vite 8 |
| Routing | React Router 7 |
| Styling | CSS Modules and CSS variables, with no UI framework |
| Icons | Lucide React |
| Backend | Supabase (Postgres, Auth, Storage) |
| Client SDK | `@supabase/supabase-js` |
| Hosting | Vercel (static build with SPA rewrite) |

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

- **Pages** compose components and call hooks or services. They contain no SQL and no direct Supabase calls.
- **Services** are the only layer that touches the data client. They return plain data or throw a readable error.
- **Adapters** implement the same contract (auth, products, cart, orders, storage), so no page ever branches on which backend is active. The offline demo backend is a full implementation of that contract, not a mock for screenshots.

---

## Engineering Decisions

**Postgres as the security boundary.** With no custom API, every read and write is filtered by Row Level Security.
- Users can read and update only their own profile, and the update policy pins `role = 'customer'`, so nobody can promote themselves.
- Cart rows are strictly scoped to the signed-in user.
- Orders cannot be inserted from the client at all. The `place_order` function is the only path.
- Order items are readable only through a parent order the user owns, or by an admin.
- Product images live in a public-read storage bucket where upload, replace and delete require admin.
- Policies wrap `auth.uid()` and `is_admin()` in a subquery so Postgres evaluates them once per query instead of once per row.

**A database trigger creates the profile row.** Supabase creates the auth user inside its own transaction, and with email confirmation on, the client never receives a session. A client-side insert guarded by RLS would fail, so a trigger handles it, and its execute rights are revoked from the API roles.

**One transaction for checkout.** Stock checks, pricing, order creation, stock reduction and cart clearing succeed or fail together, which prevents overselling and partial orders.

**Integer money.** Prices are whole-rupee integers formatted with `Intl.NumberFormat('en-IN')`, which avoids floating-point drift.

**Per-size stock.** Stock lives on a `product_sizes` table, not on the product, and is re-checked inside the checkout transaction.

**Delivery rule defined once.** Free delivery over ₹4,999, otherwise ₹149. The rule is mirrored in the client and in `place_order`, with a comment linking the two.

---

## Data Model

| Table | Purpose |
|---|---|
| `profiles` | One row per auth user: name, phone, role (customer / admin) |
| `products` | Catalogue: name, slug, description, brand, category, price, image, featured/active flags |
| `product_sizes` | Stock per size, unique on (product, size) |
| `cart_items` | Per-user cart lines, unique on (user, product, size) |
| `orders` | Order header: user, status, total, payment method, delivery details |
| `order_items` | Snapshot of name, image, size, quantity and unit price at purchase time |

The catalogue ships with 15 products, 6 brands, 4 categories and 6 sizes per product.

---

## Try It

Both accounts exist in the demo backend and the hosted Supabase project.

| Role | Email | Password |
|---|---|---|
| Customer | `demo@footwear.dev` | `demo1234` |
| Admin | `admin@footwear.dev` | `admin1234` |

---

## Skills Demonstrated

- Designing a relational schema with constraints, indexes and a transactional business function in SQL
- Writing and reasoning about Row Level Security policies
- Structuring a React app in clean layers (pages → services → adapters)
- Building route guards and role-based UI
- Handling real e-commerce concerns such as stock consistency, price integrity and order history
- Building responsive interfaces with loading, empty and error states

## Scope

Cash on Delivery only, by design. Online payments, shipping integration, email notifications, reviews, multi-currency and i18n are out of scope.
