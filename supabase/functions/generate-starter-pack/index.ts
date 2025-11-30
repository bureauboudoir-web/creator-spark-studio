import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { creatorProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating starter pack for creator:", creatorProfile);

    // Generate all 5 tasks in parallel
    const [conversationStarters, videoScripts, captions, storyTeasers, menuUpsell] = await Promise.all([
      generateConversationStarters(LOVABLE_API_KEY, creatorProfile),
      generateVideoScripts(LOVABLE_API_KEY, creatorProfile),
      generateFeedCaptions(LOVABLE_API_KEY, creatorProfile),
      generateStoryTeasers(LOVABLE_API_KEY, creatorProfile),
      generateMenuUpsell(LOVABLE_API_KEY, creatorProfile),
    ]);

    return new Response(
      JSON.stringify({
        conversation_starters: conversationStarters,
        video_scripts: videoScripts,
        captions: captions,
        story_teasers: storyTeasers,
        menu_upsell: menuUpsell,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-starter-pack function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// TASK 1: Conversation Starters (30 openers)
async function generateConversationStarters(apiKey: string, profile: any): Promise<any> {
  const prompt = `You are a professional content strategist working for a private client-management agency.

Creator Context:
Name: ${profile.personal_info?.name || profile.name || 'Content Creator'}
Persona: ${profile.persona?.character_identity || 'Professional content creator'}
Tone: ${profile.persona?.tone_of_voice || 'Friendly and professional'}
Personality Traits: ${profile.persona?.personality_traits?.join(', ') || 'Authentic, engaging'}
Mood/Energy: ${profile.persona?.mood_energy || 'Warm and inviting'}
Audience Goals: ${profile.persona?.audience_impression_goals?.join(', ') || 'Build connection'}
Fan Relationship Style: ${profile.messaging?.fan_relationship_style || 'Personal and attentive'}
Engagement Hooks: ${profile.messaging?.engagement_hooks?.join(', ') || 'Curiosity, emotion'}
Boundaries (do not include): ${profile.boundaries?.acceptable_topic_boundaries?.join(', ') || 'Respect privacy'}

TASK: Create 30 conversation openers for private messages to new and existing subscribers.

Groups:
- Warm/welcoming (10 openers)
- Playful/friendly (10 openers)
- High-engagement / curiosity-driven prompts encouraging unlock (10 openers)

Rules:
- No explicit or graphic content
- Keep tone personal, friendly, emotional, and human
- Use first-person conversational style ("I", "you", "we")
- Focus on personality, storytelling, and connection
- Encourage engagement and response
- Written in the creator's voice

Return ONLY a JSON object in this exact format:
{
  "warm": ["opener 1", "opener 2", ...],
  "playful": ["opener 1", "opener 2", ...],
  "high_engagement": ["opener 1", "opener 2", ...]
}`;

  return callLovableAI(apiKey, prompt);
}

// TASK 2: Video Scripts (5 scripts)
async function generateVideoScripts(apiKey: string, profile: any): Promise<any> {
  const prompt = `You are a professional content strategist working for a private client-management agency.

Creator Context:
Name: ${profile.personal_info?.name || profile.name || 'Content Creator'}
Location: ${profile.personal_info?.location || 'Unknown'}
Brand Story: ${profile.creator_story?.brand_origin_story || 'Creative storyteller'}
Character Identity: ${profile.persona?.character_identity || 'Authentic creator'}
Emotional Style: ${profile.persona?.emotional_style || 'Warm and engaging'}
Visual Vibe: ${profile.visual_identity?.visual_vibe || 'Stylish and approachable'}
Storytelling Style: ${profile.messaging?.storytelling_style || 'Personal and emotional'}
Preferred Themes: ${profile.content_preferences?.preferred_themes?.join(', ') || 'Lifestyle, creativity'}
Atmosphere: ${profile.content_preferences?.preferred_atmosphere || 'Intimate and engaging'}
Content to Avoid: ${profile.boundaries?.content_comfort_zones?.join(', ') || 'Nothing inappropriate'}

TASK: Create 5 video scripts.

Each script must include:
- Title
- Hook
- Emotional tone
- Full 45-90 second speaking script
- Soft call-to-action

Rules:
- No explicit or graphic content
- Focus on personality, atmosphere, mood, storytelling
- Personal and emotional connection
- Written in creator's voice
- Encourage viewers to message privately
- Keep completely Lovable-compliant

Return ONLY a JSON array in this exact format:
[
  {
    "title": "script title",
    "hook": "opening hook",
    "tone": "emotional tone",
    "script": "full script text"
  }
]`;

  return callLovableAI(apiKey, prompt);
}

// TASK 3: Feed Captions (20 captions)
async function generateFeedCaptions(apiKey: string, profile: any): Promise<any> {
  const prompt = `You are a professional content strategist working for a private client-management agency.

Creator Context:
Name: ${profile.full_name || 'Content Creator'}
Persona: ${profile.persona?.niche || 'Professional content creator'}
Voice Style: ${profile.persona?.tone_of_voice || 'Friendly and professional'}
Brand Keywords: ${profile.persona?.brand_keywords?.join(', ') || 'authentic, creative'}

TASK: Create 20 feed captions.

Requirements:
- 10 short captions (under 20 words)
- 10 long captions (40-80 words)

Theme: connection, personality, storytelling, behind-the-scenes, lifestyle, feelings, curiosity.

Rules:
- No adult content
- Written in creator's voice
- Include soft CTAs like "check your DMs", "tell me...", etc.
- Personal and engaging

Return ONLY a JSON object in this exact format:
{
  "short": ["caption 1", "caption 2", ...],
  "long": ["caption 1", "caption 2", ...]
}`;

  return callLovableAI(apiKey, prompt);
}

// TASK 4: Story Teasers (5 mini stories)
async function generateStoryTeasers(apiKey: string, profile: any): Promise<any> {
  const prompt = `You are a professional content strategist working for a private client-management agency.

Creator Context:
Name: ${profile.full_name || 'Content Creator'}
Persona: ${profile.persona?.niche || 'Professional content creator'}
Voice Style: ${profile.persona?.tone_of_voice || 'Friendly and professional'}
Key Traits: ${profile.persona?.key_traits?.join(', ') || 'authentic, creative'}

TASK: Create 5 short story-based teasers (2-3 paragraphs each).

Theme options: Emotion, tension, anticipation, mystery, personal moments, behind-the-scenes reflections.

Rules:
- First-person as the creator
- Nothing adult
- End with soft CTA: "Message me if you want the full story"
- Build curiosity and connection

Return ONLY a JSON array in this exact format:
[
  {
    "title": "story title",
    "tone": "emotional tone",
    "text": "2-3 paragraph story"
  }
]`;

  return callLovableAI(apiKey, prompt);
}

// TASK 5: Menu & Upsell Copy
async function generateMenuUpsell(apiKey: string, profile: any): Promise<any> {
  const prompt = `You are a professional content strategist working for a private client-management agency.

Creator Context:
Name: ${profile.personal_info?.name || profile.name || 'Content Creator'}
Persona: ${profile.persona?.character_identity || 'Professional content creator'}
Tone: ${profile.persona?.tone_of_voice || 'Friendly and professional'}
Menu Items: ${profile.pricing?.menu_item_names?.join(', ') || 'Custom content, exclusive access, personal messages'}
Offer Types: ${profile.pricing?.offer_types?.join(', ') || 'Various offerings'}
Bundle Style: ${profile.pricing?.bundle_style || 'Premium packages'}
Value Statements: ${profile.pricing?.value_statements?.join(', ') || 'Exclusive, personalized, intimate'}
Audience Type: ${profile.content_preferences?.audience_type || 'Engaged fans'}

TASK: Turn the creator's menu into sales copy.

For each menu item:
- 1-2 sentence description
- Non-explicit but engaging
- Focus on attention, creativity, exclusivity, atmosphere

Then create:
- 3 bundle ideas
- 3 loyal fan offers

Rules:
- Lovable-compliant - no graphic content
- Emphasize personal connection, customization, exclusivity, mood
- Focus on storytelling, emotional appeal, brand identity
- Written in creator's voice

Return ONLY a JSON object in this exact format:
{
  "items": ["menu item 1 description", "menu item 2 description", ...],
  "bundles": ["bundle 1", "bundle 2", "bundle 3"],
  "loyal_fan_offers": ["offer 1", "offer 2", "offer 3"]
}`;

  return callLovableAI(apiKey, prompt);
}

async function callLovableAI(apiKey: string, prompt: string): Promise<any> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional content strategy expert. Always respond with valid JSON only, no markdown formatting or explanation.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('AI usage limit reached. Please add credits to continue.');
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response, removing any markdown code block formatting
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanContent);
  } catch (error) {
    console.error('Error calling Lovable AI:', error);
    throw error;
  }
}
