import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Search } from "lucide-react";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { BBCreator } from "@/types/bb-creator";
import { useToast } from "@/hooks/use-toast";
import { CreatorChip } from "./CreatorChip";

export const CreatorSelectorPopover = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    creators,
    creatorsLoading,
    selectedCreator, 
    setSelectedCreator,
    refreshAllCreators 
  } = useCreatorContext();
  const { toast } = useToast();

  useEffect(() => {
    if (open && creators.length === 0 && !creatorsLoading) {
      refreshAllCreators();
    }
  }, [open]);

  const filteredCreators = creators.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="p-3 border-b space-y-2">
          <h4 className="font-semibold">Select Creator</h4>
          <p className="text-xs text-muted-foreground">
            Choose a creator to manage their content
          </p>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          {creatorsLoading ? (
            <div className="p-2 space-y-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-md">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {searchQuery ? 'No creators match your search' : 'No creators found'}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredCreators.map((creator) => (
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
                        {creator.name?.charAt(0)?.toUpperCase() || "?"}
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
