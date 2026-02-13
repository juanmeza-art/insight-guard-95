import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useProposalsAudit } from '@/hooks/useProposalsAudit';
import { useTeamKPIs } from '@/hooks/useTeamKPIs';
import { motion } from 'framer-motion';
import {
  DollarSign, Hash, TrendingUp, ShieldCheck, Clock, Wrench,
  Users, Zap, BarChart3, CalendarDays, UserSearch
} from 'lucide-react';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Line, ComposedChart } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const APPROVED_STATUSES = ['Approved', 'Done', 'Completed', 'Executing', 'Ejecutando'];

interface KPICardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  delay?: number;
  subtitle?: string;
}

function KPICard({ label, value, icon: Icon, color, delay = 0, subtitle }: KPICardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="glass-card hover:border-primary/30 transition-colors h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <p className="text-2xl font-bold font-mono">{value}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground mt-1">{subtitle}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function fmt$(n: number) {
  return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;
}

function pct(n: number, d: number) {
  return d === 0 ? '0%' : `${Math.round((n / d) * 100)}%`;
}

const PIE_COLORS = [
  'hsl(var(--chart-green))',
  'hsl(var(--chart-orange))',
  'hsl(var(--chart-blue))',
  'hsl(var(--chart-purple))',
  'hsl(var(--chart-red))',
];

export default function RolePerformance() {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(() => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<string>('all');
  const { data: proposals = [], isLoading: loadingP } = useProposalsAudit();
  const { data: kpis = [], isLoading: loadingK } = useTeamKPIs();

  // Collect all unique people across roles
  const allPeople = useMemo(() => {
    const names = new Set<string>();
    proposals.forEach(p => {
      if (p.csm) names.add(p.csm);
      if (p.seller_name) names.add(p.seller_name);
      if (p.list_builder) p.list_builder.split(',').map(n => n.trim()).forEach(n => { if (n) names.add(n); });
    });
    kpis.forEach(k => {
      if (k.team_name) names.add(k.team_name);
    });
    return Array.from(names).sort();
  }, [proposals, kpis]);

  const filtered = useMemo(() => {
    let result = proposals;
    if (dateFrom) result = result.filter(p => (p.building_proposal_start || p.pending_approval_start) && new Date(p.building_proposal_start || p.pending_approval_start!) >= dateFrom);
    if (dateTo) result = result.filter(p => (p.building_proposal_start || p.pending_approval_start) && new Date(p.building_proposal_start || p.pending_approval_start!) <= dateTo);
    if (selectedPerson !== 'all') {
      result = result.filter(p =>
        p.csm === selectedPerson ||
        p.seller_name === selectedPerson ||
        (p.list_builder && p.list_builder.split(',').map(n => n.trim()).includes(selectedPerson))
      );
    }
    return result;
  }, [proposals, dateFrom, dateTo, selectedPerson]);

  const filteredKPIs = useMemo(() => {
    let result = kpis;
    if (dateFrom) result = result.filter(k => k.execution_start && new Date(k.execution_start) >= dateFrom);
    if (dateTo) result = result.filter(k => k.execution_start && new Date(k.execution_start) <= dateTo);
    if (selectedPerson !== 'all') {
      result = result.filter(k => k.team_name === selectedPerson);
    }
    return result;
  }, [kpis, dateFrom, dateTo, selectedPerson]);


  // ---- CSM metrics ----
  const csmTotal$ = filtered.reduce((s, p) => s + p.budget, 0);
  const csmTotalN = filtered.length;
  const csmApproved = filtered.filter(p => APPROVED_STATUSES.includes(p.status ?? ''));
  const csmApproved$ = csmApproved.reduce((s, p) => s + p.budget, 0);
  const csmApprovedN = csmApproved.length;
  const sellerSlaNO = filtered.filter(p => (p.seller_sla ?? 'NO').toUpperCase() === 'NO').length;

  // ---- Listbuilder metrics ----
  const lbTotal$ = csmTotal$;
  const lbTotalN = csmTotalN;
  const lbApproved$ = csmApproved$;
  const lbApprovedN = csmApprovedN;
  const lbSlaYES = filtered.filter(p => (p.lb_sla ?? 'NO').toUpperCase() === 'YES').length;
  const lbAdjustments = filtered.filter(p => p.proposal_adjustments > 0).length;

  // ---- Campaign Manager metrics (from team_kpis) ----
  const cmExecuted$ = filteredKPIs.reduce((s, k) => s + k.target_value, 0);
  const cmCampaigns = filteredKPIs.length;
  const cmInfluencers = filteredKPIs.reduce((s, k) => s + k.num_influencers, 0);
  const cmHealthy = filteredKPIs.filter(k => k.progress_pct >= 80).length;

  // Charts data
  const csmByPerson = useMemo(() => {
    const map: Record<string, { name: string; presented: number; approved: number }> = {};
    filtered.forEach(p => {
      const name = p.csm || 'Sin asignar';
      if (!map[name]) map[name] = { name, presented: 0, approved: 0 };
      map[name].presented += p.budget;
      if (APPROVED_STATUSES.includes(p.status ?? '')) map[name].approved += p.budget;
    });
    return Object.values(map).sort((a, b) => b.presented - a.presented).slice(0, 8);
  }, [filtered]);

  const lbByPerson = useMemo(() => {
    const map: Record<string, { name: string; total: number; onTime: number; adjustments: number }> = {};
    filtered.forEach(p => {
      const names = (p.list_builder || 'Sin asignar').split(',').map(n => n.trim());
      names.forEach(name => {
        if (!map[name]) map[name] = { name, total: 0, onTime: 0, adjustments: 0 };
        map[name].total++;
        if ((p.lb_sla ?? 'NO').toUpperCase() === 'YES') map[name].onTime++;
        if (p.proposal_adjustments > 0) map[name].adjustments++;
      });
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 8);
  }, [filtered]);

  const cmByPerson = useMemo(() => {
    const map: Record<string, { name: string; campaigns: number; influencers: number; ugc: number; executed: number }> = {};
    filteredKPIs.forEach(k => {
      const name = k.team_name || 'Sin asignar';
      if (!map[name]) map[name] = { name, campaigns: 0, influencers: 0, ugc: 0, executed: 0 };
      map[name].campaigns++;
      map[name].influencers += k.num_influencers;
      map[name].ugc += k.num_ugc;
      map[name].executed += k.target_value;
    });
    return Object.values(map).sort((a, b) => b.campaigns - a.campaigns).slice(0, 10);
  }, [filteredKPIs]);

  if (loadingP || loadingK) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const renderPieLabel = ({ name, percent }: { name: string; percent: number }) => {
    const short = name.length > 10 ? name.slice(0, 10) + '…' : name;
    return `${short} ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header + Time Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Performance</h1>
          <p className="text-sm text-muted-foreground">KPIs by role across the pipeline</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Popover open={fromOpen} onOpenChange={setFromOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[130px] justify-start text-left text-xs", !dateFrom && "text-muted-foreground")}>
                <CalendarDays className="mr-1 h-3 w-3" />
                {dateFrom ? format(dateFrom, "MMM d, yy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d); setFromOpen(false); }} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          <Popover open={toOpen} onOpenChange={setToOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[130px] justify-start text-left text-xs", !dateTo && "text-muted-foreground")}>
                <CalendarDays className="mr-1 h-3 w-3" />
                {dateTo ? format(dateTo, "MMM d, yy") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d); setToOpen(false); }} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          <Select value={selectedPerson} onValueChange={setSelectedPerson}>
            <SelectTrigger className="w-[160px] text-xs h-9">
              <UserSearch className="mr-1 h-3 w-3" />
              <SelectValue placeholder="All people" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All people</SelectItem>
              {allPeople.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(dateFrom || dateTo || selectedPerson !== 'all') && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setDateFrom(undefined); setDateTo(undefined); setSelectedPerson('all'); }}>Clear</Button>
          )}
        </div>
      </div>

      {/* CSM Section */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-[hsl(var(--chart-blue))]" /> CSM
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
            <KPICard label="Total $ Presented" value={fmt$(csmTotal$)} icon={DollarSign} color="text-[hsl(var(--chart-blue))]" delay={0} />
            <KPICard label="# Campaigns" value={csmTotalN} icon={Hash} color="text-[hsl(var(--chart-blue))]" delay={0.05} />
            <KPICard label="Approved $" value={fmt$(csmApproved$)} icon={TrendingUp} color="text-[hsl(var(--chart-green))]" delay={0.1} subtitle={`${csmApprovedN} campaigns`} />
            <KPICard label="Approval Rate" value={pct(csmApproved$, csmTotal$)} icon={ShieldCheck} color="text-[hsl(var(--chart-green))]" delay={0.15} subtitle={`${pct(csmApprovedN, csmTotalN)} by #`} />
            <KPICard label="Seller SLA Miss" value={pct(sellerSlaNO, csmTotalN)} icon={Clock} color="text-[hsl(var(--chart-red))]" delay={0.2} subtitle={`${sellerSlaNO} of ${csmTotalN}`} />
          </div>
          {csmByPerson.length > 0 && (
            <Card className="glass-card flex flex-col items-center justify-center">
              <CardContent className="pt-4 w-full">
                <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">$ by CSM</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={csmByPerson} dataKey="presented" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={renderPieLabel} labelLine={false} fontSize={9}>
                      {csmByPerson.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Listbuilders Section */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Wrench className="h-4 w-4 text-[hsl(var(--chart-orange))]" /> List Builders
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3">
            <KPICard label="Total $ Presented" value={fmt$(lbTotal$)} icon={DollarSign} color="text-[hsl(var(--chart-orange))]" delay={0} />
            <KPICard label="# Campaigns" value={lbTotalN} icon={Hash} color="text-[hsl(var(--chart-orange))]" delay={0.05} />
            <KPICard label="Approved $" value={fmt$(lbApproved$)} icon={TrendingUp} color="text-[hsl(var(--chart-green))]" delay={0.1} subtitle={`${lbApprovedN} campaigns`} />
            <KPICard label="Within LB SLA" value={pct(lbSlaYES, lbTotalN)} icon={ShieldCheck} color="text-[hsl(var(--chart-green))]" delay={0.15} subtitle={`${lbSlaYES} of ${lbTotalN}`} />
            <KPICard label="Needed Adjustments" value={pct(lbAdjustments, lbTotalN)} icon={Wrench} color="text-[hsl(var(--chart-red))]" delay={0.2} subtitle={`${lbAdjustments} proposals`} />
          </div>
          {lbByPerson.length > 0 && (
            <Card className="glass-card flex flex-col items-center justify-center">
              <CardContent className="pt-4 w-full">
                <p className="text-xs font-semibold text-muted-foreground mb-2 text-center">Proposals by List Builder</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={lbByPerson} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={renderPieLabel} labelLine={false} fontSize={9}>
                      {lbByPerson.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Campaign Managers Section */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-[hsl(var(--chart-purple))]" /> Campaign Managers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPICard label="$ Executed" value={fmt$(cmExecuted$)} icon={DollarSign} color="text-[hsl(var(--chart-purple))]" delay={0} />
          <KPICard label="# Campaigns" value={cmCampaigns} icon={BarChart3} color="text-[hsl(var(--chart-purple))]" delay={0.05} />
          <KPICard label="# Influencers" value={cmInfluencers} icon={Users} color="text-[hsl(var(--chart-green))]" delay={0.1} />
          <KPICard label="Healthy Timelines" value={pct(cmHealthy, cmCampaigns)} icon={CalendarDays} color="text-[hsl(var(--chart-green))]" delay={0.15} subtitle={`${cmHealthy} of ${cmCampaigns}`} />
        </div>
        {cmByPerson.length > 0 && (
          <Card className="glass-card mt-4">
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Performance by Campaign Manager</p>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={cmByPerson}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} label={{ value: '# Campaigns', angle: 90, position: 'insideRight', style: { fontSize: 9, fill: '#9ca3af' } }} />
                  <Tooltip formatter={(value: number, name: string) => [name === 'executed' ? `$${value.toLocaleString()}` : value.toLocaleString(), name === 'executed' ? '$ Executed' : name === 'campaigns' ? '# Campaigns' : name === 'ugc' ? '# UGC' : '# Influencers']} />
                  <Bar yAxisId="right" dataKey="campaigns" fill="hsl(var(--chart-purple))" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="influencers" fill="hsl(var(--chart-green))" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="ugc" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="executed" stroke="hsl(var(--chart-orange))" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
