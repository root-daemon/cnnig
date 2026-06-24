"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DepthBand } from "@/lib/api";

interface DepthAnalysisProps {
  data?: DepthBand[];
}

export function DepthAnalysis({ data }: DepthAnalysisProps) {
  if (!data || data.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No depth data available.
          </CardContent>
        </Card>
      );
  }

  const chartData = data.map((item) => ({
    band: `B${item.band}`,
    density: Number((item.defect_density * 100).toFixed(2)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Depth Analysis (Radial Profile)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--muted)" />
              <XAxis dataKey="band" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis unit="%" tickLine={false} axisLine={false} tickMargin={10} />
              <Tooltip 
                formatter={(v: any) => [`${v}%`, 'Density']} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="density" 
                stroke="var(--primary)" 
                strokeWidth={2} 
                dot={{ r: 4, fill: "var(--background)", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
               />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
