import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "./AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "./ui/sidebar";
import { Badge } from "./ui/badge";
import { useCreatorContext } from "@/contexts/CreatorContext";
import { useRole } from "@/hooks/useRole";

export const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const { usingMockData } = useCreatorContext();
  const { isStaff } = useRole();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2 ml-auto">
              {isStaff && (
                <Badge 
                  variant={usingMockData ? "outline" : "default"}
                  className={usingMockData 
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700" 
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700"
                  }
                >
                  {usingMockData ? "Mock Mode" : "Connected to BB"}
                </Badge>
              )}
            </div>
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};