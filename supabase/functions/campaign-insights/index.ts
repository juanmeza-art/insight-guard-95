import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { campaign } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const spentPct = campaign.budget > 0 ? Math.round((campaign.spent / campaign.budget) * 100) : 0;
    const cpa = campaign.conversions > 0 ? (campaign.spent / campaign.conversions).toFixed(2) : "N/A";
    const cpm = campaign.impressions > 0 ? ((campaign.spent / campaign.impressions) * 1000).toFixed(2) : "N/A";

    const systemPrompt = `You are a senior digital advertising strategist specializing in music industry campaigns. 
Analyze campaign metrics and provide actionable insights. Be concise, data-driven, and specific. 
Always respond in Spanish. Use bullet points. Structure your response with these sections:
## 📊 Análisis de Rendimiento
## ⚠️ Riesgos Identificados  
## 🎯 Recomendaciones Accionables
## 📈 Oportunidades de Optimización`;

    const userPrompt = `Analiza esta campaña publicitaria y genera insights accionables:

- Campaña: ${campaign.campaign_name}
- Cliente: ${campaign.client_name}
- Manager: ${campaign.campaign_manager}
- Rol: ${campaign.role}
- Estado: ${campaign.status}
- Risk Score: ${campaign.risk_score}/3
- Presupuesto: $${campaign.budget.toLocaleString()}
- Gastado: $${campaign.spent.toLocaleString()} (${spentPct}%)
- Impresiones: ${campaign.impressions.toLocaleString()}
- Conversiones: ${campaign.conversions.toLocaleString()}
- CPA: $${cpa}
- CPM: $${cpm}
- Días de ejecución: ${campaign.execution_days}
- Insight actual: ${campaign.ai_insight}
- Acción requerida: ${campaign.action_required}

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
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
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
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
