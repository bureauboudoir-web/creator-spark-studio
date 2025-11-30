export interface BBCreator {
  creator_id: string;
  name: string;
  email: string;
  profile_photo_url: string | null;
  creator_status: string;
  onboarding_completion?: number;
  onboarding_sections_completed?: string[];
}

export interface BBCreatorResponse {
  success: boolean;
  data: BBCreator[];
  error: string | null;
}

// 1. Personal Information
export interface BBPersonalInformation {
  full_name?: string;
  preferred_name?: string;
  age?: number;
  date_of_birth?: string;
  nationality?: string;
  languages?: string[];
  location_city?: string;
  location_country?: string;
  bio?: string;
}

// 2. Physical Description
export interface BBPhysicalDescription {
  hair_color?: string;
  hair_length?: string;
  eye_color?: string;
  height?: string;
  body_type?: string;
  tattoos?: string;
  piercings?: string;
  distinguishing_features?: string[];
}

// 3. Amsterdam Story
export interface BBAmsterdamStory {
  how_they_arrived?: string;
  why_amsterdam?: string;
  personal_background?: string;
  connection_to_city?: string;
}

// 4. Boundaries & Comfort Levels
export interface BBBoundaries {
  hard_limits?: string[];
  soft_limits?: string[];
  creative_comfort_zones?: string[];
  content_rules?: string[];
}

// 5. Pricing Structure
export interface BBPricingStructure {
  ppv_price_range?: string;
  custom_content_price?: string;
  subscription_tiers?: string[];
  bundle_prices?: Record<string, number>;
  special_offer_logic?: string;
}

// 6. Persona & Character
export interface BBPersonaCharacter {
  persona_name?: string;
  character_traits?: string[];
  roleplay_styles?: string[];
  communication_style?: string;
}

// 7. Scripts & Messaging Style
export interface BBScriptsMessaging {
  message_tone?: string;
  selling_strategy?: string;
  flirting_style?: string;
  emotional_tone?: string;
  high_converting_phrases?: string[];
}

// 8. Content Preferences
export interface BBContentPreferences {
  preferred_content_types?: string[];
  banned_content_types?: string[];
  posting_frequency?: string;
  posting_time_preference?: string;
  content_energy_level?: string;
}

// 9. Visual Identity
export interface BBVisualIdentity {
  appearance_keywords?: string[];
  wardrobe_keywords?: string[];
  photo_style?: string;
  color_palettes?: string[];
  branding_keywords?: string[];
}

// 10. Creator Story
export interface BBCreatorStory {
  background_story?: string;
  origin_story?: string;
  ongoing_narrative_threads?: string[];
}

// 11. Menu Items
export interface BBMenuItem {
  title: string;
  description: string;
  price: number;
}

// 12. Bundles
export interface BBBundle {
  name: string;
  items: string[];
  price: number;
}

// 13. Loyal Fan Offers
export interface BBLoyalFanOffer {
  name: string;
  benefit: string;
  price: number;
}

// 14. Voice Preferences
export interface BBVoicePreferences {
  tone_of_voice?: string;
  accent?: string;
  speaking_speed?: string;
  emotional_style?: string;
}

// 15. Media Uploads
export interface BBMediaUploads {
  profile_photos?: string[];
  moodboard_images?: string[];
  reference_videos?: string[];
}

// 16. OF Strategy Settings
export interface BBOFStrategy {
  niche?: string;
  target_audience?: string;
  competition_notes?: string;
  engagement_strategy?: string;
  upsell_strategy?: string;
}

// Full BB Creator with ALL 16 onboarding sections
export interface BBCreatorFull extends BBCreator {
  personal_information?: BBPersonalInformation;
  physical_description?: BBPhysicalDescription;
  amsterdam_story?: BBAmsterdamStory;
  boundaries?: BBBoundaries;
  pricing_structure?: BBPricingStructure;
  persona_character?: BBPersonaCharacter;
  scripts_messaging?: BBScriptsMessaging;
  content_preferences?: BBContentPreferences;
  visual_identity?: BBVisualIdentity;
  creator_story?: BBCreatorStory;
  menu_items?: BBMenuItem[];
  bundles?: BBBundle[];
  loyal_fan_offers?: BBLoyalFanOffer[];
  voice_preferences?: BBVoicePreferences;
  media_uploads?: BBMediaUploads;
  of_strategy?: BBOFStrategy;
  onboarding_completion?: number;
  onboarding_sections_completed?: string[];
}

// Preview type for list views
export interface BBCreatorPreview {
  creator_id: string;
  name: string;
  email: string;
  profile_photo_url?: string;
  creator_status: string;
  onboarding_completion: number;
}
