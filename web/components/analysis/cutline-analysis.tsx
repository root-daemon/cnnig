"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CutlineAnalysis as CutlineAnalysisType } from "@/lib/api";
import { StatCard } from "@/components/stat-card";

interface CutlineAnalysisProps {
  data?: CutlineAnalysisType;
}

export function CutlineAnalysis({ data }: CutlineAnalysisProps) {
  if (!data || !data.quadrants) {
      return (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No cut-line analysis available.
          </CardContent>
        </Card>
      );
  }

  const q = data.quadrants;

  const cards = [
    { key: "top_left", label: "Top Left" },
    { key: "top_right", label: "Top Right" },
    { key: "bottom_left", label: "Bottom Left" },
    { key: "bottom_right", label: "Bottom Right" },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cut-line Analysis</CardTitle>
        <CardDescription>
          Current cut position: X={data.x_line}, Y={data.y_line}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map(({ key, label }) => (
            <div key={key} className="rounded-lg border bg-muted/50 p-4">
              <p className="font-medium mb-2">{label}</p>
              <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                      <span>Defect Count:</span>
                      <span className="font-mono text-foreground">{q[key].defect_count}</span>
                  </div>
                  <div className="flex justify-between">
                      <span>Defect %:</span>
                      <span className="font-mono text-foreground">{q[key].defect_percentage.toFixed(2)}%</span>
                  </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border border-emerald-200/50 bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
          <span>Recommended low-defect section:</span>
          <span className="font-bold text-base uppercase tracking-wider">{data.recommended_low_defect_quadrant.replace('_', ' ')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
