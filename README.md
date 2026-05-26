# Store Management System

Professional retail management software with POS, inventory tracking, billing, and reporting. Built with Node.js, Express, SQLite, and EJS.

## Features

- **Point of Sale** — Keyboard-driven POS (F2/F3/+/-/*/ESC/F12), modal-based UX, barcode quick-add with auto-creation, customer selection
- **Inventory Management** — Real-time stock sync via DB triggers, restock/adjust operations, low-stock alerts, movement history
- **Role-Based Access Control** — Three roles: Admin (full access), Manager (operations), Cashier (POS/sales only); granular permission arrays stored in DB
- **Dashboards** — Role-specific views with Chart.js visualizations (revenue trends, order volume), theme-aware (light/dark), auto-update on theme toggle
- **Product Management** — CRUD with auto-SKU generation, stock adjustment UI, categories, suppliers
- **Sales & Invoicing** — Invoice generation, refund support, payment tracking
- **Purchasing & Expenses** — Purchase orders, expense categories, supplier management
- **Reporting** — Daily sales, profit/loss, top products, expense summaries
- **Backup & Restore** — Database backup management from the UI
- **Activity Logging** — Full audit trail of user actions
- **Theme Support** — Light/dark mode with persistent preference

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express 4 |
| Database | SQLite (better-sqlite3) |
| Views | EJS, express-ejs-layouts |
| Auth | JWT (jsonwebtoken) |
| Charts | Chart.js 4 |
| Icons | Lucide |
| Validation | express-validator |
| Security | helmet, bcryptjs, rate-limit |
| Logging | Winston, Morgan |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd store-management

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings (see Configuration below)

# Seed the database with demo data
npm run seed

# Start the server
npm start
```

Visit `http://localhost:3000` and log in with the seeded credentials.

### Development

```bash
# Start with auto-reload
npm run dev
```

### Demo Credentials

| Role | Username | Password | PIN |
|------|----------|----------|-----|
| Admin | admin | admin123 | 1234 |
| Manager | manager | manager123 | 9012 |
| Cashier | cashier | cashier123 | 5678 |

## Configuration

Copy `.env.example` to `.env` and adjust:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Environment mode |
| `PORT` | `3000` | Server port |
| `JWT_SECRET` | *(required)* | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | `1h` | Token expiration duration |
| `DB_PATH` | `./data/store.db` | SQLite database file path |
| `LOG_LEVEL` | `info` | Winston log level |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed CORS origin |

## NPM Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm run seed` | Seed database with demo data (30 products, 3 users) |
| `npm run backup` | Create a database backup |
| `npm test` | Run all tests |
| `npm run test:unit` | Run unit tests |
| `npm run test:integration` | Run integration tests |
| `npm run test:coverage` | Run tests with coverage report |

## Project Structure

```
├── app.js                  # Express application setup
├── server.js               # Entry point
├── config/                 # Configuration, database schema, constants
│   ├── database.js         # SQLite schema + inventory trigger
│   ├── constants.js        # Roles, permissions, labels
│   └── index.js            # App config (dotenv)
├── middleware/
│   ├── auth.js             # JWT authentication
│   ├── errorHandler.js     # Error handling (JSON for API, HTML for pages)
│   ├── pageGuard.js        # Server-side page-level authorization
│   ├── roles.js            # RBAC middleware (authorize, requireLevel)
│   └── validate.js         # express-validator middleware
├── modules/                # Feature modules (route → controller → service → model)
│   ├── auth/               # Authentication & login
│   ├── products/           # Product CRUD
│   ├── inventory/          # Stock management, restock, adjust
│   ├── sales/              # POS sales & invoicing
│   ├── purchases/          # Purchase orders
│   ├── categories/         # Product categories
│   ├── suppliers/          # Supplier management
│   ├── customers/          # Customer management
│   ├── expenses/           # Expense tracking
│   ├── employees/          # Employee/user management
│   ├── dashboard/          # Dashboard stats, charts, recent sales
│   ├── reports/            # Reporting endpoints
│   ├── backup/             # Backup & restore
│   ├── settings/           # App settings
│   └── activity/           # Activity log
├── views/
│   ├── layouts/            # main.ejs, pos.ejs, auth.ejs
│   ├── partials/           # sidebar.ejs, navbar.ejs
│   └── pages/              # Page templates
│       ├── dashboards/     # admin.ejs, manager.ejs, cashier.ejs
│       ├── pos.ejs         # POS terminal
│       └── ...             # Other pages
├── public/
│   ├── css/                # Stylesheets
│   └── js/                 # Client-side scripts
│       ├── api.js          # API client (fetch wrapper)
│       ├── theme.js        # Theme toggle (light/dark)
│       ├── keyboard.js     # POS keyboard shortcuts
│       ├── components/     # Modal.js, DataTable.js
│       └── pages/          # Page-specific JS (login.js)
├── scripts/
│   ├── seed.js             # Demo data seeder
│   └── backup.js           # CLI backup script
├── tests/                  # Mocha/Chai/Supertest test suites
└── data/                   # SQLite database (gitignored)
```

## API Overview

All API routes are prefixed with `/api/v1` and require JWT authentication via `Authorization: Bearer <token>` header.

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/auth/login` | POST | Authenticate and receive JWT |
| `/products` | GET, POST | Product CRUD |
| `/products/:id` | GET, PUT, DELETE | Single product operations |
| `/categories` | GET, POST, PUT, DELETE | Category management |
| `/suppliers` | GET, POST, DELETE | Supplier management |
| `/customers` | GET | Customer listing |
| `/inventory` | GET | Stock overview with filters |
| `/inventory/restock/:id` | POST | Restock product |
| `/inventory/adjust/:id` | POST | Adjust stock (add/remove) |
| `/inventory/:id/movements` | GET | Stock movement history |
| `/sales` | GET, POST | Sales listing & creation |
| `/sales/:id` | GET | Sale detail/invoice |
| `/sales/:id/refund` | PUT | Refund a sale |
| `/purchases` | GET, POST | Purchase orders |
| `/expenses` | GET, POST | Expense tracking |
| `/dashboard/summary` | GET | Dashboard stats |
| `/dashboard/charts` | GET | Chart data (7-day) |
| `/dashboard/recent-sales` | GET | Recent transactions |
| `/reports/*` | GET | Various reports |
| `/backup/*` | GET, POST, DELETE | Backup management |
| `/settings` | GET, PUT | App settings |
| `/activity` | GET | Activity log |
| `/employees` | GET, POST, PUT | User management |

## Inventory Syncing

Stock quantities are maintained via a database trigger (`trg_inventory_sync_current_stock`) on the `inventory` table. Every insert into `inventory` automatically updates the corresponding `current_stock.quantity`:

- **Purchase/Restock/Return** → `+quantity`
- **Sale/Removal** → `-quantity`

This guarantees consistency regardless of code path.

## License

MIT
