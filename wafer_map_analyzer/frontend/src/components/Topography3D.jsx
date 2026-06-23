import Plot from 'react-plotly.js';

export default function Topography3D({ topography }) {
  const z = topography?.height_map || [[]];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">3D Topography</h3>
      <div className="w-full overflow-x-auto">
        <Plot
          data={[{ z, type: 'surface', colorscale: 'Jet' }]}
          layout={{
            width: 700,
            height: 450,
            autosize: false,
            margin: { l: 0, r: 0, b: 0, t: 30 },
            scene: {
              xaxis: { title: 'X' },
              yaxis: { title: 'Y' },
              zaxis: { title: 'Height' },
            },
            title: 'Defect Density Topography',
          }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
}
