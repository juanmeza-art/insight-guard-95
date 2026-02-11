import { Card, CardContent } from '@/components/ui/card';
import { Users, Activity, Send, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import type { TeamKPI } from '@/types/team-kpi';
import { motion } from 'framer-motion';

interface Props {
  data: TeamKPI[];
}

export function KPIOverview({ data }: Props) {
  const totalInfluencers = data.reduce((s, d) => s + d.num_influencers, 0);
  const totalUGC = data.reduce((s, d) => s + d.num_ugc, 0);
  const totalSent = data.reduce((s, d) => s + d.count_sent, 0);
  const totalCompleted = data.reduce((s, d) => s + d.count_completed, 0);
  const highRisk = data.filter(d => d.risk_score >= 3).length;
  const avgProgress = data.length ? Math.round(data.reduce((s, d) => s + d.progress_pct, 0) / data.length) : 0;

  const cards = [
    { label: 'Campaigns', value: data.length, icon: Activity, color: 'text-[hsl(var(--chart-blue))]' },
    { label: 'Influencers', value: totalInfluencers, icon: Users, color: 'text-[hsl(var(--chart-green))]' },
    { label: 'UGC', value: totalUGC, icon: BarChart3, color: 'text-[hsl(var(--chart-purple))]' },
    { label: 'Sent', value: totalSent, icon: Send, color: 'text-[hsl(var(--chart-orange))]' },
    { label: 'Completed', value: totalCompleted, icon: CheckCircle, color: 'text-[hsl(var(--chart-green))]' },
    { label: 'High Risk', value: highRisk, icon: AlertTriangle, color: 'text-[hsl(var(--risk-high))]' },
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
