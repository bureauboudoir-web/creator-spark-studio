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
  'audience_profile',
  'posting_frequency',
  'niche',
  'tone_of_voice',
  'content_style',
] as const;

export const ONBOARDING_SECTION_LABELS: Record<string, { label: string; description: string }> = {
  personal_information: {
    label: 'Personal Information',
    description: 'Name, age, location, bio',
  },
  physical_description: {
    label: 'Physical Description',
    description: 'Appearance details, body type, features',
  },
  amsterdam_story: {
    label: 'Amsterdam Story',
    description: 'Location narrative, city connection',
  },
  boundaries: {
    label: 'Boundaries & Comfort Level',
    description: 'Creative limits, topic boundaries',
  },
  pricing_structure: {
    label: 'Pricing Structure',
    description: 'Menu items, offers, bundles',
  },
  persona_character: {
    label: 'Persona & Character',
    description: 'Identity, traits, energy, tone',
  },
  scripts_messaging: {
    label: 'Scripts & Messaging',
    description: 'Writing tone, engagement hooks',
  },
  content_preferences: {
    label: 'Content Preferences',
    description: 'Themes, atmosphere, posting frequency',
  },
  visual_identity: {
    label: 'Visual Identity',
    description: 'Appearance style, visual brand cues',
  },
  creator_story: {
    label: 'Creator Story',
    description: 'Background, origin, motivations',
  },
  audience_profile: {
    label: 'Audience Profile',
    description: 'Target demographics, community',
  },
  posting_frequency: {
    label: 'Posting Frequency',
    description: 'Content schedule',
  },
  niche: {
    label: 'Niche',
    description: 'Content focus area',
  },
  tone_of_voice: {
    label: 'Tone of Voice',
    description: 'Communication style',
  },
  content_style: {
    label: 'Content Style',
    description: 'Style tags and approach',
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
