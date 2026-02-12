import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify webhook secret
  const secret = req.headers.get("x-webhook-secret");
  const expectedSecret = Deno.env.get("WEBHOOK_SECRET");
  if (!expectedSecret) {
    return new Response(
      JSON.stringify({ error: "WEBHOOK_SECRET not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  if (secret !== expectedSecret) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();

    // Accept single row or array of rows
    const rows: any[] = Array.isArray(body) ? body : [body];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Upsert based on monday_id to avoid duplicates
    const { data, error } = await supabase
      .from("team_kpis")
      .upsert(
        rows.map((r) => ({
          monday_id: r.monday_id,
          campaign_name: r.campaign_name,
          team_name: r.team_name,
          sal_status: r.sal_status ?? "Ongoing",
          output_count: r.output_count ?? 0,
          target_value: r.target_value ?? 0,
          risk_score: r.risk_score ?? 1,
          ai_insight: r.ai_insight,
          action_required: r.action_required,
          progress_pct: r.progress_pct ?? 0,
          num_influencers: r.num_influencers ?? 0,
          num_ugc: r.num_ugc ?? 0,
          days_active: r.days_active ?? 0,
          count_sent: r.count_sent ?? 0,
          count_completed: r.count_completed ?? 0,
          company: r.company,
          executed_amount: r.executed_amount ?? 0,
          executed_take_rate_pct: r.executed_take_rate_pct ?? 0,
          execution_start: r.execution_start,
          execution_end: r.execution_end,
          currency: r.currency ?? "USD",
        })),
        { onConflict: "monday_id" }
      )
      .select();

    if (error) {
      console.error("Upsert error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, count: rows.length, data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Sync error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
