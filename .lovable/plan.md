

## Plan: AI Assistant UI Improvement + Marketplaces Module

This plan has two parts: a quick UI fix for the inline AI assistant, and a large new Marketplaces admin module.

---

### Part 1: Inline AI Assistant UI Redesign

**Current state:** The AI section takes up a large area with title/badge above, suggestions inside the card, and the input at the bottom.

**Changes:**
- **Minimize the section** -- reduce vertical padding, remove the large header badge/title/subtitle. Replace with a compact inline title + description directly above the search-style input field.
- **Search-style input** -- style the input like a search bar (rounded-full, with a search/sparkles icon on the left, send button on the right).
- **Title + explanatory text above input** -- e.g. "Assistente MECA" as title and a short description like "Pergunte sobre produtos, moda, listas de compras, envios e mais" above the input.
- **Suggestions below the input** -- move the quick-suggestion chips below the text field instead of above it.
- **Chat area expands above** when active (conversation appears above the input).

**File:** `src/components/home/InlineAIAssistant.tsx`

---

### Part 2: Marketplaces Omnichannel Module

**Important constraints:** This project uses React + Vite (not Next.js), so we adapt the architecture accordingly. No Bull/Redis (no Node.js backend), but we can use Supabase Edge Functions + database for job-like behavior. No n8n integration without credentials.

#### 2a. Database (new tables via migration)

Create 4 new tables with RLS by `tenant_id` (using a simplified approach where tenant_id references the user/org):

1. **`marketplace_connections`** -- id, tenant_id, marketplace (text enum: mercadolivre/shopee/amazon/magalu), credentials (jsonb, encrypted at app level), status, created_at, updated_at
2. **`marketplace_product_map`** -- id, tenant_id, product_id (FK products), marketplace, external_product_id, external_sku, sync_status, last_sync_at
3. **`marketplace_orders`** -- id, tenant_id, marketplace, external_order_id, status, total, customer_name, raw_payload (jsonb), created_at
4. **`marketplace_sync_logs`** -- id, tenant_id, marketplace, operation_type (catalog/stock/price/order), status (success/fail/pending), error_details, payload_snapshot (jsonb), created_at, retried_at

RLS policies: all tables filtered by `auth.uid()` matching tenant_id, plus admin override via `is_admin_or_moderator()`.

#### 2b. Admin Pages (React components)

Add to admin sidebar under "Marketplaces" with icon `Store`:

| Submenu | Route | Description |
|---------|-------|-------------|
| Dashboard | `/admin/marketplaces` | Overview cards: connected marketplaces, sync status, recent errors, order volume |
| Conexoes | `/admin/marketplaces/conexoes` | Connect/disconnect marketplaces (OAuth placeholder for ML/Shopee, API token for Amazon/Magalu) |
| Catalogo | `/admin/marketplaces/catalogo` | Map products to marketplaces, sync status, bulk sync button |
| Pedidos | `/admin/marketplaces/pedidos` | Imported orders list with filters |
| Estoque | `/admin/marketplaces/estoque` | Stock divergence view |
| Logs | `/admin/marketplaces/logs` | Sync logs with retry button |

**New files:**
- `src/pages/admin/marketplaces/MarketplaceDashboard.tsx`
- `src/pages/admin/marketplaces/MarketplaceConnections.tsx`
- `src/pages/admin/marketplaces/MarketplaceCatalog.tsx`
- `src/pages/admin/marketplaces/MarketplaceOrders.tsx`
- `src/pages/admin/marketplaces/MarketplaceStock.tsx`
- `src/pages/admin/marketplaces/MarketplaceLogs.tsx`

#### 2c. Connector Architecture

Create service files for marketplace connectors (structural placeholders since we don't have real API keys yet):

- `src/services/marketplaces/types.ts` -- shared types/interfaces
- `src/services/marketplaces/mercadolivre.ts`
- `src/services/marketplaces/shopee.ts`
- `src/services/marketplaces/amazon.ts`
- `src/services/marketplaces/magalu.ts`

Each exports functions: `connect()`, `syncCatalog()`, `syncStock()`, `importOrders()`, `mapAttributes()`.

#### 2d. Edge Functions

- `supabase/functions/marketplace-sync/index.ts` -- handles catalog/stock/order sync operations, writes to sync_logs, supports retry

#### 2e. Routing Updates

- `src/App.tsx` -- add nested routes under `/admin/marketplaces/*`
- `src/pages/admin/AdminLayout.tsx` -- add "Marketplaces" to sidebar navigation with collapsible sub-items

#### 2f. i18n

Add marketplace-related translation keys to `LanguageContext.tsx` for PT/ES/EN.

---

### Implementation Order

1. AI Assistant UI redesign (single file change)
2. Database migration (4 new tables + RLS)
3. Service layer (connector types + placeholders)
4. Edge function for sync
5. Admin pages (6 new page components)
6. Routing + sidebar updates
7. i18n keys

