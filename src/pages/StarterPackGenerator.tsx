import { useState, useEffect } from "react";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, CheckCircle2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { NoCreatorSelected } from "@/components/shared/NoCreatorSelected";
import { MockModeWarning } from "@/components/shared/MockModeWarning";
import { CreatorMetadataCard } from "@/components/generator/CreatorMetadataCard";
import { OnboardingChecklist } from "@/components/generator/OnboardingChecklist";
import { BBCreatorFull } from "@/types/bb-creator";
import { REQUIRED_ONBOARDING_SECTIONS } from "@/types/onboarding-checklist";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function StarterPackGenerator() {
  const { selectedCreatorId, selectedCreator, usingMockData } = useCreatorContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [creatorData, setCreatorData] = useState<BBCreatorFull | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch full creator data when component mounts or creator changes
  const fetchCreatorData = async () => {
    if (!selectedCreatorId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-creator-data', {
        body: { creator_id: selectedCreatorId }
      });

      if (error) throw error;
      if (data?.success && data?.data) {
        setCreatorData(data.data);
      }
    } catch (error) {
      console.error('Error fetching creator data:', error);
      toast({
        title: "Error",
        description: "Failed to load creator data from BB",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  useEffect(() => {
    if (selectedCreatorId) {
      fetchCreatorData();
    }
  }, [selectedCreatorId]);

  if (!selectedCreatorId || !selectedCreator) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader title="Starter Pack Generator" />
        <NoCreatorSelected />
      </div>
    );
  }

  const onboardingComplete = creatorData?.onboarding_completion === 100;
  const sectionsCompleted = creatorData?.onboarding_sections_completed || [];
  const missingFields = REQUIRED_ONBOARDING_SECTIONS.filter(
    (section) => !sectionsCompleted.includes(section)
  ).length;
  const canGenerate = onboardingComplete && !usingMockData;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-starter-pack', {
        body: {
          creatorProfile: creatorData,
        },
      });

      if (error) throw error;

      setGeneratedContent(data);
      setGenerated(true);

      toast({
        title: "Success!",
        description: "Starter pack generated successfully",
      });

      // Save to local storage for preview
      localStorage.setItem('lastGeneratedPack', JSON.stringify(data));
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate starter pack",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading || !creatorData) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader title="Starter Pack Generator" />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (generated && generatedContent) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader title="Starter Pack Generated!" />
        
        <Card className="border-primary bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              Generation Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your starter pack has been generated successfully with content based on {selectedCreator.name}'s profile.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => setGenerated(false)}>
                Generate Another
              </Button>
              <Button variant="outline" onClick={() => navigate('/creator-library')}>
                <Package className="w-4 h-4 mr-2" />
                View Library
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Starter Pack Generator"
        subtitle="Generate AI-powered content based on creator onboarding data"
      />
      
      {usingMockData && <MockModeWarning />}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CreatorMetadataCard creator={creatorData} />

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">What AI Will Generate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-medium">30 Conversation Starters</span>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  Based on {creatorData.voice_preferences?.tone_of_voice || creatorData.persona_character?.communication_style || 'personality'}, {creatorData.scripts_messaging?.message_tone || 'messaging style'}, and engagement hooks
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">5 Video Scripts</span>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Using {creatorData.creator_story?.origin_story ? 'brand story' : 'profile'}, {creatorData.visual_identity?.photo_style || 'visual style'}, and storytelling approach
              </p>

              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">20 Feed Captions</span>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Reflecting {creatorData.persona_character?.persona_name || 'personality'} and {creatorData.content_preferences?.content_energy_level || 'content style'}
              </p>

              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">5 Story Teasers</span>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Built around emotional storytelling and {creatorData.content_preferences?.preferred_content_types?.join(', ') || 'preferred themes'}
              </p>

              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">Menu & Upsell Copy</span>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Showcasing {creatorData.menu_items?.length || 0} menu items with {creatorData.bundles?.length || 0} bundle offers
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <OnboardingChecklist 
            sectionsCompleted={sectionsCompleted}
            completionPercentage={creatorData.onboarding_completion || 0}
          />

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        onClick={handleGenerate}
                        disabled={!canGenerate || isGenerating}
                        className="w-full"
                        size="lg"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Starter Pack
                          </>
                        )}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {!canGenerate && (
                    <TooltipContent>
                      {usingMockData 
                        ? "Cannot generate in mock mode - connect to BB API first"
                        : `Complete ${missingFields} more onboarding section${missingFields !== 1 ? 's' : ''} in BB to generate`
                      }
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>

              {!onboardingComplete && !usingMockData && (
                <p className="text-xs text-center text-muted-foreground mt-3">
                  All 15 onboarding sections must be complete in BB before generating content
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
