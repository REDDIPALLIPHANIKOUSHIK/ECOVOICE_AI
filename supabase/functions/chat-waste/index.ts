import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANGUAGE_LABELS: Record<string, string> = {
  "en-IN": "English (India)",
  "hi-IN": "Hindi",
  "te-IN": "Telugu",
  "ta-IN": "Tamil",
  "kn-IN": "Kannada",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, locationContext, userLanguage, voiceTone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const locationInfo = locationContext || "User location unknown. Provide general recycling guidelines applicable in India.";
    const targetLanguage = LANGUAGE_LABELS[userLanguage] ? userLanguage : "en-IN";
    const targetLanguageLabel = LANGUAGE_LABELS[targetLanguage];

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
            content: `You are EcoVoice — a multilingual, voice-first environmental intelligence assistant. You combine waste management, water conservation, and sustainability guidance into actionable advice.

Location context: ${locationInfo}
Preferred response language: ${targetLanguage}
Preferred tone: ${voiceTone || "friendly"}

MANDATORY LANGUAGE RULES:
- Respond ONLY in ${targetLanguageLabel}.
- Do not mix English unless preferred response language is en-IN.
- Keep all headings, bullets, explanations, and reinforcement lines in ${targetLanguageLabel}.
- If user input is mixed/casual, still produce final answer fully in ${targetLanguageLabel}.

CORE CAPABILITIES:
1. **Waste Sorting**: Identify waste type, provide step-by-step disposal, contamination risk, and local city-specific rules (BMC for Mumbai, BBMP for Bengaluru, MCD for Delhi, GCC for Chennai, GHMC for Hyderabad).
2. **Water Conservation**: Estimate water waste from issues (leaking taps, running toilets), suggest reuse of grey water (AC water, rice water, RO reject), calculate invisible daily water usage, provide seasonal/location-aware water tips.
3. **Circular Sustainability**: Link waste and water — e.g., plastic bottle → reuse for water storage; grey water → garden irrigation.
4. **Multilingual**: Support English, Hindi, Telugu, Tamil, Kannada with strict output language control.

RESPONSE FORMAT for waste items:
- **Category**: (♻️ Recyclable | 🌱 Compostable | 🗑️ Landfill | ⚠️ Hazardous | 📱 E-Waste)
- **What to do**: Step-by-step guidance
- **Contamination Risk**: Low / Medium / High
- **Eco Tip**: Actionable sustainability tip
- **💧 Water Link**: If applicable, connect to water conservation (e.g., "Rinse this bottle and reuse it to store water")

RESPONSE FORMAT for water queries:
- **Estimated waste**: Liters per day/month
- **Fix suggestion**: Step-by-step with cost in ₹
- **Reuse potential**: If water can be repurposed
- **Impact**: "This saves X liters/month"

ALWAYS END EVERY RESPONSE WITH:
1. A **"✅ Next best action:"** suggestion — one concrete thing the user can do right now
2. A short **positive reinforcement** message in the user's language (e.g., "Great job caring for the planet! 🌍")

Handle casual speech, Hinglish, local slang. Be concise, encouraging, and actionable. If unsure, ask clarifying questions. Voice navigation: acknowledge commands like "Open Dashboard", "Show History".`,
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
