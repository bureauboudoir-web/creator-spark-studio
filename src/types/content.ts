import { Json } from "@/integrations/supabase/types";

export interface ContentItem {
  id: string;
  creator_id: string;
  category: string;
  title: string;
  short_description: string | null;
  content: string;
  metadata: Json | null;
  folder: string;
  type: string;
  approval_status: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}
