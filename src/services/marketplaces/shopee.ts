import type { MarketplaceConnector } from './types';

export const shopeeConnector: MarketplaceConnector = {
  name: 'shopee',
  label: 'Shopee',
  authType: 'oauth2',
  async connect(credentials) {
    console.log('[Shopee] Connect placeholder', credentials);
    return { success: true };
  },
  async syncCatalog(tenantId, productIds) {
    console.log('[Shopee] Sync catalog', { tenantId, productIds });
    return { synced: 0, errors: 0 };
  },
  async syncStock(tenantId, productIds) {
    console.log('[Shopee] Sync stock', { tenantId, productIds });
    return { synced: 0, errors: 0 };
  },
  async importOrders(tenantId, dateRange) {
    console.log('[Shopee] Import orders', { tenantId, dateRange });
    return { imported: 0 };
  },
  mapAttributes(product) {
    return { name: product.name, price: product.price, stock: product.stock };
  },
};
