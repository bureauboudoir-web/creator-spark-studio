import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { CreatorSelector } from '@/components/staff/CreatorSelector';
import { useCreatorContext } from '@/hooks/useCreatorContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mic, Play } from 'lucide-react';

const VoiceGenerator = () => {
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState('friendly');
  const [speed, setSpeed] = useState([1.0]);
  const [backgroundSound, setBackgroundSound] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { selectedCreatorId } = useCreatorContext();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!selectedCreatorId) {
      toast({ 
        title: 'Error', 
        description: 'Please select a creator first', 
        variant: 'destructive' 
      });
      return;
    }

    if (!message.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Please enter a message', 
        variant: 'destructive' 
      });
      return;
    }

    setLoading(true);
    
    try {
      // Save voice note to database
      const { data: voiceNote, error } = await supabase
        .from('voice_notes')
        .insert({
          creator_id: selectedCreatorId,
          message,
          tone,
          speed: speed[0],
          background_sound: backgroundSound ? 'enabled' : null,
          generated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({ 
        title: 'Success', 
        description: 'Voice note generated and saved' 
      });
      
      // Reset form
      setMessage('');
      setAudioUrl(null);
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mic className="h-8 w-8" />
            Voice Generator
          </h1>
          <p className="text-muted-foreground">Generate voice notes for creators (Staff Only)</p>
        </div>
        <CreatorSelector />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
            <CardDescription>Configure voice generation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter the message to convert to voice..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="sultry">Sultry</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="speed">Speed: {speed[0].toFixed(1)}x</Label>
              <Slider
                id="speed"
                min={0.5}
                max={2.0}
                step={0.1}
                value={speed}
                onValueChange={setSpeed}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="background">Background Sound</Label>
              <Switch
                id="background"
                checked={backgroundSound}
                onCheckedChange={setBackgroundSound}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              className="w-full"
              disabled={loading || !selectedCreatorId}
            >
              <Mic className="h-4 w-4 mr-2" />
              {loading ? 'Generating...' : 'Generate Voice'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>Listen to the generated voice note</CardDescription>
          </CardHeader>
          <CardContent>
            {audioUrl ? (
              <div className="space-y-4">
                <audio controls className="w-full">
                  <source src={audioUrl} type="audio/mpeg" />
                </audio>
                <Button variant="outline" className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  Save to Library
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground border-2 border-dashed rounded-lg">
                Generate a voice note to preview
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoiceGenerator;
