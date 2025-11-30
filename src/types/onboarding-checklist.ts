export interface OnboardingSection {
  id: string;
  label: string;
  description: string;
  required: boolean;
  completed: boolean;
}

export const REQUIRED_ONBOARDING_SECTIONS = [
  'personal_information',
  'physical_description',
  'amsterdam_story',
  'boundaries',
  'pricing_structure',
  'persona_character',
  'scripts_messaging',
  'content_preferences',
  'visual_identity',
  'creator_story',
  'menu_items',
  'bundles',
  'loyal_fan_offers',
  'voice_preferences',
  'media_uploads',
  'of_strategy',
] as const;

export const ONBOARDING_SECTION_LABELS: Record<string, { label: string; description: string }> = {
  personal_information: {
    label: 'Personal Information',
    description: 'Name, age, location, nationality, languages, bio',
  },
  physical_description: {
    label: 'Physical Description',
    description: 'Hair, eyes, body type, tattoos, piercings',
  },
  amsterdam_story: {
    label: 'Amsterdam Story',
    description: 'How you arrived, connection to the city',
  },
  boundaries: {
    label: 'Boundaries & Comfort Levels',
    description: 'Hard limits, soft limits, creative comfort zones',
  },
  pricing_structure: {
    label: 'Pricing Structure',
    description: 'PPV prices, subscriptions, bundles',
  },
  persona_character: {
    label: 'Persona & Character',
    description: 'Persona name, traits, roleplay styles',
  },
  scripts_messaging: {
    label: 'Scripts & Messaging',
    description: 'Message tone, selling strategy, flirting style',
  },
  content_preferences: {
    label: 'Content Preferences',
    description: 'Content types, posting frequency, energy level',
  },
  visual_identity: {
    label: 'Visual Identity',
    description: 'Appearance keywords, wardrobe, photo style, colors',
  },
  creator_story: {
    label: 'Creator Story',
    description: 'Background, origin, ongoing narratives',
  },
  menu_items: {
    label: 'Menu Items',
    description: 'Individual content offerings with prices',
  },
  bundles: {
    label: 'Bundles',
    description: 'Packaged content deals',
  },
  loyal_fan_offers: {
    label: 'Loyal Fan Offers',
    description: 'Special rewards for top fans',
  },
  voice_preferences: {
    label: 'Voice Preferences',
    description: 'Tone, accent, speaking speed, emotional style',
  },
  media_uploads: {
    label: 'Media Uploads',
    description: 'Profile photos, moodboard images, reference videos',
  },
  of_strategy: {
    label: 'OF Strategy',
    description: 'Niche, target audience, engagement strategy',
  },
};

export function calculateOnboardingCompletion(sectionsCompleted: string[]): number {
  if (!sectionsCompleted || sectionsCompleted.length === 0) return 0;
  return Math.round((sectionsCompleted.length / REQUIRED_ONBOARDING_SECTIONS.length) * 100);
}

export function getOnboardingSections(sectionsCompleted: string[]): OnboardingSection[] {
  return REQUIRED_ONBOARDING_SECTIONS.map((id) => ({
    id,
    label: ONBOARDING_SECTION_LABELS[id].label,
    description: ONBOARDING_SECTION_LABELS[id].description,
    required: true,
    completed: sectionsCompleted.includes(id),
  }));
}
