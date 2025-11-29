import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ImageInputProps {
  title: string;
  shortDescription: string;
  content: string;
  onTitleChange: (value: string) => void;
  onShortDescriptionChange: (value: string) => void;
  onContentChange: (value: string) => void;
}

export const ImageInput = ({
  title,
  shortDescription,
  content,
  onTitleChange,
  onShortDescriptionChange,
  onContentChange,
}: ImageInputProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter image title..."
        />
      </div>
      <div>
        <Label htmlFor="short_description">Short Description</Label>
        <Input
          id="short_description"
          value={shortDescription}
          onChange={(e) => onShortDescriptionChange(e.target.value)}
          placeholder="Brief description of the image..."
        />
      </div>
      <div>
        <Label htmlFor="content">Image URL or Description</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Image URL or detailed description..."
          className="min-h-[150px]"
        />
      </div>
    </div>
  );
};
