import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(145, 63%, 42%)", "hsl(200, 80%, 65%)", "hsl(45, 90%, 55%)", "hsl(25, 90%, 55%)", "hsl(0, 72%, 51%)"];

interface Props {
  monthlyData: { month: string; items: number }[];
  categoryBreakdown: Record<string, number>;
}

const DashboardCharts = ({ monthlyData, categoryBreakdown }: Props) => {
  const pieData = Object.entries(categoryBreakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="lg:col-span-2 eco-card p-6">
        <h2 className="font-display font-semibold mb-4">Monthly Progress</h2>
        {monthlyData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">
            Scan items to see your monthly progress chart here! 📊
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: 13 }} />
              <Bar dataKey="items" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="eco-card p-6">
        <h2 className="font-display font-semibold mb-4">Category Breakdown</h2>
        {pieData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] text-muted-foreground text-sm">Scan items to see categories! 📂</div>
        ) : (
          <div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={4}>
                  {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
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
  );
};

export default DashboardCharts;
