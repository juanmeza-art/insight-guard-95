import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';
import { useClientPerformance } from '@/hooks/useClientPerformance';
import { KPICards } from '@/components/client-performance/KPICards';
import { CampaignScatterPlot } from '@/components/client-performance/ScatterPlot';
import { GanttTimeline } from '@/components/client-performance/GanttTimeline';

const ClientPerformance = () => {
  const { data: allKPIs = [] } = useClientPerformance();
  const companies = [...new Set(allKPIs.map(k => k.company).filter(Boolean))].sort();
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = selectedCompany === 'all' ? allKPIs : allKPIs.filter(k => k.company === selectedCompany);
    if (dateFrom) result = result.filter(k => k.execution_start && new Date(k.execution_start) >= dateFrom);
    if (dateTo) result = result.filter(k => k.execution_start && new Date(k.execution_start) <= dateTo);
    return result;
  }, [allKPIs, selectedCompany, dateFrom, dateTo]);

  const hasScatterData = filtered.some((d) => d.views > 0 || d.engagements > 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Client Performance</h1>
          <p className="text-sm text-muted-foreground">Actionable audit view — campaign efficiency & team saturation</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Popover open={fromOpen} onOpenChange={setFromOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[140px] justify-start text-left text-xs", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="mr-1 h-3 w-3" />
                {dateFrom ? format(dateFrom, "MMM d, yy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateFrom} onSelect={(d) => { setDateFrom(d); setFromOpen(false); }} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          <Popover open={toOpen} onOpenChange={setToOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[140px] justify-start text-left text-xs", !dateTo && "text-muted-foreground")}>
                <CalendarIcon className="mr-1 h-3 w-3" />
                {dateTo ? format(dateTo, "MMM d, yy") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={dateTo} onSelect={(d) => { setDateTo(d); setToOpen(false); }} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
          {(dateFrom || dateTo) && (
            <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => { setDateFrom(undefined); setDateTo(undefined); }}>Clear</Button>
          )}
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
      </div>

      {/* KPI Cards */}
      <KPICards data={filtered} />

      {/* Scatter Plot — only show when there's data */}
      {hasScatterData && <CampaignScatterPlot data={filtered} />}

      {/* Gantt Timeline */}
      <GanttTimeline data={filtered} />

      {/* Campaign Detail Cards */}
      {selectedCompany !== 'all' && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(kpi => {
            const rows: { label: string; value: string }[] = [];
            if (kpi.team_name) rows.push({ label: 'Team', value: kpi.team_name });
            if (kpi.target_value > 0) rows.push({ label: 'Total Budget', value: `$${kpi.target_value.toLocaleString()}` });
            if (kpi.executed_take_rate_pct > 0) rows.push({ label: 'Take Rate', value: `${kpi.executed_take_rate_pct}%` });
            if (kpi.views > 0) rows.push({ label: 'Views', value: kpi.views.toLocaleString() });
            if (kpi.engagements > 0) rows.push({ label: 'Engagements', value: kpi.engagements.toLocaleString() });
            if (kpi.sal_status) rows.push({ label: 'Status', value: kpi.sal_status });
            if (kpi.execution_start) rows.push({ label: 'Period', value: `${kpi.execution_start} → ${kpi.execution_end ?? '—'}` });

            if (!rows.length) return null;

            const hasCpm = kpi.cpm > 0;
            const hasCpe = kpi.cpe > 0;
            const hasEr = kpi.er_pct > 0;
            const hasMetrics = hasCpm || hasCpe || hasEr;

            return (
              <Card key={kpi.id} className="glass-card overflow-hidden">
                {/* Header with gradient accent */}
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-semibold">{kpi.campaign_name || 'Unnamed'}</CardTitle>
                </CardHeader>

                {/* Performance metrics highlight strip */}
                {hasMetrics && (
                  <div className="grid grid-cols-3 divide-x divide-border/30 bg-primary/5">
                    {hasCpm ? (
                      <div className="px-3 py-2.5 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPM</p>
                        <p className="text-sm font-bold text-chart-orange">${kpi.cpm.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                    ) : <div className="px-3 py-2.5" />}
                    {hasCpe ? (
                      <div className="px-3 py-2.5 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPE</p>
                        <p className="text-sm font-bold text-chart-blue">${kpi.cpe.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                      </div>
                    ) : <div className="px-3 py-2.5" />}
                    {hasEr ? (
                      <div className="px-3 py-2.5 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">ER%</p>
                        <p className="text-sm font-bold text-chart-green">{kpi.er_pct.toFixed(2)}%</p>
                      </div>
                    ) : <div className="px-3 py-2.5" />}
                  </div>
                )}

                <CardContent className="pt-3 space-y-1.5 text-xs text-muted-foreground">
                  {rows.map((r) => (
                    <div key={r.label} className="flex justify-between">
                      <span>{r.label}</span>
                      <span className="text-foreground font-medium">{r.value}</span>
                    </div>
                  ))}
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
