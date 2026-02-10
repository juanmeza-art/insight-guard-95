import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';
import type { ExecutionCampaign } from '@/hooks/useExecutionCampaigns';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  data: ExecutionCampaign[];
  currentManager: string;
}

export function UrgentAlerts({ data, currentManager }: Props) {
  // Alerts: over-budget or very low progress campaigns for the selected manager
  const alerts = data.filter(c => {
    if (c.campaign_manager !== currentManager) return false;
    const executed = Number(c.executed_amount);
    const budget = Number(c.total_budget);
    const progress = Number(c.progress_pct);
    const overBudget = budget > 0 && executed / budget > 1.1;
    const lowProgress = progress < 40 && c.num_posts > 0;
    return overBudget || lowProgress;
  });

  return (
    <Card className="glass-card border-[hsl(var(--risk-high))]/20 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--risk-high))] animate-pulse" />
          <CardTitle className="text-sm font-semibold">Urgent Alerts</CardTitle>
          {alerts.length > 0 && (
            <Badge className="bg-[hsl(var(--risk-high))]/15 text-[hsl(var(--risk-high))] border-0 text-[10px] ml-auto">
              {alerts.length}
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">{currentManager}</p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4 pb-4">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-xs">No urgent alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((c, i) => {
                const executed = Number(c.executed_amount);
                const budget = Number(c.total_budget);
                const overBudget = budget > 0 && executed / budget > 1.1;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-lg bg-[hsl(var(--risk-high))]/5 border border-[hsl(var(--risk-high))]/10 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-semibold leading-tight">{c.name}</p>
                      {overBudget ? (
                        <TrendingDown className="h-3.5 w-3.5 text-[hsl(var(--risk-high))] shrink-0 ml-2" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--risk-high))] shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {overBudget
                        ? `Over budget: $${(executed / 1000).toFixed(1)}K executed vs $${(budget / 1000).toFixed(1)}K budget`
                        : `Low progress: ${Number(c.progress_pct).toFixed(0)}% (${c.num_published}/${c.num_posts} published)`
                      }
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{c.company}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
