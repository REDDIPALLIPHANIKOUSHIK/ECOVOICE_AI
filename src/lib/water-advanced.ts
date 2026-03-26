// Advanced Water Intelligence: What-If Simulation, Cross-Impact Engine, Daily Coach

export interface WhatIfResult {
  scenario: string;
  severity: "low" | "medium" | "high" | "critical";
  timeline: { period: string; litersLost: number; costImpact: string }[];
  environmentalEffect: string;
  recommendation: string;
}

export interface CrossImpactSuggestion {
  wasteItem: string;
  waterAction: string;
  insight: string;
  impact: string;
  icon: string;
}

export interface CoachAdvice {
  title: string;
  advice: string;
  category: string;
  savingPotential: string;
  icon: string;
}

const WHAT_IF_DB: Record<string, Omit<WhatIfResult, "scenario">> = {
  leak: {
    severity: "high",
    timeline: [
      { period: "1 Month", litersLost: 600, costImpact: "300" },
      { period: "6 Months", litersLost: 3600, costImpact: "1,800" },
      { period: "1 Year", litersLost: 7300, costImpact: "3,600" },
    ],
    environmentalEffect: "7,300L wasted per year — enough drinking water for 20 people for a month. Increases municipal load and groundwater depletion.",
    recommendation: "Fix the leak immediately. Cost: ₹200–500. Saves ₹3,600/year and 7,300L of clean water.",
  },
  toilet: {
    severity: "critical",
    timeline: [
      { period: "1 Month", litersLost: 6000, costImpact: "3,000" },
      { period: "6 Months", litersLost: 36000, costImpact: "18,000" },
      { period: "1 Year", litersLost: 73000, costImpact: "36,000" },
    ],
    environmentalEffect: "73,000L/year — equivalent to a small swimming pool! This single issue can account for 40% of a household's water bill.",
    recommendation: "Replace flapper valve or flush mechanism immediately. Cost: ₹500–1,000. Saves ₹36,000/year.",
  },
  tank: {
    severity: "critical",
    timeline: [
      { period: "1 Month", litersLost: 15000, costImpact: "7,500" },
      { period: "6 Months", litersLost: 90000, costImpact: "45,000" },
      { period: "1 Year", litersLost: 182500, costImpact: "90,000" },
    ],
    environmentalEffect: "182,500L/year lost — enough to supply a family of 5 for an entire year. Causes waterlogging and structural damage.",
    recommendation: "Install automatic water level controller. Cost: ₹1,500–3,000. Prevents catastrophic waste.",
  },
  tap: {
    severity: "medium",
    timeline: [
      { period: "1 Month", litersLost: 300, costImpact: "150" },
      { period: "6 Months", litersLost: 1800, costImpact: "900" },
      { period: "1 Year", litersLost: 3650, costImpact: "1,800" },
    ],
    environmentalEffect: "A dripping tap wastes 3,650L/year. It may seem small, but across a city of millions, it's a river of waste.",
    recommendation: "Turn off taps completely. If dripping persists, replace the washer. Cost: ₹100–300.",
  },
  hose: {
    severity: "high",
    timeline: [
      { period: "1 Month", litersLost: 1200, costImpact: "600" },
      { period: "6 Months", litersLost: 7200, costImpact: "3,600" },
      { period: "1 Year", litersLost: 14600, costImpact: "7,200" },
    ],
    environmentalEffect: "An open garden hose wastes 14,600L/year. Switching to drip irrigation saves 70% and keeps plants healthier.",
    recommendation: "Switch to drip irrigation or use a bucket. Cost: ₹300–800 for nozzle, ₹2,000–5,000 for drip system.",
  },
  shower: {
    severity: "medium",
    timeline: [
      { period: "1 Month", litersLost: 300, costImpact: "150" },
      { period: "6 Months", litersLost: 1800, costImpact: "900" },
      { period: "1 Year", litersLost: 3650, costImpact: "1,800" },
    ],
    environmentalEffect: "3,650L/year from a dripping shower. Over 10 years, that's an entire tanker-load of water wasted.",
    recommendation: "Replace shower washer or install a low-flow shower head. Cost: ₹100–1,500.",
  },
};

export const simulateWhatIf = (input: string): WhatIfResult | null => {
  const lower = input.toLowerCase();
  for (const [key, data] of Object.entries(WHAT_IF_DB)) {
    if (lower.includes(key)) {
      return { scenario: `Ignoring ${key} issue`, ...data };
    }
  }
  const keywords = ["ignore", "skip", "leave", "no repair", "don't fix", "not fix"];
  if (keywords.some((kw) => lower.includes(kw))) {
    for (const [key, data] of Object.entries(WHAT_IF_DB)) {
      if (lower.includes(key.charAt(0))) continue;
      return { scenario: "Ignoring water issue", ...data };
    }
    return { scenario: "Ignoring water issue", ...WHAT_IF_DB.leak };
  }
  return null;
};

