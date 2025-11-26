import { NavLink } from "./NavLink";
import { cn } from "@/lib/utils";
import { Home, Library, Sparkles, Mic, User, Settings } from "lucide-react";

export const Navigation = () => {
  const links = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/library", label: "Library", icon: Library },
    { to: "/generator", label: "Generator", icon: Sparkles },
    { to: "/voice", label: "Voice", icon: Mic },
    { to: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center">
              <span className="text-white font-bold text-xl">BB</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Content Generator
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all flex items-center gap-2"
                activeClassName="text-foreground bg-secondary/80 font-medium"
              >
                <link.icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};