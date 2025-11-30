export interface OnboardingSection {
  id: string;
  label: string;
  description: string;
  required: boolean;
  completed: boolean;
}

export const REQUIRED_ONBOARDING_SECTIONS = [
  'personal_info',
  'persona',
  'creator_story',
  'visual_identity',
  'messaging',
  'content_preferences',
  'pricing',
  'boundaries',
] as const;

export const ONBOARDING_SECTION_LABELS: Record<string, { label: string; description: string }> = {
  personal_info: {
    label: 'Personal Information',
    description: 'Name, age, location, bio',
  },
  persona: {
    label: 'Persona & Character',
    description: 'Tone, personality, emotional style',
  },
  creator_story: {
    label: 'Creator Story',
    description: 'Background, origin, motivations',
  },
  visual_identity: {
    label: 'Visual Identity',
    description: 'Appearance style, visual brand cues',
  },
  messaging: {
    label: 'Messaging Style',
    description: 'Writing tone, engagement hooks',
  },
  content_preferences: {
    label: 'Content Preferences',
    description: 'Themes, atmosphere, posting frequency',
  },
  pricing: {
    label: 'Pricing Structure',
    description: 'Menu items, offers, bundles',
  },
  boundaries: {
    label: 'Boundaries & Comfort Level',
    description: 'Creative limits, topic boundaries',
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
