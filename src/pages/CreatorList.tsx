import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Users, Search, Loader2, AlertCircle } from "lucide-react";
import { MOCK_CREATORS } from "@/mocks/mockCreators";
import { useCreatorContext } from "@/hooks/useCreatorContext";

interface Creator {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  onboarding_completed: boolean;
}

const CreatorList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { usingMockData, setUsingMockData } = useCreatorContext();
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-creators', {
        method: 'GET',
      });

      if (error || !data?.success || !data?.data) {
        // Use mock data
        setUsingMockData(true);
        const mockCreators = MOCK_CREATORS.map((mock) => ({
          id: mock.id,
          user_id: mock.id,
          email: mock.email,
          full_name: mock.name,
          avatar_url: mock.avatarUrl,
          onboarding_completed: mock.status === 'completed',
        }));
        setCreators(mockCreators);
      } else {
        // Use real data from BB
        setUsingMockData(false);
        
        // Map BB data to our Creator interface
        const mappedCreators = data.data.map((creator: any) => ({
          id: creator.id,
          user_id: creator.user_id,
          email: creator.email || creator.profiles?.email || 'N/A',
          full_name: creator.full_name || creator.profiles?.full_name || 'Unknown',
          avatar_url: creator.avatar_url || creator.profiles?.avatar_url,
          onboarding_completed: creator.onboarding_completed || creator.profiles?.onboarding_completed || false,
        }));
        
        setCreators(mappedCreators);
      }
    } catch (error) {
      console.error('Error loading creators:', error);
      setUsingMockData(true);
      const mockCreators = MOCK_CREATORS.map((mock) => ({
        id: mock.id,
        user_id: mock.id,
        email: mock.email,
        full_name: mock.name,
        avatar_url: mock.avatarUrl,
        onboarding_completed: mock.status === 'completed',
      }));
      setCreators(mockCreators);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter((creator) => {
    const query = searchQuery.toLowerCase();
    return (
      creator.full_name.toLowerCase().includes(query) ||
      creator.email.toLowerCase().includes(query)
    );
  });

  const handleViewDetails = (creatorId: string) => {
    navigate(`/creators/${creatorId}`);
  };

  return (
    <RoleGuard staffOnly fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">You need staff privileges to view this page.</p>
          </CardContent>
        </Card>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Creators
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage and view all creators from BB platform
                </p>
              </div>
            </div>
          </div>

          {/* Mock Data Warning */}
          {usingMockData && (
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Using mock creator data</strong> – BB API not configured.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search Bar */}
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Creators Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredCreators.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="pt-6 text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No creators found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCreators.map((creator) => (
                <Card 
                  key={creator.id} 
                  className="bg-card/50 backdrop-blur border-border/50 hover:shadow-lg transition-all duration-300 hover:border-primary/50"
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={creator.avatar_url} alt={creator.full_name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          {creator.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{creator.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{creator.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge 
                        variant={creator.onboarding_completed ? "default" : "secondary"}
                        className={creator.onboarding_completed ? "bg-green-500/20 text-green-700 dark:text-green-400" : ""}
                      >
                        {creator.onboarding_completed ? "Completed" : "Incomplete"}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => handleViewDetails(creator.id)}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
};

export default CreatorList;