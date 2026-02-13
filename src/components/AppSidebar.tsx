import { Activity, FileText, Monitor, Users, Target } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { InfluurPulseLogo } from '@/components/InfluurPulseLogo';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';

const navItems = [
  { title: 'Execution', url: '/', icon: Activity, description: 'Campaign KPIs & Risk' },
  { title: 'Proposals', url: '/proposals', icon: FileText, description: 'Sales pipeline' },
  { title: 'Client Performance', url: '/client-performance', icon: Monitor, description: 'Live dashboards' },
  { title: 'Role Performance', url: '/role-performance', icon: Users, description: 'KPIs by role' },
  { title: 'Team Performance', url: '/team-performance', icon: Target, description: 'OKR tracking' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
        {!collapsed && <InfluurPulseLogo size="sm" />}
        <SidebarTrigger className={collapsed ? 'mx-auto' : 'ml-auto'} />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url} end>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto p-3 border-t border-sidebar-border">
        <ThemeToggle />
      </div>
    </Sidebar>
  );
}
