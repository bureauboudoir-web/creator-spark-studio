export interface BBCreator {
  creator_id: string;
  name: string;
  email: string;
  profile_photo_url: string | null;
  creator_status: string;
  onboarding_completion?: number;
  onboarding_steps_completed?: number[];
}

export interface BBCreatorResponse {
  success: boolean;
  data: BBCreator[];
  error: string | null;
}

// Step 2: Persona & Brand Identity
export interface BBPersonaBrandIdentity {
  display_name?: string;
  persona_name?: string;
  brand_tagline?: string;
  brand_values?: string[];
  personality_summary?: string;
  unique_selling_points?: string[];
}

// Step 3: Amsterdam Story
export interface BBAmsterdamStory {
  origin_story?: string;
  why_amsterdam?: string;
  neighborhood?: string;
  city_connection?: string;
  local_favorites?: string[];
}

// Step 4: Persona Tone
export interface BBPersonaTone {
  persona_tone?: string;
  persona_keywords?: string[];
  emoji_style?: string;
  like_words?: string[];
  dislike_words?: string[];
}

// Step 5: Boundaries
export interface BBBoundaries {
  hard_limits?: string[];
  soft_limits?: string[];
  dont_discuss?: string[];
}

// Step 6: Pricing
export interface BBPricing {
  subscription_price?: number;
  ppv_range?: { min: number; max: number };
  custom_content_pricing?: Record<string, number>;
  tip_menu?: Array<{ item: string; price: number }>;
  bundles?: Array<{ name: string; items: string[]; price: number }>;
}

// Step 7: Messaging Templates
export interface BBMessagingTemplates {
  welcome_message?: string;
  mass_dm_templates?: string[];
  upsell_scripts?: string[];
  ppv_teasers?: string[];
  re_engagement_messages?: string[];
}

// Step 8: Platform Content
export interface BBPlatformContent {
  platform_links?: {
    onlyfans?: string;
    fansly?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  content_preferences?: {
    preferred_types?: string[];
    banned_types?: string[];
    posting_frequency?: string;
    posting_times?: string[];
  };
  lifestyle?: {
    hobbies?: string[];
    interests?: string[];
    daily_routine?: string;
  };
}

// Step 9: Market Positioning
export interface BBMarketPositioning {
  niche?: string;
  target_audience?: string;
  competitors?: string[];
  differentiators?: string[];
  content_pillars?: string[];
}

// Step 11: Commitments (read-only)
export interface BBCommitments {
  agreed_terms?: boolean;
  content_guidelines_accepted?: boolean;
  payout_terms_accepted?: boolean;
  last_updated?: string;
}

// Full BB Creator with ALL 11-step onboarding sections
export interface BBCreatorFull extends BBCreator {
  step2_persona_brand?: BBPersonaBrandIdentity;
  step3_amsterdam_story?: BBAmsterdamStory;
  step4_persona_tone?: BBPersonaTone;
  step5_boundaries?: BBBoundaries;
  step6_pricing?: BBPricing;
  step7_messaging_templates?: BBMessagingTemplates;
  step8_platform_content?: BBPlatformContent;
  step9_market_positioning?: BBMarketPositioning;
  step11_commitments?: BBCommitments;
  onboarding_completion?: number;
  onboarding_steps_completed?: number[];
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
