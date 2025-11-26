import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Mail, Eye, Send, Users } from "lucide-react";

interface Creator {
  id: string;
  name: string;
  email: string;
  status: "pending" | "approved" | "info_requested";
  onboardingComplete: boolean;
  contentCount: number;
  joinedDate: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [creators] = useState<Creator[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      status: "pending",
      onboardingComplete: true,
      contentCount: 24,
      joinedDate: "2024-01-15"
    },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike@example.com",
      status: "approved",
      onboardingComplete: true,
      contentCount: 45,
      joinedDate: "2024-01-10"
    },
    {
      id: "3",
      name: "Emma Davis",
      email: "emma@example.com",
      status: "info_requested",
      onboardingComplete: false,
      contentCount: 8,
      joinedDate: "2024-01-18"
    },
  ]);

  const handleApprove = (creatorId: string, creatorName: string) => {
    toast({
      title: "Creator Approved",
      description: `${creatorName} has been approved and notified.`,
    });
  };

  const handleRequestInfo = (creatorId: string, creatorName: string) => {
    toast({
      title: "Information Requested",
      description: `Email sent to ${creatorName} requesting additional information.`,
    });
  };

  const handleSendToBB = (creatorId: string, creatorName: string) => {
    toast({
      title: "Synced to BB Platform",
      description: `${creatorName}'s content has been sent to the main system.`,
    });
  };

  const getStatusBadge = (status: Creator["status"]) => {
    const variants = {
      pending: "bg-accent/20 text-accent border-accent/30",
      approved: "bg-primary/20 text-primary border-primary/30",
      info_requested: "bg-muted text-muted-foreground border-border"
    };

    const labels = {
      pending: "Pending Review",
      approved: "Approved",
      info_requested: "Info Requested"
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-accent shadow-accent mb-6">
            <Users className="w-12 h-12 text-accent-foreground" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Manage creator onboarding and content approval
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Creators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{creators.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {creators.filter(c => c.status === "pending").length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {creators.filter(c => c.status === "approved").length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {creators.reduce((sum, c) => sum + c.contentCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Creator List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6">Creator Management</h2>
          {creators.map((creator) => (
            <Card key={creator.id} className="bg-card border-border/50 hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{creator.name}</CardTitle>
                      {getStatusBadge(creator.status)}
                    </div>
                    <CardDescription className="flex items-center gap-4">
                      <span>{creator.email}</span>
                      <span>•</span>
                      <span>{creator.contentCount} content items</span>
                      <span>•</span>
                      <span>Joined {creator.joinedDate}</span>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {creator.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border"
                          onClick={() => handleRequestInfo(creator.id, creator.name)}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Request Info
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-primary shadow-glow"
                          onClick={() => handleApprove(creator.id, creator.name)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </>
                    )}
                    {creator.status === "approved" && (
                      <Button
                        size="sm"
                        className="bg-gradient-accent text-accent-foreground shadow-accent"
                        onClick={() => handleSendToBB(creator.id, creator.name)}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Send to BB
                      </Button>
                    )}
                    {creator.status === "info_requested" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-muted-foreground"
                        disabled
                      >
                        <Mail className="w-4 h-4 mr-1" />
                        Awaiting Response
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;