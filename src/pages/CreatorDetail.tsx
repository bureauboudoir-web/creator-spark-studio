import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
import { ArrowLeft, User, RefreshCw, FileJson, Sparkles, Loader2, AlertCircle, Package, CheckCircle, Edit, RotateCcw, Check, X, Save, Send, History } from "lucide-react";
import { MOCK_CREATORS, getMockCreatorById } from "@/mocks/mockCreators";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MockModeWarning } from "@/components/shared/MockModeWarning";
import { ErrorState } from "@/components/shared/ErrorState";

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
  conversation_starters: {
    warm: string[];
    playful: string[];
    high_engagement: string[];
  };
  video_scripts: {
    title: string;
    hook: string;
    tone: string;
    script: string;
  }[];
  captions: {
    short: string[];
    long: string[];
  };
  story_teasers: {
    title: string;
    tone: string;
    text: string;
  }[];
  menu_upsell: {
    items: string[];
    bundles: string[];
    loyal_fan_offers: string[];
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

const MOCK_STARTER_PACK: StarterPackData = {
  conversation_starters: {
    warm: [
      "Hi there! I'm so glad you're here 🌸",
      "Welcome to my space! Excited to connect with you",
      "Thanks for being here - you just made my day better!",
      "Hey! I've been looking forward to getting to know you",
      "So happy to have you here with me ✨",
      "Hi! Ready to share something special with you today",
      "Welcome! This is going to be fun 💫",
      "Hey there! Thanks for stopping by",
      "Hi beautiful! Glad our paths crossed",
      "Welcome in! Let's make today amazing together"
    ],
    playful: [
      "Guess what I'm up to right now? 😏",
      "I have a question for you...",
      "Want to know a secret?",
      "Plot twist: today got way more interesting",
      "Quick - tell me the first thing that comes to mind when you see this 👀",
      "You know what's funny? I was just thinking about you",
      "Okay but seriously, can we talk about this?",
      "Challenge: make me smile in 5 words or less",
      "Real talk - what's your vibe today?",
      "Pop quiz: what are you thinking right now?"
    ],
    high_engagement: [
      "I made something just for you - check your messages 💌",
      "Unlock what I've been working on all week?",
      "This one's different... want to see?",
      "I'm curious what you'll think about this exclusive piece",
      "Behind the scenes access - ready?",
      "There's more where that came from... interested?",
      "Want the full story? It's in your DMs",
      "I saved the best part just for you",
      "This is too good not to share with you privately",
      "Ready to see what I've been hiding? 🔓"
    ]
  },
  video_scripts: [
    {
      title: "Morning Routine Reveal",
      hook: "Want to know how I really start my day?",
      tone: "Warm and inviting",
      script: "Good morning! So many of you have been asking about my morning routine, and I wanted to show you the real, unfiltered version. This is what truly sets my day up for success - not the perfect Instagram version, but the actual practices that ground me. From my first cup of coffee to the quiet moment I take for myself, I'm letting you in on all of it. Want to see the full routine and maybe try it yourself? Message me and let's talk about creating a morning ritual that works for you."
    },
    {
      title: "Behind the Content",
      hook: "Ever wonder what goes into creating what you see?",
      tone: "Authentic and curious",
      script: "Hey! I've been thinking about pulling back the curtain a bit. You see the final result, but there's so much that happens behind the scenes - the planning, the moments of doubt, the creative process. Today I want to share that journey with you, because I think you'll find it interesting. It's not always glamorous, but it's always real. If you're curious about the full behind-the-scenes story and want to be part of this creative process, let me know. I'd love to have you along for the ride."
    },
    {
      title: "Personal Story Time",
      hook: "This is something I haven't shared before...",
      tone: "Intimate and vulnerable",
      script: "So I've been holding onto this story for a while, and I think it's time to share it with you. It's personal, it's real, and it taught me something important about myself. I'm not going to lie - it's a little vulnerable to put this out there, but I feel like you'll understand. This experience changed how I see things, and I have a feeling it might resonate with you too. Want to hear the full story and maybe share your own? Message me - I'd love to hear your thoughts."
    },
    {
      title: "Weekly Check-In",
      hook: "Let's catch up - it's been a week!",
      tone: "Friendly and engaging",
      script: "Hey you! It's been a minute since we really connected, and I wanted to check in. This week has been such a journey - some incredible highs, a few challenges, and lots of moments I wish I could share with all of you. But here's the thing: I want to know about YOUR week too. What's been going on in your world? The good, the challenging, all of it. Let's make this a real conversation. Drop me a message and let's actually talk - I promise I read and respond to everything."
    },
    {
      title: "Exclusive Preview",
      hook: "I'm working on something new...",
      tone: "Exciting and anticipatory",
      script: "Okay, I'm so excited I can barely contain it. I've been working on something completely new, and I want you to be the first to know about it. This is different from anything I've done before - it's more personal, more intimate, and I think you're really going to love it. I'm not quite ready to share all the details publicly yet, but if you want an exclusive preview and the chance to give me your thoughts, message me. I value your opinion and would love to know what you think before I release it to everyone else."
    }
  ],
  captions: {
    short: [
      "Today's mood: ready for anything ✨",
      "Check your DMs - left you something special",
      "Plot twist incoming...",
      "This moment right here 💫",
      "Tell me: what's on your mind?",
      "New week, new energy",
      "Behind the scenes vibes",
      "Feeling grateful for you today",
      "Quick question in your messages",
      "Ready when you are 🔓"
    ],
    long: [
      "I've been reflecting a lot lately on what really matters, and it keeps coming back to connection - real, genuine connection. Not the surface-level stuff, but the conversations that make you think and feel. That's what I want to create here with you. If you're looking for that same kind of authentic space, you're in the right place. Check your DMs for something I put together just for you.",
      "There's something magical about the quiet moments, isn't there? Those times when everything slows down and you can just be. I captured one of those moments recently, and it made me think about what I want to share with you differently. Not just the highlight reel, but the real, intimate moments too. If that sounds like something you'd want to be part of, message me. Let's create something special together.",
      "Here's what nobody tells you about this journey: it's not always what you expect, and that's actually the beautiful part. The surprises, the plot twists, the moments that take your breath away - those are what make it worth it. I want to share more of that journey with you, the unfiltered version. Want in? Check your messages.",
      "Can we talk about taking chances for a second? I've been pushing myself to be braver lately, to share more, to really let you in. It's scary and exciting all at once. Today feels like one of those brave days, so I'm putting something out there that feels really personal. If you're curious and want to see what I mean, unlock what's waiting for you. Promise it's worth it.",
      "Some days I wake up with this overwhelming feeling of gratitude for the community we're building together. It's not just about the content - it's about the connection, the support, the real conversations we have. You make this space what it is, and I want to give back to that. I've created something exclusive just for people like you who really engage and care. Check your DMs to see what I mean.",
      "The energy today is different, can you feel it? There's something in the air that makes me want to do something spontaneous, something a little unexpected. So here's what I'm thinking: I want to give you access to a side of me that I usually keep more private. Not because I have to, but because I want to. Because you've earned that trust. Ready to see what I mean? Let me know.",
      "Behind every post you see, there's a story - a moment, a decision, a feeling that led to it being created. Today I want to share more of those stories with you. The real context, the messy middle, the journey from idea to reality. If you're someone who appreciates the process as much as the result, I think you'll love what I'm working on. Message me for the behind-the-scenes version.",
      "I've learned that the best connections come from vulnerability - from being willing to share not just the polished version, but the real, honest truth. So here's my truth today: I'm excited about what we're creating together here. This isn't just me talking at you; it's us building something meaningful. If that resonates with you, if you want to be part of this on a deeper level, I've left something in your messages that I think you'll appreciate.",
      "There are moments that define us - not the big, dramatic ones always, but the quiet decisions we make about who we want to be and how we want to show up. I'm making one of those decisions right now, to be more open, more present, more connected with the people who matter. You matter. If you want to be part of this next chapter, check what I left for you. I think you'll understand why it's special.",
      "Real talk: I don't just want followers, I want friends. People who actually care, who engage, who want to be part of something real. If that's you - and I think it is - then let's take this to the next level. I've created some exclusive content that's just for my inner circle, the people who really get it. Want to join? Let me know and I'll make sure you get access."
    ]
  },
  story_teasers: [
    {
      title: "The Turning Point",
      tone: "Reflective and intimate",
      text: "There was this moment last summer that changed everything for me. I was sitting alone, questioning every choice I'd made, wondering if I was on the right path. And then something shifted - not dramatically, but quietly, like a whisper telling me to trust myself.\n\nWhat followed was a series of small decisions that led me exactly where I needed to be. I learned something about resilience that day, about listening to your intuition even when everyone else is telling you something different. It wasn't easy, and there were moments I almost gave up.\n\nBut here's the thing - that struggle, that uncertainty, it shaped who I am now. And I think there's more to this story that you might relate to. Message me if you want to hear the full version. I have a feeling it might resonate with where you are right now."
    },
    {
      title: "Midnight Thoughts",
      tone: "Curious and mysterious",
      text: "It's past midnight and I can't sleep. My mind keeps wandering to this conversation I had earlier - one of those talks that makes you rethink everything you thought you knew. The kind that lingers with you, whispering questions you're not sure you want to answer.\n\nI keep playing it over in my head, wondering what would have happened if I'd said something different, if I'd been braver in that moment. There's something thrilling about the unknown, about standing at the edge of possibility and deciding whether to jump.\n\nI'm not usually this cryptic, but there's something about this that feels too raw to share publicly. If you're curious about what's keeping me up tonight, about the conversation that changed my perspective, send me a message. I'll tell you the whole story."
    },
    {
      title: "Behind Closed Doors",
      tone: "Authentic and revealing",
      text: "You know the version of me you see every day? That's real, but it's not everything. Behind closed doors, when the camera's off and it's just me, there's a whole other side that I rarely show. Not because it's hidden, but because it's private, intimate, reserved for people I trust.\n\nThis week I've been thinking about what it means to really let people in, to show the unfiltered version of my life. The messy kitchen, the days I don't feel like being 'on', the vulnerable moments that don't make it into the feed.\n\nI recorded something this morning in one of those raw, real moments. No editing, no filter, just me being completely honest. If you want to see that side, if you're ready for something more authentic, let me know. I think you'll appreciate it."
    },
    {
      title: "The Secret Project",
      tone: "Exciting and exclusive",
      text: "For the past few weeks, I've been working on something in secret. It started as just an idea, something I wasn't even sure would work, but it's grown into something I'm genuinely excited about. And I'm finally ready to share it - but not with everyone. Just with the people who really get what I'm trying to do here.\n\nThis project is different. It's more personal, more intimate than anything I've done before. It's about creating something meaningful together, about building a space where we can really connect without all the noise and distractions.\n\nI'm hand-selecting a small group to be part of this from the beginning, to help shape what it becomes. If you're interested in being one of those people, in getting exclusive access to something special, message me. I'll tell you everything."
    },
    {
      title: "Tomorrow's Decision",
      tone: "Contemplative and inviting",
      text: "Tomorrow I have to make a decision that's been weighing on me for weeks. It's one of those crossroads moments where both paths look appealing, but choosing one means letting go of the other. I've been going back and forth, making lists, seeking advice, but ultimately I know it comes down to what feels right in my gut.\n\nThe interesting part? This decision affects not just me, but potentially this whole space we've created together. It could change things in ways I'm both excited and nervous about. Part of me wants to involve you in this decision, to hear your perspective before I commit.\n\nI've recorded a longer video talking through both options, my fears, and what I'm really hoping for. If you're someone who likes being part of the journey, not just watching from the sidelines, message me. I'd love your input before tomorrow."
    }
  ],
  menu_upsell: {
    items: [
      "Personalized wellness sessions - imagine having dedicated one-on-one time where it's just us, focusing entirely on what you need. No distractions, complete attention, creating something meaningful together.",
      "Exclusive content packages - access to everything I create before anyone else sees it. Be the first to know, the first to experience, the first to give feedback that actually shapes what comes next.",
      "Custom experiences - tell me exactly what you're looking for, and I'll create it specifically for you. Whether it's a video, a message, or something completely unique, this is about making your vision come to life.",
      "Behind-the-scenes access - see everything that doesn't make it to the public feed. The process, the real moments, the unfiltered version of my day-to-day life.",
      "Monthly exclusive membership - become part of my inner circle with ongoing access to exclusive content, priority messaging, and special perks designed just for my most dedicated supporters."
    ],
    bundles: [
      "The Complete Experience: Get everything - exclusive content access, custom creations, priority messaging, and monthly surprises. This is the all-access pass to everything I offer, packaged together with a special discount for committing to the full experience.",
      "The Starter Collection: Perfect if you're new here and want to explore what I offer. Includes your first exclusive content package, one custom creation, and a personal welcome session so we can get to know each other properly.",
      "The Loyalty Package: For those who've been here supporting from the beginning. Enhanced access, bonus content, priority for new releases, and special pricing on everything because your support means everything to me."
    ],
    loyal_fan_offers: [
      "VIP Priority Access: You're one of my core supporters, and that deserves recognition. Get first access to everything new, priority in message responses, and exclusive previews before anyone else sees them. Plus, special pricing on all custom requests because loyalty matters.",
      "The Insider Experience: As someone who's been consistently engaged, you get exclusive monthly bonus content that nobody else receives, behind-the-scenes decision-making input, and the ability to request custom content at a special rate reserved only for insiders.",
      "Lifetime Appreciation Membership: For the supporters who've been here through everything - enjoy permanent discounts on all content, unlimited priority messaging, quarterly exclusive video calls, and first access to any new offerings I create. This is my way of saying thank you for believing in what we're building together."
    ]
  }
};

const CreatorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { usingMockData, setUsingMockData } = useCreatorContext();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [rawJson, setRawJson] = useState<any>(null);
  
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
      
      // Check if this is a mock creator ID
      const mockCreator = getMockCreatorById(id || '');
      if (mockCreator) {
        setUsingMockData(true);
        const mappedCreator: CreatorData = {
          id: mockCreator.id,
          user_id: mockCreator.id,
          email: mockCreator.email,
          full_name: mockCreator.name,
          avatar_url: mockCreator.avatarUrl,
          onboarding_completed: mockCreator.status === 'completed',
          onboarding: mockCreator.onboarding,
          persona: {
            niche: mockCreator.persona.niche,
            tone_of_voice: mockCreator.persona.tone_of_voice,
            content_strategy: mockCreator.persona.strategy,
            key_traits: mockCreator.persona.key_traits,
            boundaries: mockCreator.persona.boundaries,
            brand_keywords: mockCreator.persona.brand_keywords,
          },
          style_preferences: {
            preferred_colors: [
              mockCreator.style_preferences.primary_color,
              mockCreator.style_preferences.secondary_color,
              mockCreator.style_preferences.accent_color,
            ],
            vibe: mockCreator.style_preferences.vibe,
            sample_image_urls: mockCreator.style_preferences.sample_image_urls,
          },
        };
        setCreator(mappedCreator);
        setRawJson({ ...mappedCreator, menu_items: mockCreator.menu_items });
        setLoading(false);
        return;
      }
      
      // Try to fetch from BB API
      const { data, error } = await supabase.functions.invoke('get-creator-data', {
        method: 'GET',
        body: { creator_id: id },
      });

      if (error || !data?.success || !data?.data) {
        console.error('Failed to load creator data:', error);
        toast({
          title: "Error Loading Creator",
          description: "Unable to load creator data from BB API. Please check API Settings.",
          variant: "destructive",
        });
        setCreator(null);
        setRawJson(null);
      } else {
        setUsingMockData(false);
        setCreator(data.data);
        setRawJson(data.data);
      }
    } catch (error) {
      console.error('Error loading creator data:', error);
      toast({
        title: "Error Loading Creator",
        description: "An unexpected error occurred while loading creator data.",
        variant: "destructive",
      });
      setCreator(null);
      setRawJson(null);
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
    try {
      const mockCreator = getMockCreatorById(id || '');
      const creatorProfile = {
        full_name: creator?.full_name,
        persona: creator?.persona,
        onboarding: creator?.onboarding,
        menu_items: mockCreator?.menu_items || [
          "Custom content",
          "Exclusive access",
          "Personal messages",
          "Behind-the-scenes",
          "Monthly membership"
        ]
      };

      const { data, error } = await supabase.functions.invoke('generate-starter-pack', {
        body: { creatorProfile }
      });

      if (error) throw error;

      setStarterPack(data);
      setEditedPack(data);
      toast({
        title: "Starter Pack Generated",
        description: "Review the content below before saving.",
      });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate starter pack. Please try again.",
        variant: "destructive",
      });
      // Fallback to mock data
      setStarterPack(MOCK_STARTER_PACK);
      setEditedPack(MOCK_STARTER_PACK);
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setStarterPack(null);
    setEditedPack(null);
    await generateStarterPack(creator?.id || '');
  };

  const handleSave = async () => {
    if (usingMockData) {
      toast({
        title: "Mock Mode Active",
        description: "Cannot save starter packs in mock mode. Configure BB API in Settings to enable.",
        variant: "destructive",
      });
      return;
    }

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
    if (usingMockData) {
      toast({
        title: "Mock Mode Active",
        description: "Cannot send to BB in mock mode. Configure BB API in Settings to enable.",
        variant: "destructive",
      });
      return;
    }

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

  // Error state - no creator data loaded
  if (!loading && !creator) {
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
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate("/creators")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Creators
              </Button>
            </div>
            <ErrorState 
              variant="bb-error"
              title="Creator Not Found"
              message="Unable to load creator data from BB API. Please check that the BB API is configured correctly in API Settings."
              onRetry={loadCreatorData}
              retryLabel="Retry Loading"
            />
          </div>
        </div>
      </RoleGuard>
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
          {usingMockData && <MockModeWarning />}

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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="w-full block">
                          <Button
                            onClick={() => generateStarterPack(creator.id)}
                            disabled={generating || usingMockData}
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
                        </span>
                      </TooltipTrigger>
                      {usingMockData && (
                        <TooltipContent>
                          Cannot generate in mock mode
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-sm text-muted-foreground">
                    Generate a personalized starter pack based on {creator.full_name}'s persona and style preferences
                  </p>
                </div>
              )}

              {/* Section B - Starter Pack Preview with 5 Accordions */}
              {starterPack && (
                <div className="space-y-6">
                  <Accordion type="multiple" defaultValue={["task1", "task2", "task3", "task4", "task5"]} className="w-full">
                    {/* TASK 1: Conversation Starters */}
                    <AccordionItem value="task1">
                      <AccordionTrigger className="text-lg font-semibold">
                        💬 Conversation Starters (30 openers)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {/* Warm/Welcoming */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-primary">Warm & Welcoming (10)</h4>
                          <div className="space-y-2">
                            {starterPack.conversation_starters.warm.map((opener, idx) => (
                              <div key={idx} className="p-3 bg-muted/30 rounded-lg text-sm">
                                {opener}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        {/* Playful/Friendly */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-primary">Playful & Friendly (10)</h4>
                          <div className="space-y-2">
                            {starterPack.conversation_starters.playful.map((opener, idx) => (
                              <div key={idx} className="p-3 bg-muted/30 rounded-lg text-sm">
                                {opener}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        {/* High Engagement */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-primary">High Engagement (10)</h4>
                          <div className="space-y-2">
                            {starterPack.conversation_starters.high_engagement.map((opener, idx) => (
                              <div key={idx} className="p-3 bg-muted/30 rounded-lg text-sm">
                                {opener}
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* TASK 2: Video Scripts */}
                    <AccordionItem value="task2">
                      <AccordionTrigger className="text-lg font-semibold">
                        🎬 Video Scripts (5 scripts)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {starterPack.video_scripts.map((script, idx) => (
                          <div key={idx} className="p-4 bg-muted/30 rounded-lg space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-primary">{script.title}</h4>
                              <Badge variant="outline">{script.tone}</Badge>
                            </div>
                            <p className="text-sm font-medium italic text-muted-foreground">Hook: "{script.hook}"</p>
                            <Separator className="my-2" />
                            <p className="text-sm whitespace-pre-wrap">{script.script}</p>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    {/* TASK 3: Feed Captions */}
                    <AccordionItem value="task3">
                      <AccordionTrigger className="text-lg font-semibold">
                        📝 Feed Captions (20 captions)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {/* Short Captions */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-primary">Short Captions (under 20 words)</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {starterPack.captions.short.map((caption, idx) => (
                              <div key={idx} className="p-3 bg-muted/30 rounded-lg text-sm">
                                {caption}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        {/* Long Captions */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-primary">Long Captions (40-80 words)</h4>
                          <div className="space-y-2">
                            {starterPack.captions.long.map((caption, idx) => (
                              <div key={idx} className="p-3 bg-muted/30 rounded-lg text-sm">
                                {caption}
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* TASK 4: Story Teasers */}
                    <AccordionItem value="task4">
                      <AccordionTrigger className="text-lg font-semibold">
                        📖 Story Teasers (5 mini stories)
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {starterPack.story_teasers.map((story, idx) => (
                          <div key={idx} className="p-4 bg-muted/30 rounded-lg space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold text-primary">{story.title}</h4>
                              <Badge variant="outline">{story.tone}</Badge>
                            </div>
                            <Separator className="my-2" />
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{story.text}</p>
                          </div>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    {/* TASK 5: Menu & Upsell Copy */}
                    <AccordionItem value="task5">
                      <AccordionTrigger className="text-lg font-semibold">
                        💰 Menu & Upsell Copy
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 pt-4">
                        {/* Menu Items */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-primary">Menu Items</h4>
                          <div className="space-y-2">
                            {starterPack.menu_upsell.items.map((item, idx) => (
                              <div key={idx} className="p-3 bg-muted/30 rounded-lg text-sm">
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        {/* Bundle Ideas */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-primary">Bundle Ideas</h4>
                          <div className="space-y-2">
                            {starterPack.menu_upsell.bundles.map((bundle, idx) => (
                              <div key={idx} className="p-3 bg-accent/10 border-l-4 border-accent rounded-r-lg text-sm">
                                {bundle}
                              </div>
                            ))}
                          </div>
                        </div>
                        <Separator />
                        {/* Loyal Fan Offers */}
                        <div className="space-y-2">
                          <h4 className="font-medium text-primary">Loyal Fan Offers</h4>
                          <div className="space-y-2">
                            {starterPack.menu_upsell.loyal_fan_offers.map((offer, idx) => (
                              <div key={idx} className="p-3 bg-green-500/10 border-l-4 border-green-500 rounded-r-lg text-sm">
                                {offer}
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Section C - Staff Review Actions */}
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">Staff Review Actions</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/starter-packs/history?creator_id=${creator.id}`)}
                        className="gap-2"
                      >
                        <History className="w-4 h-4" />
                        View History
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {/* Save button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex-1">
                              <Button
                                onClick={handleSave}
                                disabled={usingMockData || saving || !starterPack}
                                className="w-full gap-2"
                                variant="secondary"
                              >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Draft
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {usingMockData && (
                            <TooltipContent>
                              Cannot save in mock mode
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Send to BB button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="flex-1">
                              <Button
                                onClick={handleSendToBB}
                                disabled={usingMockData || sendingToBB || !starterPack}
                                className="w-full bg-green-600 hover:bg-green-700 gap-2"
                              >
                                {sendingToBB ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                Send to BB
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {usingMockData && (
                            <TooltipContent>
                              Cannot send to BB in mock mode
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Regenerate button */}
                      <Button
                        onClick={handleRegenerate}
                        variant="outline"
                        className="gap-2"
                        disabled={usingMockData}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Regenerate
                      </Button>
                      
                      {/* Edit button - removed since Accordion handles editing better */}
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