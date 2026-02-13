import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { ClientPerformanceRow } from '@/hooks/useClientPerformance';

interface GanttTimelineProps {
  data: ClientPerformanceRow[];
}

export const GanttTimeline = ({ data }: GanttTimelineProps) => {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const { teams, globalStart, globalEnd, totalDays } = useMemo(() => {
    const withDates = data.filter((d) => d.execution_start && d.execution_end);
    if (!withDates.length) return { teams: {}, globalStart: 0, globalEnd: 0, totalDays: 0 };

    const starts = withDates.map((d) => new Date(d.execution_start!).getTime());
    const ends = withDates.map((d) => new Date(d.execution_end!).getTime());
    const gStart = Math.min(...starts);
    const gEnd = Math.max(...ends);
    const tDays = Math.max((gEnd - gStart) / (1000 * 60 * 60 * 24), 1);

    const grouped: Record<string, ClientPerformanceRow[]> = {};
    withDates.forEach((d) => {
      const team = d.team_name || 'Unknown';
      if (!grouped[team]) grouped[team] = [];
      grouped[team].push(d);
    });

    // Sort teams by number of campaigns desc
    const sorted: Record<string, ClientPerformanceRow[]> = {};
    Object.entries(grouped)
      .sort(([, a], [, b]) => b.length - a.length)
      .forEach(([k, v]) => {
        sorted[k] = v.sort(
          (a, b) => new Date(a.execution_start!).getTime() - new Date(b.execution_start!).getTime()
        );
      });

    return { teams: sorted, globalStart: gStart, globalEnd: gEnd, totalDays: tDays };
  }, [data]);

  const teamEntries = Object.entries(teams);

  // Generate month labels
  const months = useMemo(() => {
    if (!globalStart || !globalEnd) return [];
    const labels: { label: string; left: number }[] = [];
    const d = new Date(globalStart);
    d.setDate(1);
    while (d.getTime() <= globalEnd) {
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
  }, [globalStart, globalEnd, totalDays]);

  if (!teamEntries.length) {
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
        <CardTitle className="text-sm font-semibold">Execution Timeline by Team</CardTitle>
        <p className="text-xs text-muted-foreground">
          Team saturation view — overlapping bars indicate concurrent campaigns
        </p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {/* Month axis */}
        <div className="relative h-6 mb-1 ml-[140px]">
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
          <div className="space-y-1">
            {teamEntries.map(([team, campaigns], teamIdx) => (
              <div key={team} className="flex items-start gap-2 min-h-[28px]">
                <div className="w-[132px] shrink-0 text-xs font-medium text-foreground truncate pt-1">
                  {team}
                  <span className="text-muted-foreground ml-1">({campaigns.length})</span>
                </div>
                <div className="relative flex-1 h-7 bg-muted/30 rounded-sm">
                  {campaigns.map((c) => {
                    const start = new Date(c.execution_start!).getTime();
                    const end = new Date(c.execution_end!).getTime();
                    const left = ((start - globalStart) / (totalDays * 86400000)) * 100;
                    const width = Math.max(((end - start) / (totalDays * 86400000)) * 100, 0.5);

                    return (
                      <Tooltip key={c.id}>
                        <TooltipTrigger asChild>
                          <div
                            className="absolute top-1 h-5 rounded-sm cursor-pointer transition-opacity"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              backgroundColor: barColors[teamIdx % barColors.length],
                              opacity: hoveredBar === c.id ? 1 : 0.7,
                            }}
                            onMouseEnter={() => setHoveredBar(c.id)}
                            onMouseLeave={() => setHoveredBar(null)}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="text-xs space-y-0.5">
                          <p className="font-semibold">{c.campaign_name}</p>
                          <p>{c.execution_start} → {c.execution_end}</p>
                          <p>Budget: ${c.target_value.toLocaleString()}</p>
                          <p>Company: {c.company}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
