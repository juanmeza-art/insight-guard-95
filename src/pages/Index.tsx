import { useState, useMemo } from 'react';
import { mockKPIs, campaignManagers } from '@/lib/mock-data';
import { DashboardFilters } from '@/components/DashboardFilters';
import { KPIOverview } from '@/components/KPIOverview';
import { RiskAuditGrid } from '@/components/RiskAuditGrid';
import { TrendCharts } from '@/components/TrendCharts';
import { UrgentAlerts } from '@/components/UrgentAlerts';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, BarChart3, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const [manager, setManager] = useState('all');
  const [role, setRole] = useState('all');
  const [currentUser, setCurrentUser] = useState(campaignManagers[0]);

  const filtered = useMemo(() => {
    return mockKPIs.filter(kpi => {
      if (manager !== 'all' && kpi.campaign_manager !== manager) return false;
      if (role !== 'all' && kpi.role !== role) return false;
      return true;
    });
  }, [manager, role]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Operational Intelligence</h1>
              <p className="text-[10px] text-muted-foreground">Team KPI Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DashboardFilters
              selectedManager={manager}
              onManagerChange={setManager}
              selectedRole={role}
              onRoleChange={setRole}
            />
            <div className="h-6 w-px bg-border" />
            <Select value={currentUser} onValueChange={setCurrentUser}>
              <SelectTrigger className="w-[180px] glass-card text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {campaignManagers.map(m => (
                  <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <KPIOverview data={filtered} />
          </motion.div>

          <Tabs defaultValue="risk" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="risk" className="text-xs gap-1.5">
                <Shield className="h-3.5 w-3.5" />
                Risk Audit
              </TabsTrigger>
              <TabsTrigger value="trends" className="text-xs gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                Historical Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="risk">
              <RiskAuditGrid data={filtered} />
            </TabsContent>

            <TabsContent value="trends">
              <TrendCharts data={filtered} />
            </TabsContent>
          </Tabs>
        </main>

        {/* Alerts Sidebar */}
        <aside className="hidden lg:block w-[320px] border-l border-border/50 p-4">
          <UrgentAlerts data={mockKPIs} currentUser={currentUser} />
        </aside>
      </div>
    </div>
  );
};

export default Index;
