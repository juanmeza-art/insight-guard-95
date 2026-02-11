import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { TeamKPI } from '@/types/team-kpi';
import { motion } from 'framer-motion';
import { Users, BarChart3, Lightbulb, AlertTriangle, CheckCircle, AlertCircle, Calendar, ArrowRight, Send } from 'lucide-react';
import { AIInsightButton } from '@/components/AIInsightButton';

interface Props {
  data: TeamKPI[];
}

const riskConfig: Record<number, { border: string; badge: string; label: string; icon: typeof CheckCircle }> = {
  1: { border: 'border-l-[hsl(var(--risk-low))]', badge: 'bg-[hsl(var(--risk-low))]/15 text-[hsl(var(--risk-low))]', label: 'Low', icon: CheckCircle },
  2: { border: 'border-l-[hsl(var(--risk-medium))]', badge: 'bg-[hsl(var(--risk-medium))]/15 text-[hsl(var(--risk-medium))]', label: 'Medium', icon: AlertCircle },
  3: { border: 'border-l-[hsl(var(--risk-high))]', badge: 'bg-[hsl(var(--risk-high))]/15 text-[hsl(var(--risk-high))]', label: 'High', icon: AlertTriangle },
};

export function RiskAuditGrid({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sorted.map((c, i) => {
        const config = riskConfig[c.risk_score] || riskConfig[1];
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
                    <CardTitle className="text-sm font-semibold truncate">{c.campaign_name ?? 'Untitled'}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.team_name ?? '—'} · {c.sal_status ?? 'N/A'}</p>
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

                {/* Next Steps */}
                {c.action_required && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                    <ArrowRight className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-0.5">Next Steps</p>
                      <p className="text-xs leading-relaxed">{c.action_required}</p>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-mono font-medium">{c.progress_pct}%</span>
                  </div>
                  <Progress value={c.progress_pct} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground">{c.output_count} / {c.target_value} outputs</p>
                </div>

                {/* Stat Boxes */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Users className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-mono font-medium">{c.num_influencers}</p>
                    <p className="text-[10px] text-muted-foreground">Influencers</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Send className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-mono font-medium">{c.count_sent}</p>
                    <p className="text-[10px] text-muted-foreground">Sent</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <BarChart3 className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-mono font-medium">{c.count_completed}</p>
                    <p className="text-[10px] text-muted-foreground">Completed</p>
                  </div>
                </div>

                {/* Extra metrics row */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-xs font-mono font-medium">{c.num_ugc}</p>
                    <p className="text-[10px] text-muted-foreground">UGC</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Calendar className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-mono font-medium">{c.days_active}</p>
                    <p className="text-[10px] text-muted-foreground">Days Active</p>
                  </div>
                </div>

                {/* AI Insight Button */}
                <div className="flex justify-end pt-1">
                  <AIInsightButton campaign={c} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
