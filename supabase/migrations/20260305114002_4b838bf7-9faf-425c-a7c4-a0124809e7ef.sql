
-- Marketplace connections
CREATE TABLE public.marketplace_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  marketplace text NOT NULL,
  credentials jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'disconnected',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own connections" ON public.marketplace_connections FOR ALL TO authenticated
  USING (auth.uid() = tenant_id OR public.is_admin_or_moderator(auth.uid()))
  WITH CHECK (auth.uid() = tenant_id OR public.is_admin_or_moderator(auth.uid()));

-- Marketplace product map
CREATE TABLE public.marketplace_product_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  marketplace text NOT NULL,
  external_product_id text,
  external_sku text,
  sync_status text NOT NULL DEFAULT 'pending',
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_product_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own product maps" ON public.marketplace_product_map FOR ALL TO authenticated
  USING (auth.uid() = tenant_id OR public.is_admin_or_moderator(auth.uid()))
  WITH CHECK (auth.uid() = tenant_id OR public.is_admin_or_moderator(auth.uid()));

-- Marketplace orders
CREATE TABLE public.marketplace_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  marketplace text NOT NULL,
  external_order_id text,
  status text NOT NULL DEFAULT 'pending',
  total numeric DEFAULT 0,
  customer_name text,
  raw_payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own marketplace orders" ON public.marketplace_orders FOR ALL TO authenticated
  USING (auth.uid() = tenant_id OR public.is_admin_or_moderator(auth.uid()))
  WITH CHECK (auth.uid() = tenant_id OR public.is_admin_or_moderator(auth.uid()));

-- Marketplace sync logs
CREATE TABLE public.marketplace_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  marketplace text NOT NULL,
  operation_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error_details text,
  payload_snapshot jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  retried_at timestamptz
);

ALTER TABLE public.marketplace_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sync logs" ON public.marketplace_sync_logs FOR ALL TO authenticated
  USING (auth.uid() = tenant_id OR public.is_admin_or_moderator(auth.uid()))
  WITH CHECK (auth.uid() = tenant_id OR public.is_admin_or_moderator(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_marketplace_connections_updated_at
  BEFORE UPDATE ON public.marketplace_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
