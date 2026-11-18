# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Phase 0: Planning and context setup. In progress. No application code has been written yet.

## Current Goal

- Finish the context files (architecture, code standards, AI workflow rules), then set up the React project and connect it to InsForge.

## Completed

- `project-overview.md` written (FootWear overview, goals, user flow, features, scope, success criteria).
- `ui-context.md` written with placeholder design tokens. Values still need to be checked against the Dribbble reference.

## In Progress

- `architecture.md`
- `code_standards.md`
- `ai-workflow-rules.md`

## Next Up

Build in this order. Finish and verify each unit before starting the next.

1. Project setup: create the React app, folder structure, global CSS tokens from `ui-context.md`, and Git repository on GitHub.
2. InsForge setup: create the InsForge project, connect the frontend, and store keys in environment variables.
3. Database: create tables (profiles, products, product sizes, cart items, orders, order items) with access rules.
4. Authentication: register, login, logout, session persistence, protected routes, and the admin role.
5. Layout shell: Navbar, Footer, and routing.
6. Home page: hero section and featured products.
7. Product listing: grid, search, filters, and sorting.
8. Product detail page: gallery, size selector, and add to cart.
9. Cart: add, remove, quantity update, and totals.
10. Checkout: delivery form and Cash on Delivery order placement.
11. Order history: user's past orders and statuses.
12. Admin dashboard: product CRUD with image upload to InsForge Storage.
13. Admin orders: view all orders and update status.
14. Responsive and polish pass: empty, loading, and error states on every page.
15. Testing against the success criteria in `project-overview.md`.
16. Deployment and demo preparation.

## Open Questions

- Do the colors, fonts, and layout in `ui-context.md` match the Dribbble reference? A screenshot is needed to confirm.
- Which hosting platform will be used to deploy the frontend (for example Vercel or Netlify)?
- How is the first admin account created: set the role manually in the database, or seed it?
- Is stock tracked per size, or is each size simply available or unavailable?
- Should the cart for a logged-in user be stored in the database or in local storage?
- Which product categories and brands will be used for the filters?

## Architecture Decisions

- **React.js frontend with InsForge as the backend (BaaS):** no custom server to build or host, which keeps the project simple and lets the focus stay on frontend, database design, and integration. Authentication, database, and storage all come from one platform.
- **PostgreSQL through InsForge:** orders, cart items, and products are relational data, so a relational database fits well.
- **Cash on Delivery only:** avoids payment gateway integration and keeps the checkout simple for an academic project.
- **Login required for checkout, browsing is public:** lets anyone explore products, while orders are always tied to a user account.
- **Light theme with plain CSS and CSS variables:** matches the minimalist reference and the stated stack (HTML and CSS), with no extra UI library to learn or maintain.
- **Admin access through a role on the user profile:** keeps one login system for both customers and admin, with admin pages protected by role checks and database access rules.

## Session Notes

- Project: FootWear, an online sneaker shopping cart built as a B.Tech final-year project.
- Stack: React.js, JavaScript, HTML and CSS, InsForge (PostgreSQL, Authentication, Storage), Git and GitHub.
- Design reference: https://dribbble.com/shots/22748023-FootWear-Sneakers-Ecommerce-Website (the page could not be read automatically, so the tokens in `ui-context.md` are placeholders).
- Context files so far: `project-overview.md` and `ui-context.md` are written. `architecture.md`, `code_standards.md`, and `ai-workflow-rules.md` are still to be written.
- When resuming, read all context files first, then continue with the first unchecked unit under Next Up.
