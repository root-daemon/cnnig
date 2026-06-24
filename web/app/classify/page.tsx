"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, FileImage, X } from "lucide-react";

import { api, type AnalyzeResponse } from "@/lib/api";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { WaferDisplay } from "@/components/analysis/wafer-display";
import { RegionAnalysis } from "@/components/analysis/region-analysis";
import { DepthAnalysis } from "@/components/analysis/depth-analysis";
import { DensityHeatmap } from "@/components/analysis/density-heatmap";
import { Topography3D } from "@/components/analysis/topography-3d";
import { DefectSpread } from "@/components/analysis/defect-spread";
import { CutlineAnalysis } from "@/components/analysis/cutline-analysis";

const TABS = [
  "Overview",
  "Region Analysis",
  "Depth Analysis",
  "Density Heatmap",
  "3D Topography",
  "Defect Spread",
  "Cut-line Analysis",
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
      
      // Auto-run analysis
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
      return {
          predictedClass: result.prediction.predicted_class,
          confidence: result.prediction.confidence,
          defectPixels: result.analysis.defect_spread.defect_pixel_count,
          affectedArea: result.analysis.defect_spread.affected_area_percentage,
      }
  }, [result]);

  return (
    <div className="space-y-6 w-full pb-10">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Deep Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a wafer map, run CNN inference, and inspect advanced defect analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>
                  Supported formats: PNG, JPG, NPY, NPZ.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <UploadZone
                  multiple={false}
                  disabled={loading && !result} // Allow upload while refreshing analysis
                  onFiles={handleFile}
                />

                {file && (
                  <div className="flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-muted/30">
                    <span className="flex items-center gap-2 truncate min-w-0">
                      <FileImage className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{file.name}</span>
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setFile(null);
                        setResult(null);
                        if (imageUrl) URL.revokeObjectURL(imageUrl);
                        setImageUrl("");
                      }}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {loading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                    </div>
                )}
              </CardContent>
            </Card>

            {result && <PredictionCard data={result.prediction} compact />}
          </div>

          <div className="lg:col-span-2">
             <WaferDisplay 
                imageUrl={imageUrl} 
                xLine={xLine} 
                yLine={yLine} 
                onCutlineChange={handleCutlineChange} 
                depthAnalysis={result?.analysis?.depth_analysis}
             />
          </div>
      </div>

      {result && (
        <Tabs defaultValue="Overview" className="w-full pt-6">
            <div className="overflow-x-auto pb-2">
                <TabsList className="inline-flex w-max min-w-full justify-start h-auto p-1 bg-muted/50 border">
                    {TABS.map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="rounded-sm px-4 py-2">
                        {tab}
                    </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            <div className="mt-4 border rounded-xl bg-card text-card-foreground shadow-sm p-4">
                <TabsContent value="Overview" className="mt-0 outline-none">
                    <h3 className="text-lg font-semibold mb-4">Overview KPIs</h3>
                    {overview && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm font-medium text-muted-foreground">Predicted Class</p>
                                <p className="text-2xl font-bold tracking-tight mt-1">{overview.predictedClass}</p>
                            </div>
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                                <p className="text-2xl font-bold tracking-tight mt-1">{(overview.confidence * 100).toFixed(2)}%</p>
                            </div>
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm font-medium text-muted-foreground">Total Defects</p>
                                <p className="text-2xl font-bold tracking-tight mt-1">{overview.defectPixels.toLocaleString()}</p>
                            </div>
                            <div className="rounded-lg border bg-muted/30 p-4">
                                <p className="text-sm font-medium text-muted-foreground">Affected Area</p>
                                <p className="text-2xl font-bold tracking-tight mt-1">{overview.affectedArea.toFixed(2)}%</p>
                            </div>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="Region Analysis" className="mt-0 outline-none">
                    <RegionAnalysis data={result.analysis.region_analysis} />
                </TabsContent>
                <TabsContent value="Depth Analysis" className="mt-0 outline-none">
                    <DepthAnalysis data={result.analysis.depth_analysis} />
                </TabsContent>
                <TabsContent value="Density Heatmap" className="mt-0 outline-none">
                    <DensityHeatmap data={result.analysis.density_analysis} />
                </TabsContent>
                <TabsContent value="3D Topography" className="mt-0 outline-none">
                    <Topography3D data={result.analysis.topography_3d} />
                </TabsContent>
                <TabsContent value="Defect Spread" className="mt-0 outline-none">
                    <DefectSpread spread={result.analysis.defect_spread} defectMap={result.analysis.defect_map} />
                </TabsContent>
                <TabsContent value="Cut-line Analysis" className="mt-0 outline-none">
                    <CutlineAnalysis data={result.analysis.cutline_analysis} />
                </TabsContent>
            </div>
        </Tabs>
      )}
    </div>
  );
}
