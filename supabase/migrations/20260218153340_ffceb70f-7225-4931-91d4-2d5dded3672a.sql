-- Add video_url column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video_url text DEFAULT NULL;

-- Enable storage bucket for product videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-videos', 'product-videos', true)
ON CONFLICT (id) DO NOTHING;