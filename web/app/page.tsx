import Link from "next/link";
import {
  Activity,
  Gauge,
  Sigma,
  Clock,
  ArrowRight,
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
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Inference activity and model health.
          </p>
        </div>
        <Button render={<Link href="/classify" />} nativeButton={false}>
          Classify wafer <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
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
          hint={overview.top_class ? "Most-predicted defect" : "No runs yet"}
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent runs</CardTitle>
            <CardDescription>Latest 5 inferences.</CardDescription>
          </CardHeader>
          <CardContent>
            <HistoryTable
              items={recent.items}
              emptyText="Run your first classification to see history."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class distribution</CardTitle>
            <CardDescription>Counts per defect class.</CardDescription>
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
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>API unreachable</CardTitle>
        <CardDescription>
          Could not reach the FastAPI backend. Make sure it is running on{" "}
          <code className="px-1 py-0.5 rounded bg-muted">
            {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
          </code>
          .
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
          {error}
        </pre>
        <p className="text-sm text-muted-foreground mt-4">
          Start the backend with:
        </p>
        <pre className="text-xs bg-muted p-3 rounded overflow-x-auto mt-1">
          uvicorn api.main:app --reload --port 8000
        </pre>
      </CardContent>
    </Card>
  );
}
