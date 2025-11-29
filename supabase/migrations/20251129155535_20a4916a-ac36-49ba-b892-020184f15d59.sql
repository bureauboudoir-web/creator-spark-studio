-- Add new columns to support extended content categories
ALTER TABLE public.content_items 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS short_description TEXT;

-- Migrate existing 'type' values to 'category' for backward compatibility
UPDATE public.content_items 
SET category = type 
WHERE category IS NULL;

-- Set default for category
ALTER TABLE public.content_items 
ALTER COLUMN category SET DEFAULT 'text';

-- Add index for faster filtering by category
CREATE INDEX IF NOT EXISTS idx_content_items_category ON public.content_items(category);

-- Add comment for documentation
COMMENT ON COLUMN public.content_items.category IS 'Content category: text, hooks, captions, images, videos, artwork, voice_scripts, ppv_templates, chat_templates, brand_assets';
COMMENT ON COLUMN public.content_items.short_description IS 'Brief description of the content item';