"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, FileImage, X, Microscope } from "lucide-react";

import { api, type AnalyzeResponse } from "@/lib/api";
import { UploadZone } from "@/components/upload-zone";
import {
  PredictionHeader,
  PredictionSummary,
  RcaPanel,
} from "@/components/prediction-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { WaferDisplay } from "@/components/analysis/wafer-display";
import { SaliencyMap } from "@/components/analysis/saliency-map";
import { Topography3D } from "@/components/analysis/topography-3d";
import { CutlineAnalysis } from "@/components/analysis/cutline-analysis";

const TABS = [
  "Overview",
  "Saliency Map",
  "3D Topography",
  "Cutline Analysis",
];

export default function ClassifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  
  const [xLine, setXLine] = useState(32);
  const [yLine, setYLine] = useState(32);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
        if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const runAnalysis = useCallback(async (selectedFile: File, nextX = xLine, nextY = yLine) => {
    setLoading(true);
    try {
      const res = await api.analyze(selectedFile, nextX, nextY);
      setResult(res);
      // Only toast on initial upload, not on cutline drag
      if (!result) {
          toast.success(`${res.prediction.predicted_class} — ${(res.prediction.confidence * 100).toFixed(1)}%`);
      }
    } catch (e) {
      toast.error(String(e));
    } finally {
      setLoading(false);
    }
  }, [xLine, yLine, result]);

  const handleFile = (files: File[]) => {
      const selected = files[0];
      setFile(selected);
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setImageUrl(URL.createObjectURL(selected));
      setResult(null);
      setXLine(32);
      setYLine(32);
      
      runAnalysis(selected, 32, 32);
  };

  const handleCutlineChange = (nextX: number, nextY: number) => {
      setXLine(nextX);
      setYLine(nextY);
      if (file) {
          runAnalysis(file, nextX, nextY);
      }
  };

  const overview = useMemo(() => {
      if (!result) return null;
      const defectPixels = result.analysis.defect_map.flat().reduce((sum, val) => sum + val, 0);
      const totalPixels = result.analysis.defect_map.flat().length || 1;
      const affectedArea = (defectPixels / totalPixels) * 100;
      return {
          predictedClass: result.prediction.predicted_class,
          confidence: result.prediction.confidence,
          defectPixels,
          affectedArea,
      }
  }, [result]);

  return (
    <div className="space-y-6 w-full pb-10">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Detailed Classification Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Provide a wafer map (NumPy array or standard image format) to extract spatial defect representations and model confidence metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-primary" />
                  Input Source
                </CardTitle>
                <CardDescription>
                  Accepted filetypes: .png, .jpg, .npy, .npz
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <UploadZone
                  multiple={false}
                  disabled={loading && !result}
                  onFiles={handleFile}
                />

                {file && (
                  <div className="flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-muted/50">
                    <span className="flex items-center gap-2 truncate min-w-0">
                      <FileImage className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{file.name}</span>
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => {
                        setFile(null);
                        setResult(null);
                        if (imageUrl) URL.revokeObjectURL(imageUrl);
                        setImageUrl("");
                      }}
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                {loading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 py-2 rounded-md border border-transparent">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        Executing Inference...
                    </div>
                )}
              </CardContent>
            </Card>

            {result && (
              <Card>
                <CardHeader className="pb-3">
                  <PredictionHeader data={result.prediction} />
                </CardHeader>
                <CardContent>
                  <PredictionSummary data={result.prediction} compact />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="min-h-[520px] border rounded-xl bg-card shadow-sm overflow-hidden p-1">
             <WaferDisplay 
                imageUrl={imageUrl} 
                xLine={xLine} 
                yLine={yLine} 
                onCutlineChange={handleCutlineChange} 
             />
          </div>

          {result && (
            <Card className="h-fit xl:sticky xl:top-6">
              <CardContent className="pt-6">
                <RcaPanel data={result.prediction} compact separated={false} />
              </CardContent>
            </Card>
          )}
      </div>

      {result && (
        <Tabs defaultValue="Overview" className="w-full pt-4">
            <div className="overflow-x-auto pb-2 border-b">
                <TabsList className="inline-flex w-max min-w-full justify-start h-auto p-1 bg-transparent">
                    {TABS.map((tab) => (
                    <TabsTrigger 
                      key={tab} 
                      value={tab} 
                      className="rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none"
                    >
                        {tab}
                    </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            <div className="mt-4 border rounded-xl bg-card shadow-sm text-card-foreground p-6">
                <TabsContent value="Overview" className="mt-0 outline-none">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Quantitative Results</h3>
                    {overview && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="rounded-lg border bg-background p-4 shadow-sm">
                                <p className="text-xs font-medium text-muted-foreground">Class Assignment</p>
                                <p className="text-xl font-bold tracking-tight mt-1 text-foreground">{overview.predictedClass}</p>
                            </div>
                            <div className="rounded-lg border bg-background p-4 shadow-sm">
                                <p className="text-xs font-medium text-muted-foreground">Model Confidence</p>
                                <p className="text-xl font-bold tracking-tight mt-1 text-foreground">{(overview.confidence * 100).toFixed(2)}%</p>
                            </div>
                            <div className="rounded-lg border bg-background p-4 shadow-sm">
                                <p className="text-xs font-medium text-muted-foreground">Defect Count (px)</p>
                                <p className="text-xl font-mono tracking-tight mt-1 text-foreground">{overview.defectPixels.toLocaleString()}</p>
                            </div>
                            <div className="rounded-lg border bg-background p-4 shadow-sm">
                                <p className="text-xs font-medium text-muted-foreground">Area Ratio</p>
                                <p className="text-xl font-mono tracking-tight mt-1 text-foreground">{overview.affectedArea.toFixed(2)}%</p>
                            </div>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="Saliency Map" className="mt-0 outline-none">
                    <SaliencyMap data={result.analysis.saliency_map} />
                </TabsContent>
                <TabsContent value="3D Topography" className="mt-0 outline-none">
                    <Topography3D data={result.analysis.topography_3d} />
                </TabsContent>
                <TabsContent value="Cutline Analysis" className="mt-0 outline-none">
                    <CutlineAnalysis data={result.analysis.cutline_analysis} />
                </TabsContent>
            </div>
        </Tabs>
      )}
    </div>
  );
}
