import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, locationContext, userLanguage, voiceTone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const locationInfo = locationContext || "User location unknown. Provide general recycling guidelines applicable in India.";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are EcoVoice — a multilingual, voice-first environmental assistant focused on guiding users on recycling, waste sorting, and sustainability actions in natural spoken language.

Location context: ${locationInfo}
Preferred response language: ${userLanguage || "auto"}
Preferred tone: ${voiceTone || "friendly"}

Your core responsibilities:
1. Understand intent even if the question is casual, imprecise, or mixed with local slang or Hinglish.
2. Provide clear guidance about recycling and waste sorting based on common materials and LOCAL city-specific rules when location is known.
3. Respond in a friendly, confident, and encouraging tone — as if speaking naturally to a friend.
4. Support multiple languages — respond in the same language the user writes/speaks in, switching fluidly. Support all Indian languages.
5. Provide friendly, motivational phrases after each action.
6. If the user mentions a specific Indian city, adapt your disposal guidance to that city's municipal rules (e.g., BMC for Mumbai, BBMP for Bengaluru, MCD for Delhi).

For waste items, include:
- **Category**: (♻️ Recyclable, 🌱 Compostable, 🗑️ Landfill, ⚠️ Hazardous, 📱 E-Waste)
- **What to do**: Step-by-step (sort, clean, where to drop off locally)
- **Contamination Risk**: Low / Medium / High
- **Eco Tip**: A helpful sustainability tip

Also help with:
- Energy saving tips
- Water saving tips
- Sustainable living advice
- Kabadiwala/scrap dealer guidance for Indian users

Voice navigation commands — if user says things like "Open Dashboard", "Show History", "My Badges", acknowledge and guide them.

Keep responses concise and conversational. Always end with a short positive reinforcement message (e.g., "Great job — you're making a real difference! 🌍").

If the user asks something unrelated to waste or sustainability, gently redirect them.`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-waste error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
