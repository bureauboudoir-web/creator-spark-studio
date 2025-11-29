import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ArrowLeft, User, RefreshCw, FileJson, Sparkles, Loader2, AlertCircle, Package, CheckCircle, Edit, RotateCcw, Check, X, Save, Send } from "lucide-react";

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

interface StarterPackData {
  profile_bio: string;
  content_themes: string[];
  weekly_content_plan: { day: string; content: string }[];
  ppv_ideas: string[];
  hook_ideas: string[];
  do_rules: string[];
  dont_rules: string[];
  text_scripts: { name: string; script: string }[];
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

const MOCK_STARTER_PACK: StarterPackData = {
  profile_bio: "Wellness advocate sharing daily mindfulness practices and self-care rituals. Join me on a journey to balanced living 🌿✨",
  content_themes: [
    "Morning Rituals",
    "Mindful Moments",
    "Self-Care Sunday",
    "Wellness Wednesday",
    "Balance & Growth",
    "Personal Reflection"
  ],
  weekly_content_plan: [
    { day: "Monday", content: "Morning meditation routine + coffee ritual" },
    { day: "Tuesday", content: "Wellness tip of the week (e.g., breathing exercises)" },
    { day: "Wednesday", content: "Behind-the-scenes of my self-care practice" },
    { day: "Thursday", content: "Q&A about mindfulness and wellness journey" },
    { day: "Friday", content: "Weekend wellness prep & planning" },
    { day: "Saturday", content: "Personal story or reflection from the week" },
    { day: "Sunday", content: "Self-care Sunday routine showcase" }
  ],
  ppv_ideas: [
    "Exclusive guided meditation audio series (20-30 min sessions)",
    "Private wellness journal prompts & reflection guide",
    "Morning routine video tutorial with all my favorite practices",
    "One-on-one wellness chat session for personalized tips",
    "Monthly self-care bundle with curated practices & resources"
  ],
  hook_ideas: [
    "Want to know the one habit that changed my mornings?",
    "Here's what nobody tells you about starting a mindfulness practice...",
    "I tried this wellness routine for 30 days and here's what happened",
    "The self-care practice everyone needs but nobody talks about",
    "This is your sign to prioritize yourself today 💫",
    "POV: You finally figure out what balance actually means"
  ],
  do_rules: [
    "Share authentic personal experiences and growth moments",
    "Provide actionable wellness tips that followers can implement today",
    "Respond to comments with encouragement and support",
    "Disclose all partnerships and sponsored content clearly",
    "Use calming, positive language that uplifts the community"
  ],
  dont_rules: [
    "Never give medical advice or diagnose health conditions",
    "Don't endorse products without trying them personally",
    "Avoid sharing others' private information or stories",
    "Don't create content when feeling inauthentic or pressured",
    "Never claim that wellness practices work the same for everyone"
  ],
  text_scripts: [
    {
      name: "Welcome Message",
      script: "Hi beautiful soul! 🌸 I'm so glad you're here. This space is all about finding balance, practicing self-care, and growing together. Feel free to reach out anytime - I love connecting with this amazing community! ✨"
    },
    {
      name: "PPV Promo (Meditation Series)",
      script: "Something special just for you 💫 I've created an exclusive guided meditation series to help you find calm in the chaos. 20-minute sessions perfect for morning or evening practice. Unlock it now and let's breathe together 🧘‍♀️"
    },
    {
      name: "Engagement Prompt",
      script: "Quick question for you lovely humans ☀️ What's one self-care practice you're trying to be more consistent with? Drop it below - I'd love to hear! Maybe we can support each other on this journey 🤝💕"
    },
    {
      name: "Re-engagement Message",
      script: "Hey, I've missed you! 🌟 Just wanted to check in and see how you're doing. Remember, it's okay to take breaks and prioritize yourself. What's one thing you're grateful for today? 💛"
    }
  ]
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
  
  // Starter Pack states
  const [starterPack, setStarterPack] = useState<StarterPackData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedPack, setEditedPack] = useState<StarterPackData | null>(null);
  const [saving, setSaving] = useState(false);
  const [sendingToBB, setSendingToBB] = useState(false);
  const [savedPackId, setSavedPackId] = useState<string | null>(null);
  const [bbConfigured, setBbConfigured] = useState<boolean | null>(null);
  const [packStatus, setPackStatus] = useState<'draft' | 'final' | 'sent' | 'approved'>('draft');

