export default function CutlineAnalysis({ cutlineData }) {
  const q = cutlineData?.quadrants;

  if (!q) {
    return <div className="card text-sm text-slate-500">No cut-line analysis available.</div>;
  }

  const cards = [
    { key: 'top_left', label: 'Top Left' },
    { key: 'top_right', label: 'Top Right' },
    { key: 'bottom_left', label: 'Bottom Left' },
    { key: 'bottom_right', label: 'Bottom Right' },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Cut-line Analysis</h3>
      <p className="text-sm text-slate-600 mb-3">
        Current cut position: X={cutlineData.x_line}, Y={cutlineData.y_line}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {cards.map(({ key, label }) => (
          <div key={key} className="rounded-lg border border-slate-200 p-3 bg-slate-50">
            <p className="font-medium text-slate-700">{label}</p>
            <p className="text-sm text-slate-600">Defect Count: {q[key].defect_count}</p>
            <p className="text-sm text-slate-600">Defect %: {q[key].defect_percentage.toFixed(2)}%</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
        Recommended low-defect section: <span className="font-semibold">{cutlineData.recommended_low_defect_quadrant}</span>
      </div>
    </div>
  );
}
