export default function DensityHeatmap({ densityAnalysis }) {
  const grid = densityAnalysis?.density_grid || [];

  const cellColor = (v) => {
    const value = Math.max(0, Math.min(1, v));
    const r = Math.round(255 * value);
    const b = Math.round(255 * (1 - value));
    return `rgb(${r},80,${b})`;
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-3">Density Heatmap (8x8)</h3>
      <div className="grid grid-cols-8 gap-1 max-w-md">
        {grid.flatMap((row, r) =>
          row.map((v, c) => (
            <div
              key={`${r}-${c}`}
              className="w-10 h-10 rounded text-[10px] flex items-center justify-center text-white"
              style={{ backgroundColor: cellColor(v) }}
              title={`Row ${r + 1}, Col ${c + 1}: ${(v * 100).toFixed(1)}%`}
            >
              {(v * 100).toFixed(0)}
            </div>
          ))
        )}
      </div>
      <p className="text-xs text-slate-500 mt-3">Blue = low density, Red = high defect density.</p>
    </div>
  );
}
