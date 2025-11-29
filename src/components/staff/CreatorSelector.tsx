import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatorContext } from '@/hooks/useCreatorContext';
import { Users, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BBCreator, BBCreatorResponse } from '@/types/bb-creator';
import { BBApiErrorBanner } from './BBApiErrorBanner';

export const CreatorSelector = () => {
  const [creators, setCreators] = useState<BBCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedCreator, setSelectedCreator, apiError, setApiError } = useCreatorContext();

  useEffect(() => {
    fetchCreatorsFromBB();
  }, []);

  const fetchCreatorsFromBB = async () => {
    try {
      setLoading(true);
      setApiError(null);

      const { data, error } = await supabase.functions.invoke<BBCreatorResponse>(
        'fetch-creators-from-bb'
      );

      if (error) {
        console.error('Error calling fetch-creators-from-bb:', error);
        setApiError('Failed to fetch creators from BB API');
        return;
      }

      if (!data?.success) {
        console.error('BB API error:', data?.error);
        setApiError(data?.error || 'Unknown error occurred');
        return;
      }

      const fetchedCreators = data.data || [];
      setCreators(fetchedCreators);

      // Auto-select first creator if none selected
      if (fetchedCreators.length > 0 && !selectedCreator) {
        setSelectedCreator(fetchedCreators[0]);
      }
    } catch (err) {
      console.error('Unexpected error fetching creators:', err);
      setApiError('Failed to fetch creators. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCreator = (creatorId: string) => {
    const creator = creators.find((c) => c.creator_id === creatorId);
    if (creator) {
      setSelectedCreator(creator);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'active') return 'default';
    if (statusLower === 'pending') return 'secondary';
    return 'outline';
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading creators...</span>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="w-full">
        <BBApiErrorBanner error={apiError} />
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="h-4 w-4" />
        <span className="text-sm">No creators found</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <Select 
        value={selectedCreator?.creator_id || undefined} 
        onValueChange={handleSelectCreator}
      >
        <SelectTrigger className="w-[320px]">
          <SelectValue placeholder="Select creator">
            {selectedCreator && (
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={selectedCreator.profile_photo_url || ''} />
                  <AvatarFallback className="text-xs">
                    {selectedCreator.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{selectedCreator.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {creators.map((creator) => (
            <SelectItem key={creator.creator_id} value={creator.creator_id}>
              <div className="flex items-center gap-3 py-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={creator.profile_photo_url || ''} />
                  <AvatarFallback>
                    {creator.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium truncate">{creator.name}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="truncate">{creator.email}</span>
                    <Badge variant={getStatusColor(creator.creator_status)} className="text-xs">
                      {creator.creator_status}
                    </Badge>
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
