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

import type { ClassCount } from "@/lib/api";

export function ClassDistributionChart({ data }: { data: ClassCount[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
        <XAxis
          dataKey="class_name"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "var(--color-muted-foreground)" }}
          dy={10}
        />
        <YAxis 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          allowDecimals={false} 
          tick={{ fill: "var(--color-muted-foreground)" }}
        />
        <Tooltip
          cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
          }}
          itemStyle={{ color: "var(--color-foreground)", fontWeight: 500 }}
          labelStyle={{ color: "var(--color-muted-foreground)", marginBottom: "4px" }}
        />
        <Bar 
          dataKey="count" 
          radius={[4, 4, 0, 0]} 
          fill="var(--color-primary)" 
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
