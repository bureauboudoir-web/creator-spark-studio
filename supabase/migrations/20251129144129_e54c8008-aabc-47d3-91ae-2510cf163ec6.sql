-- Create fastcast_content_settings table
CREATE TABLE public.fastcast_content_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  bb_api_url text,
  bb_api_key text
);

-- Enable RLS
ALTER TABLE public.fastcast_content_settings ENABLE ROW LEVEL SECURITY;

-- No public policies - only service_role can access
-- This ensures API keys are never exposed to the frontend directly

-- Add updated_at trigger
CREATE TRIGGER handle_updated_at_fastcast_settings
  BEFORE UPDATE ON public.fastcast_content_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();