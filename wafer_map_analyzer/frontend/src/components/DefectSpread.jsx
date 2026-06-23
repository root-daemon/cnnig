export default function DefectSpread({ spread, defectMap }) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Defect Spread</h3>
      {spread ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <Kpi title="Defect Pixels" value={spread.defect_pixel_count} />
            <Kpi title="Total Pixels" value={spread.total_pixel_count} />
            <Kpi title="Affected Area" value={`${spread.affected_area_percentage.toFixed(2)}%`} />
          </div>
          <div
            className="grid gap-px bg-slate-300 w-full max-w-md"
            style={{ gridTemplateColumns: 'repeat(64, minmax(0, 1fr))' }}
          >
            {(defectMap || []).flatMap((row, r) =>
              row.map((v, c) => (
                <div
                  key={`${r}-${c}`}
                  className="aspect-square"
                  style={{ backgroundColor: v ? '#ef4444' : '#e2e8f0' }}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500">No defect spread data available.</p>
      )}
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-lg font-semibold text-slate-800">{value}</p>
    </div>
  );
}
