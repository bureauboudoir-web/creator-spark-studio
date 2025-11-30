import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    // Check if user is staff (serviceClient already created above)
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

    // Fetch API settings from fastcast_content_settings
    const { data: settings, error: settingsError } = await serviceClient
      .from('fastcast_content_settings')
      .select('bb_api_url, bb_api_key')
      .limit(1)
      .single();

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

    // Parse and structure the full onboarding data - check all 15 sections
    const sectionsCompleted: string[] = [];
    
    // Check each section for completion
    if (creatorData.personal_information && Object.keys(creatorData.personal_information).length > 0) {
      sectionsCompleted.push('personal_information');
    }
    if (creatorData.physical_description && Object.keys(creatorData.physical_description).length > 0) {
      sectionsCompleted.push('physical_description');
    }
    if (creatorData.amsterdam_story && Object.keys(creatorData.amsterdam_story).length > 0) {
      sectionsCompleted.push('amsterdam_story');
    }
    if (creatorData.boundaries && Object.keys(creatorData.boundaries).length > 0) {
      sectionsCompleted.push('boundaries');
    }
    if (creatorData.pricing_structure && Object.keys(creatorData.pricing_structure).length > 0) {
      sectionsCompleted.push('pricing_structure');
    }
    if (creatorData.persona_character && Object.keys(creatorData.persona_character).length > 0) {
      sectionsCompleted.push('persona_character');
    }
    if (creatorData.scripts_messaging && Object.keys(creatorData.scripts_messaging).length > 0) {
      sectionsCompleted.push('scripts_messaging');
    }
    if (creatorData.content_preferences && Object.keys(creatorData.content_preferences).length > 0) {
      sectionsCompleted.push('content_preferences');
    }
    if (creatorData.visual_identity && Object.keys(creatorData.visual_identity).length > 0) {
      sectionsCompleted.push('visual_identity');
    }
    if (creatorData.creator_story && Object.keys(creatorData.creator_story).length > 0) {
      sectionsCompleted.push('creator_story');
    }
    if (creatorData.audience_profile && Object.keys(creatorData.audience_profile).length > 0) {
      sectionsCompleted.push('audience_profile');
    }
    if (creatorData.posting_frequency) {
      sectionsCompleted.push('posting_frequency');
    }
    if (creatorData.niche) {
      sectionsCompleted.push('niche');
    }
    if (creatorData.tone_of_voice) {
      sectionsCompleted.push('tone_of_voice');
    }
    if (creatorData.content_style && creatorData.content_style.length > 0) {
      sectionsCompleted.push('content_style');
    }

    // Calculate completion percentage based on 15 sections
    const onboarding_completion = Math.round((sectionsCompleted.length / 15) * 100);

    // Pass through ALL BB data exactly as stored
    const fullCreatorData = {
      creator_id: creatorData.creator_id || creatorId,
      name: creatorData.name,
      email: creatorData.email,
      profile_photo_url: creatorData.profile_photo_url || null,
      creator_status: creatorData.creator_status || 'active',
      
      // All 15 sections - pass through exactly as stored (null if missing, not empty objects)
      personal_information: creatorData.personal_information || null,
      physical_description: creatorData.physical_description || null,
      amsterdam_story: creatorData.amsterdam_story || null,
      boundaries: creatorData.boundaries || null,
      pricing_structure: creatorData.pricing_structure || null,
      persona_character: creatorData.persona_character || null,
      scripts_messaging: creatorData.scripts_messaging || null,
      content_preferences: creatorData.content_preferences || null,
      visual_identity: creatorData.visual_identity || null,
      creator_story: creatorData.creator_story || null,
      audience_profile: creatorData.audience_profile || null,
      
      // Top-level fields
      posting_frequency: creatorData.posting_frequency || null,
      niche: creatorData.niche || null,
      tone_of_voice: creatorData.tone_of_voice || null,
      content_style: creatorData.content_style || [],
      
      // Metadata
      voice_samples_available: creatorData.voice_samples_available || false,
      onboarding_completion,
      onboarding_sections_completed: sectionsCompleted,
      
      // Legacy mappings for backward compatibility
      personal_info: creatorData.personal_information || creatorData.personal_info || null,
      persona: creatorData.persona_character || creatorData.persona || null,
      messaging: creatorData.scripts_messaging || creatorData.messaging || null,
      pricing: creatorData.pricing_structure || creatorData.pricing || null,
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
