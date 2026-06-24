"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DefectSpread as DefectSpreadType } from "@/lib/api";
import { StatCard } from "@/components/stat-card";

interface DefectSpreadProps {
  spread?: DefectSpreadType;
  defectMap?: number[][];
}

export function DefectSpread({ spread, defectMap }: DefectSpreadProps) {
  if (!spread) {
      return (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No defect spread data available.
          </CardContent>
        </Card>
      );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Defect Pixels" value={spread.defect_pixel_count.toString()} />
        <StatCard label="Total Pixels" value={spread.total_pixel_count.toString()} />
        <StatCard label="Affected Area" value={`${spread.affected_area_percentage.toFixed(2)}%`} />
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Binary Defect Map</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div
                className="grid gap-[1px] bg-muted w-full max-w-[400px] border"
                style={{ gridTemplateColumns: "repeat(64, minmax(0, 1fr))" }}
            >
                {(defectMap || []).flatMap((row, r) =>
                row.map((v, c) => (
                    <div
                    key={`${r}-${c}`}
                    className="aspect-square"
                    style={{ backgroundColor: v ? "var(--destructive)" : "var(--background)" }}
                    />
                ))
                )}
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
