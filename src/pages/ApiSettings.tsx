import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Key, Eye, EyeOff, Loader2 } from "lucide-react";

const ApiSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [settings, setSettings] = useState({
    bb_api_url: "",
    bb_api_key: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('manage-api-settings', {
        method: 'GET',
      });

      if (error) throw error;

      if (data?.data) {
        setSettings({
          bb_api_url: data.data.bb_api_url || "",
          bb_api_key: data.data.bb_api_key || "",
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load API settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data, error } = await supabase.functions.invoke('manage-api-settings', {
        method: 'POST',
        body: settings,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "API settings saved successfully",
      });
      
      // Reload to get masked key
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save API settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const { data, error } = await supabase.functions.invoke('test-bb-connection');
      
      if (error) {
        toast({
          title: "Connection Failed",
          description: "Failed to test BB API connection",
          variant: "destructive",
        });
        return;
      }

      if (data?.status === 'error') {
        toast({
          title: "Connection Failed",
          description: data.message || "Failed to connect to BB API",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Successful",
          description: "BB API is reachable and responding",
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: "Connection Error",
        description: "Unexpected error testing BB API connection",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <RoleGuard allowedRoles={['admin']} fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need admin privileges to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-2xl shadow-lg">
              <Key className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                API Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Configure BB API credentials for content generation
              </p>
            </div>
          </div>

          {/* Settings Form */}
          <Card className="bg-card/50 backdrop-blur border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                BB API Configuration
              </CardTitle>
              <CardDescription>
                Enter the base URL and API key for BB's external API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {/* BB API URL */}
                  <div className="space-y-2">
                    <Label htmlFor="bb_api_url">BB API Base URL</Label>
                    <Input
                      id="bb_api_url"
                      type="text"
                      placeholder="https://api.example.com"
                      value={settings.bb_api_url}
                      onChange={(e) => setSettings({ ...settings, bb_api_url: e.target.value })}
                      className="bg-background/50"
                    />
                    <p className="text-xs text-muted-foreground">
                      The base URL for BB's API endpoints
                    </p>
                  </div>

                  {/* BB API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="bb_api_key">BB External API Key</Label>
                    <div className="relative">
                      <Input
                        id="bb_api_key"
                        type={showApiKey ? "text" : "password"}
                        placeholder="Enter API key"
                        value={settings.bb_api_key}
                        onChange={(e) => setSettings({ ...settings, bb_api_key: e.target.value })}
                        className="bg-background/50 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your BB API key for authentication
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={testing || !settings.bb_api_url || !settings.bb_api_key}
                    >
                      {testing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Settings"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-accent/10 border-accent/20">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Security Note:</strong> API keys are stored securely in the database and never exposed to the frontend. 
                Only admin users can view and update these settings.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleGuard>
  );
};

export default ApiSettings;