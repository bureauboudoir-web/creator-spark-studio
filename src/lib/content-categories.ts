import { MessageSquare, Image, FileText, Zap, DollarSign, BookOpen, LayoutTemplate } from "lucide-react";

export const CONTENT_CATEGORIES = [
  { id: "text", label: "Text", icon: FileText },
  { id: "hooks", label: "Hooks", icon: Zap },
  { id: "captions", label: "Captions", icon: MessageSquare },
  { id: "image_themes", label: "Image Themes", icon: Image },
  { id: "storylines", label: "Storylines", icon: BookOpen },
  { id: "offers_menus", label: "Offers & Menus", icon: DollarSign },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
];
