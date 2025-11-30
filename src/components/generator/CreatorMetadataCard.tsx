import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, TrendingUp, Calendar, Target } from "lucide-react";

interface CreatorMetadataCardProps {
  creator: {
    name: string;
    email: string;
    profile_photo_url?: string | null;
    creator_status: string;
  };
  metadata?: {
    location?: string;
    onboarding_completion?: number;
    niche?: string;
    tone_of_voice?: string;
    posting_frequency?: string;
    years_on_platform?: number;
    content_style?: string[];
  };
}

export const CreatorMetadataCard = ({ creator, metadata }: CreatorMetadataCardProps) => {
  const initials = creator.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const completion = metadata?.onboarding_completion || 0;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="text-lg">Creator Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16 border-2 border-primary/20">
            <AvatarImage src={creator.profile_photo_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-lg">{creator.name}</h3>
            <p className="text-sm text-muted-foreground">{creator.email}</p>
            <Badge variant={creator.creator_status === 'active' ? 'default' : 'secondary'}>
              {creator.creator_status}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Onboarding Progress</span>
            <span className="font-medium">{completion}%</span>
          </div>
          <Progress value={completion} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {metadata?.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{metadata.location}</span>
            </div>
          )}
          
          {metadata?.years_on_platform && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{metadata.years_on_platform} years</span>
            </div>
          )}
        </div>

        {metadata?.niche && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="w-4 h-4" />
              <span>Niche</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{metadata.niche}</p>
          </div>
        )}

        {metadata?.tone_of_voice && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>Tone of Voice</span>
            </div>
            <p className="text-sm text-muted-foreground pl-6">{metadata.tone_of_voice}</p>
          </div>
        )}

        {metadata?.posting_frequency && (
          <div className="space-y-1">
            <span className="text-sm font-medium">Posting Frequency</span>
            <Badge variant="outline">{metadata.posting_frequency}</Badge>
          </div>
        )}

        {metadata?.content_style && metadata.content_style.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Content Style</span>
            <div className="flex flex-wrap gap-2">
              {metadata.content_style.map((style, idx) => (
                <Badge key={idx} variant="secondary">
                  {style}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
