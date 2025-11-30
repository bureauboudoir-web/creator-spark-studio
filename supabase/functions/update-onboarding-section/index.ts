import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_SECTIONS = [
  'personal_information',
  'physical_description',
  'amsterdam_story',
  'boundaries',
  'pricing_structure',
  'persona_character',
  'scripts_messaging',
  'content_preferences',
  'visual_identity',
  'creator_story',
  'menu_items',
  'bundles',
  'loyal_fan_offers',
  'voice_preferences',
  'media_uploads',
  'of_strategy',
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { creator_id, section, data } = await req.json();

    if (!creator_id || !section || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: creator_id, section, data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate section name
    if (!VALID_SECTIONS.includes(section)) {
      return new Response(
        JSON.stringify({ error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get creator to verify ownership or staff access
    const { data: creator, error: creatorError } = await supabaseClient
      .from('creators')
      .select('user_id')
      .eq('id', creator_id)
      .single();

    if (creatorError || !creator) {
      return new Response(JSON.stringify({ error: 'Creator not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is staff
    const { data: staffCheck } = await supabaseClient.rpc('is_staff', { _user_id: user.id });
    const isStaff = staffCheck || false;

    // Verify user owns this creator or is staff
    if (creator.user_id !== user.id && !isStaff) {
      return new Response(JSON.stringify({ error: 'Unauthorized to update this creator' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update the specific section
    const { error: updateError } = await supabaseClient
      .from('creators')
      .update({ [section]: data })
      .eq('id', creator_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update section' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch updated creator to recalculate completion
    const { data: updatedCreator, error: fetchError } = await supabaseClient
      .from('creators')
      .select('*')
      .eq('id', creator_id)
      .single();

    if (fetchError || !updatedCreator) {
      return new Response(JSON.stringify({ error: 'Failed to fetch updated creator' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate completion based on non-empty sections
    const sectionsCompleted: string[] = [];
    
    for (const sectionName of VALID_SECTIONS) {
      const sectionData = updatedCreator[sectionName];
      if (sectionData) {
        // Check if section has data
        if (Array.isArray(sectionData)) {
          if (sectionData.length > 0) sectionsCompleted.push(sectionName);
        } else if (typeof sectionData === 'object') {
          if (Object.keys(sectionData).length > 0) sectionsCompleted.push(sectionName);
        }
      }
    }

    const completion = Math.round((sectionsCompleted.length / VALID_SECTIONS.length) * 100);

    // Update completion
    const { error: completionError } = await supabaseClient
      .from('creators')
      .update({
        onboarding_completion: completion,
        onboarding_sections_completed: sectionsCompleted,
      })
      .eq('id', creator_id);

    if (completionError) {
      console.error('Completion update error:', completionError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        completion,
        sections_completed: sectionsCompleted,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
