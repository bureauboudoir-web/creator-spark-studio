import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Eye, AlertCircle, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface StarterPack {
  id: string;
  creator_id: string;
  title: string;
  status: 'draft' | 'final' | 'sent' | 'approved';
  created_at: string;
  updated_at: string;
  creator_name: string;
  creator_email: string;
}

const StarterPackHistory = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [starterPacks, setStarterPacks] = useState<StarterPack[]>([]);
  const [filteredPacks, setFilteredPacks] = useState<StarterPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [bbConfigured, setBbConfigured] = useState<boolean | null>(null);

  const creatorIdFilter = searchParams.get('creator_id');

  useEffect(() => {
    checkBBConfig();
    fetchStarterPacks();
  }, [creatorIdFilter]);

  useEffect(() => {
    // Filter starter packs based on search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredPacks(
        starterPacks.filter(pack =>
          pack.title.toLowerCase().includes(query) ||
          pack.creator_name.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredPacks(starterPacks);
    }
  }, [searchQuery, starterPacks]);

  const checkBBConfig = async () => {
    try {
      const { data } = await supabase
        .from('fastcast_content_settings')
        .select('bb_api_url, bb_api_key')
        .single();
      
      setBbConfigured(!!data?.bb_api_url && !!data?.bb_api_key);
    } catch (error) {
      setBbConfigured(false);
    }
  };

  const fetchStarterPacks = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to view starter packs.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      const url = creatorIdFilter 
        ? `creator_id=${creatorIdFilter}` 
        : '';

      const { data, error } = await supabase.functions.invoke('get-starter-packs', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        ...(url && { body: new URLSearchParams(url) })
      });

      if (error) throw error;

      if (data?.success) {
        setStarterPacks(data.data || []);
        setFilteredPacks(data.data || []);
      } else {
        throw new Error(data?.error || 'Failed to fetch starter packs');
      }
    } catch (error: any) {
      console.error('Error fetching starter packs:', error);
      toast({
        title: 'Failed to Load Starter Packs',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'final':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'sent':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'approved':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <RoleGuard staffOnly fallback={<div>Access denied</div>}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Starter Pack History</h1>
            <p className="text-muted-foreground">Review and manage all generated starter packs</p>
          </div>
        </div>

        {bbConfigured === false && (
          <Card className="bg-amber-500/10 border-amber-500/20 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>BB API not configured</strong> - Starter packs will be saved locally only. Configure BB API in API Settings to enable sync.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>
              {creatorIdFilter ? 'Viewing starter packs for selected creator' : 'Viewing all starter packs'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Search by title or creator name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              {creatorIdFilter && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/starter-packs/history')}
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredPacks.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Starter Packs Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Generate your first starter pack to get started'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPacks.map((pack) => (
                      <TableRow key={pack.id}>
                        <TableCell className="font-medium">{pack.title}</TableCell>
                        <TableCell>{pack.creator_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(pack.status)}>
                            {pack.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(pack.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/starter-packs/${pack.id}`)}
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
};

export default StarterPackHistory;
