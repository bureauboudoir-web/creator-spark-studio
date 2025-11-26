import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Send, FileText, Image, Video, MessageSquare, Mic } from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const CreatorLibrary = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const [textPrompts] = useState<ContentItem[]>([
    { id: "1", title: "Morning Motivation Post", content: "Start your day with gratitude...", createdAt: "2024-01-15" },
    { id: "2", title: "Product Review Template", content: "Here's my honest take on...", createdAt: "2024-01-14" },
    { id: "3", title: "Behind the Scenes", content: "Let me show you how I...", createdAt: "2024-01-13" },
  ]);

  const [captions] = useState<ContentItem[]>([
    { id: "1", title: "Instagram Reel Hook", content: "Wait till you see this! 🔥", createdAt: "2024-01-15" },
    { id: "2", title: "TikTok Trending Caption", content: "POV: When you finally...", createdAt: "2024-01-14" },
  ]);

  const [imagePrompts] = useState<ContentItem[]>([
    { id: "1", title: "Urban Street Style", content: "Gritty cityscape with warm tones", createdAt: "2024-01-15" },
    { id: "2", title: "Minimalist Product Shot", content: "Clean white background, single focus", createdAt: "2024-01-14" },
  ]);

  const [videoScripts] = useState<ContentItem[]>([
    { id: "1", title: "Quick Tips Format", content: "Intro → Problem → Solution → CTA", createdAt: "2024-01-15" },
    { id: "2", title: "Day in the Life", content: "Morning routine → Work → Evening...", createdAt: "2024-01-14" },
  ]);

  const [voiceSamples] = useState<ContentItem[]>([
    { id: "1", title: "Professional Narrator", content: "Sample recorded 2024-01-15", createdAt: "2024-01-15" },
    { id: "2", title: "Casual Conversational", content: "Sample recorded 2024-01-14", createdAt: "2024-01-14" },
  ]);

  const handleSendToBB = (id: string, type: string) => {
    toast({
      title: "Sent to BB Platform",
      description: `${type} content has been synced to the main system.`,
    });
  };

  const handleDelete = (id: string) => {
    toast({
      title: "Content Deleted",
      description: "The item has been removed from your library.",
      variant: "destructive",
    });
  };

  const ContentList = ({ 
    items, 
    icon: Icon, 
    type 
  }: { 
    items: ContentItem[]; 
    icon: any; 
    type: string;
  }) => {
    const filteredItems = items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="bg-card border-border/50 hover:shadow-glow transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-gradient-primary shadow-glow">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription>{item.content}</CardDescription>
                    <p className="text-xs text-muted-foreground mt-2">Created: {item.createdAt}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="hover:text-accent">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-accent text-accent-foreground"
                    onClick={() => handleSendToBB(item.id, type)}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send to BB
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No items found matching your search.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Creator Library
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage all your content assets in one place
          </p>
        </div>

        <div className="mb-8 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
          <Button className="bg-gradient-primary shadow-glow">
            <Plus className="w-5 h-5 mr-2" />
            Add New
          </Button>
        </div>

        <Tabs defaultValue="text" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 grid grid-cols-5 gap-2">
            <TabsTrigger value="text" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              <FileText className="w-4 h-4 mr-2" />
              Text
            </TabsTrigger>
            <TabsTrigger value="captions" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Captions
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              <Image className="w-4 h-4 mr-2" />
              Images
            </TabsTrigger>
            <TabsTrigger value="videos" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              <Video className="w-4 h-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger value="voice" className="data-[state=active]:bg-gradient-primary data-[state=active]:text-white">
              <Mic className="w-4 h-4 mr-2" />
              Voice
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text">
            <ContentList items={textPrompts} icon={FileText} type="Text" />
          </TabsContent>

          <TabsContent value="captions">
            <ContentList items={captions} icon={MessageSquare} type="Caption" />
          </TabsContent>

          <TabsContent value="images">
            <ContentList items={imagePrompts} icon={Image} type="Image" />
          </TabsContent>

          <TabsContent value="videos">
            <ContentList items={videoScripts} icon={Video} type="Video" />
          </TabsContent>

          <TabsContent value="voice">
            <ContentList items={voiceSamples} icon={Mic} type="Voice" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorLibrary;