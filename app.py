"""Legacy Gradio UI for the WaferCNN defect classifier.

Model code lives in api/model.py so the FastAPI dashboard and this Gradio
entry share the same preprocessing + inference path.
"""

from __future__ import annotations

from pathlib import Path

import gradio as gr
import numpy as np
from PIL import Image

from api.model import (
    CLASS_NAMES,
    DEVICE,
    NUM_CLASSES,
    load_from_bytes,
    predict_array,
    to_64x64_array,
    wafer_preview_image,
)


def _load_input(image: np.ndarray | None, file_path: str | None) -> np.ndarray:
    if file_path:
        p = Path(file_path)
        with open(p, "rb") as fh:
            return load_from_bytes(p.name, fh.read())
    if image is not None:
        return image
    raise gr.Error("Please upload an image or a .npy/.npz file.")


def predict(image: np.ndarray | None, file_path: str | None):
    raw = _load_input(image, file_path)
    arr = to_64x64_array(raw)
    result = predict_array(arr)
    headline = (
        f"### Prediction: **{result['predicted_class']}**  —  "
        f"{result['confidence'] * 100:.2f}% confidence"
    )
    return wafer_preview_image(arr), result["probabilities"], headline


CSS = """
.gradio-container { max-width: 1100px !important; }
.headline { font-size: 1.1rem; }
"""

with gr.Blocks(title="WaferCNN — Defect Classifier") as demo:
    gr.Markdown(
        "# WaferCNN — Wafer-Map Defect Classifier\n"
        "Upload a wafer-map image **or** a `.npy` / `.npz` array. "
        "The image is converted to grayscale, resized to **64×64**, "
        "min-max normalized, and run through the trained CNN.\n\n"
        f"**Device:** `{DEVICE.type}` &nbsp;·&nbsp; **Classes:** "
        f"{', '.join(CLASS_NAMES)}"
    )

    with gr.Row():
        with gr.Column(scale=1):
            image_in = gr.Image(
                label="Wafer map (image)",
                type="numpy",
                image_mode="L",
                height=320,
            )
            file_in = gr.File(
                label="…or upload .npy / .npz",
                file_types=[".npy", ".npz"],
                type="filepath",
            )
            run_btn = gr.Button("Classify", variant="primary")
            clear_btn = gr.Button("Clear")

        with gr.Column(scale=1):
            headline_md = gr.Markdown(value="", elem_classes=["headline"])
            preview_out = gr.Image(label="Model input (64×64, normalized)", height=280)
            probs_out = gr.Label(label="Class probabilities", num_top_classes=NUM_CLASSES)

    run_btn.click(
        fn=predict,
        inputs=[image_in, file_in],
        outputs=[preview_out, probs_out, headline_md],
    )
    clear_btn.click(
        fn=lambda: (None, None, None, {}, ""),
        outputs=[image_in, file_in, preview_out, probs_out, headline_md],
    )


if __name__ == "__main__":
    demo.launch(theme=gr.themes.Soft(), css=CSS)
