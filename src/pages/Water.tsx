import { useState, useEffect } from "react";
import {
  Droplets, Search, Recycle as RecycleIcon, Activity, Lightbulb, AlertTriangle,
  CheckCircle, Info, MapPin, TrendingDown, FlaskConical, Zap, ArrowRight, Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  estimateWaterWaste, analyzeWaterReusability, getInvisibleWaterUsage, getDailyTotalUsage,
  getRandomTips, getLocationWaterContext, getWaterLevelColor,
  type WaterWasteEstimate, type WaterReusability, type LocationWaterContext,
} from "@/lib/water-intelligence";
import {
  simulateWhatIf, getCrossImpactSuggestions, getDailyCoachAdvice,
  type WhatIfResult, type CrossImpactSuggestion, type CoachAdvice,
} from "@/lib/water-advanced";
import { getSavedLocation } from "@/lib/location";

const severityColor: Record<string, string> = {
  low: "text-primary", medium: "text-yellow-500", high: "text-orange-500", critical: "text-destructive",
};
const classColor: Record<string, string> = {
  reusable: "text-primary", partially_reusable: "text-yellow-500", not_recommended: "text-destructive",
};
const classLabel: Record<string, string> = {
  reusable: "✅ Reusable", partially_reusable: "⚠️ Partially Reusable", not_recommended: "❌ Not Recommended",
};

