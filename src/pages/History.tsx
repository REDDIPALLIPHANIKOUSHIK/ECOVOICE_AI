import { useState, useEffect } from "react";
import { Recycle, Leaf, AlertTriangle, Zap, Trash2, Clock, Sparkles } from "lucide-react";
import { getScans, type ScanRecord } from "@/lib/scan-store";

const categoryIcon: Record<string, React.ReactNode> = {
  Recycle: <Recycle className="w-4 h-4" />,
  Compost: <Leaf className="w-4 h-4" />,
  Landfill: <Trash2 className="w-4 h-4" />,
  Hazardous: <AlertTriangle className="w-4 h-4" />,
  "E-waste": <Zap className="w-4 h-4" />,
};

const motivationalQuotes = [
  "Every item you sort correctly makes the planet smile! 🌍",
  "You're building a greener future, one scan at a time! 🌱",
  "Small actions, big impact — keep recycling! ♻️",
  "The Earth thanks you for being an eco-warrior! 💚",
  "Your recycling streak is inspiring! Keep going! 🔥",
  "Together we can reduce landfill waste — you're doing your part! 🙌",
];

const History = () => {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [quote] = useState(() => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

  useEffect(() => {
    const load = () => setScans(getScans());
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
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Recycle History</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Track your recycling journey and stay motivated!
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="eco-card p-4 mb-6 flex items-center gap-3 bg-secondary/50">
          <Sparkles className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm font-medium">{quote}</p>
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
          <div className="space-y-3">
            {scans.map((scan, i) => (
              <div
                key={scan.id}
                className="eco-card p-4 animate-fade-up"
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                    {categoryIcon[scan.category] || <Recycle className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{scan.item}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium shrink-0">
                        {scan.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(scan.timestamp)}</span>
                      <span>·</span>
                      <span>{scan.confidence}% confidence</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {scans.length > 0 && (
          <div className="eco-card p-4 mt-6 text-center bg-secondary/30">
            <p className="text-sm text-muted-foreground">
              🎯 You've scanned <span className="font-bold text-foreground">{scans.length}</span> items!
              {scans.length >= 5 && " Amazing progress — keep the streak going! 🔥"}
              {scans.length < 5 && " Scan a few more to earn your first badge! 🌱"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
