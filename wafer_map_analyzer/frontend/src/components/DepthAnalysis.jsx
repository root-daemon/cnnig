import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function DepthAnalysis({ data }) {
  const chartData = (data || []).map((item) => ({
    band: `B${item.band}`,
    density: Number((item.defect_density * 100).toFixed(2)),
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Depth Analysis (Radial Profile)</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="band" />
            <YAxis unit="%" />
            <Tooltip formatter={(v) => `${v}%`} />
            <Line type="monotone" dataKey="density" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