const Water = () => {
  const [wasteInput, setWasteInput] = useState("");
  const [wasteResult, setWasteResult] = useState<WaterWasteEstimate | null>(null);
  const [reuseInput, setReuseInput] = useState("");
  const [reuseResult, setReuseResult] = useState<WaterReusability | null>(null);
  const [whatIfInput, setWhatIfInput] = useState("");
  const [whatIfResult, setWhatIfResult] = useState<WhatIfResult | null>(null);
  const [activeTab, setActiveTab] = useState<"estimator" | "reuse" | "invisible" | "whatif" | "cross" | "coach">("estimator");
  const [tips] = useState(() => getRandomTips(6));
  const [waterContext, setWaterContext] = useState<LocationWaterContext | null>(null);
  const [crossSuggestions] = useState<CrossImpactSuggestion[]>(() => getCrossImpactSuggestions());
  const [coachAdvice, setCoachAdvice] = useState<CoachAdvice[]>([]);
  const invisibleUsage = getInvisibleWaterUsage();
  const dailyTotal = getDailyTotalUsage();

  useEffect(() => {
    const loc = getSavedLocation();
    if (loc?.city) {
      setWaterContext(getLocationWaterContext(loc.city));
      setCoachAdvice(getDailyCoachAdvice(loc.city));
    } else {
      setCoachAdvice(getDailyCoachAdvice());
    }
  }, []);

  const handleWasteEstimate = () => setWasteResult(estimateWaterWaste(wasteInput));
  const handleReuseAnalysis = () => setReuseResult(analyzeWaterReusability(reuseInput));
  const handleWhatIf = () => setWhatIfResult(simulateWhatIf(whatIfInput));

  const tabs = [
    { id: "estimator" as const, label: "Risk", icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "reuse" as const, label: "Reuse", icon: <RecycleIcon className="w-4 h-4" /> },
    { id: "invisible" as const, label: "Usage", icon: <Activity className="w-4 h-4" /> },
    { id: "whatif" as const, label: "What-If", icon: <FlaskConical className="w-4 h-4" /> },
    { id: "cross" as const, label: "Cross-Impact", icon: <Package className="w-4 h-4" /> },
    { id: "coach" as const, label: "Coach", icon: <Lightbulb className="w-4 h-4" /> },
  ];

  return (
    <div className="page-container">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2 eco-gradient-text">Water Intelligence</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Predict risk, discover reusability, simulate impact, and get daily coaching 💧
        </p>
      </div>

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
        <div className="flex gap-1 mb-6 bg-muted/50 rounded-xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Water Risk Prediction */}
        {activeTab === "estimator" && (
          <div className="space-y-4">
            <div className="eco-card p-6">
              <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500" /> Water Risk Prediction
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Describe your water issue to get daily loss, monthly projection, and risk level
              </p>
              <div className="flex gap-2">
                <input type="text" value={wasteInput} onChange={(e) => setWasteInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleWasteEstimate()}
                  placeholder="e.g., leaking tap, dripping shower..."
                  className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring border border-border/50" />
                <Button onClick={handleWasteEstimate} className="rounded-xl"><Search className="w-4 h-4 mr-1" /> Predict</Button>
              </div>
            </div>

            {wasteResult && (
              <div className="eco-card p-6 animate-scale-in space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize">{wasteResult.issue}</h3>
                  <span className={`text-sm font-bold ${severityColor[wasteResult.severity]}`}>
                    {wasteResult.severity.toUpperCase()} Risk
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: `${wasteResult.dailyLiters}L`, label: "Per Day" },
                    { val: `${wasteResult.monthlyLiters.toLocaleString()}L`, label: "Per Month" },
                    { val: `${wasteResult.yearlyLiters.toLocaleString()}L`, label: "Per Year" },
                  ].map((d, i) => (
                    <div key={i} className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-blue-500">{d.val}</p>
                      <p className="text-xs text-muted-foreground">{d.label}</p>
                    </div>
                  ))}
                </div>
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

        {/* Reusability Decision Engine */}
        {activeTab === "reuse" && (
          <div className="space-y-4">
            <div className="eco-card p-6">
              <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
                <RecycleIcon className="w-5 h-5 text-primary" /> Water Reusability Decision Engine
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Get a YES / PARTIAL / NO decision with reasons and safe reuse suggestions
              </p>
              <div className="flex gap-2">
                <input type="text" value={reuseInput} onChange={(e) => setReuseInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleReuseAnalysis()}
                  placeholder="e.g., rice water, RO reject, bath water..."
                  className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring border border-border/50" />
                <Button onClick={handleReuseAnalysis} className="rounded-xl"><Search className="w-4 h-4 mr-1" /> Analyze</Button>
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
                    <ul className="space-y-1">{reuseResult.warnings.map((w, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{w}</li>
                    ))}</ul>
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

        {/* Invisible Water Usage Analyzer */}
        {activeTab === "invisible" && (
          <div className="space-y-4">
            <div className="eco-card p-6">
              <h2 className="font-display font-semibold mb-1 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Invisible Water Usage Analyzer
              </h2>
              <p className="text-sm text-muted-foreground mb-4">See hidden water consumption in daily activities and optimization tips</p>
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
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
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

        {/* What-If Simulation */}
        {activeTab === "whatif" && (
          <div className="space-y-4">
            <div className="eco-card p-6">
              <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-500" /> What-If Simulation Engine
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Ask "What if I ignore this leak?" and see time-based future impact
              </p>
              <div className="flex gap-2">
                <input type="text" value={whatIfInput} onChange={(e) => setWhatIfInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleWhatIf()}
                  placeholder="e.g., ignore leak, skip fixing toilet, leave hose on..."
                  className="flex-1 bg-muted rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring border border-border/50" />
                <Button onClick={handleWhatIf} className="rounded-xl"><FlaskConical className="w-4 h-4 mr-1" /> Simulate</Button>
              </div>
            </div>
            {whatIfResult && (
              <div className="eco-card p-6 animate-scale-in space-y-4">
                <h3 className="font-semibold capitalize flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${severityColor[whatIfResult.severity]}`} />
                  {whatIfResult.scenario}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {whatIfResult.timeline.map((t, i) => (
                    <div key={i} className="bg-muted rounded-xl p-3 text-center">
                      <p className="text-xs text-muted-foreground mb-1">{t.period}</p>
                      <p className="text-lg font-bold text-destructive">{t.litersLost.toLocaleString()}L</p>
                      <p className="text-xs text-muted-foreground">≈ ₹{t.costImpact}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/20">
                  <p className="text-xs font-medium text-destructive mb-1">🌍 Environmental Impact</p>
                  <p className="text-sm">{whatIfResult.environmentalEffect}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs font-medium mb-2">✅ Recommended Action</p>
                  <p className="text-sm">{whatIfResult.recommendation}</p>
                </div>
              </div>
            )}
            {whatIfInput && !whatIfResult && (
              <div className="eco-card p-6 text-center text-muted-foreground">
                <p className="text-sm">Try: "ignore leak", "skip fixing toilet", "leave tap running", "no repair for shower"</p>
              </div>
            )}
          </div>
        )}

        {/* Cross-Impact Engine */}
        {activeTab === "cross" && (
          <div className="space-y-4">
            <div className="eco-card p-6">
              <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Cross-Impact: Waste ↔ Water
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Discover how waste items connect to water savings
              </p>
            </div>
            <div className="space-y-3">
              {crossSuggestions.map((s, i) => (
                <div key={i} className="eco-card p-4 animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{s.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{s.wasteItem}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-primary font-medium">{s.waterAction}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{s.insight}</p>
                      <p className="text-xs text-primary mt-1 font-medium">{s.impact}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Daily Water Coach */}
        {activeTab === "coach" && (
          <div className="space-y-4">
            <div className="eco-card p-6">
              <h2 className="font-display font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" /> Daily Water Intelligence Coach
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                Personalized advice based on your location, habits, and usage patterns
              </p>
            </div>
            {waterContext && (
              <div className="eco-card p-4 border-l-4 border-primary">
                <p className="text-xs font-medium text-primary mb-1">📍 Localized for {waterContext.city}</p>
                <div className="space-y-1">
                  {waterContext.localTips.map((tip, i) => (
                    <p key={i} className="text-sm text-muted-foreground">• {tip}</p>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-3">
              {coachAdvice.map((advice, i) => (
                <div key={i} className="eco-card p-4 animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{advice.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{advice.title}</span>
                        <span className="text-xs px-2 py-0.5 bg-secondary rounded-full text-secondary-foreground">{advice.category}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{advice.advice}</p>
                      <p className="text-xs text-primary mt-1 font-medium">Potential saving: {advice.savingPotential}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {tips.length > 0 && (
              <div className="eco-card p-4 bg-secondary/50">
                <p className="text-xs font-medium mb-2">💡 Quick Tips</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tips.slice(0, 4).map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span>{tip.icon}</span>
                      <span className="text-muted-foreground">{tip.tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Water;
