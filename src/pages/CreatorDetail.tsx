import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, User, RefreshCw, Loader2, CheckCircle2, XCircle, MapPin, Calendar } from "lucide-react";
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
      return <Badge className="bg-green-500/10 text-green-700 border-green-500/20">Complete</Badge>;
    } else if (completion > 0) {
      return <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">In Progress</Badge>;
    } else {
      return <Badge className="bg-red-500/10 text-red-700 border-red-500/20">Not Started</Badge>;
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
                  <h1 className="text-3xl font-bold">
                    {creator.personal_information?.full_name || creator.name || "Unnamed Creator"}
                  </h1>
                  <p className="text-muted-foreground">{creator.email}</p>
                </div>
                {getStatusBadge()}
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                {(creator.personal_information?.location_city || creator.personal_information?.location_country) && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {[creator.personal_information.location_city, creator.personal_information.location_country]
                        .filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {creator.personal_information?.age && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{creator.personal_information.age} years old</span>
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
                {creator.persona_character?.persona_name && (
                  <Badge variant="outline">{creator.persona_character.persona_name}</Badge>
                )}
                {creator.of_strategy?.niche && (
                  <Badge variant="outline">{creator.of_strategy.niche}</Badge>
                )}
                {creator.content_preferences?.posting_frequency && (
                  <Badge variant="outline">{creator.content_preferences.posting_frequency}</Badge>
                )}
              </div>

              {creator.persona_character?.character_traits && creator.persona_character.character_traits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {creator.persona_character.character_traits.map((trait, idx) => (
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
              <CardTitle>Onboarding Status ({creator.onboarding_sections_completed?.length || 0}/16)</CardTitle>
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
          {creator.personal_information && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p>{creator.personal_information.full_name || "Not provided yet"}</p>
                </div>
                {creator.personal_information.preferred_name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Preferred Name</p>
                    <p>{creator.personal_information.preferred_name}</p>
                  </div>
                )}
                {creator.personal_information.age && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Age</p>
                    <p>{creator.personal_information.age}</p>
                  </div>
                )}
                {(creator.personal_information.location_city || creator.personal_information.location_country) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Location</p>
                    <p>
                      {[creator.personal_information.location_city, creator.personal_information.location_country]
                        .filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
                {creator.personal_information.bio && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p className="text-sm">{creator.personal_information.bio}</p>
                  </div>
                )}
                {creator.personal_information.languages && creator.personal_information.languages.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.personal_information.languages.map((lang, idx) => (
                        <Badge key={idx} variant="outline">{lang}</Badge>
                      ))}
                    </div>
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
                  {creator.physical_description.hair_length && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Hair Length</p>
                      <p className="text-sm">{creator.physical_description.hair_length}</p>
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
                {creator.amsterdam_story.how_they_arrived && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">How They Arrived</p>
                    <p className="text-sm">{creator.amsterdam_story.how_they_arrived}</p>
                  </div>
                )}
                {creator.amsterdam_story.why_amsterdam && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Why Amsterdam</p>
                    <p className="text-sm">{creator.amsterdam_story.why_amsterdam}</p>
                  </div>
                )}
                {creator.amsterdam_story.connection_to_city && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">City Connection</p>
                    <p className="text-sm">{creator.amsterdam_story.connection_to_city}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Persona & Character */}
          {creator.persona_character && (
            <Card>
              <CardHeader>
                <CardTitle>Persona & Character</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.persona_character.persona_name && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Persona Name</p>
                    <p className="text-sm">{creator.persona_character.persona_name}</p>
                  </div>
                )}
                {creator.persona_character.communication_style && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Communication Style</p>
                    <p className="text-sm">{creator.persona_character.communication_style}</p>
                  </div>
                )}
                {creator.persona_character.character_traits && creator.persona_character.character_traits.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Character Traits</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.persona_character.character_traits.map((trait, idx) => (
                        <Badge key={idx} variant="secondary">{trait}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {creator.persona_character.roleplay_styles && creator.persona_character.roleplay_styles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Roleplay Styles</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.persona_character.roleplay_styles.map((style, idx) => (
                        <Badge key={idx} variant="outline">{style}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Scripts & Messaging */}
          {creator.scripts_messaging && (
            <Card>
              <CardHeader>
                <CardTitle>Scripts & Messaging Style</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.scripts_messaging.message_tone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Message Tone</p>
                    <p className="text-sm">{creator.scripts_messaging.message_tone}</p>
                  </div>
                )}
                {creator.scripts_messaging.selling_strategy && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Selling Strategy</p>
                    <p className="text-sm">{creator.scripts_messaging.selling_strategy}</p>
                  </div>
                )}
                {creator.scripts_messaging.flirting_style && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Flirting Style</p>
                    <p className="text-sm">{creator.scripts_messaging.flirting_style}</p>
                  </div>
                )}
                {creator.scripts_messaging.high_converting_phrases && creator.scripts_messaging.high_converting_phrases.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">High-Converting Phrases</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {creator.scripts_messaging.high_converting_phrases.map((phrase, idx) => (
                        <li key={idx}>{phrase}</li>
                      ))}
                    </ul>
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
                {creator.content_preferences.content_energy_level && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Energy Level</p>
                    <p className="text-sm">{creator.content_preferences.content_energy_level}</p>
                  </div>
                )}
                {creator.content_preferences.preferred_content_types && creator.content_preferences.preferred_content_types.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Preferred Content Types</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.content_preferences.preferred_content_types.map((type, idx) => (
                        <Badge key={idx} variant="outline">{type}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Menu Items */}
          {creator.menu_items && creator.menu_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Menu Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.menu_items.map((item, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium">{item.title}</p>
                      <Badge>${item.price}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Boundaries */}
          {creator.boundaries && (
            <Card>
              <CardHeader>
                <CardTitle>Boundaries & Comfort Levels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.boundaries.hard_limits && creator.boundaries.hard_limits.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Hard Limits</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.boundaries.hard_limits.map((limit, idx) => (
                        <Badge key={idx} variant="destructive">{limit}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {creator.boundaries.creative_comfort_zones && creator.boundaries.creative_comfort_zones.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Comfort Zones</p>
                    <div className="flex flex-wrap gap-2">
                      {creator.boundaries.creative_comfort_zones.map((zone, idx) => (
                        <Badge key={idx} variant="secondary">{zone}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* OF Strategy */}
          {creator.of_strategy && (
            <Card>
              <CardHeader>
                <CardTitle>OnlyFans Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {creator.of_strategy.niche && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Niche</p>
                    <p className="text-sm">{creator.of_strategy.niche}</p>
                  </div>
                )}
                {creator.of_strategy.target_audience && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Target Audience</p>
                    <p className="text-sm">{creator.of_strategy.target_audience}</p>
                  </div>
                )}
                {creator.of_strategy.engagement_strategy && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Engagement Strategy</p>
                    <p className="text-sm">{creator.of_strategy.engagement_strategy}</p>
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
