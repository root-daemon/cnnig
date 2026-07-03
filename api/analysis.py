from typing import Dict, List, Tuple

import cv2
import numpy as np


def _binary_defect_map(image_norm: np.ndarray) -> np.ndarray:
    """Return binary defect map where 1 indicates defect pixel."""
    img_u8 = (np.clip(image_norm, 0.0, 1.0) * 255).astype(np.uint8)
    blur = cv2.GaussianBlur(img_u8, (3, 3), 0)
    _, th = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return (th > 0).astype(np.uint8)


def _distance_map(shape: Tuple[int, int]) -> np.ndarray:
    h, w = shape
    cy, cx = (h - 1) / 2.0, (w - 1) / 2.0
    y, x = np.ogrid[:h, :w]
    return np.sqrt((y - cy) ** 2 + (x - cx) ** 2)


def region_analysis(defect_map: np.ndarray) -> Dict[str, float]:
    dist = _distance_map(defect_map.shape)
    max_r = dist.max()

    center_mask = dist <= max_r * 0.33
    middle_mask = (dist > max_r * 0.33) & (dist <= max_r * 0.66)
    edge_mask = dist > max_r * 0.66

    def ratio(mask: np.ndarray) -> float:
        denom = mask.sum()
        return float(defect_map[mask].sum() / denom) if denom else 0.0

    return {
        "Center": ratio(center_mask),
        "Middle": ratio(middle_mask),
        "Edge": ratio(edge_mask),
    }


def generate_saliency_map(image_norm: np.ndarray) -> List[List[float]]:
    import torch
    from api.model import MODEL, DEVICE

    tensor = torch.from_numpy(image_norm.astype(np.float32))[None, None, ...].to(DEVICE)
    tensor.requires_grad_()

    with torch.enable_grad():
        output = MODEL(tensor)
        pred_idx = output.argmax(dim=1).item()
        score = output[0, pred_idx]
        MODEL.zero_grad()
        score.backward()
        saliency = tensor.grad.data.abs().squeeze().cpu().numpy()

        lo, hi = float(saliency.min()), float(saliency.max())
        if hi > lo:
            saliency = (saliency - lo) / (hi - lo)
        else:
            saliency = np.zeros_like(saliency)

    return saliency.tolist()


def topography_analysis(defect_map: np.ndarray) -> Dict:
    # Smooth map creates a pseudo-height map for visualization.
    height = cv2.GaussianBlur(defect_map.astype(np.float32), (9, 9), sigmaX=1.2)
    height = cv2.normalize(height, None, 0.0, 1.0, cv2.NORM_MINMAX)

    return {
        "height_map": height.tolist(),
        "min_height": float(height.min()),
        "max_height": float(height.max()),
    }


def cutline_metrics(defect_map: np.ndarray, x_line: int, y_line: int) -> Dict:
    h, w = defect_map.shape
    x_line = int(np.clip(x_line, 1, w - 1))
    y_line = int(np.clip(y_line, 1, h - 1))

    quads = {
        "top_left": defect_map[:y_line, :x_line],
        "top_right": defect_map[:y_line, x_line:],
        "bottom_left": defect_map[y_line:, :x_line],
        "bottom_right": defect_map[y_line:, x_line:],
    }

    out = {}
    best_key = None
    best_score = float("inf")

    for key, arr in quads.items():
        total = arr.size
        defects = int(arr.sum())
        pct = float((defects / total) * 100.0) if total else 0.0
        out[key] = {
            "defect_count": defects,
            "total_pixels": int(total),
            "defect_percentage": pct,
        }
        if pct < best_score:
            best_score = pct
            best_key = key

    return {
        "x_line": x_line,
        "y_line": y_line,
        "quadrants": out,
        "recommended_low_defect_quadrant": best_key,
    }


def run_full_analysis(image_norm: np.ndarray, x_line: int = 32, y_line: int = 32) -> Dict:
    defect_map = _binary_defect_map(image_norm)
    return {
        "defect_map": defect_map.tolist(),
        "region_analysis": region_analysis(defect_map),
        "saliency_map": generate_saliency_map(image_norm),
        "topography_3d": topography_analysis(defect_map),
        "cutline_analysis": cutline_metrics(defect_map, x_line=x_line, y_line=y_line),
    }
