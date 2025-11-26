import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Mic, FileText, Image, Video, Save } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
}

const SampleSelector = () => {
  const { toast } = useToast();
  const [selectedVoice, setSelectedVoice] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string[]>([]);

  const voiceTemplates: Template[] = [
    { id: "v1", name: "Professional Narrator", description: "Clear, authoritative voice for educational content" },
    { id: "v2", name: "Casual Conversational", description: "Friendly and approachable tone" },
    { id: "v3", name: "Energetic Host", description: "High-energy, enthusiastic delivery" },
  ];

  const textTemplates: Template[] = [
    { id: "t1", name: "Product Review", description: "Structured review format with pros/cons" },
    { id: "t2", name: "Tutorial Script", description: "Step-by-step instructional format" },
    { id: "t3", name: "Storytelling", description: "Narrative-driven content structure" },
  ];

  const imageTemplates: Template[] = [
    { id: "i1", name: "Minimalist Modern", description: "Clean, simple aesthetic with bold colors" },
    { id: "i2", name: "Cinematic Moody", description: "Dark, dramatic lighting with film grain" },
    { id: "i3", name: "Bright & Vibrant", description: "High saturation, energetic color palette" },
    { id: "i4", name: "Luxury Editorial", description: "Sophisticated, high-end magazine style" },
    { id: "i5", name: "Urban Street", description: "Gritty, authentic city photography" },
  ];

  const videoTemplates: Template[] = [
    { id: "vid1", name: "Quick Tips Format", description: "Fast-paced, bite-sized advice videos" },
    { id: "vid2", name: "Behind the Scenes", description: "Casual, documentary-style content" },
    { id: "vid3", name: "Product Showcase", description: "Professional product demonstration" },
  ];

  const handleToggle = (id: string, category: string) => {
    const setters = {
      voice: setSelectedVoice,
      text: setSelectedText,
      image: setSelectedImage,
      video: setSelectedVideo,
    };
    
    const states = {
      voice: selectedVoice,
      text: selectedText,
      image: selectedImage,
      video: selectedVideo,
    };

    const setter = setters[category as keyof typeof setters];
    const state = states[category as keyof typeof states];
    
    if (state.includes(id)) {
      setter(state.filter(item => item !== id));
    } else {
      setter([...state, id]);
    }
  };

  const handleSave = () => {
    const total = selectedVoice.length + selectedText.length + selectedImage.length + selectedVideo.length;
    toast({
      title: "Templates Saved!",
      description: `${total} templates saved to your profile.`,
    });
  };

  const TemplateSection = ({ 
    title, 
    icon: Icon, 
    templates, 
    selected, 
    category 
  }: { 
    title: string; 
    icon: any; 
    templates: Template[]; 
    selected: string[]; 
    category: string;
  }) => (
    <Card className="bg-card border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-primary shadow-glow">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{selected.length} selected</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex items-start gap-3 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors border border-border/50"
          >
            <Checkbox
              checked={selected.includes(template.id)}
              onCheckedChange={() => handleToggle(template.id, category)}
              className="mt-1"
            />
            <div className="flex-1">
              <h4 className="font-medium mb-1">{template.name}</h4>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Sample Selector
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose templates that match your content style
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <TemplateSection
            title="Voice Samples"
            icon={Mic}
            templates={voiceTemplates}
            selected={selectedVoice}
            category="voice"
          />

          <TemplateSection
            title="Text Scripts"
            icon={FileText}
            templates={textTemplates}
            selected={selectedText}
            category="text"
          />

          <TemplateSection
            title="Image Themes"
            icon={Image}
            templates={imageTemplates}
            selected={selectedImage}
            category="image"
          />

          <TemplateSection
            title="Video Formats"
            icon={Video}
            templates={videoTemplates}
            selected={selectedVideo}
            category="video"
          />
        </div>

        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleSave}
            className="bg-gradient-primary shadow-glow"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Templates
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SampleSelector;