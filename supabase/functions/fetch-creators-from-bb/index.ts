import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // Fetch BB API settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('fastcast_content_settings')
      .select('bb_api_url, bb_api_key')
      .single();

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

    // Call BB API to fetch creators
    const bbApiUrl = `${settings.bb_api_url}/external/creator/list`;
    console.log('Calling BB API:', bbApiUrl);

    const bbResponse = await fetch(bbApiUrl, {
      method: 'GET',
      headers: {
        'x-api-key': settings.bb_api_key,
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
