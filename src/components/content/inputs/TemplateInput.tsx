import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TemplateInputProps {
  title: string;
  shortDescription: string;
  content: string;
  onTitleChange: (value: string) => void;
  onShortDescriptionChange: (value: string) => void;
  onContentChange: (value: string) => void;
  category: string;
}

export const TemplateInput = ({
  title,
  shortDescription,
  content,
  onTitleChange,
  onShortDescriptionChange,
  onContentChange,
  category,
}: TemplateInputProps) => {
  const getPlaceholder = () => {
    switch (category) {
      case "voice_scripts":
        return "Enter voice script with tone notes...";
      case "ppv_templates":
        return "Enter PPV template with pricing suggestions...";
      case "chat_templates":
        return "Enter chat message sequence...";
      case "brand_assets":
        return "Enter brand asset details and usage notes...";
      case "artwork":
        return "Enter artwork description and style notes...";
      default:
        return "Enter template content...";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter title..."
        />
      </div>
      <div>
        <Label htmlFor="short_description">Short Description</Label>
        <Input
          id="short_description"
          value={shortDescription}
          onChange={(e) => onShortDescriptionChange(e.target.value)}
          placeholder="Brief description..."
        />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={getPlaceholder()}
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
};
