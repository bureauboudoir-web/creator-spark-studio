import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface TextInputProps {
  title: string;
  shortDescription: string;
  content: string;
  onTitleChange: (value: string) => void;
  onShortDescriptionChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

export const TextInput = ({
  title,
  shortDescription,
  content,
  onTitleChange,
  onShortDescriptionChange,
  onContentChange,
}: TextInputProps) => {
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
        <Label htmlFor="short_description">Short Description (optional)</Label>
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
          placeholder="Enter your content..."
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
};
