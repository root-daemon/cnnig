"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WaferDisplayProps {
  imageUrl: string;
  xLine: number;
  yLine: number;
  onCutlineChange: (x: number, y: number) => void;
}

export function WaferDisplay({ imageUrl, xLine, yLine, onCutlineChange }: WaferDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragTarget, setDragTarget] = useState<"x" | "y" | null>(null);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragTarget || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const px = clamp(e.clientX - rect.left, 0, rect.width);
      const py = clamp(e.clientY - rect.top, 0, rect.height);
      const nextX = Math.round((px / rect.width) * 64);
      const nextY = Math.round((py / rect.height) * 64);
      if (dragTarget === "x") onCutlineChange(clamp(nextX, 1, 63), yLine);
      if (dragTarget === "y") onCutlineChange(xLine, clamp(nextY, 1, 63));
    };
    const up = () => setDragTarget(null);
    
    if (dragTarget) {
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
    }
    
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, [dragTarget, onCutlineChange, xLine, yLine]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wafer Display</CardTitle>
        <CardDescription>
          Drag green (vertical) and amber (horizontal) cut-lines to update section analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div 
            ref={containerRef} 
            className="relative w-full max-w-[400px] aspect-square bg-muted rounded-md overflow-hidden border mx-auto"
        >
          {imageUrl ? (
            <Image 
                src={imageUrl} 
                alt="Wafer map" 
                fill
                className="object-cover"
                unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              No image uploaded
            </div>
          )}

          <div
            className="absolute top-0 bottom-0 w-1 bg-emerald-500 cursor-ew-resize hover:w-1.5 transition-all"
            style={{ left: `calc(${(xLine / 64) * 100}% - 2px)` }}
            onMouseDown={() => setDragTarget("x")}
          />
          <div
            className="absolute left-0 right-0 h-1 bg-amber-500 cursor-ns-resize hover:h-1.5 transition-all"
            style={{ top: `calc(${(yLine / 64) * 100}% - 2px)` }}
            onMouseDown={() => setDragTarget("y")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
