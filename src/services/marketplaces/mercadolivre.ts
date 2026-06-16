import type { MarketplaceConnector } from './types';

export const mercadoLivreConnector: MarketplaceConnector = {
  name: 'mercadolivre',
  label: 'Mercado Livre',
  authType: 'oauth2',
  async connect(credentials) {
    console.log('[MercadoLivre] Connect placeholder', credentials);
    return { success: true };
  },
  async syncCatalog(tenantId, productIds) {
    console.log('[MercadoLivre] Sync catalog', { tenantId, productIds });
    return { synced: 0, errors: 0 };
  },
  async syncStock(tenantId, productIds) {
    console.log('[MercadoLivre] Sync stock', { tenantId, productIds });
    return { synced: 0, errors: 0 };
  },
  async importOrders(tenantId, dateRange) {
    console.log('[MercadoLivre] Import orders', { tenantId, dateRange });
    return { imported: 0 };
  },
  mapAttributes(product) {
    return { title: product.name, price: product.price, currency_id: 'BRL', condition: 'new' };
  },
};
