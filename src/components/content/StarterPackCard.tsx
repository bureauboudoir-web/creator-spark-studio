import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StarterPackCardProps {
  status: string;
  captions: number;
  scripts: number;
  chatMessages: number;
  reels: number;
  createdAt: string;
  onApprove?: () => void;
  onView?: () => void;
}

export const StarterPackCard = ({ 
  status, 
  captions, 
  scripts, 
  chatMessages, 
  reels, 
  createdAt,
  onApprove,
  onView
}: StarterPackCardProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Starter Pack</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={status === 'approved' ? 'default' : 'secondary'}>
              {status}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Generated on {new Date(createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Captions</p>
            <p className="text-2xl font-bold">{captions}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Scripts</p>
            <p className="text-2xl font-bold">{scripts}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Chat Messages</p>
            <p className="text-2xl font-bold">{chatMessages}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reel Ideas</p>
            <p className="text-2xl font-bold">{reels}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onView}>
            View Details
          </Button>
          {status === 'draft' && onApprove && (
            <Button size="sm" variant="outline" onClick={onApprove}>
              Approve Pack
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
