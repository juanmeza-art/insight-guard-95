import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useProposalsAudit } from '@/hooks/useProposalsAudit';
import { useTeamKPIs } from '@/hooks/useTeamKPIs';
import { motion } from 'framer-motion';
import {
  DollarSign, Hash, TrendingUp, ShieldCheck, Clock, Wrench,
  Users, Zap, BarChart3, CalendarDays
} from 'lucide-react';
import { ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Line, ComposedChart } from 'recharts';

type Period = '7d' | '30d' | '90d' | 'ytd' | 'all';

function getDateThreshold(period: Period): Date | null {
  const now = new Date();
  switch (period) {
    case '7d': return new Date(now.getTime() - 7 * 86400000);
    case '30d': return new Date(now.getTime() - 30 * 86400000);
    case '90d': return new Date(now.getTime() - 90 * 86400000);
    case 'ytd': return new Date(now.getFullYear(), 0, 1);
    case 'all': return null;
  }
}

const periods: { value: Period; label: string }[] = [
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: '90d', label: '90 días' },
  { value: 'ytd', label: 'YTD' },
  { value: 'all', label: 'Todo' },
];

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
  const [period, setPeriod] = useState<Period>('all');
  const { data: proposals = [], isLoading: loadingP } = useProposalsAudit();
  const { data: kpis = [], isLoading: loadingK } = useTeamKPIs();

  const filtered = useMemo(() => {
    const threshold = getDateThreshold(period);
    if (!threshold) return proposals;
    return proposals.filter(p => p.created_at && new Date(p.created_at) >= threshold);
  }, [proposals, period]);

  const filteredKPIs = useMemo(() => {
    const threshold = getDateThreshold(period);
    if (!threshold) return kpis;
    return kpis.filter(k => k.created_at && new Date(k.created_at) >= threshold);
  }, [kpis, period]);

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
  const cmExecuted$ = filteredKPIs.reduce((s, k) => s + k.output_count, 0);
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
    const map: Record<string, { name: string; campaigns: number; influencers: number; executed: number }> = {};
    filteredKPIs.forEach(k => {
      const name = k.team_name || 'Sin asignar';
      if (!map[name]) map[name] = { name, campaigns: 0, influencers: 0, executed: 0 };
      map[name].campaigns++;
      map[name].influencers += k.num_influencers;
      map[name].executed += k.output_count;
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
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          {periods.map(p => (
            <Button
              key={p.value}
              variant={period === p.value ? 'default' : 'ghost'}
              size="sm"
              className="text-xs h-7 px-3"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
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
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number, name: string) => [name === 'executed' ? `$${value.toLocaleString()}` : value.toLocaleString(), name === 'executed' ? '$ Executed' : name === 'campaigns' ? '# Campaigns' : '# Influencers']} />
                  <Bar yAxisId="left" dataKey="campaigns" fill="hsl(var(--chart-purple))" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="influencers" fill="hsl(var(--chart-green))" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="executed" stroke="hsl(var(--chart-orange))" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
