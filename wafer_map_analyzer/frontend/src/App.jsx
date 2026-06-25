import { useMemo, useState } from 'react';
import axios from 'axios';

import ImageUpload from './components/ImageUpload';
import WaferDisplay from './components/WaferDisplay';
import PredictionPanel from './components/PredictionPanel';
import RegionAnalysis from './components/RegionAnalysis';
import SaliencyMap from './components/SaliencyMap';
import Topography3D from './components/Topography3D';
import CutlineAnalysis from './components/CutlineAnalysis';

const TABS = ['Overview', 'Region Analysis', 'Saliency Map', '3D Topography', 'Cut-line Analysis'];

export default function App() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [xLine, setXLine] = useState(32);
  const [yLine, setYLine] = useState(32);

  const overview = useMemo(() => {
    if (!prediction || !analysis) return null;
    const defectPixels = (analysis.defect_map || []).flat().reduce((sum, val) => sum + val, 0);
    const totalPixels = (analysis.defect_map || []).flat().length || 1;
    const affectedArea = (defectPixels / totalPixels) * 100;
    return {
      predictedClass: prediction.predicted_class,
      confidence: prediction.confidence,
      defectPixels,
      affectedArea,
    };
  }, [prediction, analysis]);

  const analyzeFile = async (selectedFile, nextX = xLine, nextY = yLine) => {
    const data = new FormData();
    data.append('image', selectedFile);
    data.append('x_line', String(nextX));
    data.append('y_line', String(nextY));

    const response = await axios.post('/api/analyze', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setPrediction(response.data.prediction);
    setAnalysis(response.data.analysis);
  };

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    setImageUrl(URL.createObjectURL(selectedFile));
    setError('');
    setLoading(true);
    try {
      await analyzeFile(selectedFile, xLine, yLine);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Analysis failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCutlineChange = async (nextX, nextY) => {
    setXLine(nextX);
    setYLine(nextY);
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      await analyzeFile(file, nextX, nextY);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Cut-line update failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
        <header className="card">
          <h1 className="text-2xl font-bold text-slate-800">Wafer Map Defect Analysis</h1>
          <p className="text-slate-600 text-sm mt-1">
            Upload wafer maps, run CNN inference, and inspect advanced defect analytics.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="space-y-4 xl:col-span-1">
            <ImageUpload onFileSelect={handleFileSelect} loading={loading} />
            <PredictionPanel prediction={prediction} />
          </div>
          <div className="space-y-4 xl:col-span-2">
            <WaferDisplay imageUrl={imageUrl} xLine={xLine} yLine={yLine} onCutlineChange={handleCutlineChange} />
            {error && <div className="card text-sm text-red-600">{error}</div>}
          </div>
        </div>

        <div className="card">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-btn whitespace-nowrap ${activeTab === tab ? 'tab-btn-active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'Overview' && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-3">Overview</h3>
            {overview ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Stat title="Predicted Class" value={overview.predictedClass} />
                <Stat title="Model Confidence" value={`${(overview.confidence * 100).toFixed(2)}%`} />
                <Stat title="Total Defects" value={overview.defectPixels} />
                <Stat title="Affected Area" value={`${overview.affectedArea.toFixed(2)}%`} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">Upload a wafer map to view KPIs.</p>
            )}
          </div>
        )}

        {activeTab === 'Region Analysis' && <RegionAnalysis data={analysis?.region_analysis} />}
        {activeTab === 'Saliency Map' && <SaliencyMap data={analysis?.saliency_map} />}
        {activeTab === '3D Topography' && <Topography3D topography={analysis?.topography_3d} />}
        {activeTab === 'Cut-line Analysis' && <CutlineAnalysis cutlineData={analysis?.cutline_analysis} />}
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-lg font-semibold text-slate-800">{value}</p>
    </div>
  );
}
