import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Activity, DollarSign, BarChart3, Users, AlertTriangle } from 'lucide-react';
import type { ExecutionCampaign } from '@/hooks/useExecutionCampaigns';
import { motion } from 'framer-motion';

interface Props {
  data: ExecutionCampaign[];
}

export function KPIOverview({ data }: Props) {
  const totalBudget = data.reduce((s, d) => s + Number(d.total_budget), 0);
  const totalExecuted = data.reduce((s, d) => s + Number(d.executed_amount), 0);
  const totalInfluencers = data.reduce((s, d) => s + d.num_influencers, 0);
  const avgProgress = data.length ? data.reduce((s, d) => s + Number(d.progress_pct), 0) / data.length : 0;
  const highRisk = data.filter(d => (d.risk_score ?? 1) === 3).length;

  const cards = [
    { label: 'Campaigns', value: data.length, icon: Activity, color: 'text-[hsl(var(--chart-blue))]' },
    { label: 'Total Budget', value: `$${(totalBudget / 1000).toFixed(0)}K`, icon: DollarSign, color: 'text-[hsl(var(--chart-green))]' },
    { label: 'Executed', value: `$${(totalExecuted / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'text-[hsl(var(--chart-orange))]' },
    { label: 'Avg Progress', value: `${avgProgress.toFixed(0)}%`, icon: BarChart3, color: avgProgress < 50 ? 'text-[hsl(var(--risk-high))]' : 'text-[hsl(var(--chart-green))]' },
    { label: 'High Risk', value: highRisk, icon: AlertTriangle, color: 'text-[hsl(var(--risk-high))]' },
    { label: 'Influencers', value: totalInfluencers, icon: Users, color: 'text-[hsl(var(--chart-purple))]' },
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
