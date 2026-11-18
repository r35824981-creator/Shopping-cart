# Code Standards

## General

- Keep modules small and single-purpose. One component, hook, or service per file.
- Fix root causes. Do not layer workarounds or leave commented-out code.
- Do not mix unrelated concerns in one component. UI components render; hooks hold state logic; services talk to Supabase.
- Prefer simple, readable code over clever code. This is a final-year project that must be easy to explain.
- Use descriptive names. No single-letter variables except short loop indexes.
- Do not add libraries without a clear need. Check `architecture.md` before adding any dependency.
- Remove unused imports, variables, and files before finishing a task.
- Never commit secrets. Keys and URLs live in environment variables only.

## JavaScript

- Use modern ES modules (`import` / `export`). No `require`.
- Use `const` by default, `let` only when reassignment is needed. Never use `var`.
- Use `async` / `await` with `try` / `catch` for all asynchronous work. Do not leave unhandled promises.
- Validate external input (forms, URL params, API responses) before trusting it.
- Never trust the client for authorization. Role and ownership checks are also enforced by Supabase RLS policies, not only hidden in the UI.
- Do not use `console.log` in finished code. Remove debug logs.
- Add short JSDoc comments to service functions and utilities (parameters and return value).
- Keep functions short. If a function does more than one thing, split it.

## React

- Use functional components and hooks only. No class components.
- One component per file. Component files use PascalCase (`ProductCard.jsx`).
- Hooks are named `useSomething` and live in `src/hooks/`.
- Keep components focused. If a component grows past about 150 lines, split it.
- Pass data through props. Use Context only for truly global state (auth, cart).
- Never call Supabase directly from a component. Go through a function in `src/services/`.
- Always handle three states for data fetching: loading, error, and empty.
- Give list items a stable `key` (the record id, never the array index).
- Keep side effects inside `useEffect` and clean them up when needed.
- Protect pages with route guard components (`ProtectedRoute`, `AdminRoute`), not inline checks scattered through pages.
- Use controlled inputs for forms and show inline validation messages.
- Use semantic HTML (`button`, `nav`, `main`, `form`, `label`) and add `alt` text to every image and an accessible label to every icon-only button.

## Styling

- Use the CSS custom property tokens from `ui-context.md`. No hardcoded hex values in component or page CSS.
- Follow the border radius scale (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`) and the spacing scale defined in `ui-context.md`.
- Use plain CSS with CSS Modules (`Component.module.css`) next to each component. Global styles are limited to `src/styles/tokens.css` and `src/styles/global.css`.
- No inline styles except for values that must be dynamic.
- Build mobile first. Use the breakpoints from `ui-context.md`.
- Use class names in camelCase inside CSS Modules.
- Do not use `!important`.

## Data Access (Supabase)

- All Supabase calls live in `src/services/` (for example `productService.js`, `cartService.js`, `orderService.js`, `authService.js`). The single Supabase client is created once in `src/lib/dataClient.js`.
- Service functions return plain data or throw a clear error. Components decide how to show it.
- Check the user is signed in and owns the record before any create, update, or delete.
- Only admins can create, update, or delete products and update order status. Enforce this with Supabase RLS policies and also check the role in the UI.
- Select only the columns you need. Do not fetch whole tables when a filtered query works.
- Paginate or limit long lists such as products and orders.
- Place an order in a way that saves the order and its items together. Do not leave a half-created order if one step fails.
- Show user-friendly error messages. Never display raw backend errors to the user.

## Data and Storage

- Structured data (users, products, sizes, cart items, orders, order items) belongs in the PostgreSQL database.
- Product images belong in Supabase Storage. Store only the image URL or path in the database.
- Do not store image data or large blobs in database columns.
- Store prices as numbers (not strings) and calculate totals in one shared utility, not in many places.
- Store the price at the time of purchase on each order item so past orders do not change if a product price changes.
- Use clear, consistent table and column names in `snake_case`.

## Environment and Security

- Environment variables are defined in `.env` (never committed) and documented in `.env.example`.
- Only public, client-safe keys are used in the frontend. Never put a service or admin key in frontend code.
- `.env` is listed in `.gitignore`.
- Sanitize and validate all form input. Do not render raw HTML from user input.

## Git

- Work in small, focused commits with clear messages (for example `feat: add product detail page`, `fix: cart total rounding`).
- Do not commit `node_modules`, build output, or `.env`.
- Update `progress-tracker.md` after every meaningful change.

## File Organization

- `src/components/ui/` — Reusable primitives (Button, Input, Modal, Drawer, Badge, Spinner, Toast).
- `src/components/layout/` — Navbar, Footer, and page layout wrappers.
- `src/components/product/`, `cart/`, `checkout/`, `admin/` — Feature-specific components, grouped by feature.
- `src/pages/` — One file per route (Home, Products, ProductDetail, Cart, Checkout, Orders, Login, Register, admin pages).
- `src/routes/` — Router setup and route guards (`ProtectedRoute`, `AdminRoute`).
- `src/context/` — Global providers (AuthContext, CartContext).
- `src/hooks/` — Custom hooks.
- `src/services/` — All Supabase data access functions.
- `src/lib/` — Third-party client setup (the Supabase client).
- `src/utils/` — Pure helper functions (price formatting, totals, validators).
- `src/styles/` — `tokens.css` and `global.css`.
- `src/assets/` — Static images and icons bundled with the app.
- `public/` — Files served as-is (favicon, static images).
