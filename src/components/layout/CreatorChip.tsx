import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { UserCircle, ChevronDown } from "lucide-react";

interface CreatorChipProps {
  onClick: () => void;
}

export const CreatorChip = ({ onClick }: CreatorChipProps) => {
  const { selectedCreator } = useCreatorContext();

  if (!selectedCreator) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="gap-2"
      >
        <UserCircle className="w-4 h-4" />
        <span>Select Creator</span>
        <ChevronDown className="w-3 h-3" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2 max-w-[200px]"
    >
      <Avatar className="w-5 h-5">
        <AvatarImage src={selectedCreator.profile_photo_url || undefined} />
        <AvatarFallback className="text-xs">
          {selectedCreator.name?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>
      <span className="truncate">{selectedCreator.name}</span>
      <ChevronDown className="w-3 h-3" />
    </Button>
  );
};
