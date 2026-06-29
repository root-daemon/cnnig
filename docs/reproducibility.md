# Reproducibility

These notes are intended for reviewers or readers who need to run the public
artifact associated with the paper.

## Environment

- Python: `>=3.10,<3.13`
- Backend dependency manager: `uv`
- Frontend runtime/package manager: `bun`
- Model checkpoint: `best_wafercnn.pt`
- Local database: `runs.db`, created or updated by the FastAPI service

## Backend Setup

```bash
uv sync
uv run uvicorn api.main:app --reload
```

Verify that the API is running:

```bash
curl http://localhost:8000/api/health
```

## Frontend Setup

```bash
cd web
bun install
bun run dev
```

Open `http://localhost:3000`.

## Sample Prediction

Use files in `sample_data/` for a quick local smoke test. The API accepts wafer
maps as images, `.npy`, or `.npz` files.

```bash
curl -X POST \
  -F "file=@sample_data/random_defect.npy" \
  http://localhost:8000/api/predict
```

## Verification Checklist

- `GET /api/health` returns `status: ok`.
- A sample wafer map returns a predicted class and confidence score.
- The dashboard can upload a sample file and render the preview.
- The history page shows recorded inference runs.
- The analytics page reflects the stored run history.

## Paper Artifact Notes

- Keep the exact model checkpoint used for reported results under versioned
  release artifacts or document its checksum.
- Record the final paper DOI in `CITATION.cff` once available.
- If retraining is added later, include the training script, dataset reference,
  random seeds, hardware description, and evaluation command.
