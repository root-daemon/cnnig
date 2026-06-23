const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const CLASS_NAMES = [
  "Center",
  "Donut",
  "Edge-Loc",
  "Edge-Ring",
  "Loc",
  "Near-full",
  "Random",
  "Scratch",
] as const;

export type PredictionResponse = {
  id: number;
  filename: string;
  predicted_class: string;
  confidence: number;
  probabilities: Record<string, number>;
  preview_b64: string;
  created_at: string;
};

export type BatchItemResponse = {
  filename: string;
  id?: number | null;
  predicted_class?: string | null;
  confidence?: number | null;
  probabilities?: Record<string, number> | null;
  preview_b64?: string | null;
  created_at?: string | null;
  error?: string | null;
};

export type HistoryListResponse = {
  items: PredictionResponse[];
  total: number;
};

export type AnalyticsOverview = {
  total_runs: number;
  top_class: string | null;
  avg_confidence: number;
  last_run_at: string | null;
};

export type DepthBand = {
  band: number;
  inner_radius: number;
  outer_radius: number;
  defect_density: number;
};

export type DensityAnalysis = {
  grid_size: number;
  density_grid: number[][];
};

export type DefectSpread = {
  defect_pixel_count: number;
  total_pixel_count: number;
  affected_area_percentage: number;
};

export type Topography3D = {
  height_map: number[][];
  min_height: number;
  max_height: number;
};

export type QuadrantMetrics = {
  defect_count: number;
  total_pixels: number;
  defect_percentage: number;
};

export type CutlineAnalysis = {
  x_line: number;
  y_line: number;
  quadrants: Record<string, QuadrantMetrics>;
  recommended_low_defect_quadrant: string;
};

export type FullAnalysis = {
  defect_map: number[][];
  region_analysis: Record<string, number>;
  depth_analysis: DepthBand[];
  density_analysis: DensityAnalysis;
  defect_spread: DefectSpread;
  topography_3d: Topography3D;
  cutline_analysis: CutlineAnalysis;
};

export type AnalyzeResponse = {
  prediction: PredictionResponse;
  analysis: FullAnalysis;
};

export type ClassCount = { class_name: string; count: number };
export type ConfidenceBin = { lower: number; upper: number; count: number };
export type DayCount = { date: string; count: number };

async function request<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`,
    );
  }
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; device: string; classes: string[] }>(
    "/api/health",
  ),

  predict: async (file: File): Promise<PredictionResponse> => {
    const form = new FormData();
    form.append("file", file);
    return request<PredictionResponse>("/api/predict", {
      method: "POST",
      body: form,
    });
  },

  predictBatch: async (files: File[]): Promise<BatchItemResponse[]> => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    return request<BatchItemResponse[]>("/api/predict/batch", {
      method: "POST",
      body: form,
    });
  },

  analyze: async (file: File, xLine = 32, yLine = 32): Promise<AnalyzeResponse> => {
    const form = new FormData();
    form.append("file", file);
    form.append("x_line", String(xLine));
    form.append("y_line", String(yLine));
    return request<AnalyzeResponse>("/api/analyze", {
      method: "POST",
      body: form,
    });
  },

  history: (params: {
    limit?: number;
    offset?: number;
    class?: string;
  } = {}) => {
    const q = new URLSearchParams();
    if (params.limit != null) q.set("limit", String(params.limit));
    if (params.offset != null) q.set("offset", String(params.offset));
    if (params.class) q.set("class", params.class);
    return request<HistoryListResponse>(
      `/api/history${q.toString() ? `?${q}` : ""}`,
    );
  },

  getRun: (id: number) => request<PredictionResponse>(`/api/history/${id}`),

  deleteRun: (id: number) =>
    request<{ ok: boolean }>(`/api/history/${id}`, { method: "DELETE" }),

  overview: () => request<AnalyticsOverview>("/api/analytics/overview"),

  distribution: () => request<ClassCount[]>("/api/analytics/distribution"),

  confidenceHistogram: () =>
    request<ConfidenceBin[]>("/api/analytics/confidence"),

  timeseries: (days = 30) =>
    request<DayCount[]>(`/api/analytics/timeseries?days=${days}`),
};
