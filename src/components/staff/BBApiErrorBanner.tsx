import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BBApiErrorBannerProps {
  error: string;
}

export const BBApiErrorBanner = ({ error }: BBApiErrorBannerProps) => {
  const navigate = useNavigate();

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/api-settings')}
          className="ml-4"
        >
          Go to Settings
        </Button>
      </AlertDescription>
    </Alert>
  );
};
