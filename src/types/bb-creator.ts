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

// Personal Information Section
export interface BBPersonalInformation {
  name?: string;
  age?: number;
  location?: string;
  short_bio?: string;
  nationality?: string;
  languages?: string[];
}

// Physical Description Section
export interface BBPhysicalDescription {
  height?: string;
  body_type?: string;
  hair_color?: string;
  eye_color?: string;
  distinguishing_features?: string[];
  general_appearance?: string;
}

// Amsterdam Story Section (location-based narrative)
export interface BBAmsterdamStory {
  origin_story?: string;
  neighborhood?: string;
  local_context?: string;
  city_connection?: string;
}

// Visual Identity Section
export interface BBVisualIdentity {
  appearance_style?: string;
  visual_vibe?: string;
  signature_look?: string;
  unique_identifiers?: string[];
  aesthetic_preferences?: string[];
}

// Creator Story Section
export interface BBCreatorStory {
  background_story?: string;
  personality_background?: string;
  brand_origin_story?: string;
  lifestyle_themes?: string[];
  motivations?: string[];
}

// Persona & Character Section
export interface BBPersonaCharacter {
  character_identity?: string;
  personality_traits?: string[];
  mood_energy?: string;
  writing_style?: string;
  emotional_style?: string;
  audience_impression_goals?: string[];
  tone_of_voice?: string;
}

// Scripts & Messaging Section
export interface BBScriptsMessaging {
  writing_tone?: string;
  conversation_style?: string;
  message_structure?: string;
  emotional_angles?: string[];
  storytelling_style?: string;
  engagement_hooks?: string[];
  fan_relationship_style?: string;
}

// Content Preferences Section
export interface BBContentPreferences {
  preferred_themes?: string[];
  preferred_atmosphere?: string;
  preferred_storyline_types?: string[];
  preferred_visual_style?: string;
  content_to_avoid?: string[];
  content_strategy_preferences?: string[];
  audience_type?: string;
  posting_frequency?: string;
}

// Pricing Structure Section
export interface BBPricingStructure {
  menu_item_names?: string[];
  description_style?: string;
  offer_types?: string[];
  bundle_style?: string;
  value_statements?: string[];
  price_points?: Record<string, number>;
}

// Boundaries Section
export interface BBBoundaries {
  creative_limits?: string[];
  content_comfort_zones?: string[];
  communication_preferences?: string[];
  acceptable_topic_boundaries?: string[];
  hard_nos?: string[];
}

// Audience Profile Section
export interface BBAudienceProfile {
  target_demographics?: string[];
  audience_interests?: string[];
  engagement_style?: string;
  community_tone?: string;
}

// Full BB Creator with ALL onboarding sections
export interface BBCreatorFull extends BBCreator {
  // All 15 sections from BB exactly as stored
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
  audience_profile?: BBAudienceProfile;
  
  // Top-level convenience fields
  posting_frequency?: string;
  niche?: string;
  tone_of_voice?: string;
  content_style?: string[];
  
  // Metadata
  voice_samples_available?: boolean;
  
  // Legacy fields (keep for backward compatibility, map from new fields)
  personal_info?: BBPersonalInformation;
  persona?: BBPersonaCharacter;
  messaging?: BBScriptsMessaging;
  pricing?: BBPricingStructure;
}
