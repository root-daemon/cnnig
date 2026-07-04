"""WaferCNN model + preprocessing, shared by FastAPI and the legacy Gradio app."""

from __future__ import annotations

import base64
import io
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
WEIGHTS_PATH = ROOT / "best_wafercnn.pt"

IMG_SIZE = 64
CLASS_NAMES = [
    "Center",
    "Donut",
    "Edge-Loc",
    "Edge-Ring",
    "Local",
    "Near-full",
    "Random",
    "Scratch",
]
NUM_CLASSES = len(CLASS_NAMES)
DEVICE = torch.device(
    "cuda" if torch.cuda.is_available()
    else "mps" if torch.backends.mps.is_available()
    else "cpu"
)


class WaferCNN(nn.Module):
    def __init__(self, in_ch: int = 1, num_classes: int = 8,
                 base_ch: int = 32, dropout: float = 0.3) -> None:
        super().__init__()

        def conv_bn_relu(in_c: int, out_c: int, k: int = 3) -> nn.Sequential:
            return nn.Sequential(
                nn.Conv2d(in_c, out_c, k, padding=k // 2, bias=False),
                nn.BatchNorm2d(out_c),
                nn.ReLU(inplace=True),
            )

        self.block1 = nn.Sequential(
            conv_bn_relu(in_ch, base_ch),
            conv_bn_relu(base_ch, base_ch),
            nn.MaxPool2d(2),
            nn.Dropout2d(dropout * 0.5),
        )
        self.block2 = nn.Sequential(
            conv_bn_relu(base_ch, base_ch * 2),
            conv_bn_relu(base_ch * 2, base_ch * 2),
            nn.MaxPool2d(2),
            nn.Dropout2d(dropout * 0.5),
        )
        self.block3 = nn.Sequential(
            conv_bn_relu(base_ch * 2, base_ch * 4),
            conv_bn_relu(base_ch * 4, base_ch * 4),
            nn.MaxPool2d(2),
            nn.Dropout2d(dropout),
        )
        self.block4 = nn.Sequential(
            conv_bn_relu(base_ch * 4, base_ch * 8),
            conv_bn_relu(base_ch * 8, base_ch * 8),
            nn.MaxPool2d(2),
            nn.Dropout2d(dropout),
        )
        self.gap = nn.AdaptiveAvgPool2d(1)
        feat = base_ch * 8
        self.head = nn.Sequential(
            nn.Flatten(),
            nn.Linear(feat, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(inplace=True),
            nn.Dropout(dropout),
            nn.Linear(128, num_classes),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        x = self.block4(x)
        x = self.gap(x)
        return self.head(x)


def load_model() -> WaferCNN:
    model = WaferCNN(in_ch=1, num_classes=NUM_CLASSES, base_ch=32, dropout=0.3)
    state = torch.load(WEIGHTS_PATH, map_location=DEVICE, weights_only=True)
    model.load_state_dict(state)
    model.to(DEVICE).eval()
    return model


MODEL = load_model()


def to_64x64_array(arr: np.ndarray) -> np.ndarray:
    """Squeeze to 2D, resize to 64x64, normalize to [0, 1] float32."""
    arr = np.asarray(arr)
    if arr.ndim == 3:
        if arr.shape[-1] in (1, 3, 4):
            arr = arr[..., :3].mean(axis=-1) if arr.shape[-1] >= 3 else arr[..., 0]
        elif arr.shape[0] in (1, 3, 4):
            arr = arr[:3].mean(axis=0) if arr.shape[0] >= 3 else arr[0]
        else:
            arr = arr.squeeze()
    if arr.ndim != 2:
        raise ValueError(f"Expected 2D image, got shape {arr.shape}")

    if arr.shape != (IMG_SIZE, IMG_SIZE):
        img = Image.fromarray(arr.astype(np.float32))
        img = img.resize((IMG_SIZE, IMG_SIZE), Image.Resampling.BILINEAR)
        arr = np.asarray(img, dtype=np.float32)

    arr = arr.astype(np.float32)
    lo, hi = float(arr.min()), float(arr.max())
    if hi > lo:
        arr = (arr - lo) / (hi - lo)
    else:
        arr = np.zeros_like(arr)
    return arr


def load_from_bytes(filename: str, data: bytes) -> np.ndarray:
    """Load image or numpy array from raw bytes, dispatched by file suffix."""
    suffix = Path(filename).suffix.lower()
    buf = io.BytesIO(data)
    if suffix == ".npy":
        return np.load(buf, allow_pickle=False)
    if suffix == ".npz":
        archive = np.load(buf, allow_pickle=True)
        key = list(archive.keys())[0]
        sample = archive[key]
        if sample.ndim >= 3 and sample.shape[0] > 1 and sample.shape[-1] in (1, 3, 4):
            sample = sample[0]
        elif sample.ndim >= 3 and sample.shape[-1] not in (1, 3, 4):
            sample = sample[0]
        return sample
    return np.asarray(Image.open(buf))


def wafer_preview_png_b64(arr: np.ndarray) -> str:
    """Render the 64x64 normalized array as a 256x256 PNG, return base64 data-url body."""
    rgb = np.stack([arr] * 3, axis=-1)
    rgb = (rgb * 255).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(rgb, mode="RGB").resize((256, 256), Image.NEAREST)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


def wafer_preview_image(arr: np.ndarray) -> Image.Image:
    """Same preview as a PIL Image — kept for the Gradio entry point."""
    rgb = np.stack([arr] * 3, axis=-1)
    rgb = (rgb * 255).clip(0, 255).astype(np.uint8)
    return Image.fromarray(rgb, mode="RGB").resize((256, 256), Image.NEAREST)


def predict_array(arr_2d: np.ndarray) -> dict:
    """Run the model on a preprocessed 64x64 array. Returns class, confidence, full probs, preview."""
    tensor = torch.from_numpy(arr_2d)[None, None, ...].to(DEVICE)
    with torch.no_grad():
        logits = MODEL(tensor)
        probs = F.softmax(logits, dim=1).cpu().numpy()[0]

    top_idx = int(np.argmax(probs))
    return {
        "predicted_class": CLASS_NAMES[top_idx],
        "confidence": float(probs[top_idx]),
        "probabilities": {CLASS_NAMES[i]: float(probs[i]) for i in range(NUM_CLASSES)},
        "preview_b64": wafer_preview_png_b64(arr_2d),
    }
