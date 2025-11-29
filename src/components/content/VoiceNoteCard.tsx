import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/useRole';

interface VoiceNoteCardProps {
  id: string;
  message: string;
  tone?: string;
  speed?: number;
  audioUrl?: string;
  createdAt: string;
  onDelete?: () => void;
}

export const VoiceNoteCard = ({ id, message, tone, speed, audioUrl, createdAt, onDelete }: VoiceNoteCardProps) => {
  const { toast } = useToast();
  const { isStaff } = useRole();

  const handleDelete = async () => {
    const { error } = await supabase
      .from('voice_notes')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Voice note deleted' });
      onDelete?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Voice Note</CardTitle>
        <CardDescription>
          {new Date(createdAt).toLocaleDateString()} • {tone || 'Default'} • {speed || 1.0}x
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{message}</p>
        {audioUrl && (
          <audio controls className="w-full mb-4">
            <source src={audioUrl} type="audio/mpeg" />
          </audio>
        )}
        <div className="flex gap-2">
          {audioUrl && (
            <Button size="sm" variant="outline">
              <Play className="h-4 w-4 mr-1" />
              Preview
            </Button>
          )}
          <Button size="sm" variant="outline">
            <Send className="h-4 w-4 mr-1" />
            Send to BB
          </Button>
          {isStaff() && (
            <Button size="sm" variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
