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

// Personal Information
export interface BBPersonalInfo {
  name: string;
  age?: number;
  location?: string;
  short_bio?: string;
}

// Physical Description / Visual Identity
export interface BBVisualIdentity {
  appearance_style?: string;
  visual_vibe?: string;
  signature_look?: string;
  unique_identifiers?: string[];
}

// Backstory / Creator Story
export interface BBCreatorStory {
  background_story?: string;
  personality_background?: string;
  brand_origin_story?: string;
  lifestyle_themes?: string[];
  motivations?: string[];
}

// Boundaries & Comfort Levels
export interface BBBoundaries {
  creative_limits?: string[];
  content_comfort_zones?: string[];
  communication_preferences?: string[];
  acceptable_topic_boundaries?: string[];
}

// Pricing Structure
export interface BBPricing {
  menu_item_names?: string[];
  description_style?: string;
  offer_types?: string[];
  bundle_style?: string;
  value_statements?: string[];
}

// Persona & Character
export interface BBPersona {
  tone_of_voice?: string;
  personality_traits?: string[];
  character_identity?: string;
  mood_energy?: string;
  writing_style?: string;
  emotional_style?: string;
  audience_impression_goals?: string[];
}

// Scripts & Messaging
export interface BBMessaging {
  writing_tone?: string;
  conversation_style?: string;
  message_structure?: string;
  emotional_angles?: string[];
  storytelling_style?: string;
  engagement_hooks?: string[];
  fan_relationship_style?: string;
}

// Content Preferences
export interface BBContentPreferences {
  preferred_themes?: string[];
  preferred_atmosphere?: string;
  preferred_storyline_types?: string[];
  preferred_visual_style?: string;
  content_to_avoid?: string[];
  posting_frequency?: string;
  content_strategy_preferences?: string[];
  audience_type?: string;
}

// Full BB Creator with all onboarding sections
export interface BBCreatorFull extends BBCreator {
  personal_info?: BBPersonalInfo;
  visual_identity?: BBVisualIdentity;
  creator_story?: BBCreatorStory;
  boundaries?: BBBoundaries;
  pricing?: BBPricing;
  persona?: BBPersona;
  messaging?: BBMessaging;
  content_preferences?: BBContentPreferences;
  voice_samples_available?: boolean;
}

