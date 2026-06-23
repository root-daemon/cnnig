"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DensityAnalysis as DensityAnalysisType } from "@/lib/api";

interface DensityHeatmapProps {
  data?: DensityAnalysisType;
}

export function DensityHeatmap({ data }: DensityHeatmapProps) {
  if (!data) {
      return (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No density data available.
          </CardContent>
        </Card>
      );
  }

  const grid = data.density_grid || [];

  const cellColor = (v: number) => {
    const value = Math.max(0, Math.min(1, v));
    const r = Math.round(255 * value);
    const b = Math.round(255 * (1 - value));
    return `rgb(${r}, 80, ${b})`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Density Heatmap (8x8)</CardTitle>
        <CardDescription>Blue = low density, Red = high defect density.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
            <div className="grid grid-cols-8 gap-1 w-full max-w-[400px]">
              {grid.flatMap((row, r) =>
                row.map((v, c) => (
                  <div
                    key={`${r}-${c}`}
                    className="aspect-square rounded text-[10px] sm:text-xs flex items-center justify-center text-white transition-transform hover:scale-105"
                    style={{ backgroundColor: cellColor(v) }}
                    title={`Row ${r + 1}, Col ${c + 1}: ${(v * 100).toFixed(1)}%`}
                  >
                    {(v * 100).toFixed(0)}
                  </div>
                ))
              )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
