import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import type { TeamKPI } from '@/types/team-kpi';

interface Props {
  data: TeamKPI[];
}

export function TrendCharts({ data }: Props) {
  const monthlyData = useMemo(() => {
    const grouped: Record<string, { count: number; influencers: number; sent: number; completed: number; ugc: number }> = {};
    data.forEach(c => {
      const month = (c.created_at ?? '').slice(0, 7) || 'unknown';
      if (!grouped[month]) grouped[month] = { count: 0, influencers: 0, sent: 0, completed: 0, ugc: 0 };
      grouped[month].count++;
      grouped[month].influencers += c.num_influencers;
      grouped[month].sent += c.count_sent;
      grouped[month].completed += c.count_completed;
      grouped[month].ugc += c.num_ugc;
    });
    return Object.entries(grouped)
      .filter(([k]) => k !== 'unknown')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        campaigns: d.count,
        influencers: d.influencers,
        sent: d.sent,
        completed: d.completed,
        ugc: d.ugc,
      }));
  }, [data]);

  const chartConfig = {
    campaigns: { label: 'Campaigns', color: 'hsl(var(--chart-blue))' },
    influencers: { label: 'Influencers', color: 'hsl(var(--chart-green))' },
    sent: { label: 'Sent', color: 'hsl(var(--chart-orange))' },
    completed: { label: 'Completed', color: 'hsl(var(--chart-purple))' },
    ugc: { label: 'UGC', color: 'hsl(var(--chart-blue))' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Sent vs Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sent" fill="hsl(var(--chart-orange))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="hsl(var(--chart-green))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Influencers & UGC by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line yAxisId="left" type="monotone" dataKey="influencers" stroke="hsl(var(--chart-green))" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="ugc" stroke="hsl(var(--chart-blue))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
