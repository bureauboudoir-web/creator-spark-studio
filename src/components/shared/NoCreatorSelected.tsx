import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NoCreatorSelectedProps {
  onOpenSelector?: () => void;
}

export const NoCreatorSelected = ({ onOpenSelector }: NoCreatorSelectedProps) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <UserX className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No Creator Selected</h3>
            <p className="text-sm text-muted-foreground">
              Please select a creator from the header to continue
            </p>
          </div>
          {onOpenSelector && (
            <Button onClick={onOpenSelector}>Select Creator</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
