import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CONTENT_CATEGORIES } from "@/lib/content-categories";
import { TextInput } from "./inputs/TextInput";
import { ImageInput } from "./inputs/ImageInput";
import { VideoInput } from "./inputs/VideoInput";
import { TemplateInput } from "./inputs/TemplateInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCreatorContext } from "@/contexts/CreatorContext";

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddContentDialog = ({ open, onOpenChange, onSuccess }: AddContentDialogProps) => {
  const { selectedCreatorId } = useCreatorContext();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setStep(1);
    setSelectedCategory("");
    setTitle("");
    setShortDescription("");
    setContent("");
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep(2);
  };

  const handleSave = async () => {
    if (!title || !content || !selectedCreatorId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("content_items").insert({
        creator_id: selectedCreatorId,
        category: selectedCategory,
        title,
        short_description: shortDescription || null,
        content,
        folder: "library",
        type: selectedCategory,
        approval_status: "pending",
      });

      if (error) throw error;

      toast.success("Content added successfully!");
      handleReset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error adding content:", error);
      toast.error("Failed to add content");
    } finally {
      setLoading(false);
    }
  };

  const renderInputForm = () => {
    const commonProps = {
      title,
      shortDescription,
      content,
      onTitleChange: setTitle,
      onShortDescriptionChange: setShortDescription,
      onContentChange: setContent,
    };

    switch (selectedCategory) {
      case "text":
      case "hooks":
      case "captions":
        return <TextInput {...commonProps} />;
      case "images":
        return <ImageInput {...commonProps} />;
      case "videos":
        return <VideoInput {...commonProps} />;
      default:
        return <TemplateInput {...commonProps} category={selectedCategory} />;
    }
  };

  const selectedCategoryData = CONTENT_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      onOpenChange(newOpen);
      if (!newOpen) handleReset();
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Select Content Category" : `Add ${selectedCategoryData?.label}`}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid grid-cols-2 gap-4">
            {CONTENT_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="flex flex-col items-center gap-3 p-6 border rounded-lg hover:border-primary transition-colors"
                >
                  <div className={`${category.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-medium">{category.label}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {renderInputForm()}
            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Content"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
