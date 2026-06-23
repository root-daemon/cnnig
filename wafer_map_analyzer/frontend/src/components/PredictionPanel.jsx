import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function PredictionPanel({ prediction }) {
  const data = prediction
    ? Object.entries(prediction.confidence_scores).map(([name, val]) => ({
        className: name,
        confidence: Number((val * 100).toFixed(2)),
      }))
    : [];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Prediction Panel</h3>
      {prediction ? (
        <>
          <p className="text-sm text-slate-700">
            Predicted Class:{' '}
            <span className="font-semibold text-indigo-700">{prediction.predicted_class}</span>
          </p>
          <p className="text-sm text-slate-700 mb-3">
            Confidence: <span className="font-semibold">{(prediction.confidence * 100).toFixed(2)}%</span>
          </p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis type="category" dataKey="className" width={90} />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar dataKey="confidence" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-slate-500 text-sm">Upload an image to view prediction results.</p>
      )}
    </div>
  );
}
