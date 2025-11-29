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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user is authenticated and is staff
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is staff
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
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
        error: 'API settings not configured',
        useMock: true 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call BB's get-all-creators endpoint
    const bbUrl = `${settings.bb_api_url}/functions/v1/get-all-creators`;
    console.log('Calling BB API:', bbUrl);

    const bbResponse = await fetch(bbUrl, {
      method: 'GET',
      headers: {
        'x-api-key': settings.bb_api_key,
        'Content-Type': 'application/json',
      },
    });

    if (!bbResponse.ok) {
      console.error('BB API error:', bbResponse.status, await bbResponse.text());
      return new Response(JSON.stringify({ 
        error: 'BB API connection failed',
        useMock: true 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const creatorsData = await bbResponse.json();
    console.log('BB API response received:', creatorsData);

    return new Response(JSON.stringify({ 
      success: true,
      data: creatorsData,
      useMock: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-creators:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      useMock: true 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});