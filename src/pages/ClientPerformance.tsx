import { Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useState, useMemo } from 'react';
import { useTeamKPIs } from '@/hooks/useTeamKPIs';

const ClientPerformance = () => {
  const { data: allKPIs = [] } = useTeamKPIs();
  const companies = [...new Set(allKPIs.map(k => k.company).filter(Boolean))].sort();
  const [selectedCompany, setSelectedCompany] = useState('all');

  const filtered = selectedCompany === 'all' ? allKPIs : allKPIs.filter(k => k.company === selectedCompany);

  const totalInfluencers = filtered.reduce((s, k) => s + k.num_influencers, 0);
  const totalSent = filtered.reduce((s, k) => s + k.count_sent, 0);
  const totalCompleted = filtered.reduce((s, k) => s + k.count_completed, 0);
  const totalBudget = filtered.reduce((s, k) => s + k.target_value, 0);

  // Historical monthly data – last 6 months only
  const monthlyData = useMemo(() => {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const cutoff = sixMonthsAgo.toISOString().slice(0, 7); // e.g. "2025-09"

    const grouped: Record<string, { budget: number; campaigns: number }> = {};
    filtered.forEach(c => {
      const month = (c.created_at ?? '').slice(0, 7);
      if (!month || month < cutoff) return;
      if (!grouped[month]) grouped[month] = { budget: 0, campaigns: 0 };
      grouped[month].budget += c.target_value;
      grouped[month].campaigns++;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        budget: d.budget,
        campaigns: d.campaigns,
      }));
  }, [filtered]);

  const chartConfig = {
    budget: { label: 'Budget ($)', color: 'hsl(var(--chart-blue))' },
    campaigns: { label: 'Campaigns', color: 'hsl(var(--chart-orange))' },
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Client Performance</h1>
          <p className="text-sm text-muted-foreground">Historical campaign metrics by company</p>
        </div>
        <Select value={selectedCompany} onValueChange={setSelectedCompany}>
          <SelectTrigger className="w-[260px] glass-card text-xs">
            <SelectValue placeholder="Select company" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map(c => (
              <SelectItem key={c} value={c!} className="text-xs">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{filtered.length.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Influencers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalInfluencers.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalSent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCompleted.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget ($)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Historical bar chart – last 6 months */}
      {monthlyData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Budget ($) – Last 6 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="budget" fill="hsl(var(--chart-blue))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold"># Campaigns – Last 6 Months</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[260px] w-full">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="campaigns" fill="hsl(var(--chart-orange))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="glass-card flex items-center justify-center h-48">
          <p className="text-sm text-muted-foreground">No campaigns in the last 6 months for this selection</p>
        </Card>
      )}

      {selectedCompany === 'all' ? (
        <Card className="glass-card flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <Monitor className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Select a company to view detailed performance</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(kpi => {
            const cpm = kpi.num_influencers > 0 ? kpi.target_value / kpi.num_influencers * 1000 : 0;
            const cpe = kpi.count_completed > 0 ? kpi.target_value / kpi.count_completed : 0;
            return (
              <Card key={kpi.id} className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{kpi.campaign_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Team</span><span className="text-foreground">{kpi.team_name}</span></div>
                  <div className="flex justify-between"><span>Total Budget</span><span className="text-foreground">${kpi.target_value.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Take Rate</span><span className="text-foreground">{kpi.executed_take_rate_pct}%</span></div>
                  <div className="flex justify-between"><span>CPM</span><span className="text-foreground">${cpm.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span>CPE</span><span className="text-foreground">${cpe.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between"><span>Influencers</span><span className="text-foreground">{kpi.num_influencers}</span></div>
                  <div className="flex justify-between"><span>Completed</span><span className="text-foreground">{kpi.count_completed}</span></div>
                  <div className="flex justify-between"><span>Status</span><span className="text-foreground capitalize">{kpi.sal_status}</span></div>
                  {kpi.execution_start && <div className="flex justify-between"><span>Period</span><span className="text-foreground">{kpi.execution_start} → {kpi.execution_end}</span></div>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientPerformance;
