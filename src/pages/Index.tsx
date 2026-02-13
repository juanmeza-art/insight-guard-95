import { useState, useMemo } from 'react';
import { useTeamKPIs } from '@/hooks/useTeamKPIs';
import { KPIOverview } from '@/components/KPIOverview';
import { RiskAuditGrid } from '@/components/RiskAuditGrid';
import { CampaignListView } from '@/components/CampaignListView';
import { UrgentAlerts } from '@/components/UrgentAlerts';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const [team, setTeam] = useState('all');
  const [brand, setBrand] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: allCampaigns = [], isLoading } = useTeamKPIs();

  const teams = useMemo(() => [...new Set(allCampaigns.map(c => c.team_name).filter(Boolean))].sort(), [allCampaigns]);
  const brands = useMemo(() => [...new Set(allCampaigns.map(c => c.company).filter(Boolean))].sort(), [allCampaigns]);

  const filtered = useMemo(() => {
    return allCampaigns.filter(c => {
      if (team !== 'all' && c.team_name !== team) return false;
      if (brand !== 'all' && c.company !== brand) return false;
      return true;
    });
  }, [team, brand, allCampaigns]);

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
            <p className="text-[10px] text-muted-foreground">Campaign Progress & Team Monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={team} onValueChange={setTeam}>
              <SelectTrigger className="w-[200px] glass-card text-xs">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map(t => (
                  <SelectItem key={t} value={t!} className="text-xs">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="w-[200px] glass-card text-xs">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map(b => (
                  <SelectItem key={b} value={b!} className="text-xs">{b}</SelectItem>
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

          <div className="space-y-4">
            <div className="flex items-center justify-end">
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
            {viewMode === 'grid' ? <RiskAuditGrid data={filtered} /> : <CampaignListView data={filtered} />}
          </div>
        </main>

        <aside className="hidden lg:block w-[320px] border-l border-border/50 p-4">
          <UrgentAlerts data={allCampaigns} currentManager={team !== 'all' ? team : teams[0] ?? ''} />
        </aside>
      </div>
    </div>
  );
};

export default Index;
