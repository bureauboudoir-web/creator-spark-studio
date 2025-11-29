import { 
  FileText, Zap, MessageSquare, Image, Video, 
  Palette, Mic, DollarSign, MessageCircle, Brush 
} from "lucide-react";

export const CONTENT_CATEGORIES = [
  { id: "text", label: "Text", icon: FileText, color: "bg-blue-500" },
  { id: "hooks", label: "Hooks", icon: Zap, color: "bg-yellow-500" },
  { id: "captions", label: "Captions", icon: MessageSquare, color: "bg-purple-500" },
  { id: "images", label: "Images", icon: Image, color: "bg-green-500" },
  { id: "videos", label: "Videos", icon: Video, color: "bg-red-500" },
  { id: "artwork", label: "Artwork / Graphics", icon: Palette, color: "bg-pink-500" },
  { id: "voice_scripts", label: "Voice Scripts", icon: Mic, color: "bg-indigo-500" },
  { id: "ppv_templates", label: "PPV Templates", icon: DollarSign, color: "bg-amber-500" },
  { id: "chat_templates", label: "Chat Templates", icon: MessageCircle, color: "bg-teal-500" },
  { id: "brand_assets", label: "Brand Style Assets", icon: Brush, color: "bg-orange-500" },
] as const;

export type ContentCategory = typeof CONTENT_CATEGORIES[number]["id"];
