# UI Context

> Design reference: Dribbble "FootWear Sneakers Ecommerce Website"
> (https://dribbble.com/shots/22748023-FootWear-Sneakers-Ecommerce-Website).
> The UI is inspired by this shot: minimalist, spacious, product-first.
> Token values below are the source of truth for the build. If a value
> is changed after comparing against the reference, change it here first.

## Theme

Light theme only. No dark mode. The design language is a modern,
minimalist sneaker storefront: soft off-white backgrounds, plenty of
white space, large product imagery as the visual focus, bold clean
headings, and one vivid accent color reserved for primary actions and
highlights. Avoid visual clutter, heavy shadows, and decorative
gradients. Every screen should feel airy and uncluttered.

## Colors

All components must use these tokens. No hardcoded hex values in
component or page CSS. Define them once on `:root` in
`src/styles/tokens.css`.

| Role                  | CSS Variable           | Value     |
| --------------------- | ---------------------- | --------- |
| Page background       | `--bg-base`            | `#F6F6F3` |
| Surface (cards, nav)  | `--bg-surface`         | `#FFFFFF` |
| Inverse surface       | `--bg-inverse`         | `#111111` |
| Primary text          | `--text-primary`       | `#111111` |
| Muted text            | `--text-muted`         | `#6B6B66` |
| Text on inverse/accent| `--text-on-accent`     | `#FFFFFF` |
| Primary accent        | `--accent-primary`     | `#FF5A1F` |
| Accent hover          | `--accent-hover`       | `#E64A12` |
| Border                | `--border-default`     | `#E4E4DF` |
| Error                 | `--state-error`        | `#DC2626` |
| Success               | `--state-success`      | `#16A34A` |

Usage rules:

- Page background is `--bg-base`; cards, navbar, and forms sit on `--bg-surface`.
- Primary buttons use `--accent-primary` or `--bg-inverse`; never both in the same row.
- Muted text is for secondary info only (descriptions, labels, helper text).
- Product image containers use a soft neutral tint (`--bg-base`) so shoe photos stand out.

## Typography

| Role              | Font          | Variable         |
| ----------------- | ------------- | ---------------- |
| UI / body text    | Inter         | `--font-sans`    |
| Headings / display| Poppins       | `--font-display` |

Rules:

- Load fonts from Google Fonts (or self-host) with a system sans-serif fallback.
- Headings: Poppins, weights 600 to 700, tight line height.
- Body: Inter, weights 400 to 500, comfortable line height (about 1.6).
- Prices: Inter, weight 600.
- Use a consistent scale: 12, 14, 16, 20, 24, 32, 48 px. Hero headline may use 56 to 64 px on desktop.

## Border Radius

Defined as CSS variables on `:root`.

| Context                      | Variable        | Value    |
| ---------------------------- | --------------- | -------- |
| Inline / small UI (chips, size buttons, inputs) | `--radius-sm` | `8px`  |
| Cards / panels / product tiles | `--radius-md` | `16px` |
| Modals / drawers / overlays  | `--radius-lg`   | `24px`   |
| Pills (buttons, badges)      | `--radius-full` | `9999px` |

## Spacing and Shadows

- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px. Use the scale only.
- Page container: max width 1200px, centered, 16px side padding on mobile and 24 to 32px on desktop.
- Shadows are minimal: cards use a 1px `--border-default` border; hover may add a very soft shadow (`0 8px 24px rgba(0,0,0,0.06)`).

## Component Library

No third-party UI component library. Build small reusable React
components with plain CSS (CSS Modules or a single global stylesheet
per component folder). Components live in `src/components/`, grouped by
purpose: `ui/` for primitives, `layout/` for Navbar and Footer, and
feature folders for `product/`, `cart/`, `checkout/`, `admin/`.

Core primitives to build first:

- `Button` (variants: primary, secondary, ghost; sizes: sm, md, lg)
- `Input`, `Select`, `Textarea`
- `Badge`
- `Modal` and `Drawer`
- `Spinner` and `Skeleton`
- `Toast`

## Layout Patterns

- **Navbar:** sticky top bar on `--bg-surface` with a bottom border. Logo on the left, navigation links in the center (Home, Collections, New Arrivals), and search, cart (with item-count badge), and user menu on the right. Collapses to a hamburger menu on mobile.
- **Hero:** two-column on desktop. Large headline, short supporting text, and a primary call-to-action button on the left. A large, angled sneaker image on a soft background shape on the right. Stacks vertically on mobile.
- **Product grid:** responsive grid, 4 columns on desktop, 3 on tablet, 2 on mobile. Each card shows a large image, product name, short category line, and price. Card hover lifts slightly.
- **Listing page:** filter panel (category, brand, price range) on the left on desktop and in a slide-in drawer on mobile. Sort dropdown above the grid.
- **Product detail:** two-column. Image gallery with thumbnails on the left. Name, price, description, size selector, quantity, and "Add to Cart" on the right. Size options are selectable pill buttons; the selected size uses `--bg-inverse` with `--text-on-accent`, and unavailable sizes are disabled and muted.
- **Cart:** line items list with image, name, size, quantity stepper, and remove action, plus an order summary card (subtotal, delivery, total) and a checkout button. Use a slide-in drawer for the quick cart and a full page for review.
- **Checkout:** single column form (name, phone, address) with an order summary alongside on desktop. Payment is shown as Cash on Delivery only.
- **Order history:** list of order cards showing order number, date, items, total, and a status badge.
- **Auth pages:** centered card on `--bg-base`, max width 420px.
- **Admin dashboard:** fixed left sidebar with a border separator (Products, Orders), a top bar, and a content area with data tables. Forms for add and edit product open on their own page or in a modal.
- **Modals and drawers:** centered modal or right-side drawer with a dimmed backdrop (`rgba(17,17,17,0.4)`).
- **Footer:** simple, multi-column links and a copyright line.

## States and Feedback

- Loading: skeleton placeholders for product cards and tables, spinner for buttons.
- Empty: friendly message and a clear action (for example, "Your cart is empty. Browse sneakers").
- Error: inline field errors in `--state-error`; toast for server errors.
- Success: toast in `--state-success` (item added, order placed).

## Responsive Rules

- Mobile first. Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl).
- Tap targets are at least 40px high on mobile.
- No horizontal scrolling at any width.

## Icons

Lucide React (`lucide-react`). Stroke-based icons only, stroke width 1.75
to 2. Sizes: 16px for inline, 20px for buttons and navbar, 24px for
empty states. Icons inherit text color via `currentColor`.
