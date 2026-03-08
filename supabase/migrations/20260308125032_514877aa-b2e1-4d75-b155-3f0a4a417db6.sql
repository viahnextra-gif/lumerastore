
-- Create marketplace_messages table
CREATE TABLE public.marketplace_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  marketplace TEXT NOT NULL,
  customer_name TEXT,
  order_id TEXT,
  subject TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  reply_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  ai_suggestion TEXT,
  external_message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  replied_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.marketplace_messages ENABLE ROW LEVEL SECURITY;

-- RLS policy
CREATE POLICY "Users can manage own marketplace messages"
ON public.marketplace_messages
FOR ALL
TO authenticated
USING ((auth.uid() = tenant_id) OR is_admin_or_moderator(auth.uid()))
WITH CHECK ((auth.uid() = tenant_id) OR is_admin_or_moderator(auth.uid()));

-- Enable realtime for marketplace_orders and marketplace_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_orders;
