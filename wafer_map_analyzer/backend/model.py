import os
from typing import Dict, List, Tuple

import numpy as np
import torch
import torch.nn as nn
from PIL import Image

CLASS_NAMES: List[str] = [
    "Center",
    "Donut",
    "Edge-Loc",
    "Edge-Ring",
    "Local",
    "Near-full",
    "Random",
    "Scratch",
]


class WaferCNN(nn.Module):
    """CNN architecture aligned with the provided training notebook."""

    def __init__(
        self,
        in_ch: int = 1,
        num_classes: int = 8,
        base_ch: int = 32,
        dropout: float = 0.3,
    ) -> None:
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


class ModelService:
    """Loads a trained model and serves prediction utilities."""

    def __init__(self, model_path: str) -> None:
        self.model_path = model_path
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = WaferCNN(in_ch=1, num_classes=len(CLASS_NAMES), base_ch=32, dropout=0.3)
        self.model.to(self.device)
        self.model.eval()
        self.is_loaded = False

    def load(self) -> None:
        if not os.path.exists(self.model_path) or os.path.getsize(self.model_path) == 0:
            raise FileNotFoundError(
                f"Model file not found or empty at '{self.model_path}'. Please place your trained best_wafercnn.pt in backend/."
            )

        try:
            state = torch.load(self.model_path, map_location=self.device)
        except Exception as exc:
            raise RuntimeError(f"Unable to load model weights: {exc}") from exc
        if isinstance(state, dict) and "state_dict" in state:
            state = state["state_dict"]

        self.model.load_state_dict(state)
        self.model.eval()
        self.is_loaded = True

    @staticmethod
    def preprocess_image(file_stream) -> Tuple[np.ndarray, torch.Tensor]:
        """Convert input image to 64x64 grayscale for model inference."""
        image = Image.open(file_stream).convert("L").resize((64, 64), Image.Resampling.BILINEAR)
        image_np = np.array(image, dtype=np.float32)

        # Normalize to [0,1] and maintain a displayable binary-like map.
        image_norm = image_np / 255.0
        tensor = torch.from_numpy(image_norm).unsqueeze(0).unsqueeze(0)  # (1,1,64,64)
        return image_norm, tensor

    def predict(self, image_tensor: torch.Tensor) -> Dict:
        if not self.is_loaded:
            self.load()

        with torch.no_grad():
            logits = self.model(image_tensor.to(self.device))
            probs = torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()

        pred_idx = int(np.argmax(probs))

        return {
            "predicted_class": CLASS_NAMES[pred_idx],
            "predicted_index": pred_idx,
            "confidence": float(probs[pred_idx]),
            "confidence_scores": {name: float(probs[i]) for i, name in enumerate(CLASS_NAMES)},
        }
