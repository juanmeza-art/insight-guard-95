import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const MAX_ROWS = 1000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify webhook secret
  const secret = req.headers.get("x-webhook-secret");
  const expectedSecret = Deno.env.get("WEBHOOK_SECRET");
  if (!expectedSecret) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
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
    const rows: unknown[] = Array.isArray(body) ? body : [body];

    if (rows.length > MAX_ROWS) {
      return new Response(
        JSON.stringify({ error: `Too many rows (max ${MAX_ROWS})` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const safeStr = (v: unknown, max = 500): string | null => {
      if (v == null) return null;
      return String(v).slice(0, max);
    };
    const safeNum = (v: unknown, def = 0): number => {
      const n = Number(v);
      return isNaN(n) || !isFinite(n) ? def : n;
    };

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const mapped = rows.map((r: any) => ({
      monday_id: safeStr(r?.monday_id, 100),
      campaign_name: safeStr(r?.campaign_name),
      team_name: safeStr(r?.team_name, 200),
      sal_status: safeStr(r?.sal_status, 50) ?? "Ongoing",
      output_count: safeNum(r?.output_count),
      target_value: safeNum(r?.target_value),
      risk_score: safeNum(r?.risk_score, 1),
      ai_insight: safeStr(r?.ai_insight, 2000),
      action_required: safeStr(r?.action_required, 1000),
      progress_pct: safeNum(r?.progress_pct),
      num_influencers: safeNum(r?.num_influencers),
      num_ugc: safeNum(r?.num_ugc),
      days_active: safeNum(r?.days_active),
      count_sent: safeNum(r?.count_sent),
      count_completed: safeNum(r?.count_completed),
      company: safeStr(r?.company, 200),
      executed_amount: safeNum(r?.executed_amount),
      executed_take_rate_pct: safeNum(r?.executed_take_rate_pct),
      execution_start: safeStr(r?.execution_start, 10),
      execution_end: safeStr(r?.execution_end, 10),
      currency: safeStr(r?.currency, 10) ?? "USD",
    }));

    const { data, error } = await supabase
      .from("team_kpis")
      .upsert(mapped, { onConflict: "monday_id" })
      .select();

    if (error) {
      console.error("Upsert error:", error);
      return new Response(
        JSON.stringify({ error: "Database operation failed" }),
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
      JSON.stringify({ error: "Error processing request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
