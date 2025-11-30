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
    // Get authenticated user from JWT (verified by Supabase)
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!);

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin role using service role client
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData, error: roleError } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error('Role check error:', roleError);
      return new Response(JSON.stringify({ error: 'Forbidden - Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle GET request - fetch settings
    if (req.method === 'GET') {
      const { data, error } = await serviceClient
        .from('fastcast_content_settings')
        .select('bb_api_url, bb_api_key, mock_mode')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching settings:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: {
            bb_api_url: data?.bb_api_url || '',
            bb_api_key: data?.bb_api_key ? '••••••••' : '',
            mock_mode: data?.mock_mode ?? true,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle POST request - update settings
    if (req.method === 'POST') {
      const body = await req.json();
      const { bb_api_url, bb_api_key, mock_mode } = body;

      // Check if settings exist
      const { data: existing } = await serviceClient
        .from('fastcast_content_settings')
        .select('id')
        .single();

      let result;
      if (existing) {
        // Update existing settings
        const updateData: any = { updated_at: new Date().toISOString() };
        if (bb_api_url !== undefined) updateData.bb_api_url = bb_api_url;
        
        // Only update API key if it's a real value (not empty, not masked placeholder)
        if (bb_api_key !== undefined && bb_api_key !== '' && bb_api_key !== '••••••••') {
          updateData.bb_api_key = bb_api_key;
          console.log('📝 Updating bb_api_key with new value (length:', bb_api_key.length, 'chars)');
        } else {
          console.log('⏭️ Skipping bb_api_key update (value is empty or masked placeholder)');
        }
        
        if (mock_mode !== undefined) updateData.mock_mode = mock_mode;

        result = await serviceClient
          .from('fastcast_content_settings')
          .update(updateData)
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        // Insert new settings
        result = await serviceClient
          .from('fastcast_content_settings')
          .insert({ 
            bb_api_url, 
            bb_api_key,
            mock_mode: mock_mode ?? true,
          })
          .select()
          .single();
      }

      if (result.error) {
        console.error('Error saving settings:', result.error);
        return new Response(JSON.stringify({ error: 'Failed to save settings' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, data: result.data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in manage-api-settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});