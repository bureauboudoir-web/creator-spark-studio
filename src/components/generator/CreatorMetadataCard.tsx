import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, TrendingUp, Calendar, Target, MessageSquare, Palette, BookOpen, DollarSign, Shield } from "lucide-react";
import { BBCreatorFull } from "@/types/bb-creator";

interface CreatorMetadataCardProps {
  creator: BBCreatorFull;
}

export const CreatorMetadataCard = ({ creator }: CreatorMetadataCardProps) => {
  const initials = creator.name
    ? creator.name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    : 'C';

  const completion = creator.onboarding_completion || 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="text-lg">Creator Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={creator.profile_photo_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-lg">{creator.name || 'Unnamed Creator'}</h3>
            <p className="text-sm text-muted-foreground">{creator.email}</p>
            <Badge variant={creator.creator_status === 'active' ? 'default' : 'secondary'}>
              {creator.creator_status}
            </Badge>
          </div>
        </div>

        {/* Onboarding Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Onboarding Progress</span>
            <span className="font-medium">{completion}%</span>
          </div>
          <Progress value={completion} className="h-2" />
        </div>

        {/* Personal Info */}
        {(creator.personal_information || creator.personal_info) && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="w-4 h-4" />
              <span>Personal Information</span>
            </div>
            <div className="pl-6 space-y-1 text-sm text-muted-foreground">
              {(creator.personal_information?.age || creator.personal_info?.age) && 
                <p>Age: {creator.personal_information?.age || creator.personal_info?.age}</p>
              }
              {(creator.personal_information?.location || creator.personal_info?.location) && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{creator.personal_information?.location || creator.personal_info?.location}</span>
                </div>
              )}
              {(creator.personal_information?.short_bio || creator.personal_info?.short_bio) && 
                <p className="italic">"{creator.personal_information?.short_bio || creator.personal_info?.short_bio}"</p>
              }
            </div>
          </div>
        )}

        {/* Persona & Character */}
        {(creator.persona_character || creator.persona) && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>Persona & Character</span>
            </div>
            <div className="pl-6 space-y-1 text-sm text-muted-foreground">
              {(creator.persona_character?.character_identity || creator.persona?.character_identity) && 
                <p><strong>Identity:</strong> {creator.persona_character?.character_identity || creator.persona?.character_identity}</p>
              }
              {(creator.tone_of_voice || creator.persona_character?.tone_of_voice || creator.persona?.tone_of_voice) && 
                <p><strong>Tone:</strong> {creator.tone_of_voice || creator.persona_character?.tone_of_voice || creator.persona?.tone_of_voice}</p>
              }
              {(creator.persona_character?.mood_energy || creator.persona?.mood_energy) && 
                <p><strong>Energy:</strong> {creator.persona_character?.mood_energy || creator.persona?.mood_energy}</p>
              }
              {(creator.persona_character?.personality_traits || creator.persona?.personality_traits) && 
               (creator.persona_character?.personality_traits || creator.persona?.personality_traits || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(creator.persona_character?.personality_traits || creator.persona?.personality_traits || []).slice(0, 4).map((trait, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">{trait}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Creator Story */}
        {creator.creator_story?.brand_origin_story && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="w-4 h-4" />
              <span>Creator Story</span>
            </div>
            <p className="pl-6 text-sm text-muted-foreground line-clamp-3">
              {creator.creator_story.brand_origin_story}
            </p>
          </div>
        )}

        {/* Visual Identity */}
        {creator.visual_identity && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Palette className="w-4 h-4" />
              <span>Visual Identity</span>
            </div>
            <div className="pl-6 space-y-1 text-sm text-muted-foreground">
              {creator.visual_identity.visual_vibe && <p><strong>Vibe:</strong> {creator.visual_identity.visual_vibe}</p>}
              {creator.visual_identity.signature_look && <p><strong>Look:</strong> {creator.visual_identity.signature_look}</p>}
            </div>
          </div>
        )}

        {/* Messaging Style */}
        {(creator.scripts_messaging || creator.messaging) && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="w-4 h-4" />
              <span>Messaging Style</span>
            </div>
            <div className="pl-6 space-y-1 text-sm text-muted-foreground">
              {(creator.scripts_messaging?.conversation_style || creator.messaging?.conversation_style) && 
                <p><strong>Style:</strong> {creator.scripts_messaging?.conversation_style || creator.messaging?.conversation_style}</p>
              }
              {(creator.scripts_messaging?.storytelling_style || creator.messaging?.storytelling_style) && 
                <p><strong>Storytelling:</strong> {creator.scripts_messaging?.storytelling_style || creator.messaging?.storytelling_style}</p>
              }
            </div>
          </div>
        )}

        {/* Content Preferences */}
        {creator.content_preferences && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4" />
              <span>Content Preferences</span>
            </div>
            <div className="pl-6 space-y-1 text-sm text-muted-foreground">
              {(creator.posting_frequency || creator.content_preferences.posting_frequency) && (
                <p><strong>Posting:</strong> {creator.posting_frequency || creator.content_preferences.posting_frequency}</p>
              )}
              {creator.content_preferences.preferred_atmosphere && (
                <p><strong>Atmosphere:</strong> {creator.content_preferences.preferred_atmosphere}</p>
              )}
              {creator.content_preferences.preferred_themes && creator.content_preferences.preferred_themes.length > 0 && (
                <p><strong>Themes:</strong> {creator.content_preferences.preferred_themes.join(', ')}</p>
              )}
            </div>
          </div>
        )}

        {/* Pricing Structure */}
        {(creator.pricing_structure || creator.pricing) && 
         (creator.pricing_structure?.menu_item_names || creator.pricing?.menu_item_names) && 
         (creator.pricing_structure?.menu_item_names || creator.pricing?.menu_item_names || []).length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="w-4 h-4" />
              <span>Pricing Structure</span>
            </div>
            <div className="pl-6 space-y-1 text-sm text-muted-foreground">
              <p><strong>Menu Items:</strong> {(creator.pricing_structure?.menu_item_names || creator.pricing?.menu_item_names || []).slice(0, 3).join(', ')}</p>
              {(creator.pricing_structure?.bundle_style || creator.pricing?.bundle_style) && 
                <p><strong>Bundle Style:</strong> {creator.pricing_structure?.bundle_style || creator.pricing?.bundle_style}</p>
              }
            </div>
          </div>
        )}

        {/* Boundaries (High-Level) */}
        {creator.boundaries && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>Content Boundaries</span>
            </div>
            <p className="pl-6 text-xs text-muted-foreground">
              Creative boundaries configured for content filtering
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
