import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  variant?: 'error' | 'no-creator' | 'no-content' | 'bb-error' | 'api-not-configured';
}

export const ErrorState = ({ 
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
  variant = 'error'
}: ErrorStateProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'no-creator':
      case 'no-content':
        return 'border-muted-foreground/20';
      case 'bb-error':
      case 'api-not-configured':
        return 'border-warning/50 bg-warning/5';
      default:
        return 'border-destructive/50';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'no-creator':
      case 'no-content':
        return 'bg-muted text-muted-foreground';
      case 'bb-error':
      case 'api-not-configured':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-destructive/10 text-destructive';
    }
  };
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Card className={`max-w-md ${getVariantStyles()}`}>
        <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getIconColor()}`}>
            <AlertCircle className="w-8 h-8" />
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
