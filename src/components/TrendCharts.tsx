import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import type { ExecutionCampaign } from '@/hooks/useExecutionCampaigns';

interface Props {
  data: ExecutionCampaign[];
}

export function TrendCharts({ data }: Props) {
  const monthlyData = useMemo(() => {
    const grouped: Record<string, { count: number; budget: number; executed: number; influencers: number }> = {};
    data.forEach(c => {
      const month = c.ongoing_start_date?.slice(0, 7) || c.created_at.slice(0, 7);
      if (!grouped[month]) grouped[month] = { count: 0, budget: 0, executed: 0, influencers: 0 };
      grouped[month].count++;
      grouped[month].budget += Number(c.total_budget);
      grouped[month].executed += Number(c.executed_amount);
      grouped[month].influencers += c.num_influencers;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        campaigns: d.count,
        budget: Math.round(d.budget / 1000),
        executed: Math.round(d.executed / 1000),
        influencers: d.influencers,
      }));
  }, [data]);

  const chartConfig = {
    campaigns: { label: 'Campaigns', color: 'hsl(var(--chart-blue))' },
    budget: { label: 'Budget ($K)', color: 'hsl(var(--chart-green))' },
    executed: { label: 'Executed ($K)', color: 'hsl(var(--chart-orange))' },
    influencers: { label: 'Influencers', color: 'hsl(var(--chart-purple))' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Budget vs Executed ($K)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="budget" fill="hsl(var(--chart-green))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="executed" fill="hsl(var(--chart-orange))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Campaigns & Influencers by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line yAxisId="left" type="monotone" dataKey="campaigns" stroke="hsl(var(--chart-blue))" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="influencers" stroke="hsl(var(--chart-purple))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
