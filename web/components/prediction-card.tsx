import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PredictionResponse } from "@/lib/api";

type Props = {
  data: PredictionResponse;
  compact?: boolean;
};

export function PredictionCard({ data, compact }: Props) {
  const sorted = Object.entries(data.probabilities).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <Card>
      <CardHeader className="pb-3">
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
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
