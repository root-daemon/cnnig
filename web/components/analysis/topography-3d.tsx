"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Topography3D as Topography3DType } from "@/lib/api";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface Topography3DProps {
  data?: Topography3DType;
}

export function Topography3D({ data }: Topography3DProps) {
    if (!data) {
        return (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              No topography data available.
            </CardContent>
          </Card>
        );
    }
    
  const z = data.height_map || [[]];

  return (
    <Card>
      <CardHeader>
        <CardTitle>3D Topography</CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden rounded-b-xl flex items-center justify-center">
        <div className="w-full overflow-x-auto flex justify-center">
          <Plot
            data={[{ z, type: "surface", colorscale: "Jet" }]}
            layout={{
              autosize: true,
              margin: { l: 0, r: 0, b: 0, t: 30 },
              scene: {
                xaxis: { title: "X" },
                yaxis: { title: "Y" },
                zaxis: { title: "Height" },
              },
            }}
            useResizeHandler={true}
            style={{ width: "100%", minHeight: "450px" }}
            config={{ responsive: true, displayModeBar: false }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
