import { Home, Calendar, Users, LogOut, Building2, TrendingUp, Settings } from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const items = [
  { title: "Activity Tracker", url: "/", icon: Home },
  { title: "Indicator Tracker", url: "/performance", icon: TrendingUp },
  { title: "Event Schedule", url: "/meetings", icon: Calendar },
  { title: "Administration", url: "/administration", icon: Settings },
];

const adminItems = [
  { title: "Users", url: "/users", icon: Users },
  { title: "Organisations", url: "/organisations", icon: Building2 },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {/* Logo area with gold accent bar */}
        <div className="relative">
          <div className="absolute bottom-0 left-4 right-4 h-px bg-sidebar-border" />
          <div className="p-4 pb-5 flex items-center gap-3">
            <div className="relative">
              <img src={logo} alt="Logo" className="h-9 w-9 rounded-lg ring-1 ring-sidebar-border" />
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-sidebar" />
            </div>
            {open && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-sidebar-foreground tracking-tight">M&E Reporting Tool</span>
                {user && <span className="text-[11px] text-sidebar-foreground/50 mt-0.5">{user.name}</span>}
              </div>
            )}
          </div>
        </div>
        
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold px-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url || 
                  (item.url !== "/" && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/"}
                        className={
                          isActive 
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                        }
                      >
                        <item.icon className={`h-4 w-4 ${isActive ? "text-accent" : ""}`} />
                        <span>{item.title}</span>
                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin() && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold px-4">
              Administration
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url} 
                          end
                          className={
                            isActive 
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
                          }
                        >
                          <item.icon className={`h-4 w-4 ${isActive ? "text-accent" : ""}`} />
                          <span>{item.title}</span>
                          {isActive && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 text-sm"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {open && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
