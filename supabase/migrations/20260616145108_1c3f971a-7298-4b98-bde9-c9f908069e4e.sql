
-- 1) chat_messages: restrict SELECT to owner or admin (no more public read on NULL user)
DROP POLICY IF EXISTS "Users can view own messages" ON public.chat_messages;
CREATE POLICY "Users can view own messages"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 2) settings: require auth for non-secret reads
DROP POLICY IF EXISTS "Anyone can view non-secret settings" ON public.settings;
CREATE POLICY "Authenticated can view non-secret settings"
  ON public.settings
  FOR SELECT
  TO authenticated
  USING (is_secret = false);

-- 3) storage.objects: replace broad public-listing SELECT with admin-only listing.
-- Public CDN URLs continue to work because public buckets are served directly.
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view social media files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product videos" ON storage.objects;

CREATE POLICY "Admins can list product images"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can list product videos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'product-videos' AND public.is_admin_or_moderator(auth.uid()));

CREATE POLICY "Admins can list social media files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'social-media' AND public.is_admin_or_moderator(auth.uid()));

-- 4) Lock down internal trigger / helper functions from being RPC-callable.
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_automation_on_new_order() FROM PUBLIC, anon, authenticated;
-- has_role / is_admin_or_moderator are intentionally callable so RLS policies work.
