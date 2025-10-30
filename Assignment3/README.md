# Assignment 3 – Full Stack Shop (React + Vite + Node/Express + SQLite)

This project contains a React frontend (Vite) and a Node/Express backend backed by SQLite.

## Backend is soley responsible for caluclations and database communication
## Routes are soley responsible for handling communication between the frontend and backend
## Frontend is responsible for handle user interactions and displaying data

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Windows, macOS, or Linux

## Project Structure

```
Assignment3/
  server/               # Backend (Express + SQLite)
    server.cjs          # Express app entry
    backend/            # Data access classes (e.g., catalogue.cjs)
    routes/             # Express routers
    database.db         # SQLite database
  src/                  # React frontend (Vite)
    App.jsx, ...
  package.json          # Frontend scripts and deps
```

## 1. Install dependencies

From the `Assignment3` directory:

```bash
npm install
```

This installs frontend dependencies (Vite/React). The backend is plain Node (no separate install step required beyond Node itself).

## 2, Start the backend

From the `Assignment3` directory:

```bash
node server/server.cjs
```

The backend starts on `http://localhost:4000` and serves the following key API endpoints:

- Catalogue
  - GET `/api/catalogue` – list products
  - POST `/api/catalogue` – add product
  - PUT `/api/catalogue/:id` – update product fields
  - PATCH `/api/catalogue/:id/active` – toggle `is_active`

- Cart
  - GET `/api/cart/:userId`
  - POST `/api/cart/:userId/items` – add to cart
  - PUT `/api/cart/:userId/items/:productId` – update quantity
  - DELETE `/api/cart/:userId/items/:productId` – remove item

- Checkout
  - POST `/api/checkout/quote`
  - POST `/api/checkout/create`
  - POST `/api/checkout/pay`
  - GET `/api/checkout/invoice/:orderId`

Ensure `Assignment3/server/database.db` exists (it ships with the repo). If you reset it, restart the backend.

## 3. Start the frontend (Vite dev server)

Open a second terminal in the `Assignment3` directory and run:

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). Open it in your browser.

## Using the app

- Top-left toggle switches between Customer and Admin.
- Customer
  - Browse catalogue, add items to cart, update quantities, checkout.
  - All prices, totals, and quantities come from the backend.
- Admin → Update Catalogue
  - View live catalogue from DB
  - Add new products
  - Edit existing products (name, description, price, stock, is_active)
  - No client-side fallbacks; updates/reads use backend APIs

## Scripts

From `Assignment3/`:

```bash
# start frontend
npm run dev
```

```bash
# start backend + DB
node server/server.cjs


```
