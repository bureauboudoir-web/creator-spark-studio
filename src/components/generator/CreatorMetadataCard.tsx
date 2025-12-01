import { BBCreatorFull } from "@/types/bb-creator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User, MapPin, MessageSquare, Shield, DollarSign, 
  Mail, Globe, Target, CheckCircle, Tag, Sparkles
} from "lucide-react";

interface CreatorMetadataCardProps {
  creator: BBCreatorFull;
}

export const CreatorMetadataCard = ({ creator }: CreatorMetadataCardProps) => {
  const initials = creator.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '??';

  const completionPercentage = creator.onboarding_completion || 0;

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <CardHeader className="border-b border-white/10 pb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="w-24 h-24 ring-4 ring-primary/30 shadow-lg">
            <AvatarImage src={creator.profile_photo_url || undefined} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">{creator.name}</h2>
              <p className="text-slate-400 text-sm">{creator.email}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {creator.step9_market_positioning?.niche && (
                <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                  <Tag className="w-3 h-3 mr-1" />
                  {creator.step9_market_positioning.niche}
                </Badge>
              )}
              {creator.step2_persona_brand?.persona_name && (
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {creator.step2_persona_brand.persona_name}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Onboarding Progress</span>
                <span className="text-white font-semibold">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {creator.step2_persona_brand && (
            <div className="border-l-4 border-primary bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-white">Persona & Brand</h3>
              </div>
              {creator.step2_persona_brand.display_name && (
                <p className="text-sm text-slate-300 mb-2">
                  <span className="text-slate-500">Display Name:</span> {creator.step2_persona_brand.display_name}
                </p>
              )}
              {creator.step2_persona_brand.brand_tagline && (
                <p className="text-sm text-slate-300 italic">"{creator.step2_persona_brand.brand_tagline}"</p>
              )}
            </div>
          )}

          {creator.step4_persona_tone && (
            <div className="border-l-4 border-purple-500 bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-white">Persona Tone</h3>
              </div>
              {creator.step4_persona_tone.persona_tone && (
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Tone:</span> {creator.step4_persona_tone.persona_tone}
                </p>
              )}
            </div>
          )}

          {creator.step6_pricing && (
            <div className="border-l-4 border-green-500 bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-white">Pricing</h3>
              </div>
              {creator.step6_pricing.subscription_price && (
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Subscription:</span> ${creator.step6_pricing.subscription_price}/mo
                </p>
              )}
            </div>
          )}

          {creator.step9_market_positioning && (
            <div className="border-l-4 border-pink-500 bg-slate-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-pink-500" />
                <h3 className="font-semibold text-white">Market Positioning</h3>
              </div>
              {creator.step9_market_positioning.target_audience && (
                <p className="text-sm text-slate-300">
                  <span className="text-slate-500">Target:</span> {creator.step9_market_positioning.target_audience}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
