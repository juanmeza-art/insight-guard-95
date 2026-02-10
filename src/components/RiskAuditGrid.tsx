import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { ExecutionCampaign } from '@/hooks/useExecutionCampaigns';
import { motion } from 'framer-motion';
import { Users, DollarSign, BarChart3, Lightbulb, AlertTriangle, CheckCircle, AlertCircle, Calendar } from 'lucide-react';

interface Props {
  data: ExecutionCampaign[];
}

const riskConfig: Record<number, { border: string; badge: string; label: string; icon: typeof CheckCircle }> = {
  1: { border: 'border-l-[hsl(var(--risk-low))]', badge: 'bg-[hsl(var(--risk-low))]/15 text-[hsl(var(--risk-low))]', label: 'Low', icon: CheckCircle },
  2: { border: 'border-l-[hsl(var(--risk-medium))]', badge: 'bg-[hsl(var(--risk-medium))]/15 text-[hsl(var(--risk-medium))]', label: 'Medium', icon: AlertCircle },
  3: { border: 'border-l-[hsl(var(--risk-high))]', badge: 'bg-[hsl(var(--risk-high))]/15 text-[hsl(var(--risk-high))]', label: 'High', icon: AlertTriangle },
};

export function RiskAuditGrid({ data }: Props) {
  const sorted = [...data].sort((a, b) => (b.risk_score ?? 1) - (a.risk_score ?? 1));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sorted.map((c, i) => {
        const progress = Number(c.progress_pct);
        const config = riskConfig[c.risk_score ?? 1] || riskConfig[1];
        const Icon = config.icon;
        return (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card className={`glass-card border-l-4 ${config.border} hover:shadow-lg hover:shadow-primary/5 transition-all`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold truncate">{c.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.campaign_manager} · {c.company}</p>
                  </div>
                  <Badge className={`${config.badge} border-0 text-[10px] font-semibold shrink-0 ml-2`}>
                    <Icon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* AI Insight */}
                {c.ai_insight && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50">
                    <Lightbulb className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <p className="text-xs leading-relaxed">{c.ai_insight}</p>
                  </div>
                )}

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground">{c.num_published} / {c.num_posts} posts published</p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <DollarSign className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-mono font-medium">${(Number(c.total_budget) / 1000).toFixed(1)}K</p>
                    <p className="text-[10px] text-muted-foreground">Budget</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <BarChart3 className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-mono font-medium">${(Number(c.executed_amount) / 1000).toFixed(1)}K</p>
                    <p className="text-[10px] text-muted-foreground">Executed</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Users className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-mono font-medium">{c.num_influencers}</p>
                    <p className="text-[10px] text-muted-foreground">Creators</p>
                  </div>
                </div>

                {/* Footer info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                  {c.ongoing_start_date ? (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(c.ongoing_start_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                  ) : (
                    <span>—</span>
                  )}
                  <span>Take Rate: <span className="font-mono text-foreground">{Number(c.take_rate_pct)}%</span></span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
