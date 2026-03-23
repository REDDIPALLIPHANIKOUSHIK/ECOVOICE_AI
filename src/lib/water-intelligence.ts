// Water Intelligence Module

export interface WaterWasteEstimate {
  issue: string;
  dailyLiters: number;
  monthlyLiters: number;
  yearlyLiters: number;
  severity: "low" | "medium" | "high" | "critical";
  fixSuggestions: string[];
  costEstimate: string;
}

export interface WaterReusability {
  source: string;
  classification: "reusable" | "partially_reusable" | "not_recommended";
  safeUses: string[];
  warnings: string[];
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

const WATER_WASTE_DB: Record<string, Omit<WaterWasteEstimate, "issue">> = {
  "leaking tap": {
    dailyLiters: 20,
    monthlyLiters: 600,
    yearlyLiters: 7300,
    severity: "high",
    fixSuggestions: [
      "Replace the washer or cartridge inside the tap",
      "Tighten the packing nut behind the handle",
      "Call a plumber if leak persists — cost ₹200–500",
      "Use a drip catcher bucket until fixed",
    ],
    costEstimate: "₹200–500 for repair, saves ~₹3,600/year in water bills",
  },
  "running toilet": {
    dailyLiters: 200,
    monthlyLiters: 6000,
    yearlyLiters: 73000,
    severity: "critical",
    fixSuggestions: [
      "Check the flapper valve — replace if warped",
      "Adjust the float ball or fill valve",
      "Add food coloring to the tank — if it appears in the bowl, you have a leak",
      "Replace the flush mechanism kit (~₹500–1000)",
    ],
    costEstimate: "₹500–1000 for parts, saves ~₹36,000/year",
  },
  "overflowing tank": {
    dailyLiters: 500,
    monthlyLiters: 15000,
    yearlyLiters: 182500,
    severity: "critical",
    fixSuggestions: [
      "Install or fix the float valve/ball cock",
      "Set a timer for pump operation",
      "Install an automatic water level controller (~₹1500–3000)",
      "Check for stuck float mechanisms",
    ],
    costEstimate: "₹1500–3000 for controller, saves massive wastage",
  },
  "dripping shower": {
    dailyLiters: 10,
    monthlyLiters: 300,
    yearlyLiters: 3650,
    severity: "medium",
    fixSuggestions: [
      "Replace the shower head washer",
      "Check and tighten connections",
      "Install a low-flow shower head to reduce usage",
    ],
    costEstimate: "₹100–300 for washer, ₹500–1500 for low-flow head",
  },
  "garden hose": {
    dailyLiters: 40,
    monthlyLiters: 1200,
    yearlyLiters: 14600,
    severity: "high",
    fixSuggestions: [
      "Use a trigger nozzle instead of free-flowing hose",
      "Water plants in early morning or evening to reduce evaporation",
      "Switch to drip irrigation for gardens",
      "Collect rainwater for gardening",
    ],
    costEstimate: "₹300–800 for nozzle, drip system ₹2000–5000",
  },
  "leaking pipe": {
    dailyLiters: 50,
    monthlyLiters: 1500,
    yearlyLiters: 18250,
    severity: "high",
    fixSuggestions: [
      "Locate the leak and apply pipe sealant tape as temporary fix",
      "Replace the damaged pipe section",
      "Check joints and connections for corrosion",
      "Call a professional plumber for underground leaks",
    ],
    costEstimate: "₹500–3000 depending on severity",
  },
};

export const estimateWaterWaste = (input: string): WaterWasteEstimate | null => {
  const lower = input.toLowerCase();
  for (const [key, data] of Object.entries(WATER_WASTE_DB)) {
    if (lower.includes(key) || key.split(" ").every((w) => lower.includes(w))) {
      return { issue: key, ...data };
    }
  }
  // Fuzzy match
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
  },
  "rice water": {
    classification: "reusable",
    safeUses: ["Watering plants (nutrient-rich)", "Washing dishes (first rinse)", "Hair rinse", "Fermenting for skin care"],
    warnings: ["Use within 24 hours", "Don't store in heat"],
  },
  "bath water": {
    classification: "partially_reusable",
    safeUses: ["Flushing toilets", "Mopping floors", "Watering garden (if minimal soap)"],
    warnings: ["Not for drinking", "Avoid if medicated soap used", "Use within same day"],
  },
  "cooking water": {
    classification: "reusable",
    safeUses: ["Watering plants (cooled pasta/vegetable water)", "Making soups or stocks", "Cleaning"],
    warnings: ["Cool before reuse", "Use same day", "Don't reuse if heavily salted"],
  },
  "ac water": {
    classification: "reusable",
    safeUses: ["Iron (distilled water)", "Watering plants", "Car battery top-up", "Mopping"],
    warnings: ["Not for drinking without purification", "May contain dust particles"],
  },
  "ro reject": {
    classification: "partially_reusable",
    safeUses: ["Mopping floors", "Flushing toilets", "Washing vehicles", "Watering hardy plants"],
    warnings: ["High TDS — not for drinking", "May damage sensitive plants", "Don't use in appliances"],
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
  {
    activity: "Shower (10 min)",
    litersUsed: 80,
    optimizedLiters: 40,
    savingTips: ["Use a low-flow shower head", "Turn off water while soaping", "Limit to 5 minutes"],
  },
  {
    activity: "Brushing teeth (tap running)",
    litersUsed: 10,
    optimizedLiters: 1,
    savingTips: ["Turn off tap while brushing", "Use a cup of water instead"],
  },
  {
    activity: "Washing dishes (tap running)",
    litersUsed: 40,
    optimizedLiters: 15,
    savingTips: ["Fill a basin instead", "Scrape plates before washing", "Use a dishwasher if available"],
  },
  {
    activity: "Washing clothes (machine)",
    litersUsed: 80,
    optimizedLiters: 50,
    savingTips: ["Run full loads only", "Use eco-mode", "Reuse rinse water for mopping"],
  },
  {
    activity: "Flushing toilet",
    litersUsed: 12,
    optimizedLiters: 6,
    savingTips: ["Install dual-flush system", "Place a bottle in tank to reduce volume", "Use half-flush when possible"],
  },
  {
    activity: "Cooking",
    litersUsed: 15,
    optimizedLiters: 8,
    savingTips: ["Use measured water for boiling", "Reuse vegetable wash water for plants", "Steam instead of boiling"],
  },
  {
    activity: "Mopping floor",
    litersUsed: 20,
    optimizedLiters: 10,
    savingTips: ["Use a damp mop instead of wet mop", "Reuse laundry water", "Spot-clean instead of full mop"],
  },
  {
    activity: "Car wash",
    litersUsed: 150,
    optimizedLiters: 30,
    savingTips: ["Use a bucket instead of hose", "Waterless car wash products", "Wash on grass to water it too"],
  },
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

// EcoScore calculation
export const calculateEcoScore = (stats: {
  totalScans: number;
  streakDays: number;
  waterTipsViewed: number;
}): { score: number; level: string; suggestions: string[] } => {
  let score = 0;

  // Recycling component (0-40)
  score += Math.min(40, stats.totalScans * 2);

  // Streak component (0-30)
  score += Math.min(30, stats.streakDays * 3);

  // Water awareness component (0-30)
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
  if (score >= 80) suggestions.push("You're amazing! Share EcoVoice with friends to multiply your impact! 🌍");

  return { score, level, suggestions };
};
