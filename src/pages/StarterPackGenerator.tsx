import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Loader2, CheckCircle, Library } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { NoCreatorSelected } from "@/components/shared/NoCreatorSelected";
import { MockModeWarning } from "@/components/shared/MockModeWarning";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
        <Card>
          <CardHeader>
            <CardTitle>Generate AI-Powered Content</CardTitle>
            <CardDescription>
              Create a comprehensive starter pack based on {selectedCreator.name}'s profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <h4 className="font-medium mb-2">What you'll get:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 30 Conversation Starters (warm, playful, high-engagement)</li>
                  <li>• 5 Video Scripts with hooks and speaking notes</li>
                  <li>• 20 Feed Captions (short and long)</li>
                  <li>• 5 Mini Story Teasers</li>
                  <li>• Menu & Upsell Copy with bundles and loyalty offers</li>
                </ul>
              </div>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      size="lg"
                      onClick={handleGenerate}
                      disabled={isGenerating || usingMockData}
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
                {usingMockData && (
                  <TooltipContent>
                    <p>Cannot generate in mock mode</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </CardContent>
        </Card>
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
};
