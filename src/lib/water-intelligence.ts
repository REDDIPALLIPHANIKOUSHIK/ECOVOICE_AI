// Water Intelligence Module with Location Awareness

export interface WaterWasteEstimate {
  issue: string;
  dailyLiters: number;
  monthlyLiters: number;
  yearlyLiters: number;
  severity: "low" | "medium" | "high" | "critical";
  fixSuggestions: string[];
  costEstimate: string;
  futureImpact: string;
}

export interface WaterReusability {
  source: string;
  classification: "reusable" | "partially_reusable" | "not_recommended";
  safeUses: string[];
  warnings: string[];
  circularTip?: string;
}

export interface InvisibleWaterUsage {
  activity: string;
  litersUsed: number;
  optimizedLiters: number;
  savingTips: string[];
}

export interface DailyWaterTip {
  tip: string;
  category: string;
  savingPotential: string;
  icon: string;
}

export interface LocationWaterContext {
  city: string;
  waterLevel: "low" | "medium" | "high";
  climate: string;
  seasonalAdvice: string;
  localTips: string[];
}

// Location-aware water context
const CITY_WATER_MAP: Record<string, Omit<LocationWaterContext, "city">> = {
  chennai: {
    waterLevel: "low",
    climate: "Tropical, prone to droughts",
    seasonalAdvice: "Summer (Apr-Jun): Critical water scarcity. Store water, minimize usage. Monsoon (Oct-Dec): Harvest rainwater aggressively.",
    localTips: [
      "Install rainwater harvesting — mandatory in Chennai",
      "Use RO reject for cleaning — Chennai water is hard",
      "Store metro water during supply hours",
      "Use AC condensate water for plants",
    ],
  },
  bengaluru: {
    waterLevel: "low",
    climate: "Semi-arid plateau, groundwater depleting",
    seasonalAdvice: "Summer: Severe shortage in many areas. Invest in water-efficient fixtures. Monsoon: Recharge borewells.",
    localTips: [
      "Recharge borewells during monsoon",
      "Use treated STP water for gardening",
      "Reduce shower time — Bangalore water is scarce",
      "Compost wet waste to reduce water in garbage trucks",
    ],
  },
  mumbai: {
    waterLevel: "medium",
    climate: "Coastal tropical, heavy monsoons",
    seasonalAdvice: "Pre-monsoon (Mar-May): Water cuts common. Monsoon (Jun-Sep): Flooding risks — secure water tanks.",
    localTips: [
      "Store BMC water during supply windows",
      "Use building rainwater harvesting systems",
      "Report water leaks via BMC app",
      "Reuse laundry water for floor cleaning",
    ],
  },
  delhi: {
    waterLevel: "medium",
    climate: "Semi-arid, extreme seasons",
    seasonalAdvice: "Summer (Apr-Jun): Peak demand, Yamuna levels drop. Winter: Less usage but maintain habits.",
    localTips: [
      "Use DJB tanker service wisely — store efficiently",
      "Drip irrigation for terrace gardens",
      "Reuse cooking water for plants",
      "Install aerators on all taps",
    ],
  },
  hyderabad: {
    waterLevel: "medium",
    climate: "Semi-arid tropical",
    seasonalAdvice: "Summer: Krishna/Godavari supply reduces. Monsoon: Good time for tank recharging.",
    localTips: [
      "Harvest rooftop rainwater during monsoon",
      "Use HMWSSB supply efficiently",
      "Grey water recycling for garden",
      "Check for underground pipe leaks periodically",
    ],
  },
};

export const getLocationWaterContext = (city: string): LocationWaterContext | null => {
  const key = city.toLowerCase().replace(/\s/g, "");
  const data = CITY_WATER_MAP[key];
  if (!data) return null;
  return { city, ...data };
};

export const getWaterLevelColor = (level: string): string => {
  if (level === "low") return "text-destructive";
  if (level === "medium") return "text-yellow-500";
  return "text-primary";
};

