import { Activity, Gauge, Sigma, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { api } from "@/lib/api";
import { StatCard } from "@/components/stat-card";
import { ClassDistributionChart } from "@/components/charts/class-distribution";
import { ConfidenceHistogramChart } from "@/components/charts/confidence-histogram";
import { RunsTimeseriesChart } from "@/components/charts/runs-timeseries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  let overview, distribution, confidence, timeseries;
  try {
    [overview, distribution, confidence, timeseries] = await Promise.all([
      api.overview(),
      api.distribution(),
      api.confidenceHistogram(),
      api.timeseries(30),
    ]);
  } catch (e) {
    return (
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>API unreachable</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
            {String(e)}
          </pre>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Aggregate statistics over your inference runs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total runs"
          value={overview.total_runs.toLocaleString()}
          icon={Sigma}
        />
        <StatCard
          label="Top class"
          value={overview.top_class ?? "—"}
          icon={Activity}
        />
        <StatCard
          label="Avg confidence"
          value={`${(overview.avg_confidence * 100).toFixed(1)}%`}
          icon={Gauge}
        />
        <StatCard
          label="Last run"
          value={
            overview.last_run_at
              ? formatDistanceToNow(new Date(overview.last_run_at), {
                  addSuffix: true,
                })
              : "—"
          }
          icon={Clock}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class distribution</CardTitle>
            <CardDescription>Predicted class counts.</CardDescription>
          </CardHeader>
          <CardContent>
            <ClassDistributionChart data={distribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confidence distribution</CardTitle>
            <CardDescription>
              Top-class probability, binned in 10% intervals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConfidenceHistogramChart data={confidence} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Runs over time</CardTitle>
            <CardDescription>Daily count, last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <RunsTimeseriesChart data={timeseries} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
