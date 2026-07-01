"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SaliencyMapProps {
  data?: number[][];
}

export function SaliencyMap({ data }: SaliencyMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rows = data.length;
    const cols = data[0]?.length || 0;
    if (rows === 0 || cols === 0) return;

    const getColor = (v: number) => {
      const val = Math.max(0, Math.min(1, v));
      // Smooth, accurate JET colormap interpolation
      // 0.0:  [0, 0, 128]    (Dark Blue)
      // 0.15: [0, 0, 255]    (Blue)
      // 0.4:  [0, 255, 255]  (Cyan)
      // 0.6:  [0, 255, 0]    (Green)
      // 0.8:  [255, 255, 0]  (Yellow)
      // 1.0:  [255, 0, 0]    (Bright Red)
      let r = 0, g = 0, b = 0;
      if (val < 0.15) {
        const t = val / 0.15;
        b = 128 + Math.round(t * 127);
      } else if (val < 0.4) {
        const t = (val - 0.15) / 0.25;
        g = Math.round(t * 255);
        b = 255;
      } else if (val < 0.6) {
        const t = (val - 0.4) / 0.2;
        g = 255;
        b = Math.round((1 - t) * 255);
      } else if (val < 0.8) {
        const t = (val - 0.6) / 0.2;
        r = Math.round(t * 255);
        g = 255;
      } else {
        const t = (val - 0.8) / 0.2;
        r = 255;
        g = Math.round((1 - t) * 255);
      }
      return [r, g, b];
    };

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.createImageData(width, height);

    const cy = (rows - 1) / 2;
    const cx = (cols - 1) / 2;
    // We assume the wafer has a circular boundary with a radius of ~30.5 pixels on a 64x64 grid
    const maxWaferRadius = 30.5;

    for (let y = 0; y < height; y++) {
      const dataY = Math.floor((y / height) * rows);
      for (let x = 0; x < width; x++) {
        const dataX = Math.floor((x / width) * cols);
        
        // Calculate distance from center to identify pixels outside the wafer
        const dx = dataX - cx;
        const dy = dataY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const pixelIdx = (y * width + x) * 4;

        if (dist > maxWaferRadius) {
          // Dark slate background for area outside the wafer (Slate 950: #020617)
          imgData.data[pixelIdx] = 2;
          imgData.data[pixelIdx + 1] = 6;
          imgData.data[pixelIdx + 2] = 23;
          imgData.data[pixelIdx + 3] = 255;
        } else {
          const val = data[dataY]?.[dataX] || 0;
          // Apply power-law / square root scaling (gamma adjustment) to boost low/medium gradients
          // and expose hidden details from the raw peaked saliency map.
          const adjustedVal = Math.sqrt(val);
          const [r, g, b] = getColor(adjustedVal);

          imgData.data[pixelIdx] = r;
          imgData.data[pixelIdx + 1] = g;
          imgData.data[pixelIdx + 2] = b;
          imgData.data[pixelIdx + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Draw a subtle wafer boundary circle to provide perfect spatial context
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, (maxWaferRadius / cols) * width, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [data]);

  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          No saliency map data available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saliency Map (64x64)</CardTitle>
        <CardDescription>
          Highlights the regions of the wafer map that the CNN model focused on most when predicting the defect class. Red indicates the highest importance, and blue indicates the lowest importance.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative border border-muted rounded-lg overflow-hidden bg-slate-950 p-2 shadow-inner">
            <canvas
              ref={canvasRef}
              width={256}
              height={256}
              className="w-64 h-64 [image-rendering:pixelated]"
            />
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#00007f] rounded-sm" />
              <span>Low Importance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#00ff00] rounded-sm" />
              <span>Medium Importance</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#7f0000] rounded-sm" />
              <span>High Importance</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
