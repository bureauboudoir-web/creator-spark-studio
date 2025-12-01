import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { creator_id, starter_pack_id, content_items } = await req.json();
    console.log('[save-content-to-bb] Saving content for creator:', creator_id);

    if (!creator_id || !content_items) {
      return new Response(
        JSON.stringify({ success: false, error: 'creator_id and content_items are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('[save-content-to-bb] Auth error:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch BB API settings
    const { data: settings } = await supabaseClient
      .from('fastcast_content_settings')
      .select('bb_api_url, bb_api_key')
      .single();

    if (!settings?.bb_api_url || !settings?.bb_api_key) {
      console.error('[save-content-to-bb] BB API not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'BB API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Save to BB content_library
    const payload = {
      creator_id,
      starter_pack_id,
      content_type: 'starter_pack',
      items: content_items,
      generated_at: new Date().toISOString(),
      generated_by: user.id,
    };

    console.log('[save-content-to-bb] Posting to BB API:', `${settings.bb_api_url}/content_library`);
    const bbResponse = await fetch(`${settings.bb_api_url}/content_library`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.bb_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!bbResponse.ok) {
      const errorText = await bbResponse.text();
      console.error('[save-content-to-bb] BB API error:', bbResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `BB API error: ${bbResponse.status}` }),
        { status: bbResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bbData = await bbResponse.json();
    console.log('[save-content-to-bb] Successfully saved to BB');

    return new Response(
      JSON.stringify({ success: true, data: bbData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[save-content-to-bb] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
