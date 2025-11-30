import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Check, X, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/useRole';
import { CONTENT_CATEGORIES } from '@/lib/content-categories';

interface ContentCardProps {
  id: string;
  title: string;
  content: string;
  type: string;
  approvalStatus: string;
  shortDescription?: string;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export const ContentCard = ({ id, title, content, type, approvalStatus, shortDescription, onUpdate, onDelete }: ContentCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const { toast } = useToast();
  const { isStaff } = useRole();
  
  const categoryData = CONTENT_CATEGORIES.find((c) => c.id === type);
  const CategoryIcon = categoryData?.icon;

  const handleSave = async () => {
    const { error } = await supabase
      .from('content_items')
      .update({ content: editedContent })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update content', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Content updated' });
      setIsEditing(false);
      onUpdate?.();
    }
  };

  const handleApprove = async () => {
    const { error } = await supabase
      .from('content_items')
      .update({ 
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to approve', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Content approved' });
      onUpdate?.();
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Content deleted' });
      onDelete?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {CategoryIcon && categoryData && (
                <div className="bg-primary/10 p-1 rounded">
                  <CategoryIcon className="w-3 h-3 text-primary" />
                </div>
              )}
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            {shortDescription && (
              <CardDescription className="text-sm">{shortDescription}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1">
            {approvalStatus === 'pending' && (
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                Pending
              </Badge>
            )}
            {approvalStatus === 'approved' && (
              <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/50">
                Approved
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea 
              value={editedContent} 
              onChange={(e) => setEditedContent(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave}>
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
                setEditedContent(content);
                setIsEditing(false);
              }}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{content}</p>
            {isStaff() && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {approvalStatus === 'pending' && (
                  <Button size="sm" onClick={handleApprove}>
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Send className="h-4 w-4 mr-1" />
                  Send to BB
                </Button>
                <Button size="sm" variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
