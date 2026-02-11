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
    const rows: any[] = Array.isArray(body) ? body : [body];

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("proposals")
      .upsert(
        rows.map((r) => ({
          monday_item_id: r.monday_item_id,
          name: r.name,
          status: r.status ?? "To Do",
          list_builder: r.list_builder,
          creative_builder: r.creative_builder,
          csm: r.csm,
          seller: r.seller,
          company: r.company,
          total_budget: r.total_budget ?? 0,
          influencers_budget: r.influencers_budget ?? 0,
          sub_campaign_budget: r.sub_campaign_budget ?? 0,
          take_rate_pct: r.take_rate_pct ?? 0,
          creators_expected: r.creators_expected ?? 0,
          audience_country: r.audience_country,
          musical_genre: r.musical_genre,
          currency: r.currency ?? "USD",
          deal_created_date: r.deal_created_date,
          proposal_board_start_date: r.proposal_board_start_date,
          proposal_delivery_date: r.proposal_delivery_date,
          building_proposal_start_date: r.building_proposal_start_date,
          pending_approval_start_date: r.pending_approval_start_date,
          execution_board_start_date: r.execution_board_start_date,
          days_building_proposal: r.days_building_proposal,
          timing_of_delivery: r.timing_of_delivery,
          proposal_adjustments: r.proposal_adjustments ?? 0,
          declined_reasons: r.declined_reasons,
        })),
        { onConflict: "monday_item_id" }
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
