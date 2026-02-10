import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TeamKPI } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, AlertCircle, Lightbulb, ArrowRight } from 'lucide-react';

interface Props {
  data: TeamKPI[];
}

const riskConfig = {
  1: { border: 'border-l-[hsl(var(--risk-low))]', badge: 'bg-[hsl(var(--risk-low))]/15 text-[hsl(var(--risk-low))]', label: 'Low', icon: CheckCircle },
  2: { border: 'border-l-[hsl(var(--risk-medium))]', badge: 'bg-[hsl(var(--risk-medium))]/15 text-[hsl(var(--risk-medium))]', label: 'Medium', icon: AlertCircle },
  3: { border: 'border-l-[hsl(var(--risk-high))]', badge: 'bg-[hsl(var(--risk-high))]/15 text-[hsl(var(--risk-high))]', label: 'High', icon: AlertTriangle },
};

export function RiskAuditGrid({ data }: Props) {
  const active = data.filter(d => d.status === 'active').sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {active.map((kpi, i) => {
        const config = riskConfig[kpi.risk_score];
        const Icon = config.icon;
        return (
          <motion.div
            key={kpi.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className={`glass-card border-l-4 ${config.border} hover:shadow-lg hover:shadow-primary/5 transition-all`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold truncate">{kpi.campaign_name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{kpi.campaign_manager} · {kpi.role}</p>
                  </div>
                  <Badge className={`${config.badge} border-0 text-[10px] font-semibold shrink-0 ml-2`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                  <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs leading-relaxed">{kpi.ai_insight}</p>
                </div>
                <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-0.5">Next Steps</p>
                    <p className="text-xs leading-relaxed">{kpi.action_required}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Budget: <span className="font-mono font-medium text-foreground">${(kpi.budget / 1000).toFixed(1)}K</span></span>
                  <span>Spent: <span className="font-mono font-medium text-foreground">{Math.round(kpi.spent / kpi.budget * 100)}%</span></span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
