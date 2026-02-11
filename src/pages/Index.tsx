import { useState, useMemo } from 'react';
import { useTeamKPIs } from '@/hooks/useTeamKPIs';
import { KPIOverview } from '@/components/KPIOverview';
import { RiskAuditGrid } from '@/components/RiskAuditGrid';
import { CampaignListView } from '@/components/CampaignListView';
import { TrendCharts } from '@/components/TrendCharts';
import { UrgentAlerts } from '@/components/UrgentAlerts';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Shield, BarChart3, Loader2, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const [manager, setManager] = useState('all');
  const [status, setStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: allCampaigns = [], isLoading } = useTeamKPIs();

  const managers = useMemo(() => [...new Set(allCampaigns.map(c => c.campaign_manager).filter(Boolean))].sort(), [allCampaigns]);
  const statuses = useMemo(() => [...new Set(allCampaigns.map(c => c.status))].sort(), [allCampaigns]);

  const filtered = useMemo(() => {
    return allCampaigns.filter(c => {
      if (manager !== 'all' && c.campaign_manager !== manager) return false;
      if (status !== 'all' && c.status !== status) return false;
      return true;
    });
  }, [manager, status, allCampaigns]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 h-14">
          <div>
            <h1 className="text-sm font-bold tracking-tight">Execution Dashboard</h1>
            <p className="text-[10px] text-muted-foreground">Campaign Progress & Budget Monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={manager} onValueChange={setManager}>
              <SelectTrigger className="w-[200px] glass-card text-xs">
                <SelectValue placeholder="All Managers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managers</SelectItem>
                {managers.map(m => (
                  <SelectItem key={m} value={m!} className="text-xs">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[140px] glass-card text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(s => (
                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="flex">
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <KPIOverview data={filtered} />
          </motion.div>

          <Tabs defaultValue="campaigns" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="campaigns" className="text-xs gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Campaigns
                </TabsTrigger>
                <TabsTrigger value="trends" className="text-xs gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Historical Analysis
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-1 bg-muted/50 rounded-md p-0.5">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <TabsContent value="campaigns">
              {viewMode === 'grid' ? <RiskAuditGrid data={filtered} /> : <CampaignListView data={filtered} />}
            </TabsContent>

            <TabsContent value="trends">
              <TrendCharts data={filtered} />
            </TabsContent>
          </Tabs>
        </main>

        <aside className="hidden lg:block w-[320px] border-l border-border/50 p-4">
          <UrgentAlerts data={allCampaigns} currentManager={manager !== 'all' ? manager : managers[0] ?? ''} />
        </aside>
      </div>
    </div>
  );
};

export default Index;
