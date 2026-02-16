
-- Create storage bucket for social media files
INSERT INTO storage.buckets (id, name, public) VALUES ('social-media', 'social-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access
CREATE POLICY "Anyone can view social media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'social-media');

-- Admins can upload
CREATE POLICY "Admins can upload social media files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'social-media' AND public.is_admin_or_moderator(auth.uid()));

-- Admins can delete
CREATE POLICY "Admins can delete social media files"
ON storage.objects FOR DELETE
USING (bucket_id = 'social-media' AND public.is_admin_or_moderator(auth.uid()));
