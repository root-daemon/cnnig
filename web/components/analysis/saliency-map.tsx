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
      // JET colormap approximation
      const r = Math.round(Math.max(0, Math.min(1, 1.5 - Math.abs(4 * val - 3))) * 255);
      const g = Math.round(Math.max(0, Math.min(1, 1.5 - Math.abs(4 * val - 2))) * 255);
      const b = Math.round(Math.max(0, Math.min(1, 1.5 - Math.abs(4 * val - 1))) * 255);
      return [r, g, b];
    };

    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.createImageData(width, height);

    for (let y = 0; y < height; y++) {
      const dataY = Math.floor((y / height) * rows);
      for (let x = 0; x < width; x++) {
        const dataX = Math.floor((x / width) * cols);
        const val = data[dataY]?.[dataX] || 0;
        const [r, g, b] = getColor(val);

        const pixelIdx = (y * width + x) * 4;
        imgData.data[pixelIdx] = r;
        imgData.data[pixelIdx + 1] = g;
        imgData.data[pixelIdx + 2] = b;
        imgData.data[pixelIdx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
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
      <CardContent className="flex flex-col items-center justify-center space-y-4">
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
      </CardContent>
    </Card>
  );
}
