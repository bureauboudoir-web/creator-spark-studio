import { AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface BBNotConfiguredProps {
  title?: string;
  message?: string;
}

export const BBNotConfigured = ({ 
  title = "BB API Not Configured",
  message = "The BB API connection is not configured. Please configure it in API Settings to access real creator data."
}: BBNotConfiguredProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Card className="max-w-md border-warning/50 bg-warning/5">
        <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-warning" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>
          <Button onClick={() => navigate('/api-settings')} className="gap-2">
            <Settings className="w-4 h-4" />
            Go to API Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
