import { useEffect, useState } from "react";
import { Recycle, Droplets, Zap, Wind, Award, Flame, Calendar, Target, TrendingUp, Leaf } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getStats, syncScansFromDatabase } from "@/lib/scan-store";
import { calculateEcoScore, getDailyWaterTip } from "@/lib/water-intelligence";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const COLORS = [
  "hsl(145, 63%, 42%)",
  "hsl(200, 80%, 65%)",
  "hsl(45, 90%, 55%)",
  "hsl(25, 90%, 55%)",
  "hsl(0, 72%, 51%)",
];

const Dashboard = () => {
  const [data, setData] = useState(() => getStats());
  const [waterTipsViewed] = useState(() => {
    try { return parseInt(localStorage.getItem("ecovoice_water_tips") || "0"); } catch { return 0; }
  });

  const dailyTip = getDailyWaterTip();
  const ecoScore = calculateEcoScore({
    totalScans: data.total,
    streakDays: data.streak.current,
    waterTipsViewed,
  });

  useEffect(() => {
    const refresh = async () => {
      await syncScansFromDatabase().catch(() => undefined);
      setData(getStats());
    };
    refresh();
    window.addEventListener("ecovoice_scan_update", refresh);
    return () => window.removeEventListener("ecovoice_scan_update", refresh);
  }, []);

  const pieData = Object.entries(data.categoryBreakdown).map(([name, value]) => ({ name, value }));

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
          {data.total === 0
            ? "Start scanning to see your real-time impact! 🌍"
            : "See the positive difference you're making 🌍"}
        </p>
      </div>

      {/* EcoScore + Streak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="eco-card p-5 flex items-center gap-4 animate-fade-up">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="hsl(var(--primary))" strokeWidth="3"
                strokeDasharray={`${ecoScore.score} ${100 - ecoScore.score}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold">{ecoScore.score}</span>
            </div>
          </div>
          <div>
            <p className="font-bold text-lg flex items-center gap-2">
              <Leaf className="w-4 h-4 text-primary" /> EcoScore
            </p>
            <p className="text-sm text-primary font-medium">{ecoScore.level}</p>
            {ecoScore.suggestions[0] && (
              <p className="text-xs text-muted-foreground mt-1">{ecoScore.suggestions[0]}</p>
            )}
          </div>
        </div>

        {data.streak.current > 0 ? (
          <div className="eco-card p-5 flex items-center gap-4 bg-gradient-to-r from-secondary to-accent/30 animate-fade-up">
            <div className="w-12 h-12 rounded-xl eco-gradient flex items-center justify-center text-primary-foreground">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-lg">{data.streak.current}-day streak! 🔥</p>
              <p className="text-sm text-muted-foreground">
                Best: {data.streak.best} days · Keep scanning daily!
              </p>
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="eco-card p-4 text-center animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-secondary flex items-center justify-center text-primary">
              {stat.icon}
            </div>
            <p className="text-xl font-bold">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 eco-card p-6">
          <h2 className="font-display font-semibold mb-4">Monthly Progress</h2>
          {data.monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              Scan items to see your monthly progress chart here! 📊
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="items" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="eco-card p-6">
          <h2 className="font-display font-semibold mb-4">Category Breakdown</h2>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
              Scan items to see categories! 📂
            </div>
          ) : (
            <div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={4}>
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {pieData.map((entry, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {entry.name} ({entry.value})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="eco-card p-6">
        <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" /> Achievement Badges
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.badges.map((badge, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                badge.earned
                  ? "bg-secondary border border-primary/20 shadow-sm"
                  : "bg-muted/50 opacity-60"
              }`}
            >
              <span className="text-3xl">{badge.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{badge.name}</p>
                <p className="text-xs text-muted-foreground">{badge.desc}</p>
                {!badge.earned && (
                  <div className="mt-1.5 h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full eco-gradient transition-all duration-500"
                      style={{ width: `${Math.min(100, (badge.progress / badge.threshold) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
              {badge.earned ? (
                <span className="text-xs font-bold text-primary">✓</span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {`${badge.progress}/${badge.threshold}`}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
