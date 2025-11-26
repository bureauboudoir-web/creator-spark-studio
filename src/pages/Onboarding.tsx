import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, ChevronLeft, Upload, Check } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    persona: "",
    instagram: "",
    tiktok: "",
    twitter: "",
    youtube: "",
    idFile: null as File | null
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    toast({
      title: "Onboarding Complete!",
      description: "Your creator profile has been saved successfully.",
    });
    navigate("/dashboard");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, idFile: e.target.files[0] });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl bg-card border-border/50 shadow-elevated">
        <CardHeader>
          <div className="mb-6">
            <Progress value={progress} className="h-2" />
          </div>
          <CardTitle className="text-3xl">Creator Onboarding</CardTitle>
          <CardDescription>Step {step} of {totalSteps}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xl font-semibold text-primary">Basic Information</h3>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>
          )}

          {/* Step 2: Bio & Persona */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xl font-semibold text-primary">Bio & Persona</h3>
              <div className="space-y-2">
                <Label htmlFor="bio">Creator Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself and your content style..."
                  className="bg-secondary/50 border-border min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="persona">Persona Description</Label>
                <Textarea
                  id="persona"
                  value={formData.persona}
                  onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
                  placeholder="Describe your brand persona and voice..."
                  className="bg-secondary/50 border-border min-h-[120px]"
                />
              </div>
            </div>
          )}

          {/* Step 3: Social Links */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xl font-semibold text-primary">Social Media Links</h3>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="@username or profile URL"
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  value={formData.tiktok}
                  onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })}
                  placeholder="@username or profile URL"
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  placeholder="@username or profile URL"
                  className="bg-secondary/50 border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  placeholder="Channel URL"
                  className="bg-secondary/50 border-border"
                />
              </div>
            </div>
          )}

          {/* Step 4: ID Upload */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h3 className="text-xl font-semibold text-primary">ID Verification (Optional)</h3>
              <p className="text-muted-foreground">Upload a government-issued ID for verification</p>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="id-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
                <label htmlFor="id-upload" className="cursor-pointer">
                  {formData.idFile ? (
                    <div className="flex items-center justify-center gap-2 text-accent">
                      <Check className="w-6 h-6" />
                      <span className="font-medium">{formData.idFile.name}</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="font-medium">Click to upload</p>
                        <p className="text-sm text-muted-foreground">PNG, JPG, or PDF up to 10MB</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              className="border-border"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-gradient-primary shadow-glow"
            >
              {step === totalSteps ? "Complete" : "Next"}
              {step < totalSteps && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;