
-- Fix function search_path warnings
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    new_number TEXT;
BEGIN
    new_number := 'MEC-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN new_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := public.generate_order_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix overly permissive INSERT policies
-- Drop the permissive policies and create more restrictive ones
DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;
DROP POLICY IF EXISTS "Anyone can create leads" ON public.leads;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.chat_messages;

-- Order items: Allow insert if user owns the order or it's a guest order
CREATE POLICY "Users can insert order items for their orders" ON public.order_items 
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
);

-- Leads: Allow anonymous lead creation (this is intentional for chatbot)
CREATE POLICY "Anyone can create leads via chatbot" ON public.leads 
FOR INSERT WITH CHECK (source = 'chatbot' OR source = 'website');

-- Chat messages: Allow insert for session owner or authenticated users
CREATE POLICY "Users can create chat messages" ON public.chat_messages 
FOR INSERT WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
);
