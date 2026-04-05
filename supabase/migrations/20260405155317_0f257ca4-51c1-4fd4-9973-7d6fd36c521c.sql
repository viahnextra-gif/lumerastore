
CREATE TABLE public.order_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  order_number text NOT NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  old_status text,
  new_status text NOT NULL,
  notification_type text NOT NULL DEFAULT 'status_change',
  sent boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage order notifications"
  ON public.order_notifications FOR ALL
  TO public
  USING (is_admin_or_moderator(auth.uid()));

CREATE POLICY "Users can view own order notifications"
  ON public.order_notifications FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_notifications.order_id
        AND orders.user_id = auth.uid()
    )
  );
