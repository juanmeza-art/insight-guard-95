import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Activity, DollarSign, BarChart3, Eye, AlertTriangle } from 'lucide-react';
import type { TeamKPI } from '@/types/team-kpi';
import { motion } from 'framer-motion';

interface Props {
  data: TeamKPI[];
}

export function KPIOverview({ data }: Props) {
  const totalBudget = data.reduce((s, d) => s + d.budget, 0);
  const totalSpent = data.reduce((s, d) => s + d.spent, 0);
  const totalImpressions = data.reduce((s, d) => s + d.impressions, 0);
  const avgSpentPct = data.length ? (totalSpent / totalBudget) * 100 : 0;
  const highRisk = data.filter(d => d.risk_score === 3).length;

  const cards = [
    { label: 'Campaigns', value: data.length, icon: Activity, color: 'text-[hsl(var(--chart-blue))]' },
    { label: 'Total Budget', value: `$${(totalBudget / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-[hsl(var(--chart-green))]' },
    { label: 'Spent', value: `$${(totalSpent / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-[hsl(var(--chart-orange))]' },
    { label: 'Avg Spent', value: `${isFinite(avgSpentPct) ? avgSpentPct.toFixed(0) : 0}%`, icon: BarChart3, color: avgSpentPct > 90 ? 'text-[hsl(var(--risk-high))]' : 'text-[hsl(var(--chart-green))]' },
    { label: 'High Risk', value: highRisk, icon: AlertTriangle, color: 'text-[hsl(var(--risk-high))]' },
    { label: 'Impressions', value: `${(totalImpressions / 1000).toFixed(0)}K`, icon: Eye, color: 'text-[hsl(var(--chart-purple))]' },
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
