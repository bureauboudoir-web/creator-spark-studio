import { Home, Library, Sparkles, Users, Settings, Key, Package, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { RoleGuard } from "./auth/RoleGuard";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { CreatorSelector } from "./staff/CreatorSelector";
import { LanguageSelector } from "./layout/LanguageSelector";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/generator", label: "Generator", icon: Sparkles },
  { to: "/starter-packs/history", label: "Starter Packs", icon: Package },
  { to: "/library", label: "Library", icon: Library },
];

const staffNavItems = [
  { to: "/creators", label: "Creators", icon: Users },
  { to: "/staff", label: "Staff", icon: Users },
  { to: "/admin", label: "Admin", icon: Settings },
  { to: "/api-settings", label: "API Settings", icon: Key },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { isStaff } = useRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xl">BB</span>
          </div>
          {open && (
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Content Generator
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)}>
                    <NavLink to={item.to}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <RoleGuard staffOnly>
          <SidebarGroup>
            <SidebarGroupLabel>Staff</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {staffNavItems.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive(item.to)}>
                      <NavLink to={item.to}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </RoleGuard>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-2">
              <LanguageSelector />
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
