import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, ResponsiveContainer } from 'recharts';
import type { TeamKPI } from '@/lib/mock-data';

interface Props {
  data: TeamKPI[];
}

export function TrendCharts({ data }: Props) {
  const monthlyData = useMemo(() => {
    const grouped: Record<string, { count: number; riskSum: number; budget: number }> = {};
    data.forEach(kpi => {
      const month = kpi.created_at.slice(0, 7);
      if (!grouped[month]) grouped[month] = { count: 0, riskSum: 0, budget: 0 };
      grouped[month].count++;
      grouped[month].riskSum += kpi.risk_score;
      grouped[month].budget += kpi.budget;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        campaigns: d.count,
        avgRisk: +(d.riskSum / d.count).toFixed(2),
        budget: Math.round(d.budget / 1000),
      }));
  }, [data]);

  const chartConfig = {
    campaigns: { label: 'Campaigns', color: 'hsl(var(--chart-blue))' },
    avgRisk: { label: 'Avg Risk', color: 'hsl(var(--chart-orange))' },
    budget: { label: 'Budget ($K)', color: 'hsl(var(--chart-green))' },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Campaign Volume & Risk Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 3]} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line yAxisId="left" type="monotone" dataKey="campaigns" stroke="hsl(var(--chart-blue))" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="avgRisk" stroke="hsl(var(--chart-orange))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Monthly Budget Allocation ($K)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="budget" fill="hsl(var(--chart-green))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
