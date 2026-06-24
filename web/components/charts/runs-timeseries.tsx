"use client";

import { format, parseISO } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DayCount } from "@/lib/api";

export function RunsTimeseriesChart({ data }: { data: DayCount[] }) {
  const formatted = data.map((d) => ({
    ...d,
    short: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={formatted}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="short"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
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
        <Line
          type="monotone"
          dataKey="count"
          stroke="currentColor"
          strokeWidth={2}
          dot={false}
          className="text-primary"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
