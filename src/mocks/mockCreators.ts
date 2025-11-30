export interface MockCreator {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: 'completed' | 'in_progress' | 'applied';
  onboarding: {
    location: string;
    years_on_platform: string;
    content_type: string;
    posting_frequency: string;
    audience_size: string;
  };
  persona: {
    niche: string;
    tone_of_voice: string;
    strategy: string;
    boundaries: string[];
    brand_keywords: string[];
    key_traits: string[];
  };
  style_preferences: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    vibe: string;
    sample_image_urls: string[];
  };
}

export const MOCK_CREATORS: MockCreator[] = [
  {
    id: "mock-1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    status: "completed",
    onboarding: {
      location: "Los Angeles, CA",
      years_on_platform: "2+ years",
      content_type: "Lifestyle & Wellness",
      posting_frequency: "Daily",
      audience_size: "50K-100K",
    },
    persona: {
      niche: "Wellness and mindful living",
      tone_of_voice: "Warm, authentic, encouraging",
      strategy: "Educational content mixed with personal stories",
      key_traits: ["Authentic", "Empathetic", "Knowledgeable", "Approachable"],
      boundaries: ["No medical advice", "No product endorsements without disclosure", "Respect privacy"],
      brand_keywords: ["wellness", "mindfulness", "self-care", "balance", "growth"],
    },
    style_preferences: {
      primary_color: "#E8DFF5",
      secondary_color: "#FCE1E4",
      accent_color: "#DAEAF6",
      vibe: "Calm, natural, minimalist",
      sample_image_urls: [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400",
        "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400",
      ],
    },
  },
  {
    id: "mock-2",
    name: "Marcus Chen",
    email: "marcus.chen@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    status: "in_progress",
    onboarding: {
      location: "New York, NY",
      years_on_platform: "1 year",
      content_type: "Fitness & Nutrition",
      posting_frequency: "3-4 times per week",
      audience_size: "25K-50K",
    },
    persona: {
      niche: "Functional fitness and sustainable nutrition",
      tone_of_voice: "Motivational, direct, science-backed",
      strategy: "Workout tutorials, nutrition tips, transformation stories",
      key_traits: ["Motivating", "Knowledgeable", "Disciplined", "Real"],
      boundaries: ["No extreme diets", "No supplement endorsements", "Evidence-based only"],
      brand_keywords: ["fitness", "strength", "nutrition", "transformation", "sustainable"],
    },
    style_preferences: {
      primary_color: "#FF6B6B",
      secondary_color: "#4ECDC4",
      accent_color: "#FFE66D",
      vibe: "Energetic, bold, dynamic",
      sample_image_urls: [
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400",
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
      ],
    },
  },
  {
    id: "mock-3",
    name: "Sofia Rodriguez",
    email: "sofia.rodriguez@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
    status: "completed",
    onboarding: {
      location: "Miami, FL",
      years_on_platform: "3+ years",
      content_type: "Beauty & Fashion",
      posting_frequency: "Daily",
      audience_size: "100K+",
    },
    persona: {
      niche: "Inclusive beauty and sustainable fashion",
      tone_of_voice: "Fun, relatable, empowering",
      strategy: "Tutorials, product reviews, style tips, behind-the-scenes",
      key_traits: ["Creative", "Inclusive", "Trendy", "Authentic"],
      boundaries: ["No body shaming", "Honest product reviews only", "Sustainable brands preferred"],
      brand_keywords: ["beauty", "fashion", "inclusive", "sustainable", "confidence"],
    },
    style_preferences: {
      primary_color: "#FFB6C1",
      secondary_color: "#DDA0DD",
      accent_color: "#F0E68C",
      vibe: "Glamorous, playful, vibrant",
      sample_image_urls: [
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400",
      ],
    },
  },
  {
    id: "mock-4",
    name: "Jake Thompson",
    email: "jake.thompson@example.com",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jake",
    status: "applied",
    onboarding: {
      location: "Austin, TX",
      years_on_platform: "6 months",
      content_type: "Gaming & Tech",
      posting_frequency: "5-6 times per week",
      audience_size: "10K-25K",
    },
    persona: {
      niche: "Gaming tutorials and tech reviews",
      tone_of_voice: "Casual, humorous, informative",
      strategy: "Gameplay highlights, tips & tricks, tech unboxings",
      key_traits: ["Entertaining", "Knowledgeable", "Funny", "Relatable"],
      boundaries: ["No toxic gaming culture", "Age-appropriate content", "Honest reviews only"],
      brand_keywords: ["gaming", "tech", "reviews", "tutorials", "entertainment"],
    },
    style_preferences: {
      primary_color: "#7B68EE",
      secondary_color: "#00CED1",
      accent_color: "#32CD32",
      vibe: "Tech-forward, neon, cyberpunk",
      sample_image_urls: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
      ],
    },
  },
];

export const getMockCreatorById = (id: string): MockCreator | undefined => {
  return MOCK_CREATORS.find((c) => c.id === id);
};
