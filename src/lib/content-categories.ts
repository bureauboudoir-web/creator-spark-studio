import { MessageSquare, Image, Video, FileText, Zap, DollarSign, Lightbulb } from "lucide-react";

export const CONTENT_CATEGORIES = [
  { id: "text", label: "Text", icon: FileText },
  { id: "hooks", label: "Hooks", icon: Zap },
  { id: "captions", label: "Captions", icon: MessageSquare },
  { id: "images", label: "Images", icon: Image },
  { id: "scripts", label: "Scripts", icon: Video },
  { id: "menus", label: "Menus", icon: DollarSign },
  { id: "story_ideas", label: "Story Ideas", icon: Lightbulb },
];
