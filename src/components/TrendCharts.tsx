import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { TeamKPI } from '@/types/team-kpi';

interface Props {
  data: TeamKPI[];
}

const PIE_COLORS = [
  'hsl(var(--chart-green))',
  'hsl(var(--chart-orange))',
  'hsl(var(--chart-blue))',
  'hsl(var(--chart-purple))',
  'hsl(var(--chart-red))',
  'hsl(var(--chart-green))',
  'hsl(var(--chart-orange))',
  'hsl(var(--chart-blue))',
];

export function TrendCharts({ data }: Props) {
  // Monthly data grouped by execution_start month
  const monthlyData = useMemo(() => {
    const grouped: Record<string, { budget: number; campaigns: number; influencers: number; ugc: number }> = {};
    data.forEach(c => {
      const dateStr = c.execution_start ?? (c.created_at ?? '').slice(0, 10);
      const month = dateStr?.slice(0, 7);
      if (!month || month === 'unknown') return;
      if (!grouped[month]) grouped[month] = { budget: 0, campaigns: 0, influencers: 0, ugc: 0 };
      grouped[month].budget += c.target_value;
      grouped[month].campaigns++;
      grouped[month].influencers += c.num_influencers;
      grouped[month].ugc += c.num_ugc;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        ...d,
      }));
  }, [data]);

  // Workload distribution: ongoing campaigns by campaign manager
  const workloadData = useMemo(() => {
    const ongoing = data.filter(c => (c.sal_status ?? '').toLowerCase() === 'ongoing');
    const map: Record<string, number> = {};
    ongoing.forEach(c => {
      const name = c.team_name || 'Unassigned';
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [data]);

  const chartConfig = {
    budget: { label: 'Budget ($)', color: 'hsl(var(--chart-blue))' },
    campaigns: { label: 'Campaigns', color: 'hsl(var(--chart-orange))' },
    influencers: { label: 'Influencers', color: 'hsl(var(--chart-green))' },
    ugc: { label: 'UGC', color: 'hsl(var(--chart-purple))' },
  };

  const renderPieLabel = ({ name, percent }: { name: string; percent: number }) => {
    const short = name.length > 12 ? name.slice(0, 12) + '…' : name;
    return `${short} ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Budget */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Budget ($)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="budget" fill="hsl(var(--chart-blue))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Campaigns */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="campaigns" fill="hsl(var(--chart-orange))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly Influencers */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Influencers</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="influencers" fill="hsl(var(--chart-green))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Monthly UGC */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly UGC</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="ugc" fill="hsl(var(--chart-purple))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Workload Distribution */}
      {workloadData.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Current Workload – Ongoing Campaigns by Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={workloadData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={renderPieLabel} labelLine={false} fontSize={10}>
                  {workloadData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
