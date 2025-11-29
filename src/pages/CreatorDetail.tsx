import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ArrowLeft, User, RefreshCw, FileJson, Sparkles, Loader2, AlertCircle } from "lucide-react";

interface CreatorData {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  username?: string;
  age?: number;
  location?: string;
  avatar_url?: string;
  onboarding_completed: boolean;
  onboarding?: {
    [key: string]: any;
  };
  persona?: {
    niche?: string;
    tone_of_voice?: string;
    content_strategy?: string;
    key_traits?: string[];
    boundaries?: string[];
    brand_keywords?: string[];
  };
  style_preferences?: {
    preferred_colors?: string[];
    vibe?: string;
    sample_image_urls?: string[];
  };
}

const MOCK_CREATOR_DATA: CreatorData = {
  id: "mock-1",
  user_id: "user-1",
  email: "creator@example.com",
  full_name: "Alice Johnson",
  username: "@alicecreates",
  age: 28,
  location: "Los Angeles, CA",
  avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
  onboarding_completed: true,
  onboarding: {
    platform_experience: "2+ years",
    content_type: "Lifestyle & Wellness",
    posting_frequency: "Daily",
    audience_size: "50K-100K",
  },
  persona: {
    niche: "Wellness and mindful living",
    tone_of_voice: "Warm, authentic, encouraging",
    content_strategy: "Educational content mixed with personal stories",
    key_traits: ["Authentic", "Empathetic", "Knowledgeable", "Approachable"],
    boundaries: ["No medical advice", "No product endorsements without disclosure", "Respect privacy"],
    brand_keywords: ["wellness", "mindfulness", "self-care", "balance", "growth"],
  },
  style_preferences: {
    preferred_colors: ["#E8DFF5", "#FCE1E4", "#FCF4DD", "#DAEAF6"],
    vibe: "Calm, natural, minimalist",
    sample_image_urls: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773",
      "https://images.unsplash.com/photo-1499209974431-9dddcece7f88",
    ],
  },
};

const CreatorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [rawJson, setRawJson] = useState<any>(null);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    loadCreatorData();
  }, [id]);

  const loadCreatorData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-creator-data', {
        method: 'GET',
        body: { creator_id: id },
      });

      if (error) throw error;

      if (data.useMock) {
        setUsingMock(true);
        setCreator(MOCK_CREATOR_DATA);
        setRawJson(MOCK_CREATOR_DATA);
        toast({
          title: "Using Mock Data",
          description: "BB connection unavailable. Displaying sample creator data.",
          variant: "default",
        });
      } else if (data.success && data.data) {
        setUsingMock(false);
        setCreator(data.data);
        setRawJson(data.data);
      } else {
        setUsingMock(true);
        setCreator(MOCK_CREATOR_DATA);
        setRawJson(MOCK_CREATOR_DATA);
      }
    } catch (error) {
      console.error('Error loading creator data:', error);
      setUsingMock(true);
      setCreator(MOCK_CREATOR_DATA);
      setRawJson(MOCK_CREATOR_DATA);
      toast({
        title: "Connection Error",
        description: "Using mock creator data. Please check API settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCreatorData();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Creator data has been refreshed from BB.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Creator not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RoleGuard staffOnly fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You need staff privileges to view this page.</p>
          </CardContent>
        </Card>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/creators")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Creators
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh From BB
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <FileJson className="w-4 h-4" />
                    View Raw JSON
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Raw API Response</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                    <pre className="text-xs">{JSON.stringify(rawJson, null, 2)}</pre>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Mock Data Warning */}
          {usingMock && (
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Using mock creator data</strong> - BB connection unavailable.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Section 1 - Basic Info */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={creator.avatar_url} alt={creator.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl">
                    {creator.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-2xl font-bold">{creator.full_name}</h2>
                    {creator.username && (
                      <p className="text-muted-foreground">{creator.username}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{creator.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Age</p>
                      <p className="font-medium">{creator.age || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium">{creator.location || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={creator.onboarding_completed ? "default" : "secondary"}>
                        {creator.onboarding_completed ? "Onboarding Complete" : "Onboarding Incomplete"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2 - Onboarding */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Onboarding Details</CardTitle>
            </CardHeader>
            <CardContent>
              {creator.onboarding && Object.keys(creator.onboarding).length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(creator.onboarding).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="font-medium">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No onboarding data available</p>
              )}
            </CardContent>
          </Card>

          {/* Section 3 - Persona */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Creator Persona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Niche</p>
                <p className="font-medium">{creator.persona?.niche || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tone of Voice</p>
                <p className="font-medium">{creator.persona?.tone_of_voice || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Content Strategy</p>
                <p className="font-medium">{creator.persona?.content_strategy || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Key Traits</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {creator.persona?.key_traits?.length ? (
                    creator.persona.key_traits.map((trait, idx) => (
                      <Badge key={idx} variant="secondary">{trait}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Boundaries</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {creator.persona?.boundaries?.length ? (
                    creator.persona.boundaries.map((boundary, idx) => (
                      <li key={idx} className="text-sm">{boundary}</li>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Brand Keywords</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {creator.persona?.brand_keywords?.length ? (
                    creator.persona.brand_keywords.map((keyword, idx) => (
                      <Badge key={idx} variant="outline">{keyword}</Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4 - Style Preferences */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader>
              <CardTitle>Style Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Vibe</p>
                <p className="font-medium">{creator.style_preferences?.vibe || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Preferred Colors</p>
                <div className="flex gap-2 mt-2">
                  {creator.style_preferences?.preferred_colors?.length ? (
                    creator.style_preferences.preferred_colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-md border shadow-sm"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sample Images</p>
                <div className="grid grid-cols-4 gap-4 mt-2">
                  {creator.style_preferences?.sample_image_urls?.length ? (
                    creator.style_preferences.sample_image_urls.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt={`Sample ${idx + 1}`}
                        className="w-full aspect-square object-cover rounded-md border"
                      />
                    ))
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5 - Creator Actions */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle>Creator Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity gap-2"
                size="lg"
              >
                <Sparkles className="w-5 h-5" />
                Generate Starter Pack
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                This feature will be implemented in a future step
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
};

export default CreatorDetail;