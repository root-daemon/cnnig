import Link from "next/link";
import {
  Activity,
  Gauge,
  Sigma,
  Clock,
  ArrowRight,
  TerminalSquare
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
    <div className="space-y-8 max-w-6xl relative z-10">
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-border/50 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <TerminalSquare className="w-4 h-4" />
            <span className="text-xs font-mono tracking-widest uppercase opacity-80">Dashboard</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight uppercase">System Overview</h2>
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            // Inference activity and model health telemetry.
          </p>
        </div>
        <Button render={<Link href="/classify" />} nativeButton={false} className="uppercase tracking-widest font-semibold rounded-none">
          Classify Wafer <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Scans"
          value={overview.total_runs.toLocaleString()}
          icon={Sigma}
        />
        <StatCard
          label="Dominant Anomaly"
          value={overview.top_class ?? "—"}
          hint={overview.top_class ? "Highest frequency defect" : "No runs yet"}
          icon={Activity}
        />
        <StatCard
          label="Avg Confidence"
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
        <Card className="lg:col-span-2 border-t-4 border-t-secondary relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 translate-x-8 -translate-y-8 rotate-45 transform pointer-events-none group-hover:bg-primary/5 transition-colors"></div>
          <CardHeader>
            <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary inline-block"></span>
              Recent Inferences
            </CardTitle>
            <CardDescription className="font-mono text-xs opacity-70">
              Latest 5 classification jobs in queue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HistoryTable
              items={recent.items}
              emptyText="Run your first classification to see history."
            />
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-secondary relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-secondary/10 translate-x-8 -translate-y-8 rotate-45 transform pointer-events-none group-hover:bg-primary/5 transition-colors"></div>
          <CardHeader>
            <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary inline-block"></span>
              Class Distribution
            </CardTitle>
            <CardDescription className="font-mono text-xs opacity-70">
              Aggregated defect categories.
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
    <Card className="max-w-xl border-t-4 border-t-destructive">
      <CardHeader>
        <CardTitle className="uppercase text-destructive tracking-widest text-sm flex items-center gap-2">
           <span className="w-1.5 h-1.5 bg-destructive inline-block animate-pulse"></span>
           System Offline
        </CardTitle>
        <CardDescription className="font-mono text-xs mt-2 text-destructive/80">
          Could not establish connection to inference engine on{" "}
          <code className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
            {process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}
          </code>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-black/50 text-destructive/70 p-4 rounded-none overflow-x-auto border border-destructive/20 font-mono">
          {error}
        </pre>
        <p className="text-xs text-muted-foreground mt-6 font-mono uppercase tracking-widest">
          // Diagnostic Fix
        </p>
        <pre className="text-xs bg-muted/30 text-primary p-3 rounded-none overflow-x-auto mt-2 border border-border font-mono">
          uvicorn api.main:app --reload --port 8000
        </pre>
      </CardContent>
    </Card>
  );
}
