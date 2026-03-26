import { Award } from "lucide-react";

interface Badge {
  name: string;
  desc: string;
  earned: boolean;
  icon: string;
  threshold: number;
  progress: number;
}

const DashboardBadges = ({ badges }: { badges: Badge[] }) => (
  <div className="eco-card p-6">
    <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
      <Award className="w-5 h-5 text-primary" /> Achievement Badges
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {badges.map((badge, i) => (
        <div
          key={i}
          className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
            badge.earned ? "bg-secondary border border-primary/20 shadow-sm" : "bg-muted/50 opacity-60"
          }`}
        >
          <span className="text-3xl">{badge.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{badge.name}</p>
            <p className="text-xs text-muted-foreground">{badge.desc}</p>
            {!badge.earned && (
              <div className="mt-1.5 h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full eco-gradient transition-all duration-500"
                  style={{ width: `${Math.min(100, (badge.progress / badge.threshold) * 100)}%` }} />
              </div>
            )}
          </div>
          {badge.earned ? (
            <span className="text-xs font-bold text-primary">✓</span>
          ) : (
            <span className="text-xs text-muted-foreground">{`${badge.progress}/${badge.threshold}`}</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default DashboardBadges;
