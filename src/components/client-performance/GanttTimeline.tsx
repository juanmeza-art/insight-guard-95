import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ClientPerformanceRow } from '@/hooks/useClientPerformance';

interface GanttTimelineProps {
  data: ClientPerformanceRow[];
}

export const GanttTimeline = ({ data }: GanttTimelineProps) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const { campaigns, globalStart, totalDays } = useMemo(() => {
    const withDates = data
      .filter((d) => d.execution_start && d.execution_end)
      .sort((a, b) => new Date(a.execution_start!).getTime() - new Date(b.execution_start!).getTime());

    if (!withDates.length) return { campaigns: [], globalStart: 0, totalDays: 0 };

    const starts = withDates.map((d) => new Date(d.execution_start!).getTime());
    const ends = withDates.map((d) => new Date(d.execution_end!).getTime());
    const gStart = Math.min(...starts);
    const gEnd = Math.max(...ends);
    const tDays = Math.max((gEnd - gStart) / (1000 * 60 * 60 * 24), 1);

    return { campaigns: withDates, globalStart: gStart, totalDays: tDays };
  }, [data]);

  const months = useMemo(() => {
    if (!globalStart || !totalDays) return [];
    const gEnd = globalStart + totalDays * 86400000;
    const labels: { label: string; left: number }[] = [];
    const d = new Date(globalStart);
    d.setDate(1);
    while (d.getTime() <= gEnd) {
      const offset = (d.getTime() - globalStart) / (1000 * 60 * 60 * 24);
      if (offset >= 0) {
        labels.push({
          label: d.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
          left: (offset / totalDays) * 100,
        });
      }
      d.setMonth(d.getMonth() + 1);
    }
    return labels;
  }, [globalStart, totalDays]);

  if (!campaigns.length) {
    return (
      <Card className="glass-card flex items-center justify-center h-48">
        <p className="text-sm text-muted-foreground">No campaigns with execution dates</p>
      </Card>
    );
  }

  const barColors = [
    'hsl(var(--chart-blue))',
    'hsl(var(--chart-orange))',
    'hsl(var(--chart-green))',
    'hsl(var(--chart-purple))',
    'hsl(var(--chart-red))',
  ];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Execution Timeline by Campaign</CardTitle>
        <p className="text-xs text-muted-foreground">
          Each row is a campaign — hover for details
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {/* Month axis */}
        <div className="relative h-6 mb-1 ml-[200px]">
          {months.map((m, i) => (
            <span
              key={i}
              className="absolute text-[10px] text-muted-foreground"
              style={{ left: `${m.left}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <TooltipProvider delayDuration={100}>
          <div className="space-y-0.5">
            {campaigns.map((c, idx) => {
              const start = new Date(c.execution_start!).getTime();
              const end = new Date(c.execution_end!).getTime();
              const left = ((start - globalStart) / (totalDays * 86400000)) * 100;
              const width = Math.max(((end - start) / (totalDays * 86400000)) * 100, 0.5);

              return (
                <div key={c.id} className="flex items-center gap-2 min-h-[24px]">
                  <div className="w-[192px] shrink-0 text-[11px] font-medium text-foreground truncate">
                    {c.campaign_name || 'Unnamed'}
                  </div>
                  <div className="relative flex-1 h-5 bg-muted/30 rounded-sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute top-0.5 h-4 rounded-sm cursor-pointer transition-opacity"
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            backgroundColor: barColors[idx % barColors.length],
                            opacity: hoveredBar === c.id ? 1 : 0.65,
                          }}
                          onMouseEnter={() => setHoveredBar(c.id)}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs space-y-0.5">
                        <p className="font-semibold">{c.campaign_name}</p>
                        <p>Team: {c.team_name}</p>
                        <p>{c.execution_start} → {c.execution_end}</p>
                        <p>Budget: ${c.target_value.toLocaleString()}</p>
                        <p>Company: {c.company}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
