import { useMemo, useState } from 'react';
import { FileText, Clock, CheckCircle2, XCircle, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useProposals } from '@/hooks/useProposals';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof FileText }> = {
  'To Do': { label: 'To Do', color: 'bg-muted text-muted-foreground', icon: FileText },
  'On Hold': { label: 'On Hold', color: 'bg-yellow-500/20 text-yellow-400', icon: AlertTriangle },
  'Building Proposal': { label: 'Building', color: 'bg-blue-500/20 text-blue-400', icon: Clock },
  'Adjusting': { label: 'Adjusting', color: 'bg-orange-500/20 text-orange-400', icon: AlertTriangle },
  'Pending Approval': { label: 'Pending', color: 'bg-purple-500/20 text-purple-400', icon: Loader2 },
  'Sent to Execution': { label: 'Approved', color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  'Declined': { label: 'Declined', color: 'bg-red-500/20 text-red-400', icon: XCircle },
};

const Proposals = () => {
  const { data: proposals = [], isLoading } = useProposals();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let result = proposals;
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (roleFilter !== 'all') {
      result = result.filter(p => {
        if (roleFilter === 'List Builder') return !!p.list_builder;
        if (roleFilter === 'CSM') return !!p.csm;
        if (roleFilter === 'Seller') return !!p.seller;
        return true;
      });
    }
    return result;
  }, [proposals, statusFilter, roleFilter]);

  const stats = useMemo(() => {
    const total = proposals.length;
    const approved = proposals.filter(p => p.status === 'Sent to Execution').length;
    const declined = proposals.filter(p => p.status === 'Declined').length;
    const pending = proposals.filter(p => p.status === 'Pending Approval').length;
    const building = proposals.filter(p => ['Building Proposal', 'Adjusting'].includes(p.status)).length;

    // Sales cycle: avg days_building_proposal for proposals that have it
    const withDays = proposals.filter(p => p.days_building_proposal !== null && p.days_building_proposal !== undefined);
    const avgCycle = withDays.length > 0
      ? (withDays.reduce((s, p) => s + (p.days_building_proposal ?? 0), 0) / withDays.length).toFixed(1)
      : '—';

    const approvalRate = total > 0
      ? ((approved / (approved + declined)) * 100).toFixed(0)
      : '—';

    const totalBudget = proposals.reduce((s, p) => s + p.total_budget, 0);

    // Items by role
    const byListBuilder = new Map<string, number>();
    const byCsm = new Map<string, number>();
    const bySeller = new Map<string, number>();

    proposals.forEach(p => {
      if (p.list_builder) {
        p.list_builder.split(',').map(n => n.trim()).forEach(n => {
          byListBuilder.set(n, (byListBuilder.get(n) ?? 0) + 1);
        });
      }
      if (p.csm) byCsm.set(p.csm, (byCsm.get(p.csm) ?? 0) + 1);
      if (p.seller) bySeller.set(p.seller, (bySeller.get(p.seller) ?? 0) + 1);
    });

    return { total, approved, declined, pending, building, avgCycle, approvalRate, totalBudget, byListBuilder, byCsm, bySeller };
  }, [proposals]);

  const formatCurrency = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k` : `$${v}`;

  const statuses = [...new Set(proposals.map(p => p.status))].sort();

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
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
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
            <p className="text-xs text-muted-foreground mt-1">Avg. days building proposal</p>
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
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
          const count = proposals.filter(p => p.status === status).length;
          const Icon = cfg.icon;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all ${cfg.color} ${statusFilter === status ? 'ring-2 ring-primary' : 'opacity-80 hover:opacity-100'}`}
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

      {/* Proposals table */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {filtered.length} Proposals
            {statusFilter !== 'all' && <span className="text-muted-foreground"> · {statusFilter}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Name</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Company</TableHead>
                  <TableHead className="text-xs text-right">Budget</TableHead>
                  <TableHead className="text-xs">Seller</TableHead>
                  <TableHead className="text-xs">CSM</TableHead>
                  <TableHead className="text-xs">List Builder</TableHead>
                  <TableHead className="text-xs text-right">Days</TableHead>
                  <TableHead className="text-xs">Timing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(p => {
                  const cfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG['To Do'];
                  return (
                    <TableRow key={p.id} className="text-xs">
                      <TableCell className="font-medium max-w-[220px] truncate">{p.name}</TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${cfg.color} border-0`}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-muted-foreground">{p.company ?? '—'}</TableCell>
                      <TableCell className="text-right font-medium">{p.total_budget > 0 ? formatCurrency(p.total_budget) : '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{p.seller ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">{p.csm ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[120px] truncate">{p.list_builder?.split('@')[0] ?? '—'}</TableCell>
                      <TableCell className="text-right">{p.days_building_proposal ?? '—'}</TableCell>
                      <TableCell>
                        <span className={`text-[10px] font-medium ${p.timing_of_delivery === 'On time' ? 'text-green-400' : p.timing_of_delivery === 'Late Delivery' ? 'text-red-400' : 'text-muted-foreground'}`}>
                          {p.timing_of_delivery ?? '—'}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Proposals;
