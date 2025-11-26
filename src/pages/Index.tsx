import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Lock, TrendingUp } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Create comprehensive content packs with advanced AI technology"
    },
    {
      icon: Zap,
      title: "Instant Library",
      description: "Organize and manage all your content assets in one place"
    },
    {
      icon: Lock,
      title: "Secure Integration",
      description: "Seamlessly sync with BB platform through encrypted APIs"
    },
    {
      icon: TrendingUp,
      title: "Scale Efficiently",
      description: "From starter packs to full libraries, grow your content effortlessly"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-primary shadow-glow mb-8">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
              Content Generator Tool
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
              Create, manage, and export professional content for the BB platform. Streamline your creator workflow with AI-powered tools.
            </p>
            <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              <Button 
                size="lg"
                className="bg-gradient-primary shadow-glow text-lg px-8 py-6"
                onClick={() => navigate("/onboarding")}
              >
                Get Started
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-border text-lg px-8 py-6"
                onClick={() => navigate("/dashboard")}
              >
                View Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">
          Everything You Need to Create
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="bg-card border-border/50 p-6 hover:shadow-elevated transition-all duration-300 animate-in fade-in slide-in-from-bottom-8"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-3 rounded-xl bg-gradient-primary shadow-glow w-fit mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-24">
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 p-12 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Creating?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join creators building professional content with our AI-powered platform
          </p>
          <Button 
            size="lg"
            className="bg-gradient-primary shadow-glow text-lg px-8 py-6"
            onClick={() => navigate("/onboarding")}
          >
            Begin Onboarding
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Index;