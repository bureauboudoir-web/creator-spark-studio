import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState = ({ 
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again"
}: ErrorStateProps) => {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Card className="max-w-md border-destructive/50">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              {retryLabel}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
