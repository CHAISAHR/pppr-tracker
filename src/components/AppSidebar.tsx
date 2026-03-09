import { Home, Calendar, Users, LogOut, GraduationCap, Building2, TrendingUp } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
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
  { title: "Indicator Reporting", url: "/performance", icon: TrendingUp },
  { title: "Meeting Schedule", url: "/meetings", icon: Calendar },
];

const adminItems = [
  { title: "Users", url: "/users", icon: Users },
  { title: "Organisations", url: "/organisations", icon: Building2 },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
          <img src={logo} alt="Logo" className="h-8 w-8 rounded-lg" />
          {open && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">Activity Reporting Tool</span>
              {user && <span className="text-xs text-muted-foreground">{user.name}</span>}
            </div>
          )}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end
                      className={({ isActive }) => 
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin() && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end
                        className={({ isActive }) => 
                          isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      
      <SidebarFooter className="border-t border-sidebar-border">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {open && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
