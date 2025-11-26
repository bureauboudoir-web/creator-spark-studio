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

    // Generate different types of content in parallel
    const [textPrompts, captions, imageStyles, videoScripts, personaAngles] = await Promise.all([
      generateTextPrompts(LOVABLE_API_KEY, creatorProfile),
      generateCaptions(LOVABLE_API_KEY, creatorProfile),
      generateImageStyles(LOVABLE_API_KEY, creatorProfile),
      generateVideoScripts(LOVABLE_API_KEY, creatorProfile),
      generatePersonaAngles(LOVABLE_API_KEY, creatorProfile),
    ]);

    return new Response(
      JSON.stringify({
        textPrompts,
        captions,
        imageStyles,
        videoScripts,
        personaAngles,
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

async function generateTextPrompts(apiKey: string, profile: any): Promise<string[]> {
  const prompt = `Generate 10 engaging text post prompts for a content creator with this profile:
Bio: ${profile.bio || 'Content creator'}
Persona: ${profile.persona || 'Professional'}
Social Links: ${profile.socialLinks?.join(', ') || 'None'}

Create prompts that are:
- Engaging and conversation-starting
- Aligned with their persona
- Platform-optimized
- Diverse in topics

Return ONLY a JSON array of 10 strings, nothing else.`;

  return callLovableAI(apiKey, prompt);
}

async function generateCaptions(apiKey: string, profile: any): Promise<string[]> {
  const prompt = `Generate 10 social media captions for a content creator with this profile:
Bio: ${profile.bio || 'Content creator'}
Persona: ${profile.persona || 'Professional'}

Create captions that are:
- Attention-grabbing
- Include relevant hashtags
- Call-to-action oriented
- Varied in length and style

Return ONLY a JSON array of 10 strings, nothing else.`;

  return callLovableAI(apiKey, prompt);
}

async function generateImageStyles(apiKey: string, profile: any): Promise<string[]> {
  const prompt = `Generate 5 image style guides for a content creator with this profile:
Bio: ${profile.bio || 'Content creator'}
Persona: ${profile.persona || 'Professional'}

Create style guides that describe:
- Visual aesthetic direction
- Color palettes
- Composition ideas
- Mood and atmosphere

Return ONLY a JSON array of 5 strings, nothing else.`;

  return callLovableAI(apiKey, prompt);
}

async function generateVideoScripts(apiKey: string, profile: any): Promise<string[]> {
  const prompt = `Generate 5 video script outlines for a content creator with this profile:
Bio: ${profile.bio || 'Content creator'}
Persona: ${profile.persona || 'Professional'}

Create script outlines with:
- Hook (first 3 seconds)
- Main content points
- Call to action
- Estimated duration

Return ONLY a JSON array of 5 strings, nothing else.`;

  return callLovableAI(apiKey, prompt);
}

async function generatePersonaAngles(apiKey: string, profile: any): Promise<string[]> {
  const prompt = `Generate 3 brand voice variations for a content creator with this profile:
Bio: ${profile.bio || 'Content creator'}
Persona: ${profile.persona || 'Professional'}

Create persona angles that are:
- Distinct from each other
- Authentic to the creator
- Platform-appropriate
- Scalable

Return ONLY a JSON array of 3 strings describing each persona angle, nothing else.`;

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
            content: 'You are a content strategy expert. Always respond with valid JSON arrays only, no markdown formatting or explanation.',
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
