import { useState, useEffect } from "react";
import { Droplets, Search, Recycle as RecycleIcon, Activity, Lightbulb, AlertTriangle, CheckCircle, Info, MapPin, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  estimateWaterWaste,
  analyzeWaterReusability,
  getInvisibleWaterUsage,
  getDailyTotalUsage,
  getRandomTips,
  getLocationWaterContext,
  getWaterLevelColor,
  type WaterWasteEstimate,
  type WaterReusability,
  type LocationWaterContext,
} from "@/lib/water-intelligence";
import { getSavedLocation } from "@/lib/location";

const severityColor: Record<string, string> = {
  low: "text-primary",
  medium: "text-yellow-500",
  high: "text-orange-500",
  critical: "text-destructive",
};

const classColor: Record<string, string> = {
  reusable: "text-primary",
  partially_reusable: "text-yellow-500",
  not_recommended: "text-destructive",
};

const classLabel: Record<string, string> = {
  reusable: "✅ Reusable",
  partially_reusable: "⚠️ Partially Reusable",
  not_recommended: "❌ Not Recommended",
};

const Water = () => {
  const [wasteInput, setWasteInput] = useState("");
  const [wasteResult, setWasteResult] = useState<WaterWasteEstimate | null>(null);
  const [reuseInput, setReuseInput] = useState("");
  const [reuseResult, setReuseResult] = useState<WaterReusability | null>(null);
  const [activeTab, setActiveTab] = useState<"estimator" | "reuse" | "invisible" | "tips">("estimator");
  const [tips] = useState(() => getRandomTips(6));
  const [waterContext, setWaterContext] = useState<LocationWaterContext | null>(null);
  const invisibleUsage = getInvisibleWaterUsage();
  const dailyTotal = getDailyTotalUsage();

  useEffect(() => {
    const loc = getSavedLocation();
    if (loc?.city) {
      setWaterContext(getLocationWaterContext(loc.city));
    }
  }, []);

  const handleWasteEstimate = () => {
    const result = estimateWaterWaste(wasteInput);
    setWasteResult(result);
  };

  const handleReuseAnalysis = () => {
    const result = analyzeWaterReusability(reuseInput);
    setReuseResult(result);
  };

  const tabs = [
    { id: "estimator" as const, label: "Water Waste", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "reuse" as const, label: "Reusability", icon: <RecycleIcon className="w-4 h-4" /> },
    { id: "invisible" as const, label: "Daily Usage", icon: <Activity className="w-4 h-4" /> },
    { id: "tips" as const, label: "Tips", icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <div className="page-container">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2 eco-gradient-text">
          Water Intelligence
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Estimate waste, discover reusability, and track your daily water footprint 💧
        </p>
      </div>

      {/* Location Water Context Card */}
      {waterContext && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="eco-card p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex items-start gap-3 flex-1">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{waterContext.city}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-muted ${getWaterLevelColor(waterContext.waterLevel)}`}>
                    {waterContext.waterLevel.toUpperCase()} water availability
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{waterContext.climate}</p>
                <p className="text-xs text-muted-foreground mt-1">📅 {waterContext.seasonalAdvice}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {waterContext.localTips.slice(0, 2).map((tip, i) => (
                <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground">💡 {tip}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex gap-1 mb-6 bg-muted/50 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Water Waste Estimator */}
        {activeTab === "estimator" && (
          <div className="space-y-4">
            <div className="eco-card p-6">
              <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                Water Waste Estimator
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Describe your water issue (e.g., "leaking tap", "running toilet", "overflowing tank")
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={wasteInput}
                  onChange={(e) => setWasteInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleWasteEstimate()}
                  placeholder="e.g., leaking tap, dripping shower..."
                  className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring border border-border/50"
                />
                <Button onClick={handleWasteEstimate} className="rounded-xl">
                  <Search className="w-4 h-4 mr-1" /> Estimate
                </Button>
              </div>
            </div>

            {wasteResult && (
              <div className="eco-card p-6 animate-scale-in space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">{wasteResult.issue}</h3>
                  <span className={`text-sm font-bold ${severityColor[wasteResult.severity]}`}>
                    {wasteResult.severity.toUpperCase()} severity
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-blue-500">{wasteResult.dailyLiters}L</p>
                    <p className="text-xs text-muted-foreground">Per Day</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-blue-500">{wasteResult.monthlyLiters.toLocaleString()}L</p>
                    <p className="text-xs text-muted-foreground">Per Month</p>
                  </div>
                  <div className="bg-muted rounded-xl p-3 text-center">
                    <p className="text-xl font-bold text-blue-500">{wasteResult.yearlyLiters.toLocaleString()}L</p>
                    <p className="text-xs text-muted-foreground">Per Year</p>
                  </div>
                </div>

                {/* Future Impact Simulation */}
                <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/20">
                  <p className="text-xs font-medium mb-1 flex items-center gap-1.5 text-destructive">
                    <TrendingDown className="w-3.5 h-3.5" /> Future Impact Simulation
                  </p>
                  <p className="text-sm">{wasteResult.futureImpact}</p>
                </div>

                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs font-medium mb-2">💡 Fix Suggestions</p>
                  <ul className="space-y-1.5">
                    {wasteResult.fixSuggestions.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> {wasteResult.costEstimate}
                </p>
              </div>
            )}

            {wasteInput && !wasteResult && (
              <div className="eco-card p-6 text-center text-muted-foreground">
                <p className="text-sm">No exact match found. Try: "leaking tap", "running toilet", "overflowing tank", "dripping shower", "garden hose", or "leaking pipe"</p>
              </div>
            )}
          </div>
        )}

        {/* Reusability Analyzer */}
        {activeTab === "reuse" && (
          <div className="space-y-4">
            <div className="eco-card p-6">
              <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
                <RecycleIcon className="w-5 h-5 text-primary" />
                Water Reusability Analyzer
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Ask if specific water can be reused (e.g., "washing machine water", "rice water", "AC water")
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={reuseInput}
                  onChange={(e) => setReuseInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReuseAnalysis()}
                  placeholder="e.g., rice water, RO reject, bath water..."
                  className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring border border-border/50"
                />
                <Button onClick={handleReuseAnalysis} className="rounded-xl">
                  <Search className="w-4 h-4 mr-1" /> Analyze
                </Button>
              </div>
            </div>

            {reuseResult && (
              <div className="eco-card p-6 animate-scale-in space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">{reuseResult.source}</h3>
                  <span className={`text-sm font-bold ${classColor[reuseResult.classification]}`}>
                    {classLabel[reuseResult.classification]}
                  </span>
                </div>

                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs font-medium mb-2">Safe Uses</p>
                  <ul className="space-y-1.5">
                    {reuseResult.safeUses.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {reuseResult.warnings.length > 0 && (
                  <div className="bg-accent rounded-xl p-4">
                    <p className="text-xs font-medium mb-2">⚠️ Warnings</p>
                    <ul className="space-y-1">
                      {reuseResult.warnings.map((w, i) => (
                        <li key={i} className="text-sm text-muted-foreground">{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {reuseResult.circularTip && (
                  <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                    <p className="text-xs font-medium mb-1">♻️ Circular Sustainability</p>
                    <p className="text-sm">{reuseResult.circularTip}</p>
                  </div>
                )}
              </div>
            )}

            {reuseInput && !reuseResult && (
              <div className="eco-card p-6 text-center text-muted-foreground">
                <p className="text-sm">Try: "washing machine", "rice water", "bath water", "cooking water", "AC water", or "RO reject"</p>
              </div>
            )}
          </div>
        )}

        {/* Invisible Water Usage */}
        {activeTab === "invisible" && (
          <div className="space-y-4">
            <div className="eco-card p-6">
              <h2 className="font-display font-semibold mb-1 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Your Daily Water Footprint
              </h2>
              <p className="text-sm text-muted-foreground mb-4">See how much water common activities use — and how to cut down</p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-destructive">{dailyTotal.total}L</p>
                  <p className="text-xs text-muted-foreground">Current Usage</p>
                </div>
                <div className="bg-muted rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-primary">{dailyTotal.optimized}L</p>
                  <p className="text-xs text-muted-foreground">Optimized</p>
                </div>
                <div className="bg-secondary rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-primary">{dailyTotal.savingPercent}%</p>
                  <p className="text-xs text-muted-foreground">Savings</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {invisibleUsage.map((item, i) => (
                <div key={i} className="eco-card p-4 animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{item.activity}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-destructive font-semibold">{item.litersUsed}L</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-primary font-semibold">{item.optimizedLiters}L</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden mb-2">
                    <div className="h-full rounded-full eco-gradient transition-all duration-500" style={{ width: `${(item.optimizedLiters / item.litersUsed) * 100}%` }} />
                  </div>
                  <ul className="flex flex-wrap gap-1.5">
                    {item.savingTips.map((tip, j) => (
                      <li key={j} className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">{tip}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Tips */}
        {activeTab === "tips" && (
          <div className="space-y-3">
            {waterContext && (
              <div className="eco-card p-4 mb-2 border-l-4 border-primary">
                <p className="text-xs font-medium text-primary mb-1">📍 Tips for {waterContext.city}</p>
                <div className="space-y-1">
                  {waterContext.localTips.map((tip, i) => (
                    <p key={i} className="text-sm text-muted-foreground">• {tip}</p>
                  ))}
                </div>
              </div>
            )}
            {tips.map((tip, i) => (
              <div key={i} className="eco-card p-4 animate-fade-up flex items-start gap-3" style={{ animationDelay: `${i * 0.06}s` }}>
                <span className="text-2xl">{tip.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{tip.tip}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground">{tip.category}</span>
                    <span>Saves: {tip.savingPotential}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Water;
