import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ClientPerformanceRow } from '@/hooks/useClientPerformance';

interface ScatterPlotProps {
  data: ClientPerformanceRow[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover p-3 text-popover-foreground shadow-md text-xs space-y-1">
      <p className="font-semibold text-sm">{d.campaign_name}</p>
      <p>Views: {d.views.toLocaleString()}</p>
      <p>Engagements: {d.engagements.toLocaleString()}</p>
      <p>Budget: ${d.target_value.toLocaleString()}</p>
      <p>ER: {d.er_pct.toFixed(2)}%</p>
    </div>
  );
};

export const CampaignScatterPlot = ({ data }: ScatterPlotProps) => {
  const chartData = useMemo(
    () => data.filter((d) => d.views > 0 || d.engagements > 0),
    [data]
  );

  if (!chartData.length) {
    return (
      <Card className="glass-card flex items-center justify-center h-48">
        <p className="text-sm text-muted-foreground">No campaigns with views or engagements data</p>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">
          Campaign Efficiency — Views vs Engagements
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Bubble size = Budget. Top-left = high engagement at low views (organic efficiency)
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
            <XAxis
              dataKey="views"
              type="number"
              name="Views"
              tick={{ fontSize: 10 }}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              label={{ value: 'Views', position: 'insideBottom', offset: -10, fontSize: 11 }}
            />
            <YAxis
              dataKey="engagements"
              type="number"
              name="Engagements"
              tick={{ fontSize: 10 }}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              label={{ value: 'Engagements', angle: -90, position: 'insideLeft', fontSize: 11 }}
            />
            <ZAxis dataKey="target_value" range={[40, 400]} name="Budget" />
            <Tooltip content={<CustomTooltip />} />
            <Scatter
              data={chartData}
              fill="hsl(var(--chart-blue))"
              fillOpacity={0.6}
              stroke="hsl(var(--chart-blue))"
              strokeWidth={1}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
