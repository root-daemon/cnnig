"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, X, Eye } from "lucide-react";

import { api, type BatchItemResponse } from "@/lib/api";
import { UploadZone } from "@/components/upload-zone";
import { PredictionCard } from "@/components/prediction-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function BatchPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BatchItemResponse[]>([]);
  const [detail, setDetail] = useState<BatchItemResponse | null>(null);

  async function run() {
    if (!files.length) return;
    setLoading(true);
    setProgress(0);
    setResults([]);

    const collected: BatchItemResponse[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const res = await api.predictBatch([files[i]]);
        collected.push(...res);
        setResults([...collected]);
        setProgress(((i + 1) / files.length) * 100);
      }
      const failures = collected.filter((r) => r.error).length;
      if (failures) {
        toast.error(`${failures} file(s) failed`);
      } else {
        toast.success(`Classified ${collected.length} file(s)`);
      }
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Batch</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Classify many wafer maps at once.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>
            Drop multiple files. Each is processed sequentially.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadZone
            multiple
            disabled={loading}
            onFiles={(picked) => {
              setFiles(picked);
              setResults([]);
              setProgress(0);
            }}
          />

          {files.length > 0 && (
            <div className="border rounded-md p-3 bg-muted/30 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {files.length} file(s) selected
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFiles([]);
                    setResults([]);
                    setProgress(0);
                  }}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              </div>
              <ul className="text-xs text-muted-foreground space-y-0.5 max-h-32 overflow-y-auto">
                {files.map((f, i) => (
                  <li key={i} className="truncate">
                    {f.name}{" "}
                    <span className="tabular-nums">
                      ({(f.size / 1024).toFixed(1)} KB)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {loading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-center tabular-nums">
                {results.length} / {files.length}
              </p>
            </div>
          )}

          <Button onClick={run} disabled={!files.length || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Running…" : `Classify ${files.length || ""} file(s)`}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              {results.filter((r) => !r.error).length} succeeded,{" "}
              {results.filter((r) => r.error).length} failed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Prediction</TableHead>
                    <TableHead className="text-right">Confidence</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium max-w-[280px] truncate">
                        {r.filename}
                      </TableCell>
                      <TableCell>
                        {r.error ? (
                          <Badge variant="destructive">error</Badge>
                        ) : (
                          <Badge variant="secondary">
                            {r.predicted_class}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.confidence != null
                          ? `${(r.confidence * 100).toFixed(1)}%`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={!!r.error}
                          onClick={() => setDetail(r)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{detail?.filename}</DialogTitle>
          </DialogHeader>
          {detail && !detail.error && detail.id != null && (
            <PredictionCard
              compact
              data={{
                id: detail.id,
                filename: detail.filename,
                predicted_class: detail.predicted_class!,
                confidence: detail.confidence!,
                probabilities: detail.probabilities!,
                preview_b64: detail.preview_b64!,
                created_at: detail.created_at!,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
