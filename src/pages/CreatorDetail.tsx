import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User, RefreshCw, Loader2, CheckCircle2, XCircle, MapPin, Calendar, Mic } from "lucide-react";
import { BBCreatorFull } from "@/types/bb-creator";
import { getOnboardingSections } from "@/types/onboarding-checklist";
import { ErrorState } from "@/components/shared/ErrorState";

const CreatorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [creator, setCreator] = useState<BBCreatorFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCreatorData();
    }
  }, [id]);

  const loadCreatorData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      
      const { data, error } = await supabase.functions.invoke('get-creator-data', {
        body: { creator_id: id },
      });

      if (error || !data?.success) {
        console.error('Failed to load creator:', error || data?.error);
        setLoadError(data?.error || 'Unable to load creator from BB API');
        setCreator(null);
        return;
      }
      
      setCreator(data.data);
    } catch (error) {
      console.error('Error loading creator:', error);
      setLoadError('An unexpected error occurred while loading creator data');
      setCreator(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!creator) return null;
    
    const completion = creator.onboarding_completion || 0;
    
    if (completion === 100) {
      return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Active</Badge>;
    } else if (completion > 0) {
      return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">Onboarding</Badge>;
    } else {
      return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Missing Info</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading creator data...</p>
        </div>
      </div>
    );
  }

  if (!creator && loadError) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate('/creators')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Creators
        </Button>
        <ErrorState 
          variant="bb-error"
          title="Creator Not Found"
          message={loadError}
          onRetry={loadCreatorData}
          retryLabel="Retry"
        />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="ghost" onClick={() => navigate('/creators')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Creators
        </Button>
        <ErrorState 
          variant="no-creator"
          title="No Creator Data"
          message="Unable to load creator information"
        />
      </div>
    );
  }

  const onboardingSections = getOnboardingSections(creator.onboarding_sections_completed || []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/creators')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Creators
        </Button>
        <Button variant="outline" onClick={loadCreatorData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Creator Profile Card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={creator.profile_photo_url || undefined} />
              <AvatarFallback>
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{creator.personal_info?.name || creator.name || "Unnamed Creator"}</h1>
                  <p className="text-muted-foreground">{creator.email}</p>
                </div>
                {getStatusBadge()}
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                {creator.personal_info?.location && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{creator.personal_info.location}</span>
                  </div>
                )}
                {creator.personal_info?.age && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{creator.personal_info.age} years old</span>
                  </div>
                )}
                {creator.voice_samples_available && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Mic className="w-4 h-4" />
                    <span>Voice samples available</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Onboarding Progress</span>
                  <span className="text-muted-foreground">{creator.onboarding_completion || 0}%</span>
                </div>
                <Progress value={creator.onboarding_completion || 0} className="h-2" />
              </div>

              <div className="flex flex-wrap gap-2">
                {(creator.persona_character?.character_identity || creator.persona?.character_identity) && (
                  <Badge variant="outline">{creator.persona_character?.character_identity || creator.persona?.character_identity}</Badge>
                )}
                {(creator.tone_of_voice || creator.persona_character?.tone_of_voice || creator.persona?.tone_of_voice) && (
                  <Badge variant="outline">{creator.tone_of_voice || creator.persona_character?.tone_of_voice || creator.persona?.tone_of_voice}</Badge>
                )}
                {creator.niche && (
                  <Badge variant="outline">{creator.niche}</Badge>
                )}
                {(creator.posting_frequency || creator.content_preferences?.posting_frequency) && (
                  <Badge variant="outline">{creator.posting_frequency || creator.content_preferences?.posting_frequency}</Badge>
                )}
              </div>

              {(creator.persona_character?.personality_traits || creator.persona?.personality_traits) && 
               (creator.persona_character?.personality_traits || creator.persona?.personality_traits || []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(creator.persona_character?.personality_traits || creator.persona?.personality_traits || []).map((trait, idx) => (
                    <Badge key={idx} variant="secondary">{trait}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column */}
        <div className="space-y-6">
          
          {/* Onboarding Status */}
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {onboardingSections.map((section) => (
                <div key={section.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {section.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{section.label}</p>
                      <p className="text-xs text-muted-foreground">{section.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Personal Information */}
          {(creator.personal_information || creator.personal_info) && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{creator.personal_information?.name || creator.personal_info?.name || "Not provided yet"}</p>
                </div>
                {(creator.personal_information?.age || creator.personal_info?.age) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p>{creator.personal_information?.age || creator.personal_info?.age}</p>
                  </div>
                )}
                {(creator.personal_information?.location || creator.personal_info?.location) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p>{creator.personal_information?.location || creator.personal_info?.location}</p>
                  </div>
                )}
                {(creator.personal_information?.short_bio || creator.personal_info?.short_bio) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p className="text-sm">{creator.personal_information?.short_bio || creator.personal_info?.short_bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Physical Description */}
          {creator.physical_description && (
            <Card>
              <CardHeader>
                <CardTitle>Physical Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.physical_description.general_appearance && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">General Appearance</p>
                    <p className="text-sm">{creator.physical_description.general_appearance}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {creator.physical_description.height && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Height</p>
                      <p className="text-sm">{creator.physical_description.height}</p>
                    </div>
                  )}
                  {creator.physical_description.body_type && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Body Type</p>
                      <p className="text-sm">{creator.physical_description.body_type}</p>
                    </div>
                  )}
                  {creator.physical_description.hair_color && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Hair Color</p>
                      <p className="text-sm">{creator.physical_description.hair_color}</p>
                    </div>
                  )}
                  {creator.physical_description.eye_color && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Eye Color</p>
                      <p className="text-sm">{creator.physical_description.eye_color}</p>
                    </div>
                  )}
                </div>
                {creator.physical_description.distinguishing_features && creator.physical_description.distinguishing_features.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Distinguishing Features</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.physical_description.distinguishing_features.map((feature, idx) => (
                        <Badge key={idx} variant="outline">{feature}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Amsterdam Story */}
          {creator.amsterdam_story && (
            <Card>
              <CardHeader>
                <CardTitle>Amsterdam Story</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.amsterdam_story.origin_story && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Origin Story</p>
                    <p className="text-sm">{creator.amsterdam_story.origin_story}</p>
                  </div>
                )}
                {creator.amsterdam_story.neighborhood && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Neighborhood</p>
                    <p className="text-sm">{creator.amsterdam_story.neighborhood}</p>
                  </div>
                )}
                {creator.amsterdam_story.city_connection && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City Connection</p>
                    <p className="text-sm">{creator.amsterdam_story.city_connection}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Creator Persona */}
          {(creator.persona_character || creator.persona) && (
            <Card>
              <CardHeader>
                <CardTitle>Creator Persona</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(creator.tone_of_voice || creator.persona_character?.tone_of_voice || creator.persona?.tone_of_voice) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tone of Voice</p>
                    <p className="text-sm">{creator.tone_of_voice || creator.persona_character?.tone_of_voice || creator.persona?.tone_of_voice}</p>
                  </div>
                )}
                {(creator.persona_character?.character_identity || creator.persona?.character_identity) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Character Identity</p>
                    <p className="text-sm">{creator.persona_character?.character_identity || creator.persona?.character_identity}</p>
                  </div>
                )}
                {(creator.persona_character?.mood_energy || creator.persona?.mood_energy) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Mood/Energy</p>
                    <p className="text-sm">{creator.persona_character?.mood_energy || creator.persona?.mood_energy}</p>
                  </div>
                )}
                {(creator.persona_character?.writing_style || creator.persona?.writing_style) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Writing Style</p>
                    <p className="text-sm">{creator.persona_character?.writing_style || creator.persona?.writing_style}</p>
                  </div>
                )}
                {(creator.persona_character?.emotional_style || creator.persona?.emotional_style) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Emotional Style</p>
                    <p className="text-sm">{creator.persona_character?.emotional_style || creator.persona?.emotional_style}</p>
                  </div>
                )}
                {(creator.persona_character?.personality_traits || creator.persona?.personality_traits) && 
                 (creator.persona_character?.personality_traits || creator.persona?.personality_traits || []).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Personality Traits</p>
                    <div className="flex flex-wrap gap-2">
                      {(creator.persona_character?.personality_traits || creator.persona?.personality_traits || []).map((trait, idx) => (
                        <Badge key={idx} variant="secondary">{trait}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(creator.persona_character?.audience_impression_goals || creator.persona?.audience_impression_goals) && 
                 (creator.persona_character?.audience_impression_goals || creator.persona?.audience_impression_goals || []).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Audience Impression Goals</p>
                    <div className="flex flex-wrap gap-2">
                      {(creator.persona_character?.audience_impression_goals || creator.persona?.audience_impression_goals || []).map((goal, idx) => (
                        <Badge key={idx} variant="outline">{goal}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Audience Profile */}
          {creator.audience_profile && (
            <Card>
              <CardHeader>
                <CardTitle>Audience Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.audience_profile.engagement_style && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Engagement Style</p>
                    <p className="text-sm">{creator.audience_profile.engagement_style}</p>
                  </div>
                )}
                {creator.audience_profile.community_tone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Community Tone</p>
                    <p className="text-sm">{creator.audience_profile.community_tone}</p>
                  </div>
                )}
                {creator.audience_profile.target_demographics && creator.audience_profile.target_demographics.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Target Demographics</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.audience_profile.target_demographics.map((demo, idx) => (
                        <Badge key={idx} variant="secondary">{demo}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {creator.audience_profile.audience_interests && creator.audience_profile.audience_interests.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Audience Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.audience_profile.audience_interests.map((interest, idx) => (
                        <Badge key={idx} variant="outline">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Content Preferences */}
          {creator.content_preferences && (
            <Card>
              <CardHeader>
                <CardTitle>Content Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.content_preferences.posting_frequency && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Posting Frequency</p>
                    <p className="text-sm">{creator.content_preferences.posting_frequency}</p>
                  </div>
                )}
                {creator.content_preferences.preferred_atmosphere && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preferred Atmosphere</p>
                    <p className="text-sm">{creator.content_preferences.preferred_atmosphere}</p>
                  </div>
                )}
                {creator.content_preferences.preferred_visual_style && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Visual Style</p>
                    <p className="text-sm">{creator.content_preferences.preferred_visual_style}</p>
                  </div>
                )}
                {creator.content_preferences.audience_type && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Audience Type</p>
                    <p className="text-sm">{creator.content_preferences.audience_type}</p>
                  </div>
                )}
                {creator.content_preferences.preferred_themes && creator.content_preferences.preferred_themes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Preferred Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.content_preferences.preferred_themes.map((theme, idx) => (
                        <Badge key={idx} variant="secondary">{theme}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {creator.content_preferences.preferred_storyline_types && creator.content_preferences.preferred_storyline_types.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Storyline Types</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.content_preferences.preferred_storyline_types.map((type, idx) => (
                        <Badge key={idx} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {creator.content_preferences.content_strategy_preferences && creator.content_preferences.content_strategy_preferences.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Content Strategy</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.content_preferences.content_strategy_preferences.map((strategy, idx) => (
                        <Badge key={idx} variant="outline">{strategy}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {creator.content_preferences.content_to_avoid && creator.content_preferences.content_to_avoid.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Content to Avoid</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.content_preferences.content_to_avoid.map((avoid, idx) => (
                        <Badge key={idx} variant="destructive">{avoid}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Visual Identity */}
          {creator.visual_identity && (
            <Card>
              <CardHeader>
                <CardTitle>Visual Identity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.visual_identity.appearance_style && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Appearance Style</p>
                    <p className="text-sm">{creator.visual_identity.appearance_style}</p>
                  </div>
                )}
                {creator.visual_identity.visual_vibe && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Visual Vibe</p>
                    <p className="text-sm">{creator.visual_identity.visual_vibe}</p>
                  </div>
                )}
                {creator.visual_identity.signature_look && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Signature Look</p>
                    <p className="text-sm">{creator.visual_identity.signature_look}</p>
                  </div>
                )}
                {creator.visual_identity.unique_identifiers && creator.visual_identity.unique_identifiers.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Unique Identifiers</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.visual_identity.unique_identifiers.map((identifier, idx) => (
                        <Badge key={idx} variant="secondary">{identifier}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Messaging Style */}
          {creator.messaging && (
            <Card>
              <CardHeader>
                <CardTitle>Messaging Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.messaging.writing_tone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Writing Tone</p>
                    <p className="text-sm">{creator.messaging.writing_tone}</p>
                  </div>
                )}
                {creator.messaging.conversation_style && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conversation Style</p>
                    <p className="text-sm">{creator.messaging.conversation_style}</p>
                  </div>
                )}
                {creator.messaging.message_structure && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Message Structure</p>
                    <p className="text-sm">{creator.messaging.message_structure}</p>
                  </div>
                )}
                {creator.messaging.storytelling_style && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Storytelling Style</p>
                    <p className="text-sm">{creator.messaging.storytelling_style}</p>
                  </div>
                )}
                {creator.messaging.fan_relationship_style && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fan Relationship Style</p>
                    <p className="text-sm">{creator.messaging.fan_relationship_style}</p>
                  </div>
                )}
                {creator.messaging.emotional_angles && creator.messaging.emotional_angles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Emotional Angles</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.messaging.emotional_angles.map((angle, idx) => (
                        <Badge key={idx} variant="secondary">{angle}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {creator.messaging.engagement_hooks && creator.messaging.engagement_hooks.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Engagement Hooks</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.messaging.engagement_hooks.map((hook, idx) => (
                        <Badge key={idx} variant="outline">{hook}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pricing Structure */}
          {creator.pricing && (
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Offers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.pricing.description_style && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description Style</p>
                    <p className="text-sm">{creator.pricing.description_style}</p>
                  </div>
                )}
                {creator.pricing.bundle_style && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bundle Style</p>
                    <p className="text-sm">{creator.pricing.bundle_style}</p>
                  </div>
                )}
                {creator.pricing.menu_item_names && creator.pricing.menu_item_names.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Menu Items</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.pricing.menu_item_names.map((item, idx) => (
                        <Badge key={idx} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {creator.pricing.offer_types && creator.pricing.offer_types.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Offer Types</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.pricing.offer_types.map((offer, idx) => (
                        <Badge key={idx} variant="outline">{offer}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {creator.pricing.value_statements && creator.pricing.value_statements.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Value Statements</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {creator.pricing.value_statements.map((statement, idx) => (
                        <li key={idx}>{statement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Creator Story */}
          {creator.creator_story && (
            <Card>
              <CardHeader>
                <CardTitle>Creator Story</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.creator_story.background_story && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Background Story</p>
                    <p className="text-sm">{creator.creator_story.background_story}</p>
                  </div>
                )}
                {creator.creator_story.personality_background && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Personality Background</p>
                    <p className="text-sm">{creator.creator_story.personality_background}</p>
                  </div>
                )}
                {creator.creator_story.brand_origin_story && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Brand Origin</p>
                    <p className="text-sm">{creator.creator_story.brand_origin_story}</p>
                  </div>
                )}
                {creator.creator_story.lifestyle_themes && creator.creator_story.lifestyle_themes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Lifestyle Themes</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.creator_story.lifestyle_themes.map((theme, idx) => (
                        <Badge key={idx} variant="secondary">{theme}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {creator.creator_story.motivations && creator.creator_story.motivations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Motivations</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.creator_story.motivations.map((motivation, idx) => (
                        <Badge key={idx} variant="outline">{motivation}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Boundaries */}
          {creator.boundaries && (
            <Card>
              <CardHeader>
                <CardTitle>Boundaries (Staff Reference)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.boundaries.creative_limits && creator.boundaries.creative_limits.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Creative Limits</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {creator.boundaries.creative_limits.map((limit, idx) => (
                        <li key={idx}>{limit}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {creator.boundaries.content_comfort_zones && creator.boundaries.content_comfort_zones.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Content Comfort Zones</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {creator.boundaries.content_comfort_zones.map((zone, idx) => (
                        <li key={idx}>{zone}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {creator.boundaries.communication_preferences && creator.boundaries.communication_preferences.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Communication Preferences</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {creator.boundaries.communication_preferences.map((pref, idx) => (
                        <li key={idx}>{pref}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {creator.boundaries.acceptable_topic_boundaries && creator.boundaries.acceptable_topic_boundaries.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Topic Boundaries</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {creator.boundaries.acceptable_topic_boundaries.map((boundary, idx) => (
                        <li key={idx}>{boundary}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorDetail;
