import { useState, useEffect } from "react";
import { Recycle, Leaf, AlertTriangle, Zap, Trash2, Clock, Sparkles, MapPin, Flame } from "lucide-react";
import { getScans, getStreak, syncScansFromDatabase, type ScanRecord } from "@/lib/scan-store";

const categoryIcon: Record<string, React.ReactNode> = {
  Recycle: <Recycle className="w-4 h-4" />,
  Compost: <Leaf className="w-4 h-4" />,
  Landfill: <Trash2 className="w-4 h-4" />,
  Hazardous: <AlertTriangle className="w-4 h-4" />,
  "E-waste": <Zap className="w-4 h-4" />,
};

const categoryColors: Record<string, string> = {
  Recycle: "border-l-primary",
  Compost: "border-l-primary",
  Landfill: "border-l-muted-foreground",
  Hazardous: "border-l-eco-orange",
  "E-waste": "border-l-eco-blue",
};

const motivationalQuotes = [
  "Every item you sort correctly makes the planet smile! 🌍",
  "You're building a greener future, one scan at a time! 🌱",
  "Small actions, big impact — keep recycling! ♻️",
  "The Earth thanks you for being an eco-warrior! 💚",
  "Your recycling streak is inspiring! Keep going! 🔥",
  "Together we can reduce landfill waste — you're doing your part! 🙌",
  "Kabadiwala approved! You're a recycling pro! 🏆",
  "Mother Nature is smiling because of you! 🌸",
];

const History = () => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [streak, setStreak] = useState(() => getStreak());
  const [quote] = useState(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  useEffect(() => {
    const load = async () => {
      await syncScansFromDatabase().catch(() => undefined);
      setScans(getScans());
      setStreak(getStreak());
    };
    load();
    window.addEventListener("ecovoice_scan_update", load);
    return () => window.removeEventListener("ecovoice_scan_update", load);
  }, []);

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="page-container">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2 eco-gradient-text">Recycle History</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Track your recycling journey and stay motivated!
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Motivation + Streak */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div className="eco-card p-4 flex items-center gap-3 bg-secondary/50">
            <Sparkles className="w-5 h-5 text-primary shrink-0" />
            <p className="text-sm font-medium">{quote}</p>
          </div>
          <div className="eco-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl eco-gradient flex items-center justify-center text-primary-foreground shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold">{streak.current}-day streak</p>
              <p className="text-xs text-muted-foreground">Best: {streak.best} days</p>
            </div>
          </div>
        </div>

        {scans.length === 0 ? (
          <div className="eco-card p-12 text-center">
            <Recycle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-semibold mb-1">No scans yet</p>
            <p className="text-sm text-muted-foreground">
              Go to the Scanner page to start identifying waste items and building your eco-history! 🌿
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {scans.map((scan, i) => (
              <div
                key={scan.id}
                className={`eco-card p-4 animate-fade-up border-l-4 ${categoryColors[scan.category] || "border-l-border"}`}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0">
                    {categoryIcon[scan.category] || <Recycle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">{scan.item}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium shrink-0">
                        {scan.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(scan.timestamp)}</span>
                      <span>·</span>
                      <span>{scan.confidence}% confidence</span>
                      {scan.city && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{scan.city}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {scans.length > 0 && (
          <div className="eco-card p-4 mt-6 text-center bg-gradient-to-r from-secondary/50 to-accent/30">
            <p className="text-sm text-muted-foreground">
              🎯 You've scanned <span className="font-bold text-foreground">{scans.length}</span> items!
              {scans.length >= 20 && " You're a Green Hero! 🌿"}
              {scans.length >= 5 && scans.length < 20 && " Amazing progress — keep the streak going! 🔥"}
              {scans.length < 5 && " Scan a few more to earn your first badge! 🌱"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
