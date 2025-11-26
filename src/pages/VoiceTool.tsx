import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Play, Save, Upload } from "lucide-react";

const VoiceTool = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const { toast } = useToast();

  const sampleScript = `
Welcome to this sample voice recording. This script is designed to capture your natural speaking voice and tone. 
Please read this text clearly and at a comfortable pace. Try to speak naturally, as if you're having a conversation 
with a friend. We'll use this recording to analyze your voice characteristics, including tone, pace, and delivery style. 
This will help us create content that matches your unique voice and personality. Take your time, and feel free to 
start over if you need to. When you're ready, press the record button and begin reading.
  `.trim();

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecording(true);
      toast({
        title: "Recording Stopped",
        description: "Your voice sample has been captured.",
      });
    } else {
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Read the script clearly and naturally.",
      });
    }
  };

  const handleSave = () => {
    toast({
      title: "Voice Sample Saved!",
      description: "Your recording has been added to the Creator Library.",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setHasRecording(true);
      toast({
        title: "File Uploaded",
        description: `${e.target.files[0].name} has been loaded.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-primary shadow-glow mb-6">
              <Mic className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Voice Recording Tool
            </h1>
            <p className="text-xl text-muted-foreground">
              Record or upload your voice samples for content generation
            </p>
          </div>

          <div className="grid gap-6">
            {/* Recording Card */}
            <Card className="bg-card border-border/50 shadow-elevated">
              <CardHeader>
                <CardTitle>Record Voice Sample</CardTitle>
                <CardDescription>Follow the script below and record your natural speaking voice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <Button
                      size="lg"
                      onClick={handleRecord}
                      className={`w-32 h-32 rounded-full text-white transition-all ${
                        isRecording 
                          ? "bg-destructive hover:bg-destructive/90 shadow-[0_0_30px_rgba(239,68,68,0.5)]" 
                          : "bg-gradient-primary shadow-glow"
                      }`}
                    >
                      {isRecording ? (
                        <Square className="w-12 h-12" />
                      ) : (
                        <Mic className="w-12 h-12" />
                      )}
                    </Button>
                    {isRecording && (
                      <div className="absolute inset-0 rounded-full border-4 border-destructive animate-ping opacity-75" />
                    )}
                  </div>
                </div>

                {isRecording && (
                  <div className="text-center">
                    <p className="text-lg font-medium text-destructive animate-pulse">Recording in progress...</p>
                  </div>
                )}

                {hasRecording && !isRecording && (
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" size="lg" className="border-border">
                      <Play className="w-5 h-5 mr-2" />
                      Preview
                    </Button>
                    <Button size="lg" className="bg-gradient-primary shadow-glow" onClick={handleSave}>
                      <Save className="w-5 h-5 mr-2" />
                      Save to Library
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Script Card */}
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Sample Script</CardTitle>
                <CardDescription>Read this text clearly at a natural pace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-base leading-relaxed whitespace-pre-line">
                    {sampleScript}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Card */}
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle>Upload Audio File</CardTitle>
                <CardDescription>Or upload an existing voice recording</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    id="audio-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="audio/*"
                  />
                  <label htmlFor="audio-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="font-medium mb-1">Click to upload audio</p>
                    <p className="text-sm text-muted-foreground">MP3, WAV, or M4A up to 50MB</p>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTool;