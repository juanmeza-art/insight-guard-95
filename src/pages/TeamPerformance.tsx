import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, TrendingUp, Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTeamKPIs } from '@/hooks/useTeamKPIs';
import { useProposalsAudit } from '@/hooks/useProposalsAudit';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, getDaysInMonth } from 'date-fns';

const QUARTERLY_GOAL = 1_901_116;
const MONTHLY_GOAL = 700_000;

const STATUS_COLORS: Record<string, string> = {
  'To Do': '#f97316',
  'Building Proposal': '#3b82f6',
  'Pending Approval': '#eab308',
  'Approved': '#22c55e',
  'Sent to Execution': '#22c55e',
  'Declined': '#ef4444',
  'In Progress': '#8b5cf6',
  'Done': '#06b6d4',
};
const FALLBACK_COLORS = ['#f472b6', '#a78bfa', '#34d399', '#fb923c', '#60a5fa', '#fbbf24'];

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v);

export default function TeamPerformance() {
  const { data: teamKpis = [], isLoading: kpiLoading } = useTeamKPIs();
  const { data: proposals = [], isLoading: propLoading } = useProposalsAudit();

  // AI Insight state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);

  // Daily chart month selector
  const [dailyMonth, setDailyMonth] = useState(() => new Date());

  // ── OKR calculations ──
  const { quarterlyActual, monthlyActual } = useMemo(() => {
    let qActual = 0;
    let mActual = 0;
    for (const k of teamKpis) {
      if (!k.execution_start) continue;
      const d = parseISO(k.execution_start);
      const yr = d.getFullYear();
      const mo = d.getMonth();
      if (yr === 2026 && mo >= 0 && mo <= 2) qActual += k.target_value;
      if (yr === 2026 && mo === 1) mActual += k.target_value;
    }
    return { quarterlyActual: qActual, monthlyActual: mActual };
  }, [teamKpis]);

  const qPct = Math.min((quarterlyActual / QUARTERLY_GOAL) * 100, 100);
  const mPct = Math.min((monthlyActual / MONTHLY_GOAL) * 100, 100);

  // ── Chart 1 & 2: Monthly volume & budget by status (last 6 months) ──
  const { monthlyVolumeData, monthlyBudgetData, allStatuses } = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      months.push({
        key: format(d, 'yyyy-MM'),
        label: format(d, 'MMM yyyy'),
        start: startOfMonth(d),
        end: endOfMonth(d),
      });
    }

    const statusSet = new Set<string>();
    const volMap: Record<string, Record<string, number>> = {};
    const budMap: Record<string, Record<string, number>> = {};
    months.forEach((m) => { volMap[m.key] = {}; budMap[m.key] = {}; });

    for (const p of proposals) {
      const dateStr = p.building_proposal_start || p.created_at;
      if (!dateStr) continue;
      const d = parseISO(dateStr);
      const key = format(d, 'yyyy-MM');
      const status = p.status === 'Sent to Execution' ? 'Approved' : (p.status || 'Unknown');
      statusSet.add(status);
      if (volMap[key]) {
        volMap[key][status] = (volMap[key][status] || 0) + 1;
        budMap[key][status] = (budMap[key][status] || 0) + p.budget;
      }
    }

    const statuses = Array.from(statusSet);
    const volumeData = months.map((m) => ({ name: m.label, ...volMap[m.key] }));
    const budgetData = months.map((m) => ({ name: m.label, ...budMap[m.key] }));

    return { monthlyVolumeData: volumeData, monthlyBudgetData: budgetData, allStatuses: statuses };
  }, [proposals]);

  // ── Chart 3: Daily proposals for selected month ──
  const dailyData = useMemo(() => {
    const daysCount = getDaysInMonth(dailyMonth);
    const counts: number[] = new Array(daysCount).fill(0);
    const monthKey = format(dailyMonth, 'yyyy-MM');

    for (const p of proposals) {
      const dateStr = p.building_proposal_start || p.created_at;
      if (!dateStr) continue;
      const d = parseISO(dateStr);
      if (format(d, 'yyyy-MM') === monthKey) {
        counts[d.getDate() - 1]++;
      }
    }

    return counts.map((c, i) => ({ day: i + 1, count: c }));
  }, [proposals, dailyMonth]);

  // ── Chart 4: Campaigns, Influencers & UGC (current quarter only) ──
  const quarterlyData = useMemo(() => {
    const validStatuses = ['Ongoing', 'Recently Completed', 'Completed'];
    const now = new Date();
    const currentQ = Math.floor(now.getMonth() / 3);
    const currentYear = now.getFullYear();

    const campaigns = new Set<string>();
    let influencers = 0;
    let ugc = 0;

    for (const k of teamKpis) {
      if (!k.execution_start || !validStatuses.includes(k.sal_status || '')) continue;
      const d = parseISO(k.execution_start);
      if (d.getFullYear() === currentYear && Math.floor(d.getMonth() / 3) === currentQ) {
        if (k.campaign_name) campaigns.add(k.campaign_name);
        influencers += k.num_influencers;
        ugc += k.num_ugc;
      }
    }

    const qLabel = `Q${currentQ + 1} '${String(currentYear).slice(2)}`;
    return [{ quarter: qLabel, campaigns: campaigns.size, influencers, ugc }];
  }, [teamKpis]);

  // ── Monthly KPI Summary Table (last 6 months) ──
  const monthlyKpiTable = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; start: Date; end: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      months.push({
        key: format(d, 'yyyy-MM'),
        label: format(d, 'MMM'),
        start: startOfMonth(d),
        end: endOfMonth(d),
      });
    }

    return months.map((m) => {
      // Filter proposals for this month
      const monthProposals = proposals.filter(p => {
        const dateStr = p.building_proposal_start || p.created_at;
        if (!dateStr) return false;
        const d = parseISO(dateStr);
        return format(d, 'yyyy-MM') === m.key;
      });

      // Sales Cycle: avg days_after_approved where > 0
      const validDays = monthProposals.filter(p => p.days_after_approved != null && p.days_after_approved > 0);
      const salesCycle = validDays.length > 0
        ? (validDays.reduce((s, p) => s + (p.days_after_approved ?? 0), 0) / validDays.length).toFixed(1)
        : '—';

      // Approval Rate
      const approved = monthProposals.filter(p => p.status === 'Approved' || p.status === 'Sent to Execution').length;
      const declined = monthProposals.filter(p => p.status === 'Declined').length;
      const approvalRate = (approved + declined) > 0
        ? `${((approved / (approved + declined)) * 100).toFixed(0)}%`
        : '—';

      // TPV Goal Attainment: sum target_value from teamKpis for this month
      let tpv = 0;
      for (const k of teamKpis) {
        if (!k.execution_start) continue;
        const d = parseISO(k.execution_start);
        if (format(d, 'yyyy-MM') === m.key) tpv += k.target_value;
      }
      const goalPct = MONTHLY_GOAL > 0 ? `${((tpv / MONTHLY_GOAL) * 100).toFixed(0)}%` : '—';

      return { label: m.label, salesCycle, approvalRate, goalPct };
    });
  }, [proposals, teamKpis]);

  // ── AI Insight handler ──
  const generateInsight = async () => {
    setAiOpen(true);
    if (aiInsight) return;
    setAiLoading(true);
    try {
      const summary = {
        campaign_name: 'Team OKR Summary',
        target_value: QUARTERLY_GOAL,
        progress_pct: Math.round(qPct),
        num_influencers: teamKpis.reduce((s, k) => s + k.num_influencers, 0),
        executed_amount: quarterlyActual,
        sal_status: 'Ongoing',
      };
      const { data, error } = await supabase.functions.invoke('campaign-insights', { body: { campaign: summary } });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); setAiOpen(false); return; }
      setAiInsight(data.insight);
    } catch {
      toast.error('Error generating AI analysis');
      setAiOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  const isLoading = kpiLoading || propLoading;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Performance</h1>
          <p className="text-sm text-muted-foreground">OKR tracking & workload analytics</p>
        </div>
      </div>

      {/* ── OKR Section ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Q1 2026 — TPV Music Execution Goal</CardTitle>
            </div>
            <CardDescription>Target: {fmtCurrency(QUARTERLY_GOAL)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Attained: {fmtCurrency(quarterlyActual)}</span>
              <span className="font-semibold">{qPct.toFixed(1)}%</span>
            </div>
            <Progress value={qPct} className="h-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">February 2026 — Monthly Goal</CardTitle>
            </div>
            <CardDescription>Target: {fmtCurrency(MONTHLY_GOAL)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Attained: {fmtCurrency(monthlyActual)}</span>
              <span className="font-semibold">{mPct.toFixed(1)}%</span>
            </div>
            <Progress value={mPct} className="h-3" />
          </CardContent>
        </Card>
      </div>

      {/* AI Insight */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-2" onClick={generateInsight}>
          <Sparkles className="h-4 w-4 text-primary" />
          AI Insight on Progress
        </Button>
      </div>

      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Analysis — OKR Progress
            </DialogTitle>
          </DialogHeader>
          {aiLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing OKR progress...</p>
            </div>
          ) : aiInsight ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{aiInsight}</ReactMarkdown>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ── Charts ── */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Chart 1: Monthly Volume */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Volume of Requests by Status</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyVolumeData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {allStatuses.map((s, i) => (
                    <Bar key={s} dataKey={s} stackId="a" fill={STATUS_COLORS[s] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]} radius={[0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Chart 2: Monthly Budget */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monthly Budget by Status</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthlyBudgetData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtCurrency(v)} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {allStatuses.map((s, i) => (
                    <Bar key={s} dataKey={s} stackId="a" fill={STATUS_COLORS[s] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]} radius={[0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Chart 3: Daily Proposals */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Daily Proposals Requested</CardTitle>
                <CardDescription>{format(dailyMonth, 'MMMM yyyy')}</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDailyMonth((d) => subMonths(d, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDailyMonth((d) => { const next = new Date(d); next.setMonth(next.getMonth() + 1); return next > new Date() ? d : next; })}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Chart 4: Campaigns, Influencers & UGC (current Q) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Campaigns, Influencers & UGC</CardTitle>
            <CardDescription>Current quarter — Ongoing + Completed</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={quarterlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} className="fill-muted-foreground" label={{ value: '# Campaigns', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#9ca3af' } }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="influencers" fill="#f97316" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="ugc" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="campaigns" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Monthly KPI Summary Table ── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Monthly KPI Summary</CardTitle>
          <CardDescription>Last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold w-[160px]">Metric</TableHead>
                  {monthlyKpiTable.map((m) => (
                    <TableHead key={m.label} className="text-xs text-center">{m.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs font-medium">Sales Cycle (days)</TableCell>
                  {monthlyKpiTable.map((m) => (
                    <TableCell key={m.label} className="text-xs text-center font-mono">{m.salesCycle}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs font-medium">Approval Rate</TableCell>
                  {monthlyKpiTable.map((m) => (
                    <TableCell key={m.label} className="text-xs text-center font-mono">{m.approvalRate}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs font-medium">TPV Goal Attainment</TableCell>
                  {monthlyKpiTable.map((m) => (
                    <TableCell key={m.label} className="text-xs text-center font-mono">{m.goalPct}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
