import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface VideoInputProps {
  title: string;
  shortDescription: string;
  content: string;
  onTitleChange: (value: string) => void;
  onShortDescriptionChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

export const VideoInput = ({
  title,
  shortDescription,
  content,
  onTitleChange,
  onShortDescriptionChange,
  onContentChange,
}: VideoInputProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter video title..."
        />
      </div>
      <div>
        <Label htmlFor="short_description">Short Description</Label>
        <Input
          id="short_description"
          value={shortDescription}
          onChange={(e) => onShortDescriptionChange(e.target.value)}
          placeholder="Brief video description..."
        />
      </div>
      <div>
        <Label htmlFor="content">Script & Shotlist</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Enter video script and shotlist..."
          className="min-h-[200px]"
        />
      </div>
    </div>
  );
};
