import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check } from "lucide-react";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { supabase } from "@/integrations/supabase/client";
import { BBCreator } from "@/types/bb-creator";
import { useToast } from "@/hooks/use-toast";
import { CreatorChip } from "./CreatorChip";

export const CreatorSelectorPopover = () => {
  const [open, setOpen] = useState(false);
  const [creators, setCreators] = useState<BBCreator[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedCreator, setSelectedCreator, usingMockData } = useCreatorContext();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchCreators();
    }
  }, [open, usingMockData]);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-creators');
      
      if (error) throw error;
      
      if (data?.data) {
        setCreators(data.data);
      }
    } catch (error) {
      console.error('Error fetching creators:', error);
      toast({
        title: "Error",
        description: "Failed to load creators",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (creator: BBCreator) => {
    setSelectedCreator(creator);
    setOpen(false);
    toast({
      title: "Creator Selected",
      description: `Now viewing ${creator.name}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <CreatorChip onClick={() => setOpen(true)} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-popover" align="end">
        <div className="p-3 border-b">
          <h4 className="font-semibold">Select Creator</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Choose a creator to manage their content
          </p>
        </div>
        <ScrollArea className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : creators.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No creators found
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {creators.map((creator) => (
                <Button
                  key={creator.creator_id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => handleSelect(creator)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={creator.profile_photo_url || undefined} />
                      <AvatarFallback>
                        {creator.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{creator.name}</p>
                        {selectedCreator?.creator_id === creator.creator_id && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {creator.email}
                      </p>
                    </div>
                    <Badge 
                      variant="outline"
                      className={getStatusColor(creator.creator_status)}
                    >
                      {creator.creator_status}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
