import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import type { TeamKPI } from '@/types/team-kpi';

interface Props {
  campaign: TeamKPI;
}

export function AIInsightButton({ campaign }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const generate = async () => {
    setOpen(true);
    if (insight) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('campaign-insights', {
        body: { campaign },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        setOpen(false);
        return;
      }

      setInsight(data.insight);
    } catch (e: any) {
      toast.error('Error generating AI analysis');
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 text-[10px] gap-1 text-primary hover:text-primary/80"
        onClick={generate}
      >
        <Sparkles className="h-3 w-3" />
        AI Insight
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Analysis — {campaign.campaign_name}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing campaign metrics...</p>
            </div>
          ) : insight ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{insight}</ReactMarkdown>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