const WATER_WASTE_DB: Record<string, Omit<WaterWasteEstimate, "issue">> = {
  "leaking tap": {
    dailyLiters: 20, monthlyLiters: 600, yearlyLiters: 7300, severity: "high",
    fixSuggestions: ["Replace the washer or cartridge inside the tap", "Tighten the packing nut behind the handle", "Call a plumber — cost ₹200–500", "Use a drip catcher bucket until fixed"],
    costEstimate: "₹200–500 for repair, saves ~₹3,600/year in water bills",
    futureImpact: "If unfixed, this leak will waste ~7,300 liters this year — enough to fill 73 bathtubs!",
  },
  "running toilet": {
    dailyLiters: 200, monthlyLiters: 6000, yearlyLiters: 73000, severity: "critical",
    fixSuggestions: ["Check the flapper valve — replace if warped", "Adjust the float ball or fill valve", "Add food coloring to the tank — if it appears in the bowl, you have a leak", "Replace the flush mechanism kit (~₹500–1000)"],
    costEstimate: "₹500–1000 for parts, saves ~₹36,000/year",
    futureImpact: "This wastes ~6,000L/month — equal to an entire household's monthly drinking water!",
  },
  "overflowing tank": {
    dailyLiters: 500, monthlyLiters: 15000, yearlyLiters: 182500, severity: "critical",
    fixSuggestions: ["Install or fix the float valve/ball cock", "Set a timer for pump operation", "Install an automatic water level controller (~₹1500–3000)", "Check for stuck float mechanisms"],
    costEstimate: "₹1500–3000 for controller, saves massive wastage",
    futureImpact: "An overflowing tank can waste 500L/day — that's the daily water need of 10 people!",
  },
  "dripping shower": {
    dailyLiters: 10, monthlyLiters: 300, yearlyLiters: 3650, severity: "medium",
    fixSuggestions: ["Replace the shower head washer", "Check and tighten connections", "Install a low-flow shower head to reduce usage"],
    costEstimate: "₹100–300 for washer, ₹500–1500 for low-flow head",
    futureImpact: "A dripping shower wastes 3,650L/year — enough to water a small garden for months!",
  },
  "garden hose": {
    dailyLiters: 40, monthlyLiters: 1200, yearlyLiters: 14600, severity: "high",
    fixSuggestions: ["Use a trigger nozzle instead of free-flowing hose", "Water plants in early morning or evening", "Switch to drip irrigation for gardens", "Collect rainwater for gardening"],
    costEstimate: "₹300–800 for nozzle, drip system ₹2000–5000",
    futureImpact: "Switching to drip irrigation can save 70% of the water you currently use for gardening!",
  },
  "leaking pipe": {
    dailyLiters: 50, monthlyLiters: 1500, yearlyLiters: 18250, severity: "high",
    fixSuggestions: ["Apply pipe sealant tape as temporary fix", "Replace the damaged pipe section", "Check joints and connections for corrosion", "Call a plumber for underground leaks"],
    costEstimate: "₹500–3000 depending on severity",
    futureImpact: "Underground leaks are silent water thieves — 18,250L/year lost invisibly!",
  },
};

export const estimateWaterWaste = (input: string): WaterWasteEstimate | null => {
  const lower = input.toLowerCase();
  for (const [key, data] of Object.entries(WATER_WASTE_DB)) {
    if (lower.includes(key) || key.split(" ").every(w => lower.includes(w))) {
      return { issue: key, ...data };
    }
  }
  const keywords = ["leak", "drip", "overflow", "running", "waste", "broken", "pipe"];
  for (const kw of keywords) {
    if (lower.includes(kw)) {
      const match = Object.entries(WATER_WASTE_DB).find(([k]) => k.includes(kw));
      if (match) return { issue: match[0], ...match[1] };
    }
  }
  return null;
};

