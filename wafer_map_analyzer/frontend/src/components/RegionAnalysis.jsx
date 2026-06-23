import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b'];

export default function RegionAnalysis({ data }) {
  if (!data) return <div className="card text-sm text-slate-500">No region data available.</div>;

  const chartData = Object.entries(data).map(([name, v]) => ({ name, value: Number((v * 100).toFixed(2)) }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Region Analysis</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100} label={(x) => `${x.name}: ${x.value}%`}>
              {chartData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `${v}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
