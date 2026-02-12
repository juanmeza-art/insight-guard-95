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
      monday_item_id: safeStr(r?.monday_item_id, 100),
      name: safeStr(r?.name) ?? "Untitled",
      status: safeStr(r?.status, 50) ?? "To Do",
      list_builder: safeStr(r?.list_builder, 200),
      creative_builder: safeStr(r?.creative_builder, 200),
      csm: safeStr(r?.csm, 200),
      seller: safeStr(r?.seller, 200),
      company: safeStr(r?.company, 200),
      total_budget: safeNum(r?.total_budget),
      influencers_budget: safeNum(r?.influencers_budget),
      sub_campaign_budget: safeNum(r?.sub_campaign_budget),
      take_rate_pct: safeNum(r?.take_rate_pct),
      creators_expected: safeNum(r?.creators_expected),
      audience_country: safeStr(r?.audience_country, 100),
      musical_genre: safeStr(r?.musical_genre, 100),
      currency: safeStr(r?.currency, 10) ?? "USD",
      deal_created_date: safeStr(r?.deal_created_date, 10),
      proposal_board_start_date: safeStr(r?.proposal_board_start_date, 10),
      proposal_delivery_date: safeStr(r?.proposal_delivery_date, 10),
      building_proposal_start_date: safeStr(r?.building_proposal_start_date, 10),
      pending_approval_start_date: safeStr(r?.pending_approval_start_date, 10),
      execution_board_start_date: safeStr(r?.execution_board_start_date, 10),
      days_building_proposal: r?.days_building_proposal != null ? safeNum(r.days_building_proposal) : null,
      timing_of_delivery: safeStr(r?.timing_of_delivery, 100),
      proposal_adjustments: safeNum(r?.proposal_adjustments),
      declined_reasons: safeStr(r?.declined_reasons, 1000),
    }));

    const { data, error } = await supabase
      .from("proposals")
      .upsert(mapped, { onConflict: "monday_item_id" })
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
