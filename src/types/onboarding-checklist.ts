export interface OnboardingStep {
  id: string;
  stepNumber: number;
  label: string;
  description: string;
  icon: string;
  required: boolean;
  completed: boolean;
}

export const REQUIRED_ONBOARDING_STEPS = [
  'step2_persona_brand',
  'step3_amsterdam_story',
  'step4_persona_tone',
  'step5_boundaries',
  'step6_pricing',
  'step7_messaging_templates',
  'step8_platform_content',
  'step9_market_positioning',
  'step11_commitments',
] as const;

export const ONBOARDING_STEP_LABELS: Record<string, { label: string; description: string; icon: string; stepNumber: number }> = {
  step2_persona_brand: {
    stepNumber: 2,
    label: 'Persona & Brand Identity',
    description: 'Display name, brand values, personality',
    icon: 'User',
  },
  step3_amsterdam_story: {
    stepNumber: 3,
    label: 'Amsterdam Story',
    description: 'Origin story, city connection',
    icon: 'MapPin',
  },
  step4_persona_tone: {
    stepNumber: 4,
    label: 'Persona Tone',
    description: 'Keywords, emoji style, word preferences',
    icon: 'MessageSquare',
  },
  step5_boundaries: {
    stepNumber: 5,
    label: 'Boundaries',
    description: 'Hard limits, soft limits, topics to avoid',
    icon: 'Shield',
  },
  step6_pricing: {
    stepNumber: 6,
    label: 'Pricing Structure',
    description: 'Subscription, PPV, tip menu, bundles',
    icon: 'DollarSign',
  },
  step7_messaging_templates: {
    stepNumber: 7,
    label: 'Messaging Templates',
    description: 'Welcome, DMs, upsells, teasers',
    icon: 'Mail',
  },
  step8_platform_content: {
    stepNumber: 8,
    label: 'Platform & Content',
    description: 'Social links, content prefs, lifestyle',
    icon: 'Globe',
  },
  step9_market_positioning: {
    stepNumber: 9,
    label: 'Market Positioning',
    description: 'Niche, audience, competitors',
    icon: 'Target',
  },
  step11_commitments: {
    stepNumber: 11,
    label: 'Commitments',
    description: 'Terms and guidelines (read-only)',
    icon: 'CheckCircle',
  },
};

export function calculateOnboardingCompletion(stepsCompleted: number[]): number {
  if (!stepsCompleted || stepsCompleted.length === 0) return 0;
  return Math.round((stepsCompleted.length / REQUIRED_ONBOARDING_STEPS.length) * 100);
}

export function getOnboardingSteps(stepsCompleted: number[]): OnboardingStep[] {
  return REQUIRED_ONBOARDING_STEPS.map((id) => ({
    id,
    stepNumber: ONBOARDING_STEP_LABELS[id].stepNumber,
    label: ONBOARDING_STEP_LABELS[id].label,
    description: ONBOARDING_STEP_LABELS[id].description,
    icon: ONBOARDING_STEP_LABELS[id].icon,
    required: true,
    completed: stepsCompleted.includes(ONBOARDING_STEP_LABELS[id].stepNumber),
  }));
}
