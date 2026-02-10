import { Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useTeamKPIs } from '@/hooks/useTeamKPIs';

const ClientPerformance = () => {
  const { data: allKPIs = [] } = useTeamKPIs();
  const clients = [...new Set(allKPIs.map(k => k.client_name))];
  const [selectedClient, setSelectedClient] = useState('all');

  const filtered = selectedClient === 'all' ? allKPIs : allKPIs.filter(k => k.client_name === selectedClient);

  const totalBudget = filtered.reduce((s, k) => s + k.budget, 0);
  const totalSpent = filtered.reduce((s, k) => s + k.spent, 0);
  const totalConversions = filtered.reduce((s, k) => s + k.conversions, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Client Performance</h1>
          <p className="text-sm text-muted-foreground">Live campaign metrics by client</p>
        </div>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-[220px] glass-card text-xs">
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map(c => (
              <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filtered.length}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalConversions.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {selectedClient === 'all' ? (
        <Card className="glass-card flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <Monitor className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Select a client to view detailed performance</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(kpi => (
            <Card key={kpi.id} className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{kpi.campaign_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Manager</span><span className="text-foreground">{kpi.campaign_manager}</span></div>
                <div className="flex justify-between"><span>Budget</span><span className="text-foreground">${kpi.budget.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Spent</span><span className="text-foreground">${kpi.spent.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Impressions</span><span className="text-foreground">{kpi.impressions.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Conversions</span><span className="text-foreground">{kpi.conversions.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Status</span><span className="text-foreground capitalize">{kpi.status}</span></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientPerformance;
