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
    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Missing authorization header' }), {
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
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is staff
    const { data: roleData, error: roleError } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['manager', 'admin', 'chat_team', 'studio_team', 'marketing_team']);

    if (roleError || !roleData || roleData.length === 0) {
      console.error('Role check error:', roleError);
      return new Response(JSON.stringify({ success: false, error: 'Forbidden - Staff access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { creator_id, title, data, send_to_bb } = await req.json();

    if (!creator_id || !title || !data) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields: creator_id, title, data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Save or update starter pack in database
    let starterPackId: string;
    let status = 'draft';

    // Check if a starter pack already exists for this creator
    const { data: existing, error: existingError } = await serviceClient
      .from('starter_packs')
      .select('id')
      .eq('creator_id', creator_id)
      .maybeSingle();

    if (existingError) {
      console.error('Error checking existing pack:', existingError);
      return new Response(JSON.stringify({ success: false, error: 'Database error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (existing) {
      // Update existing starter pack
      const { data: updated, error: updateError } = await serviceClient
        .from('starter_packs')
        .update({
          title,
          generated_data: data,
          status: send_to_bb ? 'sent' : 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('id')
        .single();

      if (updateError) {
        console.error('Error updating starter pack:', updateError);
        return new Response(JSON.stringify({ success: false, error: 'Failed to update starter pack' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      starterPackId = updated.id;
      status = send_to_bb ? 'sent' : 'draft';
    } else {
      // Insert new starter pack
      const { data: inserted, error: insertError } = await serviceClient
        .from('starter_packs')
        .insert({
          creator_id,
          title,
          generated_data: data,
          status: send_to_bb ? 'sent' : 'draft',
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('Error inserting starter pack:', insertError);
        return new Response(JSON.stringify({ success: false, error: 'Failed to save starter pack' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      starterPackId = inserted.id;
      status = send_to_bb ? 'sent' : 'draft';
    }

    // If send_to_bb is true, attempt to sync to BB
    let bbSync = false;
    let message = '';

    if (send_to_bb) {
      // Fetch BB API settings
      const { data: settings, error: settingsError } = await serviceClient
        .from('fastcast_content_settings')
        .select('bb_api_url, bb_api_key')
        .limit(1)
        .maybeSingle();

      if (settingsError) {
        console.error('Error fetching BB settings:', settingsError);
        message = 'Failed to fetch BB API settings';
      } else if (!settings || !settings.bb_api_url || !settings.bb_api_key) {
        console.log('BB API not configured');
        message = 'BB API not configured. Saved locally only.';
        status = 'draft'; // Revert status to draft if BB sync not possible
        
        // Update status back to draft
        await serviceClient
          .from('starter_packs')
          .update({ status: 'draft' })
          .eq('id', starterPackId);
      } else {
        // Attempt to send to BB
        try {
          const bbResponse = await fetch(`${settings.bb_api_url}/functions/v1/upload-external-content`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': settings.bb_api_key,
            },
            body: JSON.stringify({
              creator_id,
              type: 'starter_pack',
              title,
              data,
            }),
          });

          if (bbResponse.ok) {
            bbSync = true;
            message = 'Successfully synced to BB';
            console.log('Successfully synced starter pack to BB');
          } else {
            const errorText = await bbResponse.text();
            console.error('BB API error:', errorText);
            message = `BB API error: ${bbResponse.status}`;
            status = 'draft'; // Revert status to draft on failure
            
            // Update status back to draft
            await serviceClient
              .from('starter_packs')
              .update({ status: 'draft' })
              .eq('id', starterPackId);
          }
        } catch (error) {
          console.error('Error calling BB API:', error);
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          message = `Failed to connect to BB API: ${errorMsg}`;
          status = 'draft'; // Revert status to draft on failure
          
          // Update status back to draft
          await serviceClient
            .from('starter_packs')
            .update({ status: 'draft' })
            .eq('id', starterPackId);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      starterPackId,
      status,
      bb_sync: bbSync,
      message: message || 'Starter pack saved successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in save-starter-pack:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
