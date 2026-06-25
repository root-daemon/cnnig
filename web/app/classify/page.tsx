"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { Loader2, FileImage, X, ScanSearch } from "lucide-react";

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
import { SaliencyMap } from "@/components/analysis/saliency-map";
import { Topography3D } from "@/components/analysis/topography-3d";
import { CutlineAnalysis } from "@/components/analysis/cutline-analysis";

const TABS = [
  "OVERVIEW",
  "REGION_ANALYSIS",
  "SALIENCY_MAP",
  "TOPOGRAPHY_3D",
  "CUTLINE_ANALYSIS",
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
    <div className="space-y-8 w-full pb-10 relative z-10">
      <div className="border-b border-border/50 pb-6">
        <div className="flex items-center gap-2 text-primary mb-1">
          <ScanSearch className="w-4 h-4" />
          <span className="text-xs font-mono tracking-widest uppercase opacity-80">Inspection Engine</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight uppercase">Deep Analysis</h2>
        <p className="text-sm text-muted-foreground mt-1 font-mono">
          // Upload a wafer map, run CNN inference, and inspect advanced defect analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <Card className="border-t-4 border-t-primary/50 relative overflow-hidden group bg-background/30 backdrop-blur-sm">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 translate-x-8 -translate-y-8 rotate-45 transform pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
              <CardHeader>
                <CardTitle className="uppercase tracking-widest text-sm text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary inline-block"></span>
                  Input Source
                </CardTitle>
                <CardDescription className="font-mono text-xs opacity-70">
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
                  <div className="flex items-center justify-between border border-border/50 rounded-none px-3 py-2 text-sm bg-muted/20">
                    <span className="flex items-center gap-2 truncate min-w-0 font-mono text-xs text-foreground/80">
                      <FileImage className="h-4 w-4 shrink-0 text-primary/70" />
                      <span className="truncate">{file.name}</span>
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-none h-6 w-6 hover:bg-destructive/20 hover:text-destructive"
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
                    <div className="flex items-center justify-center gap-2 font-mono text-xs text-primary uppercase tracking-widest py-2 bg-primary/5 border border-primary/20">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Processing...
                    </div>
                )}
              </CardContent>
            </Card>

            {result && <PredictionCard data={result.prediction} compact />}
          </div>

          <div className="lg:col-span-2 border border-border/50 bg-background/30 backdrop-blur-sm relative">
             <div className="absolute top-2 left-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 z-10 pointer-events-none">
               Wafer Scanner // Feed 01
             </div>
             <WaferDisplay 
                imageUrl={imageUrl} 
                xLine={xLine} 
                yLine={yLine} 
                onCutlineChange={handleCutlineChange} 
             />
          </div>
      </div>

      {result && (
        <Tabs defaultValue="OVERVIEW" className="w-full pt-6">
            <div className="overflow-x-auto pb-2 border-b border-border/30">
                <TabsList className="inline-flex w-max min-w-full justify-start h-auto p-0 bg-transparent border-none gap-2">
                    {TABS.map((tab) => (
                    <TabsTrigger 
                      key={tab} 
                      value={tab} 
                      className="rounded-none px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-primary/5 font-mono text-xs tracking-widest uppercase transition-all"
                    >
                        {tab.replace("_", " ")}
                    </TabsTrigger>
                    ))}
                </TabsList>
            </div>

            <div className="mt-4 border border-border/50 rounded-none bg-card/50 backdrop-blur-sm text-card-foreground p-6 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 p-2 pointer-events-none text-[10px] font-mono text-muted-foreground/30 uppercase">
                  Data Panel // Active
                </div>
                
                <TabsContent value="OVERVIEW" className="mt-0 outline-none">
                    <h3 className="text-sm font-mono tracking-widest uppercase text-primary mb-6 flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary"></span> Overview KPIs
                    </h3>
                    {overview && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="rounded-none border border-border/50 bg-background/50 p-4 border-l-2 border-l-primary hover:bg-muted/20 transition-colors">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Predicted Class</p>
                                <p className="text-2xl font-mono text-primary tracking-tight mt-2">{overview.predictedClass}</p>
                            </div>
                            <div className="rounded-none border border-border/50 bg-background/50 p-4 border-l-2 border-l-primary hover:bg-muted/20 transition-colors">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Confidence</p>
                                <p className="text-2xl font-mono text-foreground tracking-tight mt-2">{(overview.confidence * 100).toFixed(2)}%</p>
                            </div>
                            <div className="rounded-none border border-border/50 bg-background/50 p-4 border-l-2 border-l-primary hover:bg-muted/20 transition-colors">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Total Defects</p>
                                <p className="text-2xl font-mono text-foreground tracking-tight mt-2">{overview.defectPixels.toLocaleString()}</p>
                            </div>
                            <div className="rounded-none border border-border/50 bg-background/50 p-4 border-l-2 border-l-primary hover:bg-muted/20 transition-colors">
                                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Affected Area</p>
                                <p className="text-2xl font-mono text-foreground tracking-tight mt-2">{overview.affectedArea.toFixed(2)}%</p>
                            </div>
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="REGION_ANALYSIS" className="mt-0 outline-none">
                    <RegionAnalysis data={result.analysis.region_analysis} />
                </TabsContent>
                <TabsContent value="SALIENCY_MAP" className="mt-0 outline-none">
                    <SaliencyMap data={result.analysis.saliency_map} />
                </TabsContent>
                <TabsContent value="TOPOGRAPHY_3D" className="mt-0 outline-none">
                    <Topography3D data={result.analysis.topography_3d} />
                </TabsContent>
                <TabsContent value="CUTLINE_ANALYSIS" className="mt-0 outline-none">
                    <CutlineAnalysis data={result.analysis.cutline_analysis} />
                </TabsContent>
            </div>
        </Tabs>
      )}
    </div>
  );
}
