# Lazada SQL Database

A SQL Server backed e-commerce simulation inspired by Lazada, with:

- A Node.js + Express REST API
- A SQL Server relational schema (accounts, products, orders, cart, shipment, marketing)
- Two browser UIs:
	- Admin data management UI (`admin.html`) for CRUD and statistics
	- Customer storefront UI (`customer.html`) with cart interactions

This project is designed as a full-stack database coursework style system, where database design, constraints, triggers, and API behaviors are all part of the deliverable.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Architecture](#architecture)
4. [Database Setup (SQL Server)](#database-setup-sql-server)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [How to Run (Quick Start)](#how-to-run-quick-start)
8. [Default Sample Accounts](#default-sample-accounts)
9. [API Overview](#api-overview)
10. [Key Business Rules in SQL](#key-business-rules-in-sql)
11. [Troubleshooting](#troubleshooting)
12. [Future Improvements](#future-improvements)

---

## Tech Stack

### Backend
- Node.js
- Express
- `mssql` + `msnodesqlv8` (SQL Server driver)
- `cors`, `body-parser`, `dotenv`

### Database
- Microsoft SQL Server / SQL Server Express
- ODBC Driver 18 for SQL Server

### Frontend
- Vanilla HTML/CSS/JavaScript

---

## Project Structure

```text
.
|- server.js                     # Express entry point
|- config/
|  |- dbConfig.js                # SQL connection pool config
|- routes/                       # Route modules (grouped by domain)
|- controllers/                  # Request handling logic
|- models/                       # Data access layer (partially used)
|- services/                     # Additional service layer modules
|- Lazada SQL Server/
|  |- tables.sql                 # Schema creation (database, schemas, tables)
|  |- triggers.sql               # Triggers + stored procedures
|  |- sample.sql                 # Seed data
|  |- api*.sql                   # Query helpers / API SQL scripts
|  |- UTIL.DELETEALL.sql         # Reset seeded data while preserving schema
|  |- UTIL.checker.sql           # Quick checker script
|- index.html                    # Login page
|- admin.html                    # Admin interface
|- customer.html                 # Customer storefront
```

---

## Architecture

### Runtime flow

1. Browser UI sends HTTP requests to API (`http://localhost:3000/api/...`).
2. Express routes map each endpoint to controllers.
3. Controllers execute SQL queries through a shared SQL Server connection pool.
4. SQL Server enforces business rules with constraints, triggers, and procedures.

### Layering

- **Presentation**: `index.html`, `admin.html`, `customer.html` + corresponding JS/CSS
- **API/Controller**: `routes/*`, `controllers/*`
- **Data access**: `models/*` + SQL statements in controllers
- **Persistence**: SQL Server database `Lazada`

---

## Database Setup (SQL Server)

### Prerequisites

- SQL Server running (local instance expected)
- ODBC Driver 18 for SQL Server installed
- A Windows account with access to SQL Server (current config uses Trusted Connection)

### Connection configuration used by backend

`config/dbConfig.js` currently uses:

```js
connectionString: 'Driver={ODBC Driver 18 for SQL Server};Server=localhost\\SQLEXPRESS;Database=Lazada;Trusted_Connection=yes;TrustServerCertificate=yes;'
```

If your SQL Server instance name is different, update `Server=...` accordingly.

### SQL execution order

Run these scripts in order:

1. `Lazada SQL Server/tables.sql`
2. `Lazada SQL Server/triggers.sql`
3. `Lazada SQL Server/sample.sql`

Optional utilities:

- `Lazada SQL Server/UTIL.DELETEALL.sql`: Deletes all rows and reseeds identity values
- `Lazada SQL Server/UTIL.checker.sql`: Quick sanity checks

---

## Backend Setup

Install dependencies:

```bash
npm install
```

Start API server:

```bash
node server.js
```

Expected log:

```text
Connected to SQL Server successfully!
Server is running on http://localhost:3000
```

---

## Frontend Setup

This project has static frontend pages at repository root:

- `index.html` (login)
- `admin.html` (admin dashboard)
- `customer.html` (customer page)

Recommended ways to run frontend:

1. Open with VS Code Live Server, or
2. Use a simple static server (for example: `npx serve .`)

Then open the served `index.html` URL in your browser.

---

## How to Run (Quick Start)

1. Create schema and seed data in SQL Server:
	 - `tables.sql` -> `triggers.sql` -> `sample.sql`
2. Install Node dependencies:
	 - `npm install`
3. Start backend:
	 - `node server.js`
4. Start frontend static hosting (Live Server or equivalent)
5. Open `index.html` from hosted frontend URL
6. Log in with a sample account

---

## Default Sample Accounts

From seeded data in `sample.sql`:

- Admin:
	- Username: `admin`
	- Password: `admin`
- Customer examples:
	- `john_doe` / `pass1`
	- `jane_smith` / `pass2`

Authentication endpoint accepts either username or email in the `username` field.

---

## API Overview

All routes are mounted under `/api` in `server.js`.

### Authentication
- `POST /api/login`

### Accounts
- `GET /api/accounts`
- `GET/POST/PUT/DELETE /api/customer`
- `GET/POST/PUT/DELETE /api/seller`
- `GET/POST/PUT/DELETE /api/admin`
- `GET/POST/PUT/DELETE /api/affiliate`

### Product & Catalog
- `GET/POST/PUT/DELETE /api/category`
- `GET/POST/PUT/DELETE /api/product`
- `GET/POST/PUT/DELETE /api/review`

### Order
- `GET/POST/PUT/DELETE /api/order`
- `GET/POST/PUT/DELETE /api/order/history`
- `GET/POST/PUT/DELETE /api/order/item`

### Cart
- `GET /api/cart`
- `GET /api/cart/:accountID`
- `GET/POST/DELETE /api/cart/items`
- `GET /api/userCart/:accountId`
- `POST /api/userCart/add`
- `PUT /api/userCart/update`
- `DELETE /api/userCart/remove/:accountId/:productId`

### Marketing
- Wishlist APIs: `/api/wishlist`, `/api/wishlist/product`
- Coupon APIs: `/api/coupon`, `/api/coupon/product`, `/api/order/coupon`, `/api/order-item/coupon`
- Advertisement APIs: `/api/advertisement`, `/api/advertisement/product`

### Shipment & Payment
- Shipment/Shipper: `/api/shipment`, `/api/shipper`
- Payment cash/bank:
	- `GET/POST/PUT/DELETE /api/payment/cash`
	- `GET/POST/PUT/DELETE /api/payment/bank`

### Statistics
- `GET /api/stats/top-shipper`
- `PUT /api/stats/top-shipper`
- `DELETE /api/stats/top-shipper/:ShipperID`
- `GET /api/stats/customer-ltv`
- `GET /api/stats/orderdetails`

---

## Key Business Rules in SQL

Implemented primarily in `triggers.sql`:

- Users can review products only after delivered purchase
- Delivered/cancelled orders cannot be modified
- Order total is recalculated when order items change
- Ordered quantity cannot exceed product stock
- Creating an order clears customer cart items
- Coupon date validity is enforced for order coupon usage
- Shipment capacity and status transition logic is trigger-protected

These rules ensure consistency even if data is written outside the Node API.

---

## Troubleshooting

### Cannot connect to SQL Server

- Verify SQL Server instance name (`localhost\\SQLEXPRESS` vs your local instance)
- Verify ODBC Driver 18 is installed
- Ensure Windows account has DB access

### Login works but page navigation fails

- Make sure frontend is hosted via a static server (not opened as raw `file://`)

### API returns CORS or network errors

- Ensure backend is running on port `3000`
- Confirm frontend fetch URLs point to `http://localhost:3000`

---

## Future Improvements

- Add proper environment variable based DB config (`.env`)
- Add npm scripts (`start`, `dev`) in `package.json`
- Add API documentation (OpenAPI/Swagger)
- Add automated tests for controllers and SQL integration
- Hash passwords properly (currently sample uses plain text values)

---

## Notes

This repository is intended for educational database system development and demonstration.
