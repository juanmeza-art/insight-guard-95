import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import type { TeamKPI } from '@/lib/mock-data';

interface Props {
  data: TeamKPI[];
}

export function TrendCharts({ data }: Props) {
  const monthlyData = useMemo(() => {
    const grouped: Record<string, { count: number; budget: number; spent: number; conversions: number }> = {};
    data.forEach(c => {
      const month = c.created_at.slice(0, 7);
      if (!grouped[month]) grouped[month] = { count: 0, budget: 0, spent: 0, conversions: 0 };
      grouped[month].count++;
      grouped[month].budget += c.budget;
      grouped[month].spent += c.spent;
      grouped[month].conversions += c.conversions;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        campaigns: d.count,
        budget: Math.round(d.budget / 1000),
        spent: Math.round(d.spent / 1000),
        conversions: d.conversions,
      }));
  }, [data]);

  const chartConfig = {
    campaigns: { label: 'Campaigns', color: 'hsl(var(--chart-blue))' },
    budget: { label: 'Budget ($K)', color: 'hsl(var(--chart-green))' },
    spent: { label: 'Spent ($K)', color: 'hsl(var(--chart-orange))' },
    conversions: { label: 'Conversions', color: 'hsl(var(--chart-purple))' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Budget vs Spent ($K)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="budget" fill="hsl(var(--chart-green))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" fill="hsl(var(--chart-orange))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Campaigns & Conversions by Month</CardTitle>
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
              <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="hsl(var(--chart-purple))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
