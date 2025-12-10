import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Mock creator data for testing
const getMockCreatorData = (creatorId: string) => ({
  creator_id: creatorId,
  name: 'Demo Creator',
  email: 'demo@example.com',
  profile_photo_url: null,
  creator_status: 'active',
  
  // New 11-step structure mock data
  step2_persona_brand: {
    display_name: 'Luna Rose',
    persona_name: 'Luna',
    brand_tagline: 'Your Amsterdam dream girl',
    brand_values: ['authentic', 'playful', 'sensual'],
    personality_summary: 'Playful, flirty, and down-to-earth with a hint of mystery',
    unique_selling_points: ['Bilingual content', 'Custom requests', 'Daily updates'],
  },
  step3_amsterdam_story: {
    origin_story: 'Moved to Amsterdam 3 years ago from Barcelona',
    why_amsterdam: 'Fell in love with the canals and the freedom',
    neighborhood: 'Jordaan',
    city_connection: 'The artistic vibe matches my creative soul',
    local_favorites: ['Vondelpark sunsets', 'Canal boat rides', 'De Pijp market'],
  },
  step4_persona_tone: {
    persona_tone: 'Flirty and warm with playful teasing',
    persona_keywords: ['babe', 'sweetie', 'love'],
    emoji_style: 'moderate',
    like_words: ['amazing', 'gorgeous', 'sweetie'],
    dislike_words: ['daddy', 'slave', 'master'],
  },
  step5_boundaries: {
    hard_limits: ['No face reveals', 'No real location sharing', 'No meetups'],
    soft_limits: ['Fetish content requires discussion', 'Extreme requests need approval'],
    dont_discuss: ['Politics', 'Religion', 'Personal relationships'],
  },
  step6_pricing: {
    subscription_price: 9.99,
    ppv_range: { min: 5, max: 50 },
    custom_content_pricing: { photo_set: 25, video_custom: 75, voice_note: 15 },
    tip_menu: [
      { item: 'Good morning message', price: 5 },
      { item: 'Name in bio for a day', price: 20 },
      { item: 'Custom photo', price: 30 },
    ],
    bundles: [
      { name: 'Starter Pack', items: ['10 photos', '2 videos'], price: 25 },
      { name: 'Premium Bundle', items: ['25 photos', '5 videos', 'Voice note'], price: 50 },
    ],
  },
  step7_messaging_templates: {
    welcome_message: 'Hey babe! 💕 So happy you joined! Tell me a bit about yourself...',
    mass_dm_templates: [
      'Good morning sunshine! ☀️ Ready to start your day right?',
      'Missing you... 💋 Check your DMs for something special',
    ],
    upsell_scripts: [
      'I made something special just for you... want to see? 😏',
      'This one is too hot for the feed... DM me if you want it',
    ],
    ppv_teasers: [
      'A little preview of what I was up to last night... 🔥',
      'My new video just dropped and it is SPICY',
    ],
    re_engagement_messages: [
      'Hey stranger! I missed you 💕 Where have you been?',
      'I posted something I think you would LOVE... come back and see!',
    ],
  },
  step8_platform_content: {
    platform_links: {
      onlyfans: 'https://onlyfans.com/lunarose',
      instagram: '@lunarose.official',
      twitter: '@lunarose_x',
    },
    content_preferences: {
      preferred_types: ['Photos', 'Short videos', 'Stories'],
      banned_types: ['Extreme fetish', 'B/G content'],
      posting_frequency: 'Daily',
      posting_times: ['9am', '3pm', '9pm'],
    },
    lifestyle: {
      hobbies: ['Yoga', 'Photography', 'Cooking'],
      interests: ['Travel', 'Fashion', 'Art'],
      daily_routine: 'Morning yoga, afternoon shoots, evening engagement',
    },
  },
  step9_market_positioning: {
    niche: 'Girlfriend Experience',
    target_audience: 'Men 25-45 seeking authentic connection',
    competitors: ['Similar GFE creators'],
    differentiators: ['Bilingual', 'Daily voice notes', 'Personalized content'],
    content_pillars: ['Lifestyle glimpses', 'Flirty content', 'Behind the scenes'],
  },
  step11_commitments: {
    agreed_terms: true,
    content_guidelines_accepted: true,
    payout_terms_accepted: true,
    last_updated: new Date().toISOString(),
  },
  
  onboarding_completion: 100,
  onboarding_steps_completed: [2, 3, 4, 5, 6, 7, 8, 9, 11],
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get creator_id from request body
    const { creator_id } = await req.json();
    
    if (!creator_id) {
      return new Response(JSON.stringify({ error: 'Missing creator_id parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const creatorId = creator_id;

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');

    // Create service role client and verify the JWT
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await serviceClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is staff
    const { data: roleData, error: roleError } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'manager', 'chat_team', 'studio_team', 'marketing_team']);

    if (roleError || !roleData || roleData.length === 0) {
      console.error('Role check error:', roleError);
      return new Response(JSON.stringify({ error: 'Forbidden - Staff access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch API settings including mock_mode
    const { data: settings, error: settingsError } = await serviceClient
      .from('fastcast_content_settings')
      .select('bb_api_url, bb_api_key, mock_mode')
      .limit(1)
      .single();

    // Check if mock mode is enabled
    if (settings?.mock_mode === true) {
      console.log('Mock mode enabled - returning mock creator data');
      return new Response(JSON.stringify({ 
        success: true,
        data: getMockCreatorData(creatorId),
        useMock: true 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (settingsError || !settings || !settings.bb_api_url || !settings.bb_api_key) {
      console.error('Settings fetch error:', settingsError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'API settings not configured',
        details: 'BB API URL and Key must be configured in API Settings'
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fix URL construction - use correct endpoint for full creator data
    const baseUrl = settings.bb_api_url.replace(/\/+$/, ''); // Remove trailing slashes
    const bbUrl = `${baseUrl}/external-creators/${creatorId}`;
    console.log('Calling BB API:', bbUrl);

    const bbResponse = await fetch(bbUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${settings.bb_api_key}`,
        'Content-Type': 'application/json',
      },
    });

    if (!bbResponse.ok) {
      const errorText = await bbResponse.text();
      console.error('BB API error:', bbResponse.status, errorText);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'BB API connection failed',
        details: `API returned ${bbResponse.status}: ${errorText}`,
        statusCode: bbResponse.status
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const creatorData = await bbResponse.json();
    console.log('BB API response received for creator:', creatorId);

    // Calculate onboarding completion for new 11-step structure
    const stepsCompleted: number[] = [];
    
    if (creatorData.step2_persona_brand && Object.keys(creatorData.step2_persona_brand).length > 0) {
      stepsCompleted.push(2);
    }
    if (creatorData.step3_amsterdam_story && Object.keys(creatorData.step3_amsterdam_story).length > 0) {
      stepsCompleted.push(3);
    }
    if (creatorData.step4_persona_tone && Object.keys(creatorData.step4_persona_tone).length > 0) {
      stepsCompleted.push(4);
    }
    if (creatorData.step5_boundaries && Object.keys(creatorData.step5_boundaries).length > 0) {
      stepsCompleted.push(5);
    }
    if (creatorData.step6_pricing && Object.keys(creatorData.step6_pricing).length > 0) {
      stepsCompleted.push(6);
    }
    if (creatorData.step7_messaging_templates && Object.keys(creatorData.step7_messaging_templates).length > 0) {
      stepsCompleted.push(7);
    }
    if (creatorData.step8_platform_content && Object.keys(creatorData.step8_platform_content).length > 0) {
      stepsCompleted.push(8);
    }
    if (creatorData.step9_market_positioning && Object.keys(creatorData.step9_market_positioning).length > 0) {
      stepsCompleted.push(9);
    }
    if (creatorData.step11_commitments && Object.keys(creatorData.step11_commitments).length > 0) {
      stepsCompleted.push(11);
    }

    const onboardingCompletion = Math.round((stepsCompleted.length / 9) * 100);

    // Build the response with new 11-step structure
    const fullCreatorData = {
      creator_id: creatorData.creator_id || creatorId,
      name: creatorData.name,
      email: creatorData.email,
      profile_photo_url: creatorData.profile_photo_url || null,
      creator_status: creatorData.creator_status || 'active',
      
      // New 11-step structure - pass through exactly as stored
      step2_persona_brand: creatorData.step2_persona_brand || null,
      step3_amsterdam_story: creatorData.step3_amsterdam_story || null,
      step4_persona_tone: creatorData.step4_persona_tone || null,
      step5_boundaries: creatorData.step5_boundaries || null,
      step6_pricing: creatorData.step6_pricing || null,
      step7_messaging_templates: creatorData.step7_messaging_templates || null,
      step8_platform_content: creatorData.step8_platform_content || null,
      step9_market_positioning: creatorData.step9_market_positioning || null,
      step11_commitments: creatorData.step11_commitments || null,
      
      // Metadata
      onboarding_completion: onboardingCompletion,
      onboarding_steps_completed: stepsCompleted,
    };

    return new Response(JSON.stringify({ 
      success: true,
      data: fullCreatorData,
      useMock: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-creator-data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error',
      details: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
