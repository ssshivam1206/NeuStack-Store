## NeuStack Store

NeuStack Store is a demo e-commerce experience built with Next.js App Router, React server components, and Tailwind CSS. It simulates a storefront with an in-memory catalog, cart, checkout, analytics dashboard, and an nth-order discount system.

### Architecture & Flow

**Data Layer**: `src/lib/store/index.ts` is an in-memory service that seeds products, persists carts, orders, discount codes, and analytics. It’s exposed to API routes as a singleton so state survives hot reloads.

**API Routes**: Under `src/app/api/*`, REST endpoints manage the cart (`/cart` CRUD), checkout (`/checkout`), discount availability (`/discount`), and admin analytics/discount generation (`/admin/*`). All responses follow the shared `ApiResponse<T>` type.

**Client Experience**: App Router pages (`src/app`) consume React client components:

- `CartContext` hydrates the cart via cookies and exposes add/update/remove helpers to UI components.
- Product listing uses `ProductList`/`ProductCard` to fetch and display catalog data.
- Checkout flow lives in `/cart`, where `CartSummary` handles discount code entry and calls the API.
- `Admin` page renders analytics cards derived from the store’s aggregated stats.

**Styling & UI**: Tailwind + custom UI primitives (`src/components/ui/*`) plus Sonner toasts/lucide icons for feedback.

### Running Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` for the storefront, `/cart` for the cart, and `/admin` for analytics.

### Tests

`npm test` (via Jest + Testing Library) exercises critical store and discount behaviors in `src/__tests__`.
