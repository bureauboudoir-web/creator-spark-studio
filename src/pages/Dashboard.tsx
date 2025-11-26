import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, FileText, Image, Video, Mic, Library, Plus } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Create Starter Pack",
      description: "Generate comprehensive content templates and samples",
      icon: Sparkles,
      action: () => navigate("/generator"),
      gradient: "from-primary to-primary/80"
    },
    {
      title: "Content Library",
      description: "Browse and manage all your content assets",
      icon: Library,
      action: () => navigate("/library"),
      gradient: "from-accent to-accent/80"
    },
    {
      title: "Voice Samples",
      description: "Record and manage voice templates",
      icon: Mic,
      action: () => navigate("/voice"),
      gradient: "from-primary to-accent"
    },
    {
      title: "Templates",
      description: "Select and customize content templates",
      icon: FileText,
      action: () => navigate("/samples"),
      gradient: "from-accent to-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Content Generator
          </h1>
          <p className="text-xl text-muted-foreground">
            Create, manage, and export professional content for the BB platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Text Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">24</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-glow transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Image Themes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">15</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-accent transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Video Scripts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">12</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50 hover:shadow-accent transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Voice Samples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">8</div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Card 
              key={feature.title}
              className="group bg-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-elevated cursor-pointer"
              onClick={feature.action}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-glow`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <CardTitle className="text-2xl mt-4">{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Ready to get started?</h3>
                <p className="text-muted-foreground">Complete your onboarding to unlock full access</p>
              </div>
              <Button 
                size="lg"
                className="bg-gradient-primary hover:opacity-90 shadow-glow"
                onClick={() => navigate("/onboarding")}
              >
                Start Onboarding
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;