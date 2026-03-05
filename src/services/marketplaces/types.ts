export type MarketplaceName = 'mercadolivre' | 'shopee' | 'amazon' | 'magalu';

export interface MarketplaceConnection {
  id: string;
  tenant_id: string;
  marketplace: MarketplaceName;
  credentials: Record<string, string>;
  status: 'connected' | 'disconnected' | 'error';
  created_at: string;
  updated_at: string;
}

export interface MarketplaceProductMap {
  id: string;
  tenant_id: string;
  product_id: string;
  marketplace: MarketplaceName;
  external_product_id: string | null;
  external_sku: string | null;
  sync_status: 'pending' | 'synced' | 'error';
  last_sync_at: string | null;
}

export interface MarketplaceOrder {
  id: string;
  tenant_id: string;
  marketplace: MarketplaceName;
  external_order_id: string | null;
  status: string;
  total: number;
  customer_name: string | null;
  raw_payload: Record<string, unknown>;
  created_at: string;
}

export interface MarketplaceSyncLog {
  id: string;
  tenant_id: string;
  marketplace: MarketplaceName;
  operation_type: 'catalog' | 'stock' | 'price' | 'order';
  status: 'success' | 'fail' | 'pending';
  error_details: string | null;
  payload_snapshot: Record<string, unknown> | null;
  created_at: string;
  retried_at: string | null;
}

export interface MarketplaceConnector {
  name: MarketplaceName;
  label: string;
  authType: 'oauth2' | 'api_token';
  connect(credentials: Record<string, string>): Promise<{ success: boolean; error?: string }>;
  syncCatalog(tenantId: string, productIds?: string[]): Promise<{ synced: number; errors: number }>;
  syncStock(tenantId: string, productIds?: string[]): Promise<{ synced: number; errors: number }>;
  importOrders(tenantId: string, dateRange?: { from: string; to: string }): Promise<{ imported: number }>;
  mapAttributes(product: Record<string, unknown>): Record<string, unknown>;
}
