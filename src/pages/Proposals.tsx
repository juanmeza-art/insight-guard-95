import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { FileText, Clock, CheckCircle2, XCircle, AlertTriangle, Loader2, LayoutGrid, List, Lightbulb, ArrowRight, AlertCircle, DollarSign, Calendar, CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useProposalsAudit, type ProposalAudit } from '@/hooks/useProposalsAudit';
import { motion } from 'framer-motion';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  'To Do': { label: 'To Do', color: 'bg-muted text-muted-foreground', icon: FileText },
  'On Hold': { label: 'On Hold', color: 'bg-yellow-500/20 text-yellow-400', icon: AlertTriangle },
  'Building Proposal': { label: 'Building', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
  'Adjusting': { label: 'Adjusting', color: 'bg-orange-500/20 text-orange-400', icon: AlertTriangle },
  'Pending Approval': { label: 'Pending', color: 'bg-purple-500/20 text-purple-400', icon: Loader2 },
  'Sent to Execution': { label: 'Approved', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  'Approved': { label: 'Approved', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  'Declined': { label: 'Declined', color: 'bg-red-500/20 text-red-400', icon: XCircle },
};

const riskConfig: Record<number, { border: string; badge: string; label: string; icon: typeof CheckCircle2 }> = {
  1: { border: 'border-l-[hsl(var(--risk-low))]', badge: 'bg-[hsl(var(--risk-low))]/15 text-[hsl(var(--risk-low))]', label: 'Low', icon: CheckCircle2 },
  2: { border: 'border-l-[hsl(var(--risk-medium))]', badge: 'bg-[hsl(var(--risk-medium))]/15 text-[hsl(var(--risk-medium))]', label: 'Med', icon: AlertCircle },
  3: { border: 'border-l-[hsl(var(--risk-high))]', badge: 'bg-[hsl(var(--risk-high))]/15 text-[hsl(var(--risk-high))]', label: 'High', icon: AlertTriangle },
};

const Proposals = () => {
  const { data: proposals = [], isLoading } = useProposalsAudit();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(() => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = proposals;
    if (statusFilter !== 'all') {
      const matchStatuses = statusFilter === 'Approved' ? ['Approved', 'Sent to Execution'] : [statusFilter];
      result = result.filter(p => matchStatuses.includes(p.status ?? ''));
    }
    if (roleFilter !== 'all') {
      result = result.filter(p => {
        if (roleFilter === 'List Builder') return !!p.list_builder;
        if (roleFilter === 'CSM') return !!p.csm;
        if (roleFilter === 'Seller') return !!p.seller_name;
        return true;
      });
    }
    if (dateFrom) {
      result = result.filter(p => {
        const d = p.building_proposal_start || p.pending_approval_start;
        return d ? new Date(d) >= dateFrom : false;
      });
    }
    if (dateTo) {
      result = result.filter(p => {
        const d = p.building_proposal_start || p.pending_approval_start;
        return d ? new Date(d) <= dateTo : false;
      });
    }
    return result;
  }, [proposals, statusFilter, roleFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const approved = filtered.filter(p => p.status === 'Sent to Execution' || p.status === 'Approved').length;
    const declined = filtered.filter(p => p.status === 'Declined').length;
    const pending = filtered.filter(p => p.status === 'Pending Approval').length;
    const building = filtered.filter(p => ['Building Proposal', 'Adjusting'].includes(p.status ?? '')).length;

    const withDays = filtered.filter(p => p.days_since_pending > 0);
    const avgCycle = withDays.length > 0
      ? (withDays.reduce((s, p) => s + p.days_since_pending, 0) / withDays.length).toFixed(1)
      : '—';

    const approvalRate = (approved + declined) > 0
      ? ((approved / (approved + declined)) * 100).toFixed(0)
      : '—';

    const totalBudget = filtered.reduce((s, p) => s + p.budget, 0);

    const byListBuilder = new Map<string, number>();
    const byCsm = new Map<string, number>();
    const bySeller = new Map<string, number>();

    filtered.forEach(p => {
      if (p.list_builder) {
        p.list_builder.split(',').map(n => n.trim()).forEach(n => {
          byListBuilder.set(n, (byListBuilder.get(n) ?? 0) + 1);
        });
      }
      if (p.csm) byCsm.set(p.csm, (byCsm.get(p.csm) ?? 0) + 1);
      if (p.seller_name) bySeller.set(p.seller_name, (bySeller.get(p.seller_name) ?? 0) + 1);
    });

    return { total, approved, declined, pending, building, avgCycle, approvalRate, totalBudget, byListBuilder, byCsm, bySeller };
  }, [filtered]);

  const formatCurrency = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${v}`;

  const statuses = [...new Set(proposals.map(p => p.status).filter(Boolean))].sort();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Proposals</h1>
          <p className="text-sm text-muted-foreground">Sales cycle, approval rates & team breakdown</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(s => (
                <SelectItem key={s} value={s!}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="List Builder">List Builder</SelectItem>
              <SelectItem value="CSM">CSM</SelectItem>
              <SelectItem value="Seller">Seller</SelectItem>
            </SelectContent>
          </Select>
          <Popover open={fromOpen} onOpenChange={setFromOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("h-8 text-xs gap-1.5", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="h-3.5 w-3.5" />
                {dateFrom ? format(dateFrom, "MMM d, yyyy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d); setFromOpen(false); }} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          <Popover open={toOpen} onOpenChange={setToOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("h-8 text-xs gap-1.5", !dateTo && "text-muted-foreground")}>
                <CalendarIcon className="h-3.5 w-3.5" />
                {dateTo ? format(dateTo, "MMM d, yyyy") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d); setToOpen(false); }} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>
              Clear dates
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sales Cycle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.avgCycle}<span className="text-sm font-normal text-muted-foreground ml-1">days</span></p>
            <p className="text-xs text-muted-foreground mt-1">Avg. days pending approval</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.approvalRate}{stats.approvalRate !== '—' && '%'}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.approved} approved · {stats.declined} declined</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pending + stats.building}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.pending} pending · {stats.building} building</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats.total} proposals total</p>
          </CardContent>
        </Card>
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
        {[
          { key: 'To Do', statuses: ['To Do'] },
          { key: 'On Hold', statuses: ['On Hold'] },
          { key: 'Building Proposal', statuses: ['Building Proposal'] },
          { key: 'Adjusting', statuses: ['Adjusting'] },
          { key: 'Pending Approval', statuses: ['Pending Approval'] },
          { key: 'Approved', statuses: ['Approved', 'Sent to Execution'] },
          { key: 'Declined', statuses: ['Declined'] },
        ].map(({ key, statuses }) => {
          const cfg = STATUS_CONFIG[key];
          const count = proposals.filter(p => statuses.includes(p.status ?? '')).length;
          const Icon = cfg.icon;
          const isActive = statuses.includes(statusFilter);
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(isActive ? 'all' : key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${cfg.color} ${isActive ? 'ring-2 ring-primary' : 'opacity-80 hover:opacity-100'}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cfg.label}</span>
              <span className="ml-auto font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Team breakdown cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {([
          { title: 'By List Builder', data: stats.byListBuilder },
          { title: 'By CSM', data: stats.byCsm },
          { title: 'By Seller', data: stats.bySeller },
        ] as const).map(({ title, data }) => (
          <Card key={title} className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {[...data.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([name, count]) => (
                  <div key={name} className="flex justify-between items-center text-xs">
                    <span className="truncate mr-2">{name.split('@')[0]}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5">{count}</Badge>
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Proposals list/grid with toggle */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              {filtered.length} Proposals
              {statusFilter !== 'all' && <span className="text-muted-foreground"> · {statusFilter}</span>}
            </CardTitle>
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
        </CardHeader>
        <CardContent className={viewMode === 'list' ? 'p-0' : ''}>
          {viewMode === 'list' ? (
            <ProposalTableView data={filtered} />
          ) : (
            <ProposalGridView data={filtered} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function ProposalTableView({ data }: { data: ProposalAudit[] }) {
  const formatCurrency = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${v}`;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Campaign</TableHead>
            <TableHead className="text-xs">Status</TableHead>
            <TableHead className="text-xs">Company</TableHead>
            <TableHead className="text-xs text-right">Budget</TableHead>
            <TableHead className="text-xs">Seller</TableHead>
            <TableHead className="text-xs">CSM</TableHead>
            <TableHead className="text-xs">List Builder</TableHead>
            <TableHead className="text-xs text-right">Days Pending</TableHead>
            <TableHead className="text-xs text-center">Risk</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(p => {
            const cfg = STATUS_CONFIG[p.status ?? ''] ?? STATUS_CONFIG['To Do'];
            const risk = riskConfig[p.risk_score] ?? riskConfig[1];
            const RiskIcon = risk.icon;
            return (
              <TableRow key={p.id} className="text-xs">
                <TableCell className="font-medium max-w-[220px] truncate">{p.campaign_name ?? '—'}</TableCell>
                <TableCell>
                  <Badge className={`text-[10px] ${cfg.color} border-0`}>{cfg.label}</Badge>
                </TableCell>
                <TableCell className="max-w-[140px] truncate text-muted-foreground">{p.company ?? '—'}</TableCell>
                <TableCell className="text-right font-medium">{p.budget > 0 ? formatCurrency(p.budget) : '—'}</TableCell>
                <TableCell className="text-muted-foreground">{p.seller_name ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground">{p.csm ?? '—'}</TableCell>
                <TableCell className="text-muted-foreground max-w-[120px] truncate">{p.list_builder?.split('@')[0] ?? '—'}</TableCell>
                <TableCell className="text-right">{p.days_since_pending || '—'}</TableCell>
                <TableCell className="text-center">
                  <Badge className={`${risk.badge} border-0 text-[10px] font-semibold`}>
                    <RiskIcon className="h-3 w-3 mr-0.5" />
                    {risk.label}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ProposalGridView({ data }: { data: ProposalAudit[] }) {
  const sorted = [...data].sort((a, b) => b.risk_score - a.risk_score);
  const formatCurrency = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${v}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sorted.map((p, i) => {
        const config = riskConfig[p.risk_score] ?? riskConfig[1];
        const Icon = config.icon;
        const statusCfg = STATUS_CONFIG[p.status ?? ''] ?? STATUS_CONFIG['To Do'];
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className={`glass-card border-l-4 ${config.border} hover:shadow-lg hover:shadow-primary/5 transition-all`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold truncate">{p.campaign_name ?? 'Untitled'}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.company ?? '—'}</p>
                  </div>
                  <Badge className={`${config.badge} border-0 text-[10px] font-semibold shrink-0 ml-2`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status */}
                <Badge className={`text-[10px] ${statusCfg.color} border-0`}>{statusCfg.label}</Badge>

                {/* AI Insight */}
                {p.ai_insight && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                    <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed">{p.ai_insight}</p>
                  </div>
                )}

                {/* Action Required */}
                {p.action_required && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                    <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-0.5">Next Steps</p>
                      <p className="text-xs leading-relaxed">{p.action_required}</p>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <DollarSign className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-mono font-medium">{formatCurrency(p.budget)}</p>
                    <p className="text-[10px] text-muted-foreground">Budget</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-xs font-mono font-medium">{p.take_rate_pct}%</p>
                    <p className="text-[10px] text-muted-foreground">Take Rate</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Calendar className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-mono font-medium">{p.days_since_pending || '—'}</p>
                    <p className="text-[10px] text-muted-foreground">Days Pending</p>
                  </div>
                </div>

                {/* Team */}
                <div className="space-y-1 text-xs text-muted-foreground">
                  {p.seller_name && <p><span className="font-medium text-foreground">Seller:</span> {p.seller_name}</p>}
                  {p.csm && <p><span className="font-medium text-foreground">CSM:</span> {p.csm}</p>}
                  {p.list_builder && <p><span className="font-medium text-foreground">List Builder:</span> {p.list_builder.split('@')[0]}</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

export default Proposals;
