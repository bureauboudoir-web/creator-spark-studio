import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Package, CheckCircle, Clock, Users, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { BBCreator } from "@/types/bb-creator";

interface DashboardStats {
  creatorsWaitingReview: number;
  creatorsReadyForGeneration: number;
  starterPacksInProgress: number;
  starterPacksCompleted: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { creators, creatorsLoading, refreshAllCreators } = useCreatorContext();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    creatorsWaitingReview: 0,
    creatorsReadyForGeneration: 0,
    starterPacksInProgress: 0,
    starterPacksCompleted: 0,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, [creators]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Use creators from context
      const creatorsWaitingReview = creators.filter((c: BBCreator) => 
        (c.onboarding_completion || 0) > 0 && (c.onboarding_completion || 0) < 100
      ).length;
      const creatorsReadyForGeneration = creators.filter((c: BBCreator) => 
        (c.onboarding_completion || 0) === 100
      ).length;

      // Fetch starter packs stats
      const { data: starterPacks } = await supabase
        .from('starter_packs')
        .select('status');

      const inProgress = starterPacks?.filter(sp => sp.status === 'draft').length || 0;
      const completed = starterPacks?.filter(sp => sp.status === 'completed').length || 0;

      setStats({
        creatorsWaitingReview,
        creatorsReadyForGeneration,
        starterPacksInProgress: inProgress,
        starterPacksCompleted: completed,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Creators Waiting Onboarding Review",
      description: "Creators with incomplete onboarding",
      value: stats.creatorsWaitingReview,
      icon: AlertCircle,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      action: () => navigate("/creators"),
    },
    {
      title: "Creators Ready for Content Generation",
      description: "Fully onboarded creators",
      value: stats.creatorsReadyForGeneration,
      icon: Users,
      iconColor: "text-accent",
      iconBg: "bg-accent/10",
      action: () => navigate("/generator"),
    },
    {
      title: "Starter Packs In Progress",
      description: "Draft starter packs",
      value: stats.starterPacksInProgress,
      icon: Clock,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      action: () => navigate("/starter-packs/history"),
    },
    {
      title: "Completed Starter Packs",
      description: "Successfully generated packs",
      value: stats.starterPacksCompleted,
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-50 dark:bg-green-950",
      action: () => navigate("/starter-packs/history"),
    },
  ];

  return (
    <RoleGuard staffOnly>
      <div className="container mx-auto p-6 space-y-6">
        <PageHeader 
          title="Staff Dashboard"
          subtitle="Onboarding status synced from BB platform"
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => (
              <Card 
                key={index}
                className="hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50"
                onClick={card.action}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg ${card.iconBg}`}>
                      <card.icon className={`w-4 h-4 ${card.iconColor}`} />
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{card.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common staff workflows</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/generator")} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate Starter Pack
            </Button>
            <Button onClick={() => navigate("/library")} variant="outline" className="gap-2">
              View Content Library
            </Button>
            <Button onClick={() => navigate("/starter-packs/history")} variant="outline" className="gap-2">
              <Package className="w-4 h-4" />
              View All Starter Packs
            </Button>
            <Button onClick={() => navigate("/creators")} variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Manage Creators
            </Button>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
