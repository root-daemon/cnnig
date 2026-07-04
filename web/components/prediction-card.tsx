import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PredictionResponse } from "@/lib/api";

type Props = {
  data: PredictionResponse;
  compact?: boolean;
  separated?: boolean;
};

export function PredictionCard({ data, compact }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <PredictionHeader data={data} />
      </CardHeader>
      <CardContent
        className={cn(
          "grid gap-6",
          compact ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2",
        )}
      >
        <PredictionSummary data={data} compact={compact} />
        <RcaPanel data={data} compact={compact} />
      </CardContent>
    </Card>
  );
}

export function PredictionHeader({ data }: { data: PredictionResponse }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <CardTitle className="truncate">{data.filename}</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(data.created_at).toLocaleString()}
        </p>
      </div>
      <Badge className="text-sm" variant="default">
        {data.predicted_class} · {(data.confidence * 100).toFixed(1)}%
      </Badge>
    </div>
  );
}

export function PredictionSummary({ data, compact }: Props) {
  const sorted = Object.entries(data.probabilities).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div className="space-y-6">
      <div
        className={cn(
          "grid gap-6",
          compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-[auto_1fr]",
        )}
      >
        <div className="flex justify-center md:justify-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${data.preview_b64}`}
            alt={`Wafer map preview for ${data.filename}`}
            className="rounded-md border bg-black/5"
            width={224}
            height={224}
          />
        </div>
        <div className="space-y-2">
          {sorted.map(([name, prob], i) => {
            const isTop = i === 0;
            return (
              <div key={name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span
                    className={cn(
                      isTop ? "font-semibold" : "text-muted-foreground",
                    )}
                  >
                    {name}
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {(prob * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      isTop ? "bg-primary" : "bg-muted-foreground/40",
                    )}
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function RcaPanel({ data, compact, separated = true }: Props) {
  return (
    <div
      className={cn(
        "space-y-4",
        separated &&
          (compact
            ? "border-t pt-5"
            : "border-t xl:border-l xl:border-t-0 pt-5 xl:pt-0 xl:pl-6"),
      )}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-semibold">Root Cause Analysis</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {data.rca.description}
          </p>
        </div>
        <Badge variant="outline">{data.rca.evidence_strength} evidence</Badge>
      </div>

      <div
        className={cn(
          "grid gap-4",
          compact ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3",
        )}
      >
        <RcaList title="Likely Modules" items={data.rca.likely_modules} />
        <RcaList title="Investigations" items={data.rca.investigations} />
        <RcaList title="Corrective Actions" items={data.rca.corrective} />
      </div>

      {data.rca.evidence.length > 0 && (
        <div className="rounded-md border overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] gap-3 bg-muted/40 px-3 py-2 text-xs font-medium uppercase text-muted-foreground">
            <span>Evidence Traceability</span>
            <span>Strength</span>
          </div>
          <div className="divide-y">
            {data.rca.evidence.map((item) => (
              <div
                key={`${item.process_module}-${item.mechanism}-${item.reference_key}`}
                className="grid grid-cols-1 gap-2 px-3 py-3 text-sm md:grid-cols-[minmax(140px,0.8fr)_minmax(0,1.6fr)_auto]"
              >
                <div className="font-medium">{item.process_module}</div>
                <div className="min-w-0">
                  <div className="font-medium">{item.mechanism}</div>
                  <p className="text-muted-foreground mt-1">{item.basis}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary">{item.provenance}</Badge>
                    <Badge variant="outline">[{item.reference_key}]</Badge>
                  </div>
                </div>
                <Badge variant="outline" className="w-fit">
                  {item.strength}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.rca.references.length > 0 && (
        <details className="rounded-md border px-3 py-2">
          <summary className="cursor-pointer text-sm font-medium">
            References
          </summary>
          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            {data.rca.references.map((ref) => (
              <li key={ref.key}>
                <span className="font-medium text-foreground">
                  [{ref.key}] {ref.type}
                </span>{" "}
                {ref.cite}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function RcaList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <h4 className="text-xs font-medium uppercase text-muted-foreground">
        {title}
      </h4>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1.5 text-sm">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">No RCA items.</p>
      )}
    </div>
  );
}
