"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, FileImage, X } from "lucide-react";

import { api, type PredictionResponse } from "@/lib/api";
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

export default function ClassifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);

  async function run() {
    if (!file) return;
    setLoading(true);
    try {
      const res = await api.predict(file);
      setResult(res);
      toast.success(`${res.predicted_class} — ${(res.confidence * 100).toFixed(1)}%`);
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Classify</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a single wafer map for inference.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>
            Image is grayscaled, resized to 64×64, and min-max normalized.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <UploadZone
            multiple={false}
            disabled={loading}
            onFiles={(files) => {
              setFile(files[0]);
              setResult(null);
            }}
          />

          {file && (
            <div className="flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-muted/30">
              <span className="flex items-center gap-2 truncate min-w-0">
                <FileImage className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{file.name}</span>
                <span className="text-muted-foreground shrink-0 tabular-nums">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setFile(null);
                  setResult(null);
                }}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <Button
            onClick={run}
            disabled={!file || loading}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Classifying…" : "Classify"}
          </Button>
        </CardContent>
      </Card>

      {result && <PredictionCard data={result} />}
    </div>
  );
}
