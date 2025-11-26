import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StarterPackGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    textPrompts: 0,
    captions: 0,
    imageStyles: 0,
    videoScripts: 0,
    personaAngles: 0
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      // Get creator profile from localStorage (from onboarding)
      const creatorProfile = {
        bio: localStorage.getItem('creator_bio') || 'Content creator passionate about storytelling',
        persona: localStorage.getItem('creator_persona') || 'Professional and authentic',
        socialLinks: JSON.parse(localStorage.getItem('creator_social_links') || '[]'),
      };

      const { data, error } = await supabase.functions.invoke('generate-starter-pack', {
        body: { creatorProfile }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Store generated content in localStorage for the library
      localStorage.setItem('generated_starter_pack', JSON.stringify(data));

      setGeneratedContent({
        textPrompts: data.textPrompts?.length || 0,
        captions: data.captions?.length || 0,
        imageStyles: data.imageStyles?.length || 0,
        videoScripts: data.videoScripts?.length || 0,
        personaAngles: data.personaAngles?.length || 0,
      });
      
      setGenerated(true);
      
      toast({
        title: "Starter Pack Generated!",
        description: "Your content has been saved to the Creator Library.",
      });
    } catch (error) {
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-primary shadow-glow mb-6">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Starter Pack Generator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Automatically generate a comprehensive content starter pack based on your profile and selected templates
            </p>
          </div>

          {!generated ? (
            <Card className="bg-card border-border/50 shadow-elevated">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">What You'll Get</CardTitle>
                <CardDescription>AI-powered content generation tailored to your style</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  {[
                    { label: "Text Prompts", count: 10, desc: "Engaging post ideas and captions" },
                    { label: "Social Captions", count: 10, desc: "Platform-optimized copy" },
                    { label: "Image Style Guides", count: 5, desc: "Visual direction for photos" },
                    { label: "Video Script Outlines", count: 5, desc: "Structured video content" },
                    { label: "Persona Angles", count: 3, desc: "Brand voice variations" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
                    >
                      <div>
                        <h4 className="font-medium">{item.label}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <div className="text-2xl font-bold text-primary">{item.count}</div>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full bg-gradient-primary shadow-glow text-lg py-6"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Generating Your Content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 mr-2" />
                      Generate Starter Pack
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 shadow-elevated">
              <CardContent className="pt-8 text-center space-y-6">
                <div className="inline-flex p-4 rounded-full bg-accent/20">
                  <Check className="w-16 h-16 text-accent" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-3">Generation Complete!</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Your starter pack has been created and saved to your library
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                    {Object.entries(generatedContent).map(([key, value]) => (
                      <div key={key} className="p-4 rounded-lg bg-card border border-border/50">
                        <div className="text-3xl font-bold text-primary mb-1">{value}</div>
                        <div className="text-sm text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => setGenerated(false)}
                      className="border-border"
                    >
                      Generate Another
                    </Button>
                    <Button
                      size="lg"
                      className="bg-gradient-primary shadow-glow"
                      onClick={() => navigate("/library")}
                    >
                      View Library
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StarterPackGenerator;