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
        <CartesianGrid strokeDasharray="2 2" className="stroke-border/40" />
        <XAxis
          dataKey="class_name"
          fontSize={10}
          fontFamily="var(--font-mono)"
          tickLine={false}
          axisLine={false}
          tick={{ fill: "currentColor", opacity: 0.7 }}
        />
        <YAxis 
          fontSize={10} 
          fontFamily="var(--font-mono)"
          tickLine={false} 
          axisLine={false} 
          allowDecimals={false} 
          tick={{ fill: "currentColor", opacity: 0.7 }}
        />
        <Tooltip
          cursor={{ fill: "var(--color-secondary)", opacity: 0.3 }}
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-primary)",
            borderRadius: "0",
            fontSize: "0.75rem",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            boxShadow: "0 0 10px rgba(0, 229, 255, 0.1)"
          }}
          itemStyle={{ color: "var(--color-primary)" }}
        />
        <Bar 
          dataKey="count" 
          radius={[0, 0, 0, 0]} 
          fill="var(--color-primary)" 
          className="hover:opacity-80 transition-opacity" 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
