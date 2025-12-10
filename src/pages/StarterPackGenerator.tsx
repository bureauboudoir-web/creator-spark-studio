import { useState, useEffect } from "react";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { supabase } from "@/integrations/supabase/client";
import { BBCreatorFull } from "@/types/bb-creator";
import { calculateOnboardingCompletion } from "@/types/onboarding-checklist";
import { PageHeader } from "@/components/layout/PageHeader";
import { CreatorMetadataCard } from "@/components/generator/CreatorMetadataCard";
import { OnboardingChecklist } from "@/components/generator/OnboardingChecklist";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, CheckCircle, Library, RefreshCw, Save } from "lucide-react";
import { NoCreatorSelected } from "@/components/shared/NoCreatorSelected";
import { MockModeWarning } from "@/components/shared/MockModeWarning";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function StarterPackGenerator() {
  const { selectedCreatorId, usingMockData: mockDataUsed } = useCreatorContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [starterPackId, setStarterPackId] = useState<string | null>(null);
  const [creatorData, setCreatorData] = useState<BBCreatorFull | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCreatorData = async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    if (!selectedCreatorId) return;
    
    setIsLoading(true);
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
      toast.error("Failed to load creator data from BB");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      if (showToast) {
        toast.success("Creator data refreshed from BB Platform");
      }
    }
  };

  useEffect(() => {
    if (selectedCreatorId) {
      fetchCreatorData();
    }
  }, [selectedCreatorId]);

  const handleGenerate = async () => {
    if (!selectedCreatorId || !creatorData) return;

    setIsGenerating(true);
    try {
      // Build creatorProfile object matching edge function expectations
      const creatorProfile = {
        name: creatorData.name,
        full_name: creatorData.name,
        personal_info: {
          name: creatorData.name,
          location: creatorData.step3_amsterdam_story?.neighborhood || 'Unknown',
        },
        persona: {
          character_identity: creatorData.step2_persona_brand?.persona_name,
          tone_of_voice: creatorData.step4_persona_tone?.persona_tone,
          personality_traits: creatorData.step2_persona_brand?.brand_values,
          mood_energy: creatorData.step4_persona_tone?.emoji_style,
          audience_impression_goals: creatorData.step9_market_positioning?.differentiators,
          emotional_style: creatorData.step4_persona_tone?.persona_tone,
          niche: creatorData.step9_market_positioning?.target_audience,
          brand_keywords: creatorData.step2_persona_brand?.brand_values,
          key_traits: creatorData.step2_persona_brand?.brand_values,
        },
        creator_story: {
          brand_origin_story: creatorData.step3_amsterdam_story?.origin_story,
        },
        visual_identity: {
          visual_vibe: creatorData.step2_persona_brand?.brand_tagline,
        },
        messaging: {
          fan_relationship_style: creatorData.step7_messaging_templates?.welcome_message,
          engagement_hooks: creatorData.step7_messaging_templates?.ppv_teasers,
          storytelling_style: creatorData.step4_persona_tone?.persona_tone,
        },
        boundaries: {
          acceptable_topic_boundaries: creatorData.step5_boundaries?.hard_limits,
          content_comfort_zones: creatorData.step5_boundaries?.soft_limits,
        },
        pricing: {
          menu_item_names: creatorData.step6_pricing?.tip_menu?.map(t => t.item),
          offer_types: ['Custom content', 'Exclusive access'],
          bundle_style: 'Premium packages',
          value_statements: ['Exclusive', 'Personalized', 'Intimate'],
        },
        content_preferences: {
          preferred_themes: creatorData.step9_market_positioning?.content_pillars,
          preferred_atmosphere: 'Intimate and engaging',
          audience_type: creatorData.step9_market_positioning?.target_audience,
        },
      };

      const { data, error } = await supabase.functions.invoke('generate-starter-pack', {
        body: { creatorProfile }
      });

      if (error) throw error;

      if (data?.success) {
        setGeneratedContent(data.content);
        setStarterPackId(data.starter_pack_id);
        toast.success("Starter Pack generated successfully!");
      } else {
        throw new Error(data?.error || 'Generation failed');
      }
    } catch (error: any) {
      console.error('Error generating starter pack:', error);
      toast.error(error.message || "Failed to generate starter pack");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToBB = async () => {
    if (!selectedCreatorId || !generatedContent || !starterPackId) return;

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('save-content-to-bb', {
        body: { 
          creator_id: selectedCreatorId,
          starter_pack_id: starterPackId,
          content_items: generatedContent
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success("Content saved to BB Platform successfully!");
      } else {
        throw new Error(data?.error || 'Save failed');
      }
    } catch (error: any) {
      console.error('Error saving to BB:', error);
      toast.error(error.message || "Failed to save to BB Platform");
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedCreatorId) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader title="Starter Pack Generator" />
        <NoCreatorSelected />
      </div>
    );
  }

  const completionPercentage = creatorData?.onboarding_completion || 0;
  const stepsCompleted = creatorData?.onboarding_steps_completed || [];
  const canGenerate = completionPercentage === 100;

  if (isLoading || !creatorData) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader title="Starter Pack Generator" />
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (generatedContent) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader title="Starter Pack Generated!" />
        
        <Card className="border-primary bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              Generation Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your starter pack has been generated successfully based on {creatorData.name}'s profile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={handleGenerate}
                className="flex-1"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate New Pack
              </Button>
              <Button 
                size="lg" 
                onClick={handleSaveToBB}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 mr-2" />
                )}
                Save to BB
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/creator-library')}
              >
                <Library className="w-5 h-5 mr-2" />
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
      
      {mockDataUsed && <MockModeWarning />}

      <div className="space-y-6">
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => fetchCreatorData(true)}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh from BB
          </Button>
        </div>

        <CreatorMetadataCard creator={creatorData} />

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">What AI Will Generate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium">Scripts & Hooks</span>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Based on persona tone and messaging templates
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium">PPV Teasers</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Using pricing structure and boundaries
            </p>

            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium">Fan Messages</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Reflecting persona tone and market positioning
            </p>
          </CardContent>
        </Card>

        <OnboardingChecklist 
          stepsCompleted={stepsCompleted}
          completionPercentage={completionPercentage}
        />

        <Card className="border-primary/20">
          <CardContent className="pt-6">
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

            {!canGenerate && (
              <p className="text-xs text-center text-muted-foreground mt-3">
                Complete all onboarding steps before generating content
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
