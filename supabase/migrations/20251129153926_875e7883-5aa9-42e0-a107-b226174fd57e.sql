-- Add title column to starter_packs table
ALTER TABLE public.starter_packs 
ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT 'Untitled Starter Pack';