import Link from "next/link";
import {
  Activity,
  Gauge,
  Sigma,
  Clock,
  ArrowRight,
  Database
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { api } from "@/lib/api";
import { StatCard } from "@/components/stat-card";
import { HistoryTable } from "@/components/history-table";
import { ClassDistributionChart } from "@/components/charts/class-distribution";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  let overview, recent, distribution;
  try {
    [overview, recent, distribution] = await Promise.all([
      api.overview(),
      api.history({ limit: 5 }),
      api.distribution(),
    ]);
  } catch (e) {
    return <ApiErrorState error={String(e)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">System Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Summary of classification activity, model performance, and dataset distribution.
          </p>
        </div>
        <Button render={<Link href="/classify" />} nativeButton={false}>
          Run Inference <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Classifications"
          value={overview.total_runs.toLocaleString()}
          icon={Sigma}
        />
        <StatCard
          label="Primary Defect"
          value={overview.top_class ?? "—"}
          hint={overview.top_class ? "Most frequent classification" : "Insufficient data"}
          icon={Activity}
        />
        <StatCard
          label="Mean Confidence"
          value={`${(overview.avg_confidence * 100).toFixed(1)}%`}
          icon={Gauge}
        />
        <StatCard
          label="Last Execution"
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Recent Classifications</CardTitle>
            <CardDescription>
              A log of the most recent inference executions by the CNN model.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HistoryTable
              items={recent.items}
              emptyText="No historical data available. Run an inference to populate."
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Class Distribution</CardTitle>
            <CardDescription>
              Aggregate count of defect classes identified by the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClassDistributionChart data={distribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ApiErrorState({ error }: { error: string }) {
  return (
    <Card className="max-w-xl border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
           <Database className="w-5 h-5" />
           Backend Connection Error
        </CardTitle>
        <CardDescription className="mt-2 text-foreground">
          The Next.js frontend is unable to reach the FastAPI backend at{" "}
          <code className="px-1.5 py-0.5 rounded-md bg-muted text-sm font-mono border">
            {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
          </code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-muted p-4 rounded-md text-sm font-mono text-muted-foreground overflow-x-auto border">
          {error}
        </div>
        <p className="text-sm text-foreground mt-4 font-medium">
          Resolution Steps:
        </p>
        <div className="bg-muted p-3 rounded-md overflow-x-auto mt-2 border text-sm font-mono">
          uvicorn api.main:app --reload --port 8000
        </div>
      </CardContent>
    </Card>
  );
}
