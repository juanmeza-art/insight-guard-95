import { useState, useMemo } from 'react';
import { useExecutionCampaigns } from '@/hooks/useExecutionCampaigns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Shield, BarChart3, Loader2, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_COLORS: Record<string, string> = {
  'On Hold': 'bg-yellow-500/20 text-yellow-400',
  'To Do': 'bg-muted text-muted-foreground',
  'Ongoing': 'bg-blue-500/20 text-blue-400',
  'Building Reports': 'bg-purple-500/20 text-purple-400',
  'Completed': 'bg-green-500/20 text-green-400',
  'Approved': 'bg-emerald-500/20 text-emerald-400',
};

const Index = () => {
  const { data: campaigns = [], isLoading } = useExecutionCampaigns();
  const [managerFilter, setManagerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const managers = useMemo(() => [...new Set(campaigns.map(c => c.campaign_manager).filter(Boolean))].sort(), [campaigns]);
  const statuses = useMemo(() => [...new Set(campaigns.map(c => c.status))].sort(), [campaigns]);

  const filtered = useMemo(() => {
    return campaigns.filter(c => {
      if (managerFilter !== 'all' && c.campaign_manager !== managerFilter) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      return true;
    });
  }, [campaigns, managerFilter, statusFilter]);

  const stats = useMemo(() => {
    const totalBudget = filtered.reduce((s, c) => s + c.total_budget, 0);
    const totalExecuted = filtered.reduce((s, c) => s + c.executed_amount, 0);
    const totalInfluencers = filtered.reduce((s, c) => s + c.num_influencers, 0);
    const ongoing = filtered.filter(c => c.status === 'Ongoing').length;
    const completed = filtered.filter(c => c.status === 'Completed').length;
    const avgProgress = filtered.length > 0 ? filtered.reduce((s, c) => s + c.progress_pct, 0) / filtered.length : 0;

    // By campaign manager
    const byManager = new Map<string, { count: number; budget: number }>();
    filtered.forEach(c => {
      if (c.campaign_manager) {
        const existing = byManager.get(c.campaign_manager) ?? { count: 0, budget: 0 };
        byManager.set(c.campaign_manager, { count: existing.count + 1, budget: existing.budget + c.total_budget });
      }
    });

    return { totalBudget, totalExecuted, totalInfluencers, ongoing, completed, avgProgress, byManager };
  }, [filtered]);

  const formatCurrency = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${v}`;

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
            <p className="text-[10px] text-muted-foreground">Campaign Execution & Performance Monitoring</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={managerFilter} onValueChange={setManagerFilter}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Managers</SelectItem>
                {managers.map(m => <SelectItem key={m!} value={m!} className="text-xs">{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* KPI Overview */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="h-3 w-3" />Active</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{stats.ongoing}</p><p className="text-[10px] text-muted-foreground">ongoing campaigns</p></CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" />Completed</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{stats.completed}</p><p className="text-[10px] text-muted-foreground">finished campaigns</p></CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="h-3 w-3" />Budget</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</p><p className="text-[10px] text-muted-foreground">total allocated</p></CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" />Executed</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatCurrency(stats.totalExecuted)}</p><p className="text-[10px] text-muted-foreground">amount spent</p></CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" />Influencers</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{stats.totalInfluencers}</p><p className="text-[10px] text-muted-foreground">across campaigns</p></CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground flex items-center gap-1"><BarChart3 className="h-3 w-3" />Progress</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{stats.avgProgress.toFixed(0)}%</p><p className="text-[10px] text-muted-foreground">avg. delivery</p></CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="campaigns" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="campaigns" className="text-xs gap-1.5"><Shield className="h-3.5 w-3.5" />All Campaigns</TabsTrigger>
            <TabsTrigger value="managers" className="text-xs gap-1.5"><Users className="h-3.5 w-3.5" />By Manager</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{filtered.length} Campaigns</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Campaign</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Company</TableHead>
                        <TableHead className="text-xs">Manager</TableHead>
                        <TableHead className="text-xs text-right">Budget</TableHead>
                        <TableHead className="text-xs text-right">Executed</TableHead>
                        <TableHead className="text-xs text-center">Progress</TableHead>
                        <TableHead className="text-xs text-right">Influencers</TableHead>
                        <TableHead className="text-xs">Genre</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(c => (
                        <TableRow key={c.id} className="text-xs">
                          <TableCell className="font-medium max-w-[220px] truncate">{c.name}</TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] border-0 ${STATUS_COLORS[c.status] ?? 'bg-muted text-muted-foreground'}`}>{c.status}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground max-w-[140px] truncate">{c.company ?? '—'}</TableCell>
                          <TableCell className="text-muted-foreground">{c.campaign_manager ?? '—'}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(c.total_budget)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(c.executed_amount)}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center gap-2">
                              <Progress value={c.progress_pct} className="h-1.5 w-16" />
                              <span className="text-[10px] text-muted-foreground w-8">{c.progress_pct.toFixed(0)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{c.num_influencers}</TableCell>
                          <TableCell className="text-muted-foreground max-w-[100px] truncate">{c.musical_genre ?? '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="managers">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...stats.byManager.entries()]
                .sort((a, b) => b[1].budget - a[1].budget)
                .map(([name, data]) => (
                  <Card key={name} className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Campaigns</span>
                        <span className="font-medium">{data.count}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Total Budget</span>
                        <span className="font-medium">{formatCurrency(data.budget)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