const CROSS_IMPACT_DATA: CrossImpactSuggestion[] = [
  { wasteItem: "Plastic Bottle", waterAction: "Reuse for water storage", insight: "Clean plastic bottles can store filtered water, reducing need for new containers", impact: "Saves 2L plastic + reduces container manufacturing water footprint", icon: "🍼" },
  { wasteItem: "Grey Water", waterAction: "Garden irrigation", insight: "Bath and laundry water can irrigate non-edible plants, reducing fresh water demand", impact: "Saves 30–50L per day for a household garden", icon: "🌿" },
  { wasteItem: "Newspaper", waterAction: "Mulching for moisture retention", insight: "Shredded newspaper around plant bases retains soil moisture and reduces watering", impact: "Reduces plant watering by 25% and recycles paper waste", icon: "📰" },
  { wasteItem: "Coconut Shells", waterAction: "Natural water filter", insight: "Activated coconut shell charcoal is an effective water purifier used in many filters", impact: "Reduces dependence on electric purifiers, saves 5L RO reject per day", icon: "🥥" },
  { wasteItem: "Used Cooking Oil", waterAction: "Prevent water contamination", insight: "1L of cooking oil can contaminate 1 million liters of water if dumped in drains", impact: "Proper disposal or soap-making prevents massive water pollution", icon: "🛢️" },
  { wasteItem: "Cloth / Old Towels", waterAction: "Replace paper towels", insight: "Using cloth rags instead of paper towels reduces both waste and water used in paper manufacturing", impact: "Saves 37L of water per roll of paper towels avoided", icon: "🧺" },
  { wasteItem: "Food Scraps", waterAction: "Composting reduces water waste", insight: "Composting food waste at home means less water used in garbage processing and landfill leachate treatment", impact: "Reduces municipal water use by preventing contaminated runoff", icon: "🥕" },
  { wasteItem: "Glass Containers", waterAction: "Water storage & collection", insight: "Glass jars can collect rainwater or store drinking water safely without chemical leaching", impact: "Reduces plastic waste while enabling safe water storage", icon: "🫙" },
];

export const getCrossImpactSuggestions = (): CrossImpactSuggestion[] => CROSS_IMPACT_DATA;

const BASE_COACH_ADVICE: CoachAdvice[] = [
  { title: "Morning Routine Optimizer", advice: "Turn off tap while brushing and use a cup. Take a 5-minute shower instead of 10. These two changes alone save 50L daily.", category: "Bathroom", savingPotential: "50L/day", icon: "🌅" },
  { title: "Kitchen Water Master", advice: "Wash vegetables in a bowl, not under running water. Reuse pasta/rice water for plants. Use measured water for boiling.", category: "Kitchen", savingPotential: "15–25L/day", icon: "🍳" },
  { title: "Laundry Intelligence", advice: "Only run full loads. Use eco-mode. Collect rinse water for mopping floors.", category: "Laundry", savingPotential: "30L/load", icon: "👕" },
  { title: "Garden Efficiency", advice: "Water plants before 8 AM or after 6 PM to reduce evaporation by 50%. Use drip irrigation over hose.", category: "Garden", savingPotential: "40% reduction", icon: "🌱" },
  { title: "Leak Detective", advice: "Check all taps, pipes, and toilets monthly. A single unnoticed leak wastes 20L/day. Check your water meter at night for hidden leaks.", category: "Maintenance", savingPotential: "20–200L/day", icon: "🔍" },
  { title: "Smart Flushing", advice: "Install dual-flush or place a filled bottle in the tank to reduce flush volume. Use half-flush when possible.", category: "Bathroom", savingPotential: "6L/flush", icon: "🚽" },
];

const LOCATION_COACH: Record<string, CoachAdvice[]> = {
  chennai: [
    { title: "Chennai Summer Survival", advice: "Store metro water during supply hours in clean containers. Install rooftop rainwater harvesting — it's mandatory and can provide 50% of your needs during monsoon.", category: "Location", savingPotential: "100L/day", icon: "☀️" },
    { title: "Hard Water Strategy", advice: "Use RO reject water for mopping and toilet flushing. Chennai's hard water means more RO rejection — capture and reuse every drop.", category: "Location", savingPotential: "20L/day", icon: "💧" },
  ],
  bengaluru: [
    { title: "Borewell Recharge Plan", advice: "During monsoon, channel rooftop water to recharge your borewell. One season of harvesting can improve water table for months.", category: "Location", savingPotential: "1000L/monsoon day", icon: "⛏️" },
    { title: "STP Water Reuse", advice: "If your apartment has an STP, ensure treated water is used for gardening and car washing. Never use fresh water for these.", category: "Location", savingPotential: "50L/day", icon: "🏢" },
  ],
  mumbai: [
    { title: "BMC Supply Optimization", advice: "Mumbai has timed water supply. Keep tanks clean and use efficient storage. Report leaks via BMC app immediately.", category: "Location", savingPotential: "30L/day", icon: "🏙️" },
  ],
  delhi: [
    { title: "Summer Peak Strategy", advice: "Delhi summers drain water fast. Use earthen pots for cooling water instead of continuous RO. Install aerators on all taps.", category: "Location", savingPotential: "25L/day", icon: "🌡️" },
  ],
  hyderabad: [
    { title: "Monsoon Harvesting", advice: "Hyderabad receives good monsoon rain. Install simple rooftop collection — even a basic barrel system helps during dry months.", category: "Location", savingPotential: "500L/rain day", icon: "🌧️" },
  ],
};

export const getDailyCoachAdvice = (city?: string): CoachAdvice[] => {
  const advice = [...BASE_COACH_ADVICE];
  if (city) {
    const key = city.toLowerCase().replace(/\s/g, "");
    const locationAdvice = LOCATION_COACH[key];
    if (locationAdvice) {
      advice.unshift(...locationAdvice);
    }
  }
  return advice;
};
