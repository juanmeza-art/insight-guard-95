import { useState, useMemo } from 'react';
import { useExecutionCampaigns } from '@/hooks/useExecutionCampaigns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Monitor, Loader2, TrendingUp, Eye, Heart, DollarSign } from 'lucide-react';

const ClientPerformance = () => {
  const { data: allCampaigns = [], isLoading } = useExecutionCampaigns('Completed');
  const [selectedClient, setSelectedClient] = useState('all');

  const clients = useMemo(() => 
    [...new Set(allCampaigns.map(c => c.company).filter(Boolean))].sort() as string[],
    [allCampaigns]
  );

  const filtered = useMemo(() => 
    selectedClient === 'all' ? allCampaigns : allCampaigns.filter(c => c.company === selectedClient),
    [allCampaigns, selectedClient]
  );

  const stats = useMemo(() => {
    const totalBudget = filtered.reduce((s, c) => s + c.total_budget, 0);
    const totalExecuted = filtered.reduce((s, c) => s + c.executed_amount, 0);
    const totalViews = filtered.reduce((s, c) => s + (c.views ?? 0), 0);
    const totalEngagement = filtered.reduce((s, c) => s + (c.engagement ?? 0), 0);
    const totalInfluencers = filtered.reduce((s, c) => s + c.num_influencers, 0);
    const withCpm = filtered.filter(c => c.cpm !== null && c.cpm > 0);
    const avgCpm = withCpm.length > 0 ? withCpm.reduce((s, c) => s + (c.cpm ?? 0), 0) / withCpm.length : 0;
    const withEr = filtered.filter(c => c.er_pct !== null && c.er_pct > 0);
    const avgEr = withEr.length > 0 ? withEr.reduce((s, c) => s + (c.er_pct ?? 0), 0) / withEr.length : 0;
    return { totalBudget, totalExecuted, totalViews, totalEngagement, totalInfluencers, avgCpm, avgEr };
  }, [filtered]);

  const formatNum = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K`;
    return v.toLocaleString();
  };
  const formatCurrency = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${v}`;

  if (isLoading) {
    return <div className="p-6 flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Client Performance</h1>
          <p className="text-sm text-muted-foreground">Completed campaign results by client</p>
        </div>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-[240px] h-8 text-xs">
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients ({allCampaigns.length} campaigns)</SelectItem>
            {clients.map(c => (
              <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="glass-card">
          <CardHeader className="pb-1"><CardTitle className="text-[10px] text-muted-foreground">Campaigns</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{filtered.length}</p></CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-1"><CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />Budget</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{formatCurrency(stats.totalBudget)}</p></CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-1"><CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" />Executed</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{formatCurrency(stats.totalExecuted)}</p></CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-1"><CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" />Views</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{formatNum(stats.totalViews)}</p></CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-1"><CardTitle className="text-[10px] text-muted-foreground flex items-center gap-1"><Heart className="h-3 w-3" />Engagement</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{formatNum(stats.totalEngagement)}</p></CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-1"><CardTitle className="text-[10px] text-muted-foreground">Avg CPM</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">${stats.avgCpm.toFixed(1)}</p></CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-1"><CardTitle className="text-[10px] text-muted-foreground">Avg ER%</CardTitle></CardHeader>
          <CardContent><p className="text-xl font-bold">{stats.avgEr.toFixed(1)}%</p></CardContent>
        </Card>
      </div>

      {filtered.length === 0 ? (
        <Card className="glass-card flex items-center justify-center h-64">
          <div className="text-center text-muted-foreground">
            <Monitor className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No completed campaigns found</p>
            <p className="text-xs mt-1">Select a different client</p>
          </div>
        </Card>
      ) : (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{filtered.length} Completed Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Campaign</TableHead>
                    <TableHead className="text-xs">Company</TableHead>
                    <TableHead className="text-xs text-right">Budget</TableHead>
                    <TableHead className="text-xs text-right">Executed</TableHead>
                    <TableHead className="text-xs text-center">Progress</TableHead>
                    <TableHead className="text-xs text-right">Views</TableHead>
                    <TableHead className="text-xs text-right">Engagement</TableHead>
                    <TableHead className="text-xs text-right">CPM</TableHead>
                    <TableHead className="text-xs text-right">ER%</TableHead>
                    <TableHead className="text-xs">Genre</TableHead>
                    <TableHead className="text-xs">Market</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(c => (
                    <TableRow key={c.id} className="text-xs">
                      <TableCell className="font-medium max-w-[200px] truncate">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[130px] truncate">{c.company}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(c.total_budget)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(c.executed_amount)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 justify-center">
                          <Progress value={c.progress_pct} className="h-1.5 w-12" />
                          <span className="text-[10px] w-7 text-muted-foreground">{c.progress_pct.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{c.views ? formatNum(c.views) : '—'}</TableCell>
                      <TableCell className="text-right">{c.engagement ? formatNum(c.engagement) : '—'}</TableCell>
                      <TableCell className="text-right">{c.cpm ? `$${c.cpm}` : '—'}</TableCell>
                      <TableCell className="text-right">
                        <span className={c.er_pct && c.er_pct >= 5 ? 'text-green-400' : c.er_pct ? 'text-yellow-400' : 'text-muted-foreground'}>
                          {c.er_pct ? `${c.er_pct}%` : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[80px] truncate">{c.musical_genre ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[80px] truncate">{c.audience_country ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientPerformance;
