import { useRef, useState } from 'react';

export default function ImageUpload({ onFileSelect, loading }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    onFileSelect(file);
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Image Upload</h3>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          dragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-slate-50'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-slate-700 font-medium">Drag & Drop wafer map image here</p>
        <p className="text-sm text-slate-500 mt-1">or click to select from disk</p>
        {loading && <p className="text-indigo-600 mt-3 text-sm">Processing...</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
