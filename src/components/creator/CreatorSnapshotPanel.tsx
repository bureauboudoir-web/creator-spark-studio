import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface CreatorSnapshotPanelProps {
  creator: {
    name: string;
    profile_photo_url?: string | null;
    creator_status: string;
  };
  metadata?: {
    niche?: string;
    content_type?: string;
    tone_of_voice?: string;
    audience?: string;
    years_on_platform?: number;
    posting_frequency?: string;
  };
}

export const CreatorSnapshotPanel = ({ creator, metadata }: CreatorSnapshotPanelProps) => {
  const initials = creator.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12 border-2 border-primary/20">
            <AvatarImage src={creator.profile_photo_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{creator.name}</h3>
              <Badge variant={creator.creator_status === 'active' ? 'default' : 'secondary'} className="text-xs">
                {creator.creator_status}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {metadata?.niche && (
                <Badge variant="outline" className="text-xs">
                  {metadata.niche}
                </Badge>
              )}
              {metadata?.content_type && (
                <Badge variant="outline" className="text-xs">
                  {metadata.content_type}
                </Badge>
              )}
              {metadata?.tone_of_voice && (
                <Badge variant="outline" className="text-xs">
                  {metadata.tone_of_voice}
                </Badge>
              )}
              {metadata?.years_on_platform && (
                <Badge variant="outline" className="text-xs">
                  {metadata.years_on_platform}+ years
                </Badge>
              )}
              {metadata?.posting_frequency && (
                <Badge variant="outline" className="text-xs">
                  {metadata.posting_frequency}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
