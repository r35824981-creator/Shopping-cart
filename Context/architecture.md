# Architecture Context

## Stack

| Layer          | Technology                              | Role                                                                 |
| -------------- | --------------------------------------- | -------------------------------------------------------------------- |
| Frontend       | React.js + JavaScript (Vite)            | Single-page app: pages, components, routing, client state            |
| Styling        | HTML5 + CSS (CSS Modules, CSS variables)| Minimalist light theme defined in `ui-context.md`                    |
| Routing        | React Router                            | Client-side routes and route guards                                  |
| Backend        | InsForge (Backend-as-a-Service)         | Hosted backend: database API, auth, storage. No custom server        |
| Database       | PostgreSQL through InsForge             | Users' profiles, products, sizes, carts, orders                      |
| Auth           | InsForge Authentication                 | Email and password registration, login, sessions                     |
| File storage   | InsForge Storage                        | Product images                                                       |
| Client SDK     | `@insforge/sdk`                         | The only way the frontend talks to InsForge                          |
| Version control| Git + GitHub                            | Source control and history                                           |
| Hosting        | Static frontend hosting (e.g. Vercel or Netlify) | Serves the built React app. Final platform is an open question in `progress-tracker.md` |

## System Boundaries

- `src/pages/` — One component per route. Pages compose components and call hooks or services. They contain no raw database logic.
- `src/components/` — Reusable UI. `ui/` holds primitives, `layout/` holds Navbar and Footer, and `product/`, `cart/`, `checkout/`, `admin/` hold feature components. Components render and handle user events only.
- `src/routes/` — Router configuration and route guards (`ProtectedRoute` for signed-in users, `AdminRoute` for admins).
- `src/context/` — Global state providers: `AuthContext` (current user, profile, role) and `CartContext` (cart items and totals).
- `src/hooks/` — Custom hooks that wrap context and data-fetching logic.
- `src/services/` — The data access layer. The only place that calls InsForge for products, cart, orders, auth, and storage.
- `src/lib/insforge.js` — Creates the single shared InsForge client from environment variables.
- `src/utils/` — Pure helpers: price formatting, cart total calculation, validators.
- `src/styles/` — `tokens.css` (design tokens) and `global.css`.
- InsForge project — Owns the database schema, access rules (RLS), auth configuration, and storage buckets. These are configured on the InsForge side and recorded in this file.

## Data Model

All table and column names use `snake_case`. Primary keys are `id` (UUID).

| Table           | Key columns                                                                                                   | Notes                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `profiles`      | `id` (matches the auth user id), `full_name`, `phone`, `role` (`customer` or `admin`), `created_at`           | One row per user. Default role is `customer`                 |
| `products`      | `id`, `name`, `slug`, `description`, `brand`, `category`, `price`, `image_url`, `is_featured`, `is_active`, `created_at` | `price` is numeric. Inactive products are hidden from the store |
| `product_sizes` | `id`, `product_id`, `size`, `stock`                                                                           | One row per available size of a product                      |
| `cart_items`    | `id`, `user_id`, `product_id`, `size`, `quantity`, `created_at`                                               | Unique on (`user_id`, `product_id`, `size`)                  |
| `orders`        | `id`, `user_id`, `status`, `total_amount`, `payment_method`, `delivery_name`, `delivery_phone`, `delivery_address`, `created_at` | `payment_method` is always `COD`. Status values: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| `order_items`   | `id`, `order_id`, `product_id`, `product_name`, `image_url`, `size`, `quantity`, `unit_price`                  | Snapshot of product details at purchase time                 |

Relationships:

- `profiles` 1 to many `orders` and `cart_items`.
- `products` 1 to many `product_sizes`, `cart_items`, and `order_items`.
- `orders` 1 to many `order_items`.

## Storage Model

- **Database (PostgreSQL)**: All structured data: profiles and roles, products, sizes and stock, cart items, orders, and order items. Product records hold only the image URL or path, never the image itself.
- **File storage (InsForge Storage)**: Product images in a `product-images` bucket. The bucket allows public read so the storefront can display images, and only admins can upload, replace, or delete files.
- **Browser (localStorage)**: Only the InsForge session handled by the SDK and light UI preferences. Cart data for signed-in users lives in the database, not in the browser.

## Auth and Access Model

- Every account is created and signed in through InsForge Authentication with email and password. A `profiles` row is created for each new user with the role `customer`.
- Browsing products is public. Checkout, cart, order history, and the admin dashboard require sign-in.
- Roles: `customer` and `admin`. The first admin is created manually by setting `role` to `admin` in the InsForge dashboard. The app never lets a user change their own role.
- Ownership: every cart item and order belongs to exactly one user through `user_id`. Customers can read and change only their own cart items, and read only their own orders and order items.
- Admin access: only admins can create, update, or delete products and sizes, upload product images, read all orders, and update order status.
- Enforcement happens in two places. InsForge Row Level Security (RLS) policies are the real protection. Route guards and hidden buttons in the UI are only for user experience and are never the only check.
- Public read access (no sign-in) is limited to active products, their sizes, and product images.

## Order Flow

1. The user reviews the cart (`cart_items`) and submits the checkout form (name, phone, address).
2. The app creates an `orders` row with status `pending` and payment method `COD`, then one `order_items` row per cart item, copying the product name, image, size, quantity, and current price.
3. The app clears the user's `cart_items` after the order is saved successfully.
4. The user sees a confirmation and can find the order in order history.
5. An admin updates the order status from the dashboard. The user sees the new status on their next load.

## Environment and Deployment

- Environment variables (documented in `.env.example`, real values in `.env` which is never committed):
  - `VITE_INSFORGE_URL` — the InsForge project URL.
  - `VITE_INSFORGE_ANON_KEY` — the public client key, if the project requires one.
- Only public, client-safe values are used in the frontend. Admin or service credentials are never placed in the frontend.
- Build: `npm run build` produces a static bundle that is deployed to the hosting platform. The same environment variables are set in the host's settings.
- Because the app is a single-page app, the host must rewrite all routes to `index.html`.
- Workflow: develop locally, push to GitHub, and deploy from the `main` branch.

## Invariants

1. The frontend talks to InsForge only through functions in `src/services/`, using the single client from `src/lib/insforge.js`. Components never call InsForge directly.
2. Authorization is enforced by InsForge RLS policies. UI checks are never the only protection for any read or write.
3. A user's role can only be changed by an admin directly in the InsForge dashboard or database, never from the client app.
4. Prices shown at checkout come from the database, and each order item stores the unit price at purchase time. Changing a product price never alters past orders.
5. Product images live in InsForge Storage and only their URLs are stored in the database. No binary data is stored in database columns.
6. Cash on Delivery is the only payment method. No payment data, card numbers, or payment gateway code exists in the project.
7. An order is never left half-saved. If saving the order items fails, the order must not remain as a valid, visible order.
8. Secrets and keys never appear in committed code. Only public client keys are used in the frontend.
9. Every cart line is unique per user, product, and size. Quantities are always whole numbers of at least 1.
10. Any change to the data model, auth rules, or storage setup is recorded in this file and in `progress-tracker.md` before or together with the code change.
