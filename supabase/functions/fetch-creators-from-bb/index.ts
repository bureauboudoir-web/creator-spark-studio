import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Sanitize URL: trim whitespace, remove invisible chars, fix double slashes
const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace(/([^:])\/\//g, '$1/');
  return cleaned;
};

// Validate API key exists and is not empty
const validateApiKey = (key: string): boolean => {
  return typeof key === 'string' && key.trim().length > 0;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Fetch BB API settings including mock_mode
    const { data: settings, error: settingsError } = await supabaseClient
      .from('fastcast_content_settings')
      .select('bb_api_url, bb_api_key, mock_mode')
      .single();

    // Check if mock mode is enabled
    if (settings?.mock_mode === true) {
      console.log('Mock mode enabled - frontend will use mock data');
      return new Response(
        JSON.stringify({
          success: true,
          useMock: true,
          data: [],
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (settingsError || !settings?.bb_api_url || !settings?.bb_api_key) {
      console.error('BB API not configured:', settingsError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'BB API not configured',
          details: 'BB API URL and Key must be configured in API Settings'
        }),
        { 
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize URL and validate API key
    const cleanUrl = sanitizeUrl(settings.bb_api_url);
    const apiKey = settings.bb_api_key;
    
    // Validate API key exists
    if (!validateApiKey(apiKey)) {
      console.error('❌ API key is empty or invalid');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid API key',
          details: 'API key is empty or invalid - please reconfigure in Settings'
        }),
        { 
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Fix URL construction - don't add /functions/v1/ if it's already part of the base URL
    const baseUrl = cleanUrl.endsWith('/') 
      ? cleanUrl.slice(0, -1) 
      : cleanUrl;
    const bbApiUrl = `${baseUrl}/external-creators`;
    
    console.log('=== BB API Request ===');
    console.log('Sanitized URL:', cleanUrl);
    console.log('Base URL:', baseUrl);
    console.log('Full URL:', bbApiUrl);
    console.log('API Key length:', apiKey.length);

    const bbResponse = await fetch(bbApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!bbResponse.ok) {
      const errorText = await bbResponse.text();
      console.error('BB API error:', bbResponse.status, errorText);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'BB API connection failed',
          details: `API returned ${bbResponse.status}: ${errorText}`
        }),
        { 
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const bbData = await bbResponse.json();
    console.log('BB API response:', bbData);

    // Normalize the response to our format
    const rawCreators = bbData.creators || bbData || [];
    const normalizedCreators = rawCreators.map((creator: any) => {
      // Calculate onboarding completion based on available sections
      const sectionsCompleted: string[] = [];
      
      if (creator.personal_info && Object.keys(creator.personal_info).length > 0) sectionsCompleted.push('personal_info');
      if (creator.persona && Object.keys(creator.persona).length > 0) sectionsCompleted.push('persona');
      if (creator.creator_story && Object.keys(creator.creator_story).length > 0) sectionsCompleted.push('creator_story');
      if (creator.visual_identity && Object.keys(creator.visual_identity).length > 0) sectionsCompleted.push('visual_identity');
      if (creator.messaging && Object.keys(creator.messaging).length > 0) sectionsCompleted.push('messaging');
      if (creator.content_preferences && Object.keys(creator.content_preferences).length > 0) sectionsCompleted.push('content_preferences');
      if (creator.pricing && Object.keys(creator.pricing).length > 0) sectionsCompleted.push('pricing');
      if (creator.boundaries && Object.keys(creator.boundaries).length > 0) sectionsCompleted.push('boundaries');

      const onboarding_completion = Math.round((sectionsCompleted.length / 8) * 100);

      return {
        creator_id: creator.creator_id || creator.id || creator.userId,
        name: creator.name || creator.full_name || creator.displayName || 'Unknown',
        email: creator.email || '',
        profile_photo_url: creator.profile_photo_url || creator.avatar_url || creator.photoUrl || null,
        creator_status: creator.creator_status || creator.status || 'active',
        onboarding_completion,
        onboarding_sections_completed: sectionsCompleted,
      };
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: normalizedCreators,
        error: null,
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error fetching creators from BB:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
        details: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
