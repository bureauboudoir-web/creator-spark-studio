import { CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getOnboardingSteps } from "@/types/onboarding-checklist";

interface OnboardingChecklistProps {
  stepsCompleted: number[];
  completionPercentage: number;
}

export const OnboardingChecklist = ({ stepsCompleted, completionPercentage }: OnboardingChecklistProps) => {
  const sections = getOnboardingSteps(stepsCompleted);
  const missingSections = sections.filter(s => !s.completed);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Onboarding Checklist</CardTitle>
          <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
            {completionPercentage}% Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{stepsCompleted.length} of {sections.length}</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Required Sections:</p>
          <div className="space-y-2">
            {sections.map((section) => (
              <div
                key={section.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  section.completed
                    ? 'bg-primary/5 border-primary/20'
                    : 'bg-muted/30 border-muted'
                }`}
              >
                {section.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${section.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {section.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {missingSections.length > 0 && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm text-warning-foreground font-medium mb-1">
              ⚠️ Missing Information
            </p>
            <p className="text-xs text-muted-foreground">
              {missingSections.length} section{missingSections.length !== 1 ? 's' : ''} must be completed in BB before generating content.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
