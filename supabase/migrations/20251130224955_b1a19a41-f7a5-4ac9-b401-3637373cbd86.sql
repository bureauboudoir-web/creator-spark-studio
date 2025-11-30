-- Add 16 JSONB columns for onboarding sections to creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS personal_information JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS physical_description JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS amsterdam_story JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS boundaries JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS pricing_structure JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS persona_character JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS scripts_messaging JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS content_preferences JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS visual_identity JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS creator_story JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS menu_items JSONB DEFAULT '[]';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS bundles JSONB DEFAULT '[]';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS loyal_fan_offers JSONB DEFAULT '[]';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS voice_preferences JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS media_uploads JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS of_strategy JSONB DEFAULT '{}';
ALTER TABLE creators ADD COLUMN IF NOT EXISTS onboarding_completion INTEGER DEFAULT 0;
ALTER TABLE creators ADD COLUMN IF NOT EXISTS onboarding_sections_completed TEXT[] DEFAULT '{}';

-- Add helpful comment
COMMENT ON COLUMN creators.personal_information IS 'Full name, age, location, nationality, languages, bio';
COMMENT ON COLUMN creators.physical_description IS 'Hair, eyes, body type, tattoos, piercings';
COMMENT ON COLUMN creators.amsterdam_story IS 'How they arrived, connection to Amsterdam';
COMMENT ON COLUMN creators.boundaries IS 'Hard limits, soft limits, creative comfort zones';
COMMENT ON COLUMN creators.pricing_structure IS 'PPV prices, subscriptions, bundles';
COMMENT ON COLUMN creators.persona_character IS 'Persona name, traits, roleplay styles';
COMMENT ON COLUMN creators.scripts_messaging IS 'Message tone, selling strategy, flirting style';
COMMENT ON COLUMN creators.content_preferences IS 'Content types, posting frequency, energy level';
COMMENT ON COLUMN creators.visual_identity IS 'Appearance keywords, wardrobe, photo style, colors';
COMMENT ON COLUMN creators.creator_story IS 'Background, origin, ongoing narratives';
COMMENT ON COLUMN creators.menu_items IS 'Array of menu items with title, description, price';
COMMENT ON COLUMN creators.bundles IS 'Array of bundles with name, items, price';
COMMENT ON COLUMN creators.loyal_fan_offers IS 'Array of loyal fan offers with name, benefit, price';
COMMENT ON COLUMN creators.voice_preferences IS 'Tone, accent, speaking speed, emotional style';
COMMENT ON COLUMN creators.media_uploads IS 'Profile photos, moodboard images, reference videos';
COMMENT ON COLUMN creators.of_strategy IS 'Niche, target audience, engagement strategy, upsell strategy';
COMMENT ON COLUMN creators.onboarding_completion IS 'Percentage of onboarding sections completed (0-100)';
COMMENT ON COLUMN creators.onboarding_sections_completed IS 'Array of completed section IDs';