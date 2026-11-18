# FootWear – Online Sneaker Shopping Cart

## Overview

FootWear is a web-based e-commerce application for browsing and buying sneakers online. It is built as a B.Tech final-year academic project for shoppers who want a simple, user-friendly way to explore sneaker collections, pick a size, and order without needing online payment. It solves the problem of a cluttered or hard-to-use shopping experience by offering a clean, minimalist storefront (inspired by the Dribbble "FootWear Sneakers Ecommerce Website" concept) with a complete flow from product discovery to order placement using Cash on Delivery. A basic admin dashboard lets the store owner manage products and customer orders.

## Goals

1. Deliver a fully working storefront where a user can register, log in, browse sneakers, add items to a cart, and place a Cash on Delivery order end to end.
2. Provide an admin dashboard where an admin can add, edit, and delete products and view and update the status of customer orders.
3. Ship a responsive, visually clean UI that works on mobile, tablet, and desktop screen sizes.
4. Demonstrate full-stack skills: frontend development (React), backend integration, database management, authentication, and file storage using Supabase.
5. Keep the project simple, maintainable, and easy to demonstrate in a final-year project presentation.

## Core User Flow

1. A visitor opens the site and lands on the home page showing featured sneakers and collections.
2. The visitor browses collections, or searches and filters products (for example by category, brand, price).
3. The visitor opens a product detail page and views images, description, and price.
4. The visitor selects a shoe size.
5. The user registers or logs in (required before checkout).
6. The user adds the product to the cart and updates quantities or removes items.
7. The user proceeds to checkout, enters delivery details, and confirms the order with Cash on Delivery.
8. The user sees an order confirmation and can later view the order in their order history.
9. The admin logs in to the dashboard, manages products, and reviews and updates customer orders.

## Features

### Authentication

- User registration and login using Supabase Auth
- Logout and persistent session handling
- Role separation between regular users and admin
- Protected routes for checkout, order history, and the admin dashboard

### Product Browsing

- Home page with featured products and sneaker collections
- Collection and category listing pages
- Product detail page with images, description, price, and available sizes
- Search by product name
- Filters (category, brand, price range) and sorting

### Shopping Cart

- Select a shoe size before adding to cart
- Add to cart, remove from cart, and update quantity
- Cart shows line totals and an order subtotal
- Cart contents persist for logged-in users

### Checkout and Orders

- Checkout form for delivery name, phone, and address
- Cash on Delivery as the only payment method
- Order confirmation after placing an order
- Order history page showing past orders, items, and status

### Admin Dashboard

- Admin-only access
- Add, edit, and delete products (name, description, price, category, sizes, images)
- Upload product images to Supabase Storage
- View all customer orders and order details
- Update order status (for example Pending, Confirmed, Shipped, Delivered, Cancelled)

### Design and Experience

- Modern, minimalist visual style inspired by the Dribbble reference
- Fully responsive layout
- Clear loading, empty, and error states

## Scope

### In Scope

- React.js frontend using JavaScript, HTML, and CSS
- Supabase as the backend (Backend-as-a-Service)
- PostgreSQL database through Supabase
- Supabase Auth for registration and login
- Supabase Storage for product images
- Product browsing, search, filter, and size selection
- Shopping cart with quantity updates
- Checkout with Cash on Delivery
- Order history for users
- Basic admin dashboard for product and order management
- Git and GitHub for version control
- Deployment of the frontend so the project can be demonstrated live

### Out of Scope

- Online payment gateways (cards, UPI, wallets)
- Product reviews and ratings
- Wishlist or favorites
- Coupons, discounts, and promotions
- Returns, refunds, and exchange handling
- Email or SMS notifications
- Multi-vendor or multi-store support
- Advanced analytics and reporting in the admin dashboard
- Native mobile applications
- Social login (Google, Facebook, and similar)

## Success Criteria

1. A new user can register, log in, and log out successfully.
2. A visitor can browse sneakers, search by name, and filter products, and the results update correctly.
3. A user can open a product, select a size, and add it to the cart; adding without a size is blocked with a clear message.
4. A user can change quantities and remove items, and the cart totals are always correct.
5. A logged-in user can place a Cash on Delivery order, see a confirmation, and find that order in their order history.
6. An admin can add, edit, and delete products (including image upload), and these changes appear on the storefront.
7. An admin can view all orders and update an order's status, and the user sees the updated status.
8. Non-admin users cannot access the admin dashboard, and logged-out users cannot access checkout or order history.
9. The application is usable on mobile, tablet, and desktop widths without broken layouts.
10. The project is stored in a GitHub repository and the deployed version runs without errors during the demonstration.