const REUSABILITY_DB: Record<string, Omit<WaterReusability, "source">> = {
  "washing machine": {
    classification: "reusable",
    safeUses: ["Mopping floors", "Flushing toilets", "Watering non-edible plants", "Washing vehicles"],
    warnings: ["Don't use for drinking or cooking", "Avoid on edible plants if detergent is used"],
    circularTip: "♻️ Washing machine water + old clothes → Clothes become cleaning rags, water cleans floors!",
  },
  "rice water": {
    classification: "reusable",
    safeUses: ["Watering plants (nutrient-rich)", "Washing dishes (first rinse)", "Hair rinse", "Fermenting for skin care"],
    warnings: ["Use within 24 hours", "Don't store in heat"],
    circularTip: "♻️ Rice water → Plants → Compost food waste → Back to garden!",
  },
  "bath water": {
    classification: "partially_reusable",
    safeUses: ["Flushing toilets", "Mopping floors", "Watering garden (if minimal soap)"],
    warnings: ["Not for drinking", "Avoid if medicated soap used", "Use within same day"],
    circularTip: "♻️ Bath water → Garden plants → Reduced municipal water demand!",
  },
  "cooking water": {
    classification: "reusable",
    safeUses: ["Watering plants (cooled pasta/vegetable water)", "Making soups or stocks", "Cleaning"],
    warnings: ["Cool before reuse", "Use same day", "Don't reuse if heavily salted"],
    circularTip: "♻️ Vegetable water → Plant fertilizer → Grow more veggies!",
  },
  "ac water": {
    classification: "reusable",
    safeUses: ["Iron (distilled water)", "Watering plants", "Car battery top-up", "Mopping"],
    warnings: ["Not for drinking without purification", "May contain dust particles"],
    circularTip: "♻️ AC water is basically free distilled water — reuse it and save 10-15L daily!",
  },
  "ro reject": {
    classification: "partially_reusable",
    safeUses: ["Mopping floors", "Flushing toilets", "Washing vehicles", "Watering hardy plants"],
    warnings: ["High TDS — not for drinking", "May damage sensitive plants", "Don't use in appliances"],
    circularTip: "♻️ RO reject + bucket system = 20L saved daily for cleaning tasks!",
  },
};

export const analyzeWaterReusability = (input: string): WaterReusability | null => {
  const lower = input.toLowerCase();
  for (const [key, data] of Object.entries(REUSABILITY_DB)) {
    if (lower.includes(key)) return { source: key, ...data };
  }
  return null;
};

const INVISIBLE_USAGE: InvisibleWaterUsage[] = [
  { activity: "Shower (10 min)", litersUsed: 80, optimizedLiters: 40, savingTips: ["Use a low-flow shower head", "Turn off water while soaping", "Limit to 5 minutes"] },
  { activity: "Brushing teeth (tap running)", litersUsed: 10, optimizedLiters: 1, savingTips: ["Turn off tap while brushing", "Use a cup of water instead"] },
  { activity: "Washing dishes (tap running)", litersUsed: 40, optimizedLiters: 15, savingTips: ["Fill a basin instead", "Scrape plates before washing", "Use a dishwasher if available"] },
  { activity: "Washing clothes (machine)", litersUsed: 80, optimizedLiters: 50, savingTips: ["Run full loads only", "Use eco-mode", "Reuse rinse water for mopping"] },
  { activity: "Flushing toilet", litersUsed: 12, optimizedLiters: 6, savingTips: ["Install dual-flush system", "Place a bottle in tank to reduce volume", "Use half-flush when possible"] },
  { activity: "Cooking", litersUsed: 15, optimizedLiters: 8, savingTips: ["Use measured water for boiling", "Reuse vegetable wash water for plants", "Steam instead of boiling"] },
  { activity: "Mopping floor", litersUsed: 20, optimizedLiters: 10, savingTips: ["Use a damp mop instead of wet mop", "Reuse laundry water", "Spot-clean instead of full mop"] },
  { activity: "Car wash", litersUsed: 150, optimizedLiters: 30, savingTips: ["Use a bucket instead of hose", "Waterless car wash products", "Wash on grass to water it too"] },
];

