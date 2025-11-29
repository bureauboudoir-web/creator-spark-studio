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
import { Users } from 'lucide-react';

interface Creator {
  id: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

export const CreatorSelector = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const { selectedCreatorId, setSelectedCreatorId } = useCreatorContext();

  useEffect(() => {
    const fetchCreators = async () => {
      const { data, error } = await supabase
        .from('creators')
        .select('id, user_id, profiles!inner(full_name, email)');

      if (error) {
        console.error('Error fetching creators:', error);
        return;
      }

      if (data) {
        // Sort client-side by full_name or email
        const sortedCreators = [...data].sort((a, b) => 
          (a.profiles.full_name || a.profiles.email).localeCompare(
            b.profiles.full_name || b.profiles.email
          )
        );
        
        setCreators(sortedCreators as any);
        if (sortedCreators.length > 0 && !selectedCreatorId) {
          setSelectedCreatorId(sortedCreators[0].id);
        }
      }
    };

    fetchCreators();
  }, [selectedCreatorId, setSelectedCreatorId]);

  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedCreatorId || undefined} onValueChange={setSelectedCreatorId}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select creator" />
        </SelectTrigger>
        <SelectContent>
          {creators.map((creator) => (
            <SelectItem key={creator.id} value={creator.id}>
              {creator.profiles.full_name || creator.profiles.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
