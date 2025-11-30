import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { Key, Eye, EyeOff, Loader2, Bug } from "lucide-react";
import { Switch } from "@/components/ui/switch";

// Sanitize API key: only trim whitespace, preserve all characters
const sanitizeApiKey = (key: string): string => {
  if (!key) return '';
  return key.trim();
};

// Sanitize URL: trim whitespace, remove invisible chars, fix double slashes
const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  // Remove non-ASCII characters except valid URL characters
  let cleaned = url.replace(/[^\x20-\x7E]/g, '');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  // Fix double slashes (except after protocol)
  cleaned = cleaned.replace(/([^:])\/\//g, '$1/');
  
  return cleaned;
};

const ApiSettings = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { refreshMockModeFromDB, setUsingMockData } = useCreatorContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [debugging, setDebugging] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Separate API key handling - never store masked value in state
  const [hasApiKey, setHasApiKey] = useState(false);      // Whether DB has a key
  const [apiKeyInput, setApiKeyInput] = useState("");     // Real user input
  const [apiKeyModified, setApiKeyModified] = useState(false);  // User changed it
  
  const [settings, setSettings] = useState({
    bb_api_url: "",
    mock_mode: true,
  });

  useEffect(() => {
    // Only load settings after auth is complete and user is authenticated
    if (!authLoading && user) {
      loadSettings();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user]);

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
          mock_mode: data.data.mock_mode ?? true,
        });
        
        // Track if API key exists in DB (check for masked placeholder)
        const keyExists = data.data.bb_api_key === '••••••••';
        setHasApiKey(keyExists);
        console.log('✅ API key exists in DB:', keyExists);
        
        // Clear the input field - don't show masked value
        setApiKeyInput("");
        setApiKeyModified(false);
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
      
      // Build payload with sanitized URL
      const payload: Record<string, any> = {
        bb_api_url: sanitizeUrl(settings.bb_api_url),
        mock_mode: settings.mock_mode,
      };
      
      // Only include API key if user entered a new one
      if (apiKeyModified && apiKeyInput.trim()) {
        payload.bb_api_key = apiKeyInput.trim();
        console.log('✅ Saving new API key:', `${apiKeyInput.trim().length} chars`);
      } else {
        console.log('⏭️ Not updating API key (unchanged)');
      }
      
      // Debug logging
      console.log('💾 Saving settings:', {
        bb_api_url: payload.bb_api_url,
        bb_api_key: payload.bb_api_key !== undefined ? `[KEY PROVIDED - ${payload.bb_api_key.length} chars]` : '[NOT INCLUDED]',
        mock_mode: payload.mock_mode,
        hasApiKey,
        apiKeyModified,
      });
      
      const { data, error } = await supabase.functions.invoke('manage-api-settings', {
        method: 'POST',
        body: payload,
      });

      if (error) throw error;

      console.log('✅ Save response:', data);

      toast({
        title: "Success",
        description: "API settings saved successfully",
      });
      
      // Update global mock mode state immediately
      setUsingMockData(settings.mock_mode);
      console.log('Global mockMode updated:', settings.mock_mode);
      
      // After successful save, update hasApiKey if we saved a new one
      if (apiKeyModified && apiKeyInput.trim()) {
        setHasApiKey(true);
      }
      
      // Reset input state
      setApiKeyInput("");
      setApiKeyModified(false);
      
      // Refresh from DB to ensure consistency and trigger CreatorSelector refresh
      await refreshMockModeFromDB();
      
      // Reload to get latest values
      await loadSettings();
    } catch (error) {
      console.error('❌ Error saving settings:', error);
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

  const handleDebugBBAPI = async () => {
    setDebugging(true);
    console.group('🔧 BB API Debug Tests');
    console.log('Starting BB API configuration tests at:', new Date().toISOString());
    
    try {
      // ===== TEST A: Log current settings from the database =====
      console.group('📋 Test A: Loading Settings from Database');
      const { data: settingsResponse, error: settingsError } = await supabase.functions.invoke('manage-api-settings', {
        method: 'GET',
      });
      
      if (settingsError) {
        console.error('❌ Failed to load settings:', settingsError);
      } else {
        console.log('✅ Settings loaded successfully:');
        console.table({
          bb_api_url: settingsResponse?.data?.bb_api_url || '(not set)',
          bb_api_key: settingsResponse?.data?.bb_api_key || '(not set)',
          mock_mode: settingsResponse?.data?.mock_mode,
        });
      }
      console.groupEnd();
      
      // ===== TEST B: Validate URL format (trailing slash check) =====
      console.group('🔗 Test B: URL Validation');
      const currentUrl = settings.bb_api_url;
      if (!currentUrl) {
        console.warn('⚠️ WARNING: bb_api_url is empty or not set');
      } else if (!currentUrl.endsWith('/')) {
        console.warn('⚠️ WARNING: bb_api_url does NOT end with a trailing slash');
        console.warn('   Current URL:', currentUrl);
        console.warn('   Recommended:', currentUrl + '/');
      } else {
        console.log('✅ bb_api_url ends with trailing slash:', currentUrl);
      }
      console.groupEnd();
      
      // ===== TEST C: Test via edge function =====
      console.group('🌐 Test C: Test BB Connection via Edge Function');
      if (!settings.bb_api_url) {
        console.warn('⚠️ Skipping API test - URL not configured');
      } else if (!hasApiKey && !apiKeyInput) {
        console.warn('⚠️ No API key configured or entered');
        console.log('📤 Testing via edge function (uses DB-stored key)...');
        
        try {
          const { data: testResult, error: testError } = await supabase.functions.invoke('test-bb-connection');
          
          if (testError) {
            console.error('❌ Edge function error:', testError);
          } else {
            console.log('📥 Edge function result:', testResult);
            
            if (testResult?.status === 'ok') {
              console.log('🎉 BB API is live and Content Generator is now connected!');
            }
          }
        } catch (edgeFunctionError) {
          console.error('❌ Edge function call failed:', edgeFunctionError);
        }
      } else if (apiKeyModified && apiKeyInput) {
        // User entered a new key - test with it directly
        console.log('📤 Testing with newly entered key...');
        const rawKey = apiKeyInput.trim();
        const sanitizedUrl = sanitizeUrl(settings.bb_api_url);
        
        const baseUrl = sanitizedUrl.endsWith('/') 
          ? sanitizedUrl 
          : sanitizedUrl + '/';
        const statusEndpoint = `${baseUrl}external-api-status`;
        
        console.log('📤 Request URL:', statusEndpoint);
        console.log('📤 Sanitized URL:', sanitizedUrl);
        console.log('📤 API Key length:', rawKey.length);
        console.log('📤 Authorization: Bearer [API_KEY]');
        
        try {
          const response = await fetch(statusEndpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${rawKey}`,
              'Content-Type': 'application/json',
            },
          });
          
          // ===== TEST D: Print full response =====
          console.group('📥 Test D: Full Response');
          console.log('Status Code:', response.status);
          console.log('Status Text:', response.statusText);
          console.log('Headers:', Object.fromEntries(response.headers.entries()));
          
          const responseText = await response.text();
          try {
            const responseJson = JSON.parse(responseText);
            console.log('✅ Response Body (JSON):', responseJson);
            
            if (response.status === 200) {
              console.log('🎉 BB API is live and Content Generator is now connected!');
            }
          } catch {
            console.log('📄 Response Body (Text):', responseText);
          }
          console.groupEnd();
          
        } catch (fetchError) {
          console.error('❌ Fetch Error:', fetchError);
          console.error('   This could be due to CORS, network issues, or invalid URL');
        }
      } else {
        // Key exists in DB, use edge function
        console.log('📤 Testing via edge function (DB-stored key)...');
        
        try {
          const { data: testResult, error: testError } = await supabase.functions.invoke('test-bb-connection');
          
          if (testError) {
            console.error('❌ Edge function error:', testError);
          } else {
            console.log('📥 Edge function result:', testResult);
            
            if (testResult?.status === 'ok') {
              console.log('🎉 BB API is live and Content Generator is now connected!');
            }
          }
        } catch (edgeFunctionError) {
          console.error('❌ Edge function call failed:', edgeFunctionError);
        }
      }
      console.groupEnd();
      
      // ===== TEST E: Test save function =====
      console.group('💾 Test E: Save Settings Test');
      
      // Log API key state
      console.log('hasApiKey (from DB):', hasApiKey);
      console.log('apiKeyInput (user entered):', apiKeyInput ? `${apiKeyInput.length} chars` : '(empty)');
      console.log('apiKeyModified:', apiKeyModified);
      console.log('Will save new key:', apiKeyModified && apiKeyInput.trim().length > 0);
      
      const testSettings = {
        ...settings,
        mock_mode: !settings.mock_mode, // Toggle mock_mode
      };
      console.log('📤 Attempting to save with mock_mode toggled to:', testSettings.mock_mode);
      
      const { data: saveResponse, error: saveError } = await supabase.functions.invoke('manage-api-settings', {
        method: 'POST',
        body: testSettings,
      });
      
      if (saveError) {
        console.error('❌ Save failed:', saveError);
      } else {
        console.log('✅ Save successful:', saveResponse);
      }
      
      // Restore original mock_mode
      console.log('🔄 Restoring original mock_mode to:', settings.mock_mode);
      const { data: restoreResponse, error: restoreError } = await supabase.functions.invoke('manage-api-settings', {
        method: 'POST',
        body: settings,
      });
      
      if (restoreError) {
        console.error('❌ Restore failed:', restoreError);
      } else {
        console.log('✅ Settings restored to original values');
      }
      console.groupEnd();
      
    } catch (error) {
      console.error('💥 Unexpected error during debug tests:', error);
    } finally {
      console.log('Debug tests completed at:', new Date().toISOString());
      console.groupEnd();
      setDebugging(false);
      
      toast({
        title: "Debug Tests Complete",
        description: "Check browser console (F12) for detailed results",
      });
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
                        placeholder={hasApiKey ? "••••••••••••••••••••" : "Enter API key"}
                        value={apiKeyInput}
                        onChange={(e) => {
                          setApiKeyInput(e.target.value);
                          setApiKeyModified(true);
                        }}
                        className="bg-background/50 pr-10"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        data-form-type="other"
                        data-lpignore="true"
                        data-1p-ignore="true"
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
                      {hasApiKey && !apiKeyModified ? (
                        <span className="text-green-600">✓ API key is configured (enter new value to replace)</span>
                      ) : apiKeyModified && apiKeyInput ? (
                        <span className="text-amber-600">⚠ New key entered ({apiKeyInput.length} chars) - will be saved on submit</span>
                      ) : (
                        'Your BB API key for authentication'
                      )}
                    </p>
                  </div>

                  {/* Mock Mode Toggle */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="space-y-0.5">
                      <Label htmlFor="mock_mode">Mock Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        When enabled, uses mock creator data instead of live BB API
                      </p>
                    </div>
                    <Switch
                      id="mock_mode"
                      checked={settings.mock_mode}
                      onCheckedChange={(checked) => setSettings({ ...settings, mock_mode: checked })}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={handleTestConnection}
                      disabled={testing || !settings.bb_api_url || (!hasApiKey && !apiKeyInput)}
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

          {/* Debug Tools Card - Temporary for testing */}
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-600">
                <Bug className="w-5 h-5" />
                Debug Tools (Admin Only)
              </CardTitle>
              <CardDescription>
                Temporary debugging tools for BB API configuration testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={handleDebugBBAPI}
                disabled={debugging}
                className="border-amber-500 text-amber-600 hover:bg-amber-500/10"
              >
                {debugging ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Debug Tests...
                  </>
                ) : (
                  <>
                    <Bug className="w-4 h-4 mr-2" />
                    Debug BB API
                  </>
                )}
              </Button>
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