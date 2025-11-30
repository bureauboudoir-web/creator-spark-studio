import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing BB API connection...');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch BB API settings
    const { data: settings, error: settingsError } = await supabase
      .from('fastcast_content_settings')
      .select('bb_api_url, bb_api_key')
      .single();

    if (settingsError) {
      console.error('Failed to fetch API settings:', settingsError);
      return new Response(
        JSON.stringify({
          status: 'error',
          statusType: 'CONNECTION_ERROR',
          httpStatus: null,
          message: 'Failed to fetch API settings from database',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Validate API URL
    if (!settings.bb_api_url) {
      console.log('BB API URL not configured');
      return new Response(
        JSON.stringify({
          status: 'error',
          statusType: 'MISSING_API_URL',
          httpStatus: null,
          message: 'BB API URL not configured',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Validate API Key
    if (!settings.bb_api_key) {
      console.log('BB API Key not configured');
      return new Response(
        JSON.stringify({
          status: 'error',
          statusType: 'MISSING_API_KEY',
          httpStatus: null,
          message: 'BB API Key not configured',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Validate URL format
    let apiUrl: URL;
    try {
      apiUrl = new URL(settings.bb_api_url);
    } catch (urlError) {
      console.error('Invalid API URL format:', urlError);
      return new Response(
        JSON.stringify({
          status: 'error',
          statusType: 'CONNECTION_ERROR',
          httpStatus: null,
          message: 'Invalid API URL format',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Sanitize URL and use raw API key
    const cleanUrl = sanitizeUrl(settings.bb_api_url);
    const apiKey = settings.bb_api_key;

    if (!validateApiKey(apiKey)) {
      console.error('❌ API key is empty or invalid');
      return new Response(
        JSON.stringify({
          status: 'error',
          statusType: 'MISSING_API_KEY',
          httpStatus: null,
          message: 'BB API Key not configured',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Construct status endpoint - handle trailing slash
    const baseUrl = cleanUrl.endsWith('/') 
      ? cleanUrl.slice(0, -1) 
      : cleanUrl;
    const statusUrl = `${baseUrl}/external-api-status`;
    
    console.log('=== BB API Connection Test ===');
    console.log('Base URL:', baseUrl);
    console.log('Full URL:', statusUrl);
    console.log('Sanitized URL:', cleanUrl);
    console.log('API Key length:', apiKey.length);

    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`BB API response status: ${response.status}`);

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`BB API error response: ${errorText}`);
      
      return new Response(
        JSON.stringify({
          status: 'error',
          statusType: 'CONNECTION_ERROR',
          httpStatus: response.status,
          message: `BB API returned error (${response.status}): ${response.statusText}`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Try to parse response
    let responseData;
    try {
      responseData = await response.json();
      console.log('BB API ping successful:', responseData);
    } catch (parseError) {
      console.error('Failed to parse BB API response:', parseError);
      return new Response(
        JSON.stringify({
          status: 'error',
          statusType: 'CONNECTION_ERROR',
          httpStatus: response.status,
          message: 'BB API returned invalid JSON response',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Success!
    return new Response(
      JSON.stringify({
        status: 'ok',
        statusType: 'CONNECTED',
        httpStatus: 200,
        message: 'BB API is reachable and responding',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Unexpected error testing BB connection:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        status: 'error',
        statusType: 'CONNECTION_ERROR',
        httpStatus: null,
        message: `Unexpected error: ${errorMessage}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
