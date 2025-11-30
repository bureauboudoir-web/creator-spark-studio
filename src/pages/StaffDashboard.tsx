import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, User, CheckCircle, Clock, XCircle } from 'lucide-react';
import { CreatorSelector } from '@/components/staff/CreatorSelector';
import { useCreatorContext } from '@/contexts/CreatorContext';

interface Creator {
  id: string;
  user_id: string;
  id_upload_status: string;
  sample_images: string[] | null;
  profiles: {
    full_name: string | null;
    email: string;
    onboarding_completed: boolean;
  };
}

const StaffDashboard = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    const { data, error } = await supabase
      .from('creators')
      .select(`
        id,
        user_id,
        id_upload_status,
        sample_images,
        profiles!inner(full_name, email, onboarding_completed)
      `)
      .order('profiles(full_name)');

    if (!error && data) {
      setCreators(data as any);
    }
  };

  const filteredCreators = creators.filter(creator =>
    creator.profiles.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.profiles.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'rejected': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-muted-foreground">Manage creators and content</p>
        </div>
        <CreatorSelector />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{creators.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {creators.filter(c => c.id_upload_status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {creators.filter(c => c.profiles.onboarding_completed).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Creators</CardTitle>
          <CardDescription>View and manage creator accounts</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{creator.profiles.full_name || 'No name'}</p>
                    <p className="text-sm text-muted-foreground">{creator.profiles.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {creator.profiles.onboarding_completed ? (
                    <Badge className="bg-green-500/20 text-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-500/20 text-yellow-500">
                      <Clock className="h-3 w-3 mr-1" />
                      In Progress
                    </Badge>
                  )}
                  <Badge className={getStatusColor(creator.id_upload_status)}>
                    {creator.id_upload_status}
                  </Badge>
                  <Badge variant="outline">
                    {creator.sample_images?.length || 0} samples
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDashboard;
