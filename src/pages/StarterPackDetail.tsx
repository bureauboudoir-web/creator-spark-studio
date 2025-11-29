import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, CheckCircle, Send, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RoleGuard } from '@/components/auth/RoleGuard';

interface StarterPackData {
  profileBio: string;
  contentThemes: string[];
  weeklyPlan: Array<{ day: string; content: string }>;
  ppvIdeas: string[];
  hookIdeas: string[];
  doRules: string[];
  dontRules: string[];
  textScripts: Array<{ type: string; script: string }>;
}

interface StarterPack {
  id: string;
  creator_id: string;
  title: string;
  status: 'draft' | 'final' | 'sent' | 'approved';
  created_at: string;
  updated_at: string;
  generated_data: StarterPackData;
  creator_name: string;
  creator_email: string;
}

const StarterPackDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [starterPack, setStarterPack] = useState<StarterPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sending, setSending] = useState(false);
  const [bbConfigured, setBbConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    checkBBConfig();
    fetchStarterPack();
  }, [id]);

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

  const fetchStarterPack = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to view this starter pack.',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('get-starter-packs', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: new URLSearchParams({ id: id || '' })
      });

      if (error) throw error;

      if (data?.success && data.data) {
        setStarterPack(data.data);
      } else {
        throw new Error(data?.error || 'Starter pack not found');
      }
    } catch (error: any) {
      console.error('Error fetching starter pack:', error);
      toast({
        title: 'Failed to Load Starter Pack',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: 'final' | 'approved') => {
    if (!starterPack) return;

    setUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase.functions.invoke('update-starter-pack-status', {
        body: {
          starter_pack_id: starterPack.id,
          new_status: newStatus,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setStarterPack(prev => prev ? { ...prev, status: newStatus } : null);
        toast({
          title: 'Status Updated',
          description: data.message,
        });
      } else {
        throw new Error(data?.error || 'Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSendToBB = async () => {
    if (!starterPack) return;

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Authentication required');
      }

      const { data, error } = await supabase.functions.invoke('save-starter-pack', {
        body: {
          creator_id: starterPack.creator_id,
          title: starterPack.title,
          data: starterPack.generated_data,
          send_to_bb: true,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.success) {
        if (data.bb_sync) {
          setStarterPack(prev => prev ? { ...prev, status: 'sent' } : null);
          toast({
            title: 'Sent to BB',
            description: 'Starter pack has been synced to BB successfully.',
          });
        } else {
          toast({
            title: 'Saved Locally Only',
            description: data.message || 'BB API not configured. Saved locally.',
          });
        }
      } else {
        throw new Error(data?.error || 'Failed to send to BB');
      }
    } catch (error: any) {
      console.error('Error sending to BB:', error);
      toast({
        title: 'Sync Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!starterPack) {
    return (
      <RoleGuard staffOnly fallback={<div>Access denied</div>}>
        <div className="container mx-auto py-8 px-4">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Starter pack not found</strong> - The requested starter pack could not be loaded.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/starter-packs/history')}
                className="mt-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to History
              </Button>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    );
  }

  const data = starterPack.generated_data;

  return (
    <RoleGuard staffOnly fallback={<div>Access denied</div>}>
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/starter-packs/history')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </Button>
          <Badge variant="outline" className={getStatusColor(starterPack.status)}>
            Status: {starterPack.status}
          </Badge>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{starterPack.title}</CardTitle>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Creator: {starterPack.creator_name}</p>
              <p>Created: {formatDate(starterPack.created_at)}</p>
              <p>Last Updated: {formatDate(starterPack.updated_at)}</p>
            </div>
          </CardHeader>
        </Card>

        {bbConfigured === false && (
          <Card className="bg-amber-500/10 border-amber-500/20 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>BB API not configured</strong> - Configure BB API in API Settings to enable sync.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{data.profileBio}</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Content Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.contentThemes.map((theme, index) => (
                <Badge key={index} variant="secondary">
                  {theme}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Weekly Content Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {data.weeklyPlan.map((plan, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold mb-2">{plan.day}</h4>
                  <p className="text-sm text-muted-foreground">{plan.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>PPV Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.ppvIdeas.map((idea, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Hook Ideas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.hookIdeas.map((hook, index) => (
                <div key={index} className="p-4 border-l-4 border-primary bg-muted rounded">
                  <p className="italic">"{hook}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Content Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-500" />
                  Do
                </h4>
                <ul className="space-y-2">
                  {data.doRules.map((rule, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5 text-red-500" />
                  Don't
                </h4>
                <ul className="space-y-2">
                  {data.dontRules.map((rule, index) => (
                    <li key={index} className="flex gap-2 text-sm">
                      <span className="text-red-500">✗</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Text Scripts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.textScripts.map((script, index) => (
                <div key={index} className="p-4 rounded-lg bg-muted">
                  <h4 className="font-semibold mb-2">{script.type}</h4>
                  <p className="text-sm whitespace-pre-wrap">{script.script}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Review Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => updateStatus('final')}
                disabled={updating || starterPack.status === 'final'}
                className="gap-2"
                variant="outline"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Mark as Reviewed
              </Button>
              <Button
                onClick={() => updateStatus('approved')}
                disabled={updating || starterPack.status === 'approved'}
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve
              </Button>
              <Button
                onClick={handleSendToBB}
                disabled={sending}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send to BB
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
};

export default StarterPackDetail;
