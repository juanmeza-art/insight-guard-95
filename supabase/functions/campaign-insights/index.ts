import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const campaign = body?.campaign;

    // Input validation
    if (!campaign || typeof campaign !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid request: campaign object required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitize = (val: unknown, maxLen = 200): string => {
      if (val == null) return "";
      return String(val).slice(0, maxLen).replace(/[<>"'`]/g, "");
    };
    const safeNum = (val: unknown): number => {
      const n = Number(val);
      return isNaN(n) || !isFinite(n) ? 0 : n;
    };

    const budget = safeNum(campaign.budget);
    const spent = safeNum(campaign.spent);
    const conversions = safeNum(campaign.conversions);
    const impressions = safeNum(campaign.impressions);

    const spentPct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
    const cpa = conversions > 0 ? (spent / conversions).toFixed(2) : "N/A";
    const cpm = impressions > 0 ? ((spent / impressions) * 1000).toFixed(2) : "N/A";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a senior digital advertising strategist specializing in music industry campaigns. 
Analyze campaign metrics and provide actionable insights. Be concise, data-driven, and specific. 
Always respond in Spanish. Use bullet points. Structure your response with these sections:
## 📊 Análisis de Rendimiento
## ⚠️ Riesgos Identificados  
## 🎯 Recomendaciones Accionables
## 📈 Oportunidades de Optimización`;

    const userPrompt = `Analiza esta campaña publicitaria y genera insights accionables:

- Campaña: ${sanitize(campaign.campaign_name)}
- Cliente: ${sanitize(campaign.client_name)}
- Manager: ${sanitize(campaign.campaign_manager, 100)}
- Rol: ${sanitize(campaign.role, 50)}
- Estado: ${sanitize(campaign.status, 50)}
- Risk Score: ${safeNum(campaign.risk_score)}/3
- Presupuesto: $${budget.toLocaleString()}
- Gastado: $${spent.toLocaleString()} (${spentPct}%)
- Impresiones: ${impressions.toLocaleString()}
- Conversiones: ${conversions.toLocaleString()}
- CPA: $${cpa}
- CPM: $${cpm}
- Días de ejecución: ${safeNum(campaign.execution_days)}
- Insight actual: ${sanitize(campaign.ai_insight, 500)}
- Acción requerida: ${sanitize(campaign.action_required, 500)}

Proporciona un análisis detallado con recomendaciones específicas y métricas de referencia de la industria musical.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de peticiones excedido. Intenta de nuevo en unos momentos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados. Agrega fondos en Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.error("AI gateway error:", response.status); // server-side only
      return new Response(
        JSON.stringify({ error: "Error al conectar con el servicio de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "No se pudo generar el análisis.";

    return new Response(JSON.stringify({ insight: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("campaign-insights error:", e);
    return new Response(
      JSON.stringify({ error: "Error processing request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
