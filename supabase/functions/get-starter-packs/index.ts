import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is authenticated and is staff
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is staff
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isStaff = roles?.some(r => 
      ['manager', 'admin', 'chat_team', 'studio_team', 'marketing_team'].includes(r.role)
    );

    if (!isStaff) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Staff access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get optional query parameters
    const url = new URL(req.url);
    const creatorId = url.searchParams.get('creator_id');
    const starterPackId = url.searchParams.get('id');

    let data, error;

    // Handle single pack query separately due to different return type
    if (starterPackId) {
      const result = await supabase
        .from('starter_packs')
        .select(`
          id,
          creator_id,
          title,
          status,
          created_at,
          updated_at,
          generated_data,
          creators!inner(
            id,
            user_id,
            profiles!inner(
              full_name,
              email
            )
          )
        `)
        .eq('id', starterPackId)
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Build query for multiple packs
      let query = supabase
        .from('starter_packs')
        .select(`
          id,
          creator_id,
          title,
          status,
          created_at,
          updated_at,
          generated_data,
          creators!inner(
            id,
            user_id,
            profiles!inner(
              full_name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      // Apply creator filter if provided
      if (creatorId) {
        query = query.eq('creator_id', creatorId);
      }

      const result = await query;
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error fetching starter packs:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform data to flatten creator info
    let transformedData;
    if (starterPackId) {
      // Single result
      const pack = data as any;
      transformedData = {
        ...pack,
        creator_name: pack.creators?.profiles?.full_name || 'Unknown',
        creator_email: pack.creators?.profiles?.email || '',
        creators: undefined // Remove nested object
      };
    } else {
      // Array of results
      transformedData = (data as any[]).map(pack => ({
        ...pack,
        creator_name: pack.creators?.profiles?.full_name || 'Unknown',
        creator_email: pack.creators?.profiles?.email || '',
        creators: undefined // Remove nested object
      }));
    }

    return new Response(
      JSON.stringify({ success: true, data: transformedData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
