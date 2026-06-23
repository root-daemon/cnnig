# Wafer Map Defect Analyzer (Full-Stack)

A production-ready full-stack application for wafer map defect classification and deep visual analysis.

- **Backend**: Flask + PyTorch inference + image analytics
- **Frontend**: React + Vite + Tailwind + Recharts + Plotly
- **Model**: `best_wafercnn.pt` (8-class CNN)

## 1) Prerequisites

Install these tools on your machine:

- **Python** 3.8+
- **Node.js** 18+ (recommended)
- **npm** 9+
- **VS Code** (recommended IDE)

## 2) Project Structure

```text
wafer_map_analyzer/
├── backend/
│   ├── app.py
│   ├── model.py
│   ├── analysis.py
│   ├── requirements.txt
│   └── best_wafercnn.pt
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── components/
│   │       ├── ImageUpload.jsx
│   │       ├── WaferDisplay.jsx
│   │       ├── PredictionPanel.jsx
│   │       ├── RegionAnalysis.jsx
│   │       ├── DepthAnalysis.jsx
│   │       ├── DensityHeatmap.jsx
│   │       ├── Topography3D.jsx
│   │       ├── DefectSpread.jsx
│   │       └── CutlineAnalysis.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
└── README.md
```

## 3) Place the Model File

Copy your trained model weights file:

- Filename: **`best_wafercnn.pt`**
- Location: **`backend/best_wafercnn.pt`**

> The backend will fail with a clear error if the file is missing or empty.

## 4) Backend Setup & Run (Flask)

Open a terminal:

```bash
cd /Users/smile/Desktop/ResearchWork/Silicon_Wafer/WM811K_Visualization_Tool/wafer_map_analyzer/backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Backend will start at:

- `http://127.0.0.1:5000`

Useful endpoint check:

- `GET /api/health`

## 5) Frontend Setup & Run (React + Vite)

Open another terminal:

```bash
cd /Users/smile/Desktop/ResearchWork/Silicon_Wafer/WM811K_Visualization_Tool/wafer_map_analyzer/frontend
npm install
npm run dev
```

Frontend will start at:

- `http://127.0.0.1:5173`

The Vite config proxies `/api/*` to backend `127.0.0.1:5000`.

## 6) Open in VS Code

From terminal:

```bash
cd wafer_map_analyzer
code .
```

Or manually open VS Code and choose **File → Open Folder → wafer_map_analyzer**.

## 7) How to Use / Test with Sample Images

1. Start backend and frontend.
2. Open `http://127.0.0.1:5173` in browser.
3. Upload a wafer map image (PNG/JPG).
4. The app calls `/api/analyze` and shows:
   - predicted defect class and confidence scores
   - region analysis (Center/Middle/Edge)
   - radial depth profile (10 bands)
   - 8x8 density heatmap
   - defect spread KPIs + defect map
   - 3D topography surface
   - cut-line quadrant statistics
5. Drag horizontal/vertical cut-lines in **Wafer Display** for real-time section updates.

### Optional API test with cURL

```bash
curl -X POST http://127.0.0.1:5000/api/predict \
  -F "image=@/absolute/path/to/wafer.png"

curl -X POST http://127.0.0.1:5000/api/analyze \
  -F "image=@/absolute/path/to/wafer.png" \
  -F "x_line=32" \
  -F "y_line=32"
```

## 8) Backend API Summary

### `POST /api/predict`
Input:
- multipart file field: `image`

Output:
- predicted defect class (8 classes)
- confidence scores for all classes

### `POST /api/analyze`
Input:
- multipart file field: `image`
- optional form fields: `x_line`, `y_line`

Output:
- everything from `predict`
- region analysis
- depth analysis (10 concentric bands)
- density analysis (8x8)
- defect spread metrics
- 3D topography data
- cut-line quadrant metrics + recommendation

## 9) Defect Classes

The model outputs one of these 8 classes:

1. Center
2. Donut
3. Edge-Loc
4. Edge-Ring
5. Local
6. Random
7. Scratch
8. Near-full

## 10) Notes for Production

- Use a production WSGI server (e.g., gunicorn) for deployment.
- Add authentication and request size limits for public-facing APIs.
- Persist uploads if historical auditing is needed.
- Optionally containerize with Docker for reproducible deployment.
