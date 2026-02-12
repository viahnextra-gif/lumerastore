
-- Subcategories table
CREATE TABLE public.subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Admins can manage subcategories" ON public.subcategories FOR ALL USING (is_admin_or_moderator(auth.uid()));

-- CMS Pages table
CREATE TABLE public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published pages" ON public.pages FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage pages" ON public.pages FOR ALL USING (is_admin_or_moderator(auth.uid()));
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- API Credentials table (for storing platform API keys/tokens)
CREATE TABLE public.api_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL, -- meta, google, tiktok, pinterest, x
  credential_type TEXT NOT NULL, -- api_key, token, webhook, secret, app_id
  credential_name TEXT NOT NULL,
  credential_value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can manage credentials" ON public.api_credentials FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_api_credentials_updated_at BEFORE UPDATE ON public.api_credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Social accounts table
CREATE TABLE public.social_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL, -- instagram, facebook, tiktok, pinterest, x, google
  account_name TEXT NOT NULL,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can manage social accounts" ON public.social_accounts FOR ALL USING (is_admin_or_moderator(auth.uid()));
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Campaigns table (ads management)
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  platform TEXT NOT NULL, -- meta, google, tiktok, pinterest, x
  campaign_type TEXT DEFAULT 'awareness', -- awareness, traffic, conversion, engagement
  status TEXT DEFAULT 'draft', -- draft, active, paused, completed, archived
  budget NUMERIC DEFAULT 0,
  budget_type TEXT DEFAULT 'daily', -- daily, lifetime
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  target_audience JSONB DEFAULT '{}',
  creatives JSONB DEFAULT '[]',
  external_campaign_id TEXT,
  metrics JSONB DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can manage campaigns" ON public.campaigns FOR ALL USING (is_admin_or_moderator(auth.uid()));
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Scheduled posts table (social media planner)
CREATE TABLE public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  social_account_id UUID REFERENCES public.social_accounts(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ NOT NULL,
  published_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled', -- scheduled, published, failed, cancelled
  external_post_id TEXT,
  error_message TEXT,
  hashtags TEXT[] DEFAULT '{}',
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can manage scheduled posts" ON public.scheduled_posts FOR ALL USING (is_admin_or_moderator(auth.uid()));
CREATE TRIGGER update_scheduled_posts_updated_at BEFORE UPDATE ON public.scheduled_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
