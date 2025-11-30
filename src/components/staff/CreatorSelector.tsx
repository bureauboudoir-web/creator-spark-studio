import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useCreatorContext } from '@/contexts/CreatorContext';
import { Users, Loader2, CheckCircle, AlertCircle, Zap, Database, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export const CreatorSelector = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const { toast } = useToast();
  const { 
    creators,
    creatorsLoading,
    creatorsError,
    selectedCreator, 
    setSelectedCreator, 
    usingMockData,
    bbApiStatus,
    setBbApiStatus,
    refreshAllCreators,
  } = useCreatorContext();

  // Filter creators by search query
  const filteredCreators = creators.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-bb-connection');
      
      if (error) {
        setBbApiStatus('CONNECTION_ERROR');
        toast({
          title: "Connection Failed",
          description: "Failed to test BB API connection",
          variant: "destructive",
        });
        return;
      }

      if (data?.status === 'error') {
        setBbApiStatus(data.statusType);
        toast({
          title: "Connection Failed",
          description: data.message || "Failed to connect to BB API",
          variant: "destructive",
        });
      } else {
        setBbApiStatus('CONNECTED');
        toast({
          title: "Connection Successful",
          description: "BB API is reachable and responding",
        });
        // Refresh creators list
        await refreshAllCreators();
      }
    } catch (err) {
      console.error('Error testing connection:', err);
      setBbApiStatus('CONNECTION_ERROR');
      toast({
        title: "Connection Error",
        description: "Unexpected error testing BB API connection",
        variant: "destructive",
      });
    } finally {
      setTestingConnection(false);
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

  if (creatorsLoading) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading creators...</span>
      </div>
    );
  }

  if (creatorsError && !usingMockData) {
    return (
      <div className="w-full space-y-3">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{creatorsError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAllCreators}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (creators.length === 0 && !creatorsLoading) {
    return (
      <div className="space-y-3">
        <Alert className="bg-muted/50">
          <Users className="h-4 w-4" />
          <AlertDescription>
            No creators found. {!usingMockData && 'Make sure the BB API is configured correctly.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Warning banner when API not configured */}
      {(bbApiStatus === 'MISSING_API_URL' || bbApiStatus === 'MISSING_API_KEY') && !usingMockData && (
        <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            BB API is not configured.{' '}
            <Link to="/api-settings" className="underline hover:text-amber-900 dark:hover:text-amber-100">
              Go to API Settings
            </Link>{' '}
            to enable.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Users className="h-4 w-4 text-muted-foreground" />
        
        {/* Creator Selector with Search */}
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
                      {selectedCreator.name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{selectedCreator.name}</span>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 pb-2">
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
            {filteredCreators.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No creators found
              </div>
            ) : (
              filteredCreators.map((creator) => (
                <SelectItem key={creator.creator_id} value={creator.creator_id}>
                  <div className="flex items-center gap-3 py-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={creator.profile_photo_url || ''} />
                      <AvatarFallback>
                        {creator.name?.charAt(0)?.toUpperCase() || '?'}
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
              ))
            )}
          </SelectContent>
        </Select>

        {/* BB API Status Badge */}
        {usingMockData ? (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-200 border-amber-300 dark:border-amber-800">
            <Database className="w-3 h-3 mr-1" />
            Using Mock Data
          </Badge>
        ) : bbApiStatus === 'CONNECTED' ? (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-200 border-green-300 dark:border-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            BB Connected
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-200 border-red-300 dark:border-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            {bbApiStatus === 'MISSING_API_URL' || bbApiStatus === 'MISSING_API_KEY' 
              ? 'Not Configured' 
              : 'Connection Error'}
          </Badge>
        )}

        {/* Test Connection Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleTestConnection}
          disabled={testingConnection || usingMockData}
          className="gap-1"
        >
          {testingConnection ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          Test Connection
        </Button>
      </div>
    </div>
  );
};
