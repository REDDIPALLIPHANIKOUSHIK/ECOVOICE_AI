import { useEffect, useState } from "react";
import { Recycle, Droplets, Zap, Wind, Award, Flame, Calendar, Target, Leaf } from "lucide-react";
import { getStats, syncScansFromDatabase } from "@/lib/scan-store";
import { calculateEcoScore, getDailyWaterTip } from "@/lib/water-intelligence";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DashboardBadges from "@/components/dashboard/DashboardBadges";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); } else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const Dashboard = () => {
  const [data, setData] = useState(() => getStats());
  const [waterTipsViewed] = useState(() => {
    try { return parseInt(localStorage.getItem("ecovoice_water_tips") || "0"); } catch { return 0; }
  });

  const dailyTip = getDailyWaterTip();
  const ecoScore = calculateEcoScore({ totalScans: data.total, streakDays: data.streak.current, waterTipsViewed });

  useEffect(() => {
    const refresh = async () => {
      await syncScansFromDatabase().catch(() => undefined);
      setData(getStats());
    };
    refresh();
    window.addEventListener("ecovoice_scan_update", refresh);
    return () => window.removeEventListener("ecovoice_scan_update", refresh);
  }, []);

  const stats = [
    { label: "Total Scans", value: data.total, icon: <Recycle className="w-5 h-5" />, suffix: "" },
    { label: "Today", value: data.todayScans, icon: <Target className="w-5 h-5" />, suffix: "" },
    { label: "This Week", value: data.weekScans, icon: <Calendar className="w-5 h-5" />, suffix: "" },
    { label: "CO₂ Saved", value: data.co2Saved, icon: <Wind className="w-5 h-5" />, suffix: " kg" },
    { label: "Water Saved", value: data.waterSaved, icon: <Droplets className="w-5 h-5" />, suffix: " L" },
    { label: "Energy Saved", value: data.energySaved, icon: <Zap className="w-5 h-5" />, suffix: " kWh" },
  ];

  return (
    <div className="page-container">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2 eco-gradient-text">Impact Dashboard</h1>
        <p className="text-muted-foreground">
          {data.total === 0 ? "Start scanning to see your real-time impact! 🌍" : "See the positive difference you're making 🌍"}
        </p>
      </div>

      {/* Daily Impact Message */}
      {data.todayScans > 0 && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="eco-card p-4 bg-gradient-to-r from-primary/10 to-secondary/50 text-center animate-fade-up">
            <p className="text-sm font-medium">
              🎉 You saved <span className="text-primary font-bold">{Math.round(data.todayScans * 8.5)}L</span> of water and reduced <span className="text-primary font-bold">{(data.todayScans * 0.33).toFixed(1)}kg</span> CO₂ today! 💧🌿
            </p>
          </div>
        </div>
      )}

      {/* EcoScore + Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="eco-card p-5 flex items-center gap-4 animate-fade-up">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                strokeDasharray={`${ecoScore.score} ${100 - ecoScore.score}`} strokeLinecap="round" className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{ecoScore.score}</span>
            </div>
          </div>
          <div>
            <p className="font-bold text-lg flex items-center gap-2"><Leaf className="w-4 h-4 text-primary" /> EcoScore</p>
            <p className="text-sm text-primary font-medium">{ecoScore.level}</p>
            {ecoScore.suggestions[0] && <p className="text-xs text-muted-foreground mt-1">{ecoScore.suggestions[0]}</p>}
          </div>
        </div>

        {data.streak.current > 0 ? (
          <div className="eco-card p-5 flex items-center gap-4 bg-gradient-to-r from-secondary to-accent/30 animate-fade-up">
            <div className="w-12 h-12 rounded-xl eco-gradient flex items-center justify-center text-primary-foreground">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg">{data.streak.current}-day streak! 🔥</p>
              <p className="text-sm text-muted-foreground">Best: {data.streak.best} days · Keep scanning daily!</p>
            </div>
          </div>
        ) : (
          <div className="eco-card p-5 flex items-center gap-3 animate-fade-up">
            <span className="text-2xl">{dailyTip.icon}</span>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-0.5">💧 Daily Water Tip</p>
              <p className="text-sm font-medium">{dailyTip.tip}</p>
              <p className="text-xs text-primary mt-0.5">Saves: {dailyTip.savingPotential}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="eco-card p-4 text-center animate-fade-up hover:shadow-md transition-shadow duration-200" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-secondary flex items-center justify-center text-primary">{stat.icon}</div>
            <p className="text-xl font-bold"><AnimatedCounter target={stat.value} suffix={stat.suffix} /></p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <DashboardCharts monthlyData={data.monthlyData} categoryBreakdown={data.categoryBreakdown} />
      <DashboardBadges badges={data.badges} />
    </div>
  );
};

export default Dashboard;
