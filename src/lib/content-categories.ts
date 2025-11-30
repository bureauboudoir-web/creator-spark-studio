import { MessageSquare, Image, Video, FileText, Zap } from "lucide-react";

export const CONTENT_CATEGORIES = [
  { id: "text", label: "Text", icon: FileText },
  { id: "hooks", label: "Hooks", icon: Zap },
  { id: "captions", label: "Captions", icon: MessageSquare },
  { id: "images", label: "Images", icon: Image },
  { id: "video_scripts", label: "Video Scripts", icon: Video },
  { id: "templates", label: "Templates", icon: FileText },
];