  useEffect(() => {
    loadCreatorData();
    checkBBConfig();
  }, [id]);

  // Check if BB API is configured
  const checkBBConfig = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-api-settings', {
        method: 'GET'
      });

      if (error) {
        console.error('Error checking BB config:', error);
        setBbConfigured(false);
        return;
      }

      const hasConfig = data?.data?.bb_api_url && data?.data?.bb_api_key;
      setBbConfigured(hasConfig);
    } catch (error) {
      console.error('Error checking BB config:', error);
      setBbConfigured(false);
    }
  };

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

  // Starter Pack handlers
  const generateStarterPack = async (creatorId: string) => {
    setGenerating(true);
    // Simulate AI generation with a delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStarterPack(MOCK_STARTER_PACK);
    setEditedPack(MOCK_STARTER_PACK);
    setGenerating(false);
    toast({
      title: "Starter Pack Generated",
      description: "Review the content below before approving.",
    });
  };

  const handleRegenerate = async () => {
    setStarterPack(null);
    setEditedPack(null);
    await generateStarterPack(creator?.id || '');
  };

  const handleSave = async () => {
    if (!creator?.id) {
      toast({
        title: "Error",
        description: "Creator ID not found",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const packData = editMode ? editedPack : starterPack;
      const { data, error } = await supabase.functions.invoke('save-starter-pack', {
        body: {
          creator_id: creator.id,
          title: `${creator.full_name}'s Starter Pack`,
          data: packData,
          send_to_bb: false
        }
      });
      
      if (error || !data.success) {
        throw new Error(data?.error || 'Failed to save');
      }
      
      setSavedPackId(data.starterPackId);
      setPackStatus('draft');
      toast({
        title: "Starter Pack Saved",
        description: "The starter pack has been saved locally.",
      });
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendToBB = async () => {
    if (!creator?.id) {
      toast({
        title: "Error",
        description: "Creator ID not found",
        variant: "destructive",
      });
      return;
    }

    if (!starterPack) {
      toast({
        title: "Nothing to Send",
        description: "Please generate or save a starter pack first.",
        variant: "destructive",
      });
      return;
    }

    setSendingToBB(true);
    try {
      const packData = editMode ? editedPack : starterPack;
      const { data, error } = await supabase.functions.invoke('save-starter-pack', {
        body: {
          creator_id: creator.id,
          title: `${creator.full_name}'s Starter Pack`,
          data: packData,
          send_to_bb: true
        }
      });
      
      if (error || !data.success) {
        throw new Error(data?.error || 'Failed to send');
      }
      
      setSavedPackId(data.starterPackId);
      
      if (data.bb_sync) {
        setPackStatus('sent');
        toast({
          title: "Sent to BB",
          description: "Starter pack has been synced to BB successfully.",
        });
      } else {
        // BB not configured fallback
        setPackStatus('draft');
        toast({
          title: "Saved Locally Only",
          description: data.message || "BB API not configured. Saved locally.",
        });
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSendingToBB(false);
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setEditedPack(starterPack);
    }
  };

  const updateEditedField = (field: keyof StarterPackData, value: any) => {
    if (editedPack) {
      setEditedPack({ ...editedPack, [field]: value });
    }
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

          {/* BB API Warning */}
          {bbConfigured === false && (
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>BB API not configured</strong> - Starter packs will be saved locally only. Configure BB API in API Settings to enable sync.
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

          {/* Section 5 - Starter Pack Generator */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Starter Pack Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Section A - Generation Trigger */}
              {!starterPack && (
                <div className="text-center space-y-4">
                  <Button
                    onClick={() => generateStarterPack(creator.id)}
                    disabled={generating}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity gap-2"
                    size="lg"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating Starter Pack...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Generate Starter Pack
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Generate a personalized starter pack based on {creator.full_name}'s persona and style preferences
                  </p>
                </div>
              )}

              {/* Section B - Starter Pack Preview */}
              {starterPack && (
                <div className="space-y-6">
                  {/* Profile Bio */}
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Suggested Profile Bio
                    </h3>
                    {editMode ? (
                      <Textarea
                        value={editedPack?.profile_bio || ''}
                        onChange={(e) => updateEditedField('profile_bio', e.target.value)}
                        className="min-h-[80px]"
                      />
                    ) : (
                      <p className="text-sm bg-muted/50 p-4 rounded-lg">{starterPack.profile_bio}</p>
                    )}
                  </div>

                  <Separator />

                  {/* Content Themes */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Content Themes</h3>
                    <div className="flex flex-wrap gap-2">
                      {starterPack.content_themes.map((theme, idx) => (
                        <Badge key={idx} variant="secondary" className="text-sm">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Weekly Content Plan */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Weekly Content Plan</h3>
                    <div className="space-y-2">
                      {starterPack.weekly_content_plan.map((item, idx) => (
                        <div key={idx} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                          <span className="font-medium text-primary min-w-[100px]">{item.day}</span>
                          <span className="text-sm">{item.content}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* PPV Ideas */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">PPV Ideas</h3>
                    <ul className="space-y-2">
                      {starterPack.ppv_ideas.map((idea, idx) => (
                        <li key={idx} className="flex gap-2 text-sm">
                          <span className="text-primary">•</span>
                          <span>{idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  {/* Hook Ideas */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Hook Ideas</h3>
                    <div className="space-y-2">
                      {starterPack.hook_ideas.map((hook, idx) => (
                        <div key={idx} className="p-3 bg-accent/10 border-l-4 border-accent rounded-r-lg">
                          <p className="text-sm italic">"{hook}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Do/Don't Rules */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Content Guidelines</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Do Rules */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Do's
                        </h4>
                        <ul className="space-y-2">
                          {starterPack.do_rules.map((rule, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Don't Rules */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                          <X className="w-4 h-4" />
                          Don'ts
                        </h4>
                        <ul className="space-y-2">
                          {starterPack.dont_rules.map((rule, idx) => (
                            <li key={idx} className="flex gap-2 text-sm">
                              <X className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                              <span>{rule}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Text Scripts */}
                  <div className="space-y-2">
                    <h3 className="font-semibold">Text Scripts</h3>
                    <div className="space-y-3">
                      {starterPack.text_scripts.map((script, idx) => (
                        <div key={idx} className="space-y-1 p-4 bg-muted/30 rounded-lg">
                          <h4 className="text-sm font-medium text-primary">{script.name}</h4>
                          {editMode ? (
                            <Textarea
                              value={editedPack?.text_scripts[idx]?.script || ''}
                              onChange={(e) => {
                                const newScripts = [...(editedPack?.text_scripts || [])];
                                newScripts[idx] = { ...newScripts[idx], script: e.target.value };
                                updateEditedField('text_scripts', newScripts);
                              }}
                              className="min-h-[60px] text-sm"
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground">{script.script}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section C - Staff Review Actions */}
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-3">
                      {/* Save button */}
                      <Button
                        onClick={handleSave}
                        disabled={saving || !starterPack}
                        className="flex-1 gap-2"
                        variant="secondary"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Draft
                      </Button>
                      
                      {/* Send to BB button */}
                      <Button
                        onClick={handleSendToBB}
                        disabled={sendingToBB || !starterPack}
                        className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                      >
                        {sendingToBB ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Send to BB
                      </Button>
                      
                      {/* Regenerate button */}
                      <Button
                        onClick={handleRegenerate}
                        variant="outline"
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Regenerate
                      </Button>
                      
                      {/* Edit button */}
                      <Button
                        onClick={handleEditToggle}
                        variant="outline"
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        {editMode ? 'Done Editing' : 'Edit'}
                      </Button>
                    </div>

                    {/* Status indicator */}
                    {packStatus !== 'draft' && (
                      <Badge variant={packStatus === 'sent' ? 'default' : 'secondary'}>
                        Status: {packStatus}
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
};

export default CreatorDetail;