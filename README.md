# Retail & Distribution Management Platform

A production-minded React + Node.js + MongoDB showcase for a small or medium retail/distribution business. It includes an Express API, role-based access control, seeded business workflows, inventory movements, financial reporting, audit logs, notifications, and an AI-style business copilot.

## Run Locally

Start MongoDB first:

```bash
docker compose up -d mongodb
```

Then run the React client and Node API:

```bash
npm run dev
```

React runs on `http://127.0.0.1:5173`.
The API runs on `http://127.0.0.1:8123`.

For the production-style single container flow:

```bash
docker compose up --build
```

Open `http://localhost:8123`.

Demo bearer tokens:

- `owner-token`: Business Owner
- `manager-token`: Manager
- `sales-token`: Sales Staff
- `inventory-token`: Inventory Staff
- `accountant-token`: Accountant
- `super-token`: Super Admin

Copy `server/.env.example` to `server/.env` if you want to customize MongoDB, ports, CORS, or secrets.

## Useful Commands

```bash
npm test
npm start
```

## Architecture

- `server/index.js`: Express server, routing, auth, RBAC, observability headers.
- `server/models.js`: Mongoose models for MongoDB collections.
- `server/db.js`: MongoDB connection and seed bootstrap.
- `server/store.js`: seeded business data source.
- `server/domain.js`: reporting, stock, financial, and copilot calculations.
- `client/`: Vite + React dashboard UI.
- `docs/architecture.md`: production roadmap and cloud design.
- `deploy/Dockerfile` and `docker-compose.yml`: container entry points.

## Implemented Modules

- Dashboard and analytics APIs
- Product, category, supplier, customer, channel APIs
- Inventory stock movements
- Purchase orders and sales orders
- Invoices, payments, expenses, returns
- Notifications
- Users, roles, permissions
- Audit logs
- AI Business Copilot insights
