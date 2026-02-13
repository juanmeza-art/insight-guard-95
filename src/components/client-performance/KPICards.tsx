import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Eye, Percent } from 'lucide-react';
import type { ClientPerformanceRow } from '@/hooks/useClientPerformance';

interface KPICardsProps {
  data: ClientPerformanceRow[];
}

export const KPICards = ({ data }: KPICardsProps) => {
  const totalExecuted = data.reduce((s, k) => s + k.target_value, 0);
  const avgER = data.length ? data.reduce((s, k) => s + k.er_pct, 0) / data.length : 0;
  const avgCPM = data.length ? data.reduce((s, k) => s + k.cpm, 0) / data.length : 0;
  const avgTakeRate = data.length ? data.reduce((s, k) => s + k.executed_take_rate_pct, 0) / data.length : 0;

  const cards = [
    {
      title: 'Executed Amount',
      value: `$${totalExecuted.toLocaleString()}`,
      icon: DollarSign,
      accent: 'text-chart-blue',
    },
    {
      title: 'Avg. ER%',
      value: `${avgER.toFixed(2)}%`,
      icon: TrendingUp,
      accent: 'text-chart-green',
    },
    {
      title: 'Avg. CPM',
      value: `$${avgCPM.toFixed(2)}`,
      icon: Eye,
      accent: 'text-chart-orange',
    },
    {
      title: 'Avg. Take Rate',
      value: `${avgTakeRate.toFixed(1)}%`,
      icon: Percent,
      accent: 'text-chart-purple',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.title} className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {c.title}
            </CardTitle>
            <c.icon className={`h-4 w-4 ${c.accent}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tracking-tight">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
