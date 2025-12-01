import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BBCreatorFull } from "@/types/bb-creator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, Loader2, RefreshCw, User, MapPin, MessageSquare, 
  Shield, DollarSign, Mail, Globe, Target, CheckCircle 
} from "lucide-react";
import { ErrorState } from "@/components/shared/ErrorState";
import { toast } from "sonner";
import * as Icons from "lucide-react";

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

  const renderSection = (
    title: string,
    icon: keyof typeof Icons,
    data: any,
    borderColor: string
  ) => {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return null;
    }

    const IconComponent = Icons[icon] as React.ComponentType<{ className?: string }>;

    return (
      <div className={`border-l-4 ${borderColor} bg-slate-800/50 rounded-lg p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <IconComponent className="w-6 h-6" />
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        <div className="space-y-3 text-sm">
          {Object.entries(data).map(([key, value]) => {
            if (!value) return null;
            
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            if (Array.isArray(value)) {
              return (
                <div key={key}>
                  <p className="text-slate-400 mb-2">{label}:</p>
                  <div className="flex flex-wrap gap-2">
                    {value.map((item, i) => (
                      <Badge key={i} variant="outline" className="bg-slate-700/50">
                        {typeof item === 'object' ? JSON.stringify(item) : item}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            }
            
            if (typeof value === 'object') {
              return (
                <div key={key} className="space-y-2">
                  <p className="text-slate-400 font-medium">{label}:</p>
                  <div className="pl-4 space-y-1">
                    {Object.entries(value).map(([subKey, subValue]) => (
                      <p key={subKey} className="text-slate-300">
                        <span className="text-slate-500">{subKey.replace(/_/g, ' ')}:</span> {String(subValue)}
                      </p>
                    ))}
                  </div>
                </div>
              );
            }
            
            return (
              <p key={key} className="text-slate-300">
                <span className="text-slate-400">{label}:</span> {String(value)}
              </p>
            );
          })}
        </div>
      </div>
    );
  };

  const getStatusBadge = (completion: number) => {
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

  const initials = creator.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '??';

  return (
    <div className="container mx-auto p-6 space-y-6">
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

      <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader className="border-b border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-24 h-24 ring-4 ring-primary/30">
              <AvatarImage src={creator.profile_photo_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <CardTitle className="text-3xl text-white">{creator.name}</CardTitle>
                {getStatusBadge(creator.onboarding_completion || 0)}
              </div>
              <p className="text-slate-400 mb-4">{creator.email}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Onboarding Progress</span>
                  <span className="text-white font-semibold">{creator.onboarding_completion || 0}%</span>
                </div>
                <Progress value={creator.onboarding_completion || 0} className="h-2" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {renderSection(
          "Persona & Brand Identity",
          "User",
          creator.step2_persona_brand,
          "border-primary"
        )}
        {renderSection(
          "Amsterdam Story",
          "MapPin",
          creator.step3_amsterdam_story,
          "border-blue-500"
        )}
        {renderSection(
          "Persona Tone",
          "MessageSquare",
          creator.step4_persona_tone,
          "border-purple-500"
        )}
        {renderSection(
          "Boundaries",
          "Shield",
          creator.step5_boundaries,
          "border-red-500"
        )}
        {renderSection(
          "Pricing Structure",
          "DollarSign",
          creator.step6_pricing,
          "border-green-500"
        )}
        {renderSection(
          "Messaging Templates",
          "Mail",
          creator.step7_messaging_templates,
          "border-cyan-500"
        )}
        {renderSection(
          "Platform & Content",
          "Globe",
          creator.step8_platform_content,
          "border-indigo-500"
        )}
        {renderSection(
          "Market Positioning",
          "Target",
          creator.step9_market_positioning,
          "border-pink-500"
        )}
        {renderSection(
          "Commitments",
          "CheckCircle",
          creator.step11_commitments,
          "border-emerald-500"
        )}
      </div>
    </div>
  );
};

export default CreatorDetail;
