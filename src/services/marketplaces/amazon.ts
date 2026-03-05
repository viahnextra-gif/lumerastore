import type { MarketplaceConnector } from './types';

export const amazonConnector: MarketplaceConnector = {
  name: 'amazon',
  label: 'Amazon Seller',
  authType: 'api_token',
  async connect(credentials) {
    console.log('[Amazon] Connect placeholder', credentials);
    return { success: true };
  },
  async syncCatalog(tenantId, productIds) {
    console.log('[Amazon] Sync catalog', { tenantId, productIds });
    return { synced: 0, errors: 0 };
  },
  async syncStock(tenantId, productIds) {
    console.log('[Amazon] Sync stock', { tenantId, productIds });
    return { synced: 0, errors: 0 };
  },
  async importOrders(tenantId, dateRange) {
    console.log('[Amazon] Import orders', { tenantId, dateRange });
    return { imported: 0 };
  },
  mapAttributes(product) {
    return { title: product.name, standard_price: product.price, quantity: product.stock };
  },
};
