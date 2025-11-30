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

// Sanitize API key: remove non-ASCII characters
const sanitizeApiKey = (key: string): string => {
  if (!key) return '';
  return key.replace(/[^\x20-\x7E]/g, '').trim();
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
          data: [],
          error: 'BB API not configured. Please configure it in Settings.',
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize URL and API key
    const cleanUrl = sanitizeUrl(settings.bb_api_url);
    const cleanApiKey = sanitizeApiKey(settings.bb_api_key);
    
    // Validate API key
    if (!cleanApiKey) {
      console.error('❌ API key is empty after sanitization');
      return new Response(
        JSON.stringify({
          success: false,
          data: [],
          error: 'Invalid API key - please reconfigure in Settings',
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Call BB API to fetch creators using /external-creators endpoint
    const baseUrl = cleanUrl.endsWith('/') 
      ? cleanUrl.slice(0, -1) 
      : cleanUrl;
    const bbApiUrl = `${baseUrl}/external-creators`;
    
    console.log('=== BB API Request ===');
    console.log('Sanitized URL:', cleanUrl);
    console.log('Base URL:', baseUrl);
    console.log('Full URL:', bbApiUrl);
    console.log('Sanitized API Key length:', cleanApiKey.length);

    const bbResponse = await fetch(bbApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!bbResponse.ok) {
      console.error('BB API error:', bbResponse.status, await bbResponse.text());
      return new Response(
        JSON.stringify({
          success: false,
          data: [],
          error: 'BB API Connection Failed — Check Settings',
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const bbData = await bbResponse.json();
    console.log('BB API response:', bbData);

    // Normalize the response to our format
    const normalizedCreators = (bbData.creators || bbData || []).map((creator: any) => ({
      creator_id: creator.creator_id || creator.id || creator.userId,
      name: creator.name || creator.full_name || creator.displayName || 'Unknown',
      email: creator.email || '',
      profile_photo_url: creator.profile_photo_url || creator.avatar_url || creator.photoUrl || null,
      creator_status: creator.creator_status || creator.status || 'active',
    }));

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
    return new Response(
      JSON.stringify({
        success: false,
        data: [],
        error: 'Failed to fetch creators. Please try again.',
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
