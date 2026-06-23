import { useEffect, useRef, useState } from 'react';

export default function WaferDisplay({ imageUrl, xLine, yLine, onCutlineChange }) {
  const containerRef = useRef(null);
  const [dragTarget, setDragTarget] = useState(null);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  useEffect(() => {
    const move = (e) => {
      if (!dragTarget || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const px = clamp(e.clientX - rect.left, 0, rect.width);
      const py = clamp(e.clientY - rect.top, 0, rect.height);
      const nextX = Math.round((px / rect.width) * 64);
      const nextY = Math.round((py / rect.height) * 64);
      if (dragTarget === 'x') onCutlineChange(clamp(nextX, 1, 63), yLine);
      if (dragTarget === 'y') onCutlineChange(xLine, clamp(nextY, 1, 63));
    };
    const up = () => setDragTarget(null);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, [dragTarget, onCutlineChange, xLine, yLine]);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">Wafer Display</h3>
      <div ref={containerRef} className="relative w-full max-w-md aspect-square bg-slate-100 rounded-lg overflow-hidden border mx-auto">
        {imageUrl ? (
          <img src={imageUrl} alt="Wafer map" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">No image uploaded</div>
        )}

        <div
          className="absolute top-0 bottom-0 w-1 bg-emerald-500 cursor-ew-resize"
          style={{ left: `${(xLine / 64) * 100}%` }}
          onMouseDown={() => setDragTarget('x')}
        />
        <div
          className="absolute left-0 right-0 h-1 bg-amber-500 cursor-ns-resize"
          style={{ top: `${(yLine / 64) * 100}%` }}
          onMouseDown={() => setDragTarget('y')}
        />
      </div>
      <p className="text-xs text-slate-500 mt-2 text-center">
        Drag green (vertical) and amber (horizontal) cut-lines to update section analysis.
      </p>
    </div>
  );
}
