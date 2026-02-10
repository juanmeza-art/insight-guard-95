import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';
import type { TeamKPI } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  data: TeamKPI[];
  currentUser: string;
}

export function UrgentAlerts({ data, currentUser }: Props) {
  const alerts = data.filter(d => d.risk_score === 3 && d.campaign_manager === currentUser);

  return (
    <Card className="glass-card border-[hsl(var(--risk-high))]/20 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--risk-high))] animate-pulse" />
          <CardTitle className="text-sm font-semibold">My Urgent Alerts</CardTitle>
          {alerts.length > 0 && (
            <Badge className="bg-[hsl(var(--risk-high))]/15 text-[hsl(var(--risk-high))] border-0 text-[10px] ml-auto">
              {alerts.length}
            </Badge>
          )}
        </div>
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
              {alerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 rounded-lg bg-[hsl(var(--risk-high))]/5 border border-[hsl(var(--risk-high))]/10 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-semibold leading-tight">{alert.campaign_name}</p>
                    <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--risk-high))] shrink-0 ml-2" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.ai_insight}</p>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
