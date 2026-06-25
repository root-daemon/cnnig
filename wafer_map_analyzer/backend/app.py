import os
from typing import Any, Dict

from flask import Flask, jsonify, request
from flask_cors import CORS

from analysis import run_full_analysis
from model import ModelService

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "best_wafercnn.pt")

app = Flask(__name__)
CORS(app)

model_service = ModelService(model_path=MODEL_PATH)


def _ok(payload: Dict[str, Any], status_code: int = 200):
    return jsonify(payload), status_code


def _error(message: str, status_code: int = 400):
    return jsonify({"error": message}), status_code


@app.route("/api/health", methods=["GET"])
def health():
    return _ok({"status": "ok", "model_loaded": model_service.is_loaded})


@app.route("/api/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return _error("Missing file field 'image'", 400)

    uploaded = request.files["image"]
    if uploaded.filename == "":
        return _error("No file selected", 400)

    try:
        image_norm, image_tensor = model_service.preprocess_image(uploaded.stream)
        pred = model_service.predict(image_tensor)
        return _ok(
            {
                "prediction": pred,
                "image_shape": list(image_norm.shape),
            }
        )
    except FileNotFoundError as exc:
        return _error(str(exc), 500)
    except Exception as exc:
        return _error(f"Prediction failed: {exc}", 500)


@app.route("/api/analyze", methods=["POST"])
def analyze():
    if "image" not in request.files:
        return _error("Missing file field 'image'", 400)

    uploaded = request.files["image"]
    if uploaded.filename == "":
        return _error("No file selected", 400)

    try:
        x_line = int(request.form.get("x_line", 32))
        y_line = int(request.form.get("y_line", 32))

        image_norm, image_tensor = model_service.preprocess_image(uploaded.stream)
        pred = model_service.predict(image_tensor)
        analysis = run_full_analysis(
            image_norm,
            x_line=x_line,
            y_line=y_line,
            model=model_service.model,
            device=model_service.device
        )

        return _ok(
            {
                "prediction": pred,
                "analysis": analysis,
            }
        )
    except FileNotFoundError as exc:
        return _error(str(exc), 500)
    except Exception as exc:
        return _error(f"Analysis failed: {exc}", 500)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
