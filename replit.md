# MultiTrack Hub

Full-stack Brazilian music multitrack e-commerce platform for musicians, bands, worship ministries, and producers.

## Architecture

**Monorepo (pnpm workspaces)**
- `artifacts/multitrack-hub` — React + Vite frontend (port 22394, preview path `/`)
- `artifacts/api-server` — Express 5 API server (port 8080, path `/api`)
- `lib/db` — Drizzle ORM schema + PostgreSQL client
- `lib/api-spec` — OpenAPI 3.0 spec + codegen
- `lib/api-client-react` — Generated React Query hooks (from orval)
- `lib/api-zod` — Generated Zod schemas (from orval)

## Features

- **Catalog** — searchable/filterable product grid with BPM, key, genre, price filters
- **Product Detail** — cover, HTML5 audio preview, BPM/key/duration, track list, purchase/credit options
- **Cart + Checkout** — coupon codes, Pix/card payment method selection
- **Orders** — order history, status badges, download links
- **Downloads** — all granted downloads with re-download
- **Plans** — Free vs Premium subscription comparison
- **Subscriptions + Credits** — R$ 9,90/mês Premium with 3 credits/month, up to 6 accumulated
- **Rateios** — collective purchasing system with progress bars, comments timeline, join button
- **Wishlist** — saved products
- **Admin Panel** — dashboard (Recharts), product CRUD, orders, users, rateios, coupons, credit adjustments

## Database Schema (PostgreSQL + Drizzle)

Tables: `users`, `sessions`, `categories`, `products`, `cart_items`, `cart_coupons`, `orders`, `order_items`, `download_grants`, `download_logs`, `plans`, `subscriptions`, `credit_ledger`, `rateios`, `rateio_participants`, `rateio_comments`, `coupons`, `coupon_usages`, `wishlist`

## Auth

- SHA-256 + SESSION_SECRET password hashing
- Bearer token sessions (stored in `sessions` table, 30-day TTL)
- Token stored in localStorage on client
- Roles: `buyer`, `member`, `premium`, `admin`, `support`
- Admin credentials: `admin@multitrack.com` / `admin123`

## API Routes

All routes prefixed `/api`:
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET /categories`
- `GET /products`, `GET /products/featured`, `GET /products/bestsellers`, `GET /products/:id`, `GET /products/:id/related`
- `GET|POST /cart`, `POST /cart/items`, `DELETE /cart/items/:id`, `POST /cart/coupon`, `POST /cart/coupon/remove`
- `GET|POST /orders`, `GET /orders/:id`, `POST /orders/:id/pay`
- `GET /downloads`, `POST /downloads/:grantId/link`
- `GET /subscriptions/plans`, `GET|POST|DELETE /subscriptions/me`
- `GET /credits`, `POST /credits/use`
- `GET|POST /rateios`, `GET /rateios/:id`, `POST /rateios/:id/join`, `GET|POST /rateios/:id/comments`
- `GET|POST|DELETE /wishlist/:productId`
- Admin: `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/users`, `/admin/rateios`, `/admin/coupons`, `/admin/credits`

## Design

- Dark studio atmosphere: `hsl(240 10% 4%)` background
- Electric cyan accent: `hsl(180 100% 50%)`
- Brazilian Portuguese UI throughout

## Seed Data

- 8 categories (Gospel, Rock, Sertanejo, MPB, Pop, Forró, Pagode, Worship)
- 12 products with real images, BPM, keys, track lists
- 4 rateios in various stages (open, in_quotation, suggested)
- 3 coupons (BEMVINDO10, GOSPEL20, FRETE5)
- 1 Premium plan (R$ 9,90/mês, 3 credits/month)
- 3 test users including admin

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection (auto-provisioned)
- `SESSION_SECRET` — password hashing secret
- `PORT` — assigned per artifact by workflow config
