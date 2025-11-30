import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Wand2, Loader2, CheckCircle, Library, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { NoCreatorSelected } from "@/components/shared/NoCreatorSelected";
import { MockModeWarning } from "@/components/shared/MockModeWarning";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CreatorMetadataCard } from "@/components/generator/CreatorMetadataCard";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StarterPackGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedCreator, usingMockData } = useCreatorContext();

  if (!selectedCreator) {
    return (
      <div className="container mx-auto p-6">
        <PageHeader title="Starter Pack Generator" />
        <NoCreatorSelected />
      </div>
    );
  }

  // Mock onboarding completion data - will be replaced with real data
  const onboardingComplete = {
    basic_info: true,
    niche: true,
    tone: true,
    content_strategy: false,
    audience: false,
  };

  const missingFields = Object.entries(onboardingComplete)
    .filter(([_, completed]) => !completed)
    .map(([field]) => field.replace(/_/g, ' '));

  const canGenerate = Object.values(onboardingComplete).every(v => v) && !usingMockData;

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const creatorData = {
        creator_id: selectedCreator.creator_id,
        name: selectedCreator.name,
        email: selectedCreator.email,
      };

      const { data, error } = await supabase.functions.invoke('generate-starter-pack', {
        body: { 
          creator_id: selectedCreator.creator_id,
          creator_data: creatorData
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      localStorage.setItem('generated_starter_pack', JSON.stringify(data));
      setGeneratedContent(data);
      setGenerated(true);
      
      toast({
        title: "Starter Pack Generated!",
        description: "Your content has been saved to the Creator Library.",
      });
    } catch (error: any) {
      console.error('Error generating starter pack:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate starter pack. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Starter Pack Generator"
        subtitle={`Generate content for ${selectedCreator.name}`}
      />
      
      {usingMockData && <MockModeWarning />}

      {!generated ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <CreatorMetadataCard 
              creator={selectedCreator}
              metadata={{
                location: "Los Angeles, CA",
                onboarding_completion: 60,
                niche: "Lifestyle & Wellness",
                tone_of_voice: "Warm, authentic, encouraging",
                posting_frequency: "Daily",
                years_on_platform: 2,
                content_style: ["Educational", "Personal", "Engaging"],
              }}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {missingFields.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Missing Information:</strong> {missingFields.join(', ')} need to be completed before generation.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Onboarding Checklist</CardTitle>
                <CardDescription>
                  Required sections for content generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(onboardingComplete).map(([field, completed]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox checked={completed} disabled />
                    <label className="text-sm font-medium leading-none capitalize">
                      {field.replace(/_/g, ' ')}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What AI Will Generate</CardTitle>
                <CardDescription>
                  Based on {selectedCreator.name}'s profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 30 Conversation Starters (warm, playful, high-engagement)</li>
                    <li>• 5 Video Scripts with hooks and speaking notes</li>
                    <li>• 20 Feed Captions (short and long)</li>
                    <li>• 5 Mini Story Teasers</li>
                    <li>• Menu & Upsell Copy with bundles and loyalty offers</li>
                  </ul>
                </div>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button 
                          size="lg"
                          onClick={handleGenerate}
                          disabled={isGenerating || !canGenerate}
                          className="w-full"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Generating Your Starter Pack...
                            </>
                          ) : (
                            <>
                              <Wand2 className="mr-2 h-5 w-5" />
                              Generate Starter Pack
                            </>
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {!canGenerate && (
                      <TooltipContent>
                        <p>
                          {usingMockData 
                            ? "Cannot generate in mock mode" 
                            : "Complete all onboarding sections first"}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="inline-flex p-4 rounded-full bg-accent/20">
              <CheckCircle className="w-16 h-16 text-accent" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-3">Generation Complete!</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Your starter pack has been created and saved to your library
              </p>

              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setGenerated(false)}
                >
                  Generate Another
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate("/library")}
                >
                  <Library className="mr-2 h-5 w-5" />
                  View Library
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
