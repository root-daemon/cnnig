"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#6366f1", "#14b8a6", "#f59e0b"];

interface RegionAnalysisProps {
  data?: Record<string, number>;
}

export function RegionAnalysis({ data }: RegionAnalysisProps) {
  if (!data) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          No region data available.
        </CardContent>
      </Card>
    );
  }

  const chartData = Object.entries(data).map(([name, v]) => ({
    name,
    value: Number((v * 100).toFixed(2)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Region Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label={(x) => `${x.name}: ${x.value}%`}
              >
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
