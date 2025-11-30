import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { creator_id, content_ids } = await req.json();

    if (!creator_id || !content_ids || !Array.isArray(content_ids)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required parameters: creator_id and content_ids array' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Syncing ${content_ids.length} content items for creator ${creator_id}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch API settings
    const { data: settings, error: settingsError } = await supabase
      .from('fastcast_content_settings')
      .select('bb_api_url, bb_api_key')
      .single();

    if (settingsError || !settings) {
      console.error('Settings error:', settingsError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'BB API settings not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!settings.bb_api_url || !settings.bb_api_key) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'BB API URL or API key not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch content items from database
    const { data: contentItems, error: contentError } = await supabase
      .from('content_items')
      .select('*')
      .in('id', content_ids)
      .eq('creator_id', creator_id);

    if (contentError) {
      console.error('Content fetch error:', contentError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch content items' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!contentItems || contentItems.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No content items found' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare content for BB API
    const bbContent = contentItems.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      type: item.category,
      folder: item.folder,
      short_description: item.short_description,
      metadata: item.metadata,
    }));

    // Send to BB API
    const baseUrl = settings.bb_api_url.replace(/\/+$/, '');
    const bbUrl = `${baseUrl}/external-creators/${creator_id}/content`;
    
    console.log('Sending content to BB API:', bbUrl);

    const bbResponse = await fetch(bbUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.bb_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: bbContent }),
    });

    if (!bbResponse.ok) {
      const errorText = await bbResponse.text();
      console.error('BB API error:', bbResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `BB API error: ${bbResponse.status}`,
          details: errorText,
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const bbData = await bbResponse.json();
    console.log('BB API response:', bbData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synced ${contentItems.length} items to BB`,
        synced_count: contentItems.length,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in sync-content-to-bb function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
