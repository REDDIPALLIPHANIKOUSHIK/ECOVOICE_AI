import { useEffect, useState } from "react";
import { Recycle, Droplets, Zap, Wind, Award, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getStats } from "@/lib/scan-store";

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

const Dashboard = () => {
  const [data, setData] = useState(() => getStats());

  useEffect(() => {
    const refresh = () => setData(getStats());
    window.addEventListener("ecovoice_scan_update", refresh);
    return () => window.removeEventListener("ecovoice_scan_update", refresh);
  }, []);

  const stats = [
    { label: "Items Scanned", value: data.total, icon: <Recycle className="w-5 h-5" />, suffix: "" },
    { label: "Correctly Sorted", value: data.correctlySorted, icon: <TrendingUp className="w-5 h-5" />, suffix: "" },
    { label: "CO₂ Saved", value: data.co2Saved, icon: <Wind className="w-5 h-5" />, suffix: " kg" },
    { label: "Water Saved", value: data.waterSaved, icon: <Droplets className="w-5 h-5" />, suffix: " L" },
    { label: "Energy Saved", value: data.energySaved, icon: <Zap className="w-5 h-5" />, suffix: " kWh" },
  ];

  return (
    <div className="page-container">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">Impact Dashboard</h1>
        <p className="text-muted-foreground">
          {data.total === 0
            ? "Start scanning to see your real-time impact! 🌍"
            : "See the positive difference you're making 🌍"}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="eco-card p-4 text-center animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-secondary flex items-center justify-center text-primary">
              {stat.icon}
            </div>
            <p className="text-2xl font-bold">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Badges
          </h2>
          <div className="space-y-3">
            {data.badges.map((badge, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  badge.earned ? "bg-secondary" : "bg-muted opacity-50"
                }`}
              >
                <span className="text-2xl">{badge.icon}</span>
                <div>
                  <p className="font-medium text-sm">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.desc}</p>
                </div>
                {badge.earned ? (
                  <span className="ml-auto text-xs font-medium text-primary">Earned ✓</span>
                ) : (
                  <span className="ml-auto text-xs text-muted-foreground">{data.total}/{badge.threshold}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
