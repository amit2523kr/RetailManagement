# Architecture

## Product Boundaries

The platform is split into bounded modules: identity and RBAC, catalog, partners, inventory, purchasing, sales, invoicing, payments, expenses, returns, reporting, notifications, audit, and AI business intelligence.

## Production Target

- Frontend: React with Vite today; Next.js can be introduced later for SSR and route-level authorization.
- API: Node.js with Express today; Fastify or NestJS can be introduced later for larger teams and stricter module boundaries.
- Database: MongoDB with Mongoose today. A production deployment should add replica sets, backups, indexes, validation, and tenant scoping.
- Cache: Redis for dashboard aggregates, sessions, rate limits, and background job coordination.
- Events: durable outbox for stock, invoice, payment, and notification events.
- Background jobs: reorder alerts, aging receivables, marketplace imports, scheduled reports, and copilot summaries.
- Observability: structured logs, request IDs, metrics, traces, SLO dashboards, and alerting.
- Security: password hashing, JWT rotation, permission policies, audit trails, tenant scoping, rate limiting, and secret management.

## Current Local Implementation

The current version uses MongoDB through Mongoose and seeds realistic business data on first startup. The API and React UI already respect the same module boundaries intended for the production architecture.

## Next Hardening Steps

1. Add request validation and generated OpenAPI documentation.
2. Add compound MongoDB indexes for tenant, date, status, SKU, and document IDs.
3. Add Redis-backed dashboard aggregation and cache invalidation.
4. Add a queue worker for notification and reporting jobs.
5. Add Playwright end-to-end tests and API contract tests.
6. Add cloud infrastructure modules for container hosting, managed MongoDB, cache, secrets, and monitoring.
