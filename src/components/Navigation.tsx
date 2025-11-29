import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { Home, Library, Sparkles, User, Settings, Users, LogOut, Key } from "lucide-react";
import { LanguageSelector } from "./layout/LanguageSelector";
import { RoleGuard } from "./auth/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { CreatorSelector } from "./staff/CreatorSelector";
import { useCreatorContext } from "@/hooks/useCreatorContext";

export const Navigation = () => {
  const { signOut, user } = useAuth();
  const { isStaff } = useRole();
  const navigate = useNavigate();
  const { selectedCreatorId } = useCreatorContext();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: Home, roles: null },
    { to: "/library", label: "Library", icon: Library, roles: null },
    { to: "/generator", label: "Generator", icon: Sparkles, roles: null },
    { to: "/staff", label: "Staff", icon: Users, staffOnly: true },
    { to: "/admin", label: "Admin", icon: Settings, staffOnly: true },
    { to: "/creators", label: "Creators", icon: Users, staffOnly: true },
    { to: "/api-settings", label: "API Settings", icon: Key, roles: ['admin'] },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center">
              <span className="text-white font-bold text-xl">BB</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Content Generator
            </span>
            
            <RoleGuard staffOnly>
              <div className="ml-4">
                <CreatorSelector />
              </div>
            </RoleGuard>
          </div>
          
          <div className="flex items-center gap-1">
            {links.map((link) => {
              if (link.staffOnly) {
                return (
                  <RoleGuard key={link.to} staffOnly>
                    <NavLink
                      to={link.to}
                      className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all flex items-center gap-2"
                      activeClassName="text-foreground bg-secondary/80 font-medium"
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </NavLink>
                  </RoleGuard>
                );
              }
              
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all flex items-center gap-2"
                  activeClassName="text-foreground bg-secondary/80 font-medium"
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
            
            <LanguageSelector />
            
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};