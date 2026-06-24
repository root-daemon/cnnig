"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ConfidenceBin } from "@/lib/api";

export function ConfidenceHistogramChart({ data }: { data: ConfidenceBin[] }) {
  const formatted = data.map((b) => ({
    label: `${(b.lower * 100).toFixed(0)}–${(b.upper * 100).toFixed(0)}%`,
    count: b.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={formatted}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="label"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          fontSize={11}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--popover)",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
          }}
        />
        <Bar
          dataKey="count"
          radius={[4, 4, 0, 0]}
          fill="currentColor"
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