export const getInvisibleWaterUsage = (): InvisibleWaterUsage[] => INVISIBLE_USAGE;

export const getDailyTotalUsage = (): { total: number; optimized: number; savingPercent: number } => {
  const total = INVISIBLE_USAGE.reduce((s, a) => s + a.litersUsed, 0);
  const optimized = INVISIBLE_USAGE.reduce((s, a) => s + a.optimizedLiters, 0);
  return { total, optimized, savingPercent: Math.round(((total - optimized) / total) * 100) };
};

const DAILY_TIPS: DailyWaterTip[] = [
  { tip: "Turn off the tap while brushing — saves 10L per brush!", category: "Bathroom", savingPotential: "20L/day", icon: "🚿" },
  { tip: "Fix that dripping tap today — it wastes 20L daily!", category: "Maintenance", savingPotential: "20L/day", icon: "🔧" },
  { tip: "Collect AC water for mopping — free distilled water!", category: "Reuse", savingPotential: "10-15L/day", icon: "❄️" },
  { tip: "Use a bucket instead of a hose for car washing", category: "Outdoor", savingPotential: "120L/wash", icon: "🚗" },
  { tip: "Water plants in early morning to reduce evaporation by 50%", category: "Garden", savingPotential: "30%", icon: "🌱" },
  { tip: "Reuse rice/dal wash water for plants — it's nutrient-rich!", category: "Kitchen", savingPotential: "5-10L/day", icon: "🍚" },
  { tip: "Run washing machine only with full loads", category: "Laundry", savingPotential: "30L/load", icon: "👕" },
  { tip: "Install a dual-flush toilet to save 6L per flush", category: "Bathroom", savingPotential: "6L/flush", icon: "🚽" },
  { tip: "Take 5-min showers instead of 10-min — halve your usage!", category: "Bathroom", savingPotential: "40L/shower", icon: "⏱️" },
  { tip: "Place a 1L bottle in your toilet tank to reduce flush volume", category: "DIY", savingPotential: "5-8L/day", icon: "💡" },
  { tip: "Use RO reject water for mopping and cleaning", category: "Reuse", savingPotential: "15-20L/day", icon: "💧" },
  { tip: "Soak dal and rice in measured water — don't run the tap", category: "Kitchen", savingPotential: "5L/day", icon: "🥘" },
];

export const getDailyWaterTip = (): DailyWaterTip => {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
};

export const getRandomTips = (count: number): DailyWaterTip[] => {
  const shuffled = [...DAILY_TIPS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const calculateEcoScore = (stats: {
  totalScans: number;
  streakDays: number;
  waterTipsViewed: number;
}): { score: number; level: string; suggestions: string[] } => {
  let score = 0;
  score += Math.min(40, stats.totalScans * 2);
  score += Math.min(30, stats.streakDays * 3);
  score += Math.min(30, stats.waterTipsViewed * 5);
  score = Math.min(100, Math.round(score));

  let level = "Beginner";
  if (score >= 80) level = "Eco Champion";
  else if (score >= 60) level = "Green Warrior";
  else if (score >= 40) level = "Eco Learner";
  else if (score >= 20) level = "Getting Started";

  const suggestions: string[] = [];
  if (stats.totalScans < 10) suggestions.push("Scan more waste items to boost your score!");
  if (stats.streakDays < 3) suggestions.push("Build a daily scanning streak for bonus points!");
  if (stats.waterTipsViewed < 3) suggestions.push("Explore water-saving tips in the Water module!");
  if (score >= 80) suggestions.push("You're amazing! Share EcoVoice with friends! 🌍");

  return { score, level, suggestions };
};
