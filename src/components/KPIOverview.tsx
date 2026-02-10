import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, AlertTriangle } from 'lucide-react';
import type { TeamKPI } from '@/lib/mock-data';
import { motion } from 'framer-motion';

interface Props {
  data: TeamKPI[];
}

export function KPIOverview({ data }: Props) {
  const active = data.filter(d => d.status === 'active').length;
  const totalBudget = data.reduce((s, d) => s + d.budget, 0);
  const totalSpent = data.reduce((s, d) => s + d.spent, 0);
  const avgRisk = data.length ? (data.reduce((s, d) => s + d.risk_score, 0) / data.length) : 0;
  const highRisk = data.filter(d => d.risk_score === 3).length;
  const totalConversions = data.reduce((s, d) => s + d.conversions, 0);

  const cards = [
    { label: 'Active Campaigns', value: active, icon: Activity, color: 'text-[hsl(var(--chart-blue))]' },
    { label: 'Total Budget', value: `$${(totalBudget / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-[hsl(var(--chart-green))]' },
    { label: 'Total Spent', value: `$${(totalSpent / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-[hsl(var(--chart-orange))]' },
    { label: 'Avg Risk Score', value: avgRisk.toFixed(1), icon: BarChart3, color: avgRisk > 2 ? 'text-[hsl(var(--risk-high))]' : 'text-[hsl(var(--risk-medium))]' },
    { label: 'High Risk', value: highRisk, icon: AlertTriangle, color: 'text-[hsl(var(--risk-high))]' },
    { label: 'Conversions', value: totalConversions.toLocaleString(), icon: TrendingDown, color: 'text-[hsl(var(--chart-purple))]' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card className="glass-card hover:border-primary/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{c.label}</span>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <p className="text-2xl font-bold font-mono">{c.value}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
