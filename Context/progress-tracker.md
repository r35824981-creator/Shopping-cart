# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Phase 14 complete (responsive and polish pass).
- Phase 15 (testing and success criteria) complete against the live Supabase project.
- Phase 16 (deployment) is next.

## Current Goal

- Complete the success-criteria checklist against the running app, then prepare deployment notes and the demo.

## Completed

- `project-overview.md` written (FootWear overview, goals, user flow, features, scope, success criteria).
- `ui-context.md` written with design tokens.
- `architecture.md`, `code_standards.md` and `ai-workflow-rules.md` written.
- **Project setup:** React 19 + Vite 8 + React Router 7 project, folder structure, `tokens.css`, `global.css`, `.env.example`, `.gitignore`, Git repository.
- **Data layer:** `src/lib/dataClient.js` with two adapters that share one contract:
  - `supabaseAdapter.js` for a real Supabase project (`auth`, PostgREST-style `database`, `storage`).
  - `localAdapter.js` demo backend on `localStorage`, seeded with 15 products, 2 users and 2 sample orders.
  - `supabase/schema.sql` with tables, indexes, RLS policies, the profile trigger, storage policies and the atomic `place_order` function; `supabase/seed.sql` with the 15 sample products.
- **Services:** `authService`, `productService`, `cartService`, `orderService`, `storageService`.
- **State:** `AuthContext`, `CartContext`, `ToastContext`; hooks for document title, products, product detail, featured products and filter options.
- **UI primitives:** Button, Input, Select, Textarea, Badge, Modal, Drawer, Spinner, Skeleton, EmptyState, ToastViewport (CSS Modules + tokens).
- **Layout shell:** sticky Navbar with search panel, cart button and account menu; footer; mobile hamburger drawer; scroll-to-top on navigation.
- **Authentication:** register, login, logout, session persistence, `ProtectedRoute`, `AdminRoute`, demo-account shortcuts on the login page.
- **Home page:** hero, brand strip, featured products, category cards.
- **Product listing:** responsive grid, search, brand/category/price filters, sorting, mobile filter drawer, loading/empty/error states.
- **Product detail:** gallery with thumbnails, size selector with stock, quantity stepper, add to cart, related products.
- **Cart:** full review page and slide-in drawer, quantity updates, remove, totals, free-delivery threshold.
- **Checkout:** delivery form with validation, Cash on Delivery confirmation, atomic order placement, redirect to the new order.
- **Order history:** customer order list with statuses, order detail page with tracking timeline, delivery and payment cards.
- **Admin dashboard:** revenue/order/pending/product metrics, recent orders, low-stock list, demo-mode notice.
- **Admin products:** searchable table, create/edit form with per-size stock, image upload, feature/active toggles, delete confirmation.
- **Admin orders:** status filters, inline status updates, links to full order detail.
- **Polish:** 404 page, signed-in-aware footer, empty/loading/error states, Indian rupee formatting, responsive breakpoints.
- **Documentation:** `README.md` with setup, demo credentials, Supabase connection steps and project structure; `supabase/schema.sql`; architecture and tracker kept in sync.
- **Backend migration:** replaced InsForge with Supabase (`@supabase/supabase-js`). New `src/lib/supabaseAdapter.js` (same contract as the demo adapter), env switched to `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`, `supabase/schema.sql` rewritten for Supabase with an `auth.users` profile trigger, and `supabase/seed.sql` generated from the demo catalogue.
- **Supabase project provisioned** (`tpoogaznujbupfxrrtpo`): schema, indexes, RLS policies, `place_order`, the `handle_new_user` trigger and the public `product-images` bucket. The 15 sample products and 90 size rows are loaded.
- **Supabase advisors:** the only remaining notices are accepted by design — `is_admin()` must be callable by `anon` for the public product policy, and `place_order` is intentionally callable by signed-in users. Trigger functions are revoked from the API.
- **Live verification (API and browser):** customer and admin sign-in, own-profile reads, cart add/update, atomic `place_order` with correct totals and cleared cart, admin-only order visibility and status updates, admin product create/delete with size cascade, image upload allowed for admins and denied for customers, anon blocked from orders and cross-user profile reads.
- **Deployment prep:** `vercel.json` SPA rewrite and a README deployment section.
- **Testing:** production build passes; browser checks cover customer and admin demo sign-in, cart drawer, add/update/remove, COD checkout, order history, admin metrics, product create/edit, order status updates, route guards, search/filter/sort, mobile navigation and no horizontal overflow at 390px.

