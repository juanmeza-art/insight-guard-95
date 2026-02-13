import { CalendarIcon } from 'lucide-react';
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

      {/* Scatter Plot */}
      <CampaignScatterPlot data={filtered} />

      {/* Gantt Timeline */}
      <GanttTimeline data={filtered} />
    </div>
  );
};

export default ClientPerformance;