## In Progress

- Nothing open; the app is verified end to end against the live Supabase project.

## Next Up

1. Push to GitHub and import the repository in Vercel (see the README section).
2. Set `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel, then deploy.
3. Add the deployment URL to Supabase Auth → URL Configuration.
4. Re-run the live checklist on the deployed URL: register, log in, add to cart, place an order, open the admin dashboard, update an order status.

## Open Questions

- ~~Do the colors, fonts, and layout in `ui-context.md` match the Dribbble reference?~~ Resolved: the reference could not be read automatically; the tokens in `ui-context.md` are used as the source of truth.
- ~~Which hosting platform will be used to deploy the frontend?~~ Still open; the app is a static Vite build, so Vercel, Netlify or GitHub Pages all work with an `index.html` rewrite.
- ~~How is the first admin account created?~~ Resolved: promote a registered profile to `role = 'admin'` in the Supabase SQL editor (snippet at the end of `supabase/schema.sql`). Demo mode ships an admin account.
- ~~Is stock tracked per size?~~ Resolved: yes, `product_sizes.stock` per size, enforced in cart and order placement.
- ~~Should the cart for a logged-in user be stored in the database or in local storage?~~ Resolved: database (`cart_items`) with the Supabase adapter; `localStorage` only in demo mode.
- ~~Which product categories and brands will be used for the filters?~~ Resolved: Running, Lifestyle, Basketball, Training; Nike, Adidas, Puma, New Balance, Reebok, Asics.

## Architecture Decisions

- **React.js frontend with Supabase as the backend (BaaS):** no custom server to build or host, which keeps the project simple and lets the focus stay on frontend, database design, and integration.
- **PostgreSQL through Supabase:** orders, cart items, and products are relational data, so a relational database fits well.
- **Cash on Delivery only:** avoids payment gateway integration and keeps the checkout simple for an academic project.
- **Login required for checkout, browsing is public:** lets anyone explore products, while orders are always tied to a user account.
- **Light theme with plain CSS and CSS variables:** matches the minimalist reference, with no extra UI library.
- **Admin access through a role on the user profile:** one login system for customers and admins, with route guards plus RLS as the real protection.
- **Adapter layer with demo fallback:** `dataClient.js` selects the Supabase adapter when credentials exist and a `localStorage` adapter otherwise. This lets the project run, be reviewed and be graded without a hosted backend, while the Supabase path stays a first-class implementation.
- **Atomic order placement:** Supabase uses the `place_order` SQL function (one transaction); the demo adapter mirrors the same steps in memory before writing once.
- **Whole-rupee integer prices:** INR prices have no paise, so the database stores integers and the UI formats with `Intl.NumberFormat('en-IN')`.

## Demo Credentials

- Customer: `demo@footwear.dev` / `demo1234`
- Admin: `admin@footwear.dev` / `admin1234`
- Both exist in the local demo backend and in the Supabase project. The login page
  also has one-click "Customer demo" and "Admin demo" buttons while demo mode is
  active (no Supabase credentials configured).

## Session Notes

- Project: FootWear, an online sneaker shopping cart built as a B.Tech final-year project.
- Stack: React.js, JavaScript, HTML and CSS, Supabase (PostgreSQL, Authentication, Storage), Git and GitHub.
- Design reference: https://dribbble.com/shots/22748023-FootWear-Sneakers-Ecommerce-Website (the page could not be read automatically, so the tokens in `ui-context.md` are the source of truth).
- Node.js is not installed system-wide on this machine. A portable Node 26 build lives at `C:\Users\r3582\AppData\Local\Tools\node-v26.13.1-win-x64`; run npm with `$env:Path = "<that path>;$env:Path"; & "<that path>\npm.cmd" run <script>`.
- Run locally with `npm run dev` (Vite, default port 5173). Build with `npm run build`.
- Verified in the browser: demo sign-in (customer and admin), add to cart, cart quantity/remove, COD checkout, order confirmation, order history, admin metrics, product create/edit/delete, order status updates, route guards, loading/empty/error states.
- Production build passes with the Supabase client; no Vite externalisation warnings remain.
