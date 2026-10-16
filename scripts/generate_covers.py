#!/usr/bin/env python3
"""Generate OpenAI-style luminous pastel/sky blurred covers with organic light folds and film grain."""
from __future__ import annotations

import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "newww" / "img" / "gen"
ROOT_DIR = ROOT / "img" / "gen"

# Each cover defines:
# - base: 4 corner colors [top-left, top-right, bottom-left, bottom-right]
# - ribbons: list of flowing silk/aurora light waves & soft bokeh blobs
# - angle: primary flow angle in degrees
# - wave_freq, wave_amp: organic fold modulation
COVERS = {
    # 1. Main reference ("OpenAI | The Washington Post"): periwinkle, lavender, soft violet & icy blue folds
    "pulse-ui": {
        "seed": 101,
        "base": ["#6e73e2", "#8e88ec", "#9ba6f6", "#857ae6"],
        "blobs": [
            {"x": 0.22, "y": 0.30, "rx": 0.48, "ry": 0.65, "rot": -22, "c": "#c8bffc", "a": 0.72},
            {"x": 0.58, "y": 0.25, "rx": 0.36, "ry": 0.75, "rot": 18, "c": "#6364d4", "a": 0.65},
            {"x": 0.78, "y": 0.62, "rx": 0.45, "ry": 0.68, "rot": 24, "c": "#b2d2ff", "a": 0.75},
            {"x": 0.38, "y": 0.75, "rx": 0.52, "ry": 0.45, "rot": -15, "c": "#d8c6ff", "a": 0.68},
            {"x": 0.50, "y": 0.48, "rx": 0.40, "ry": 0.50, "rot": 12, "c": "#7c7ee6", "a": 0.55},
        ],
        "folds": [
            {"pos": 0.20, "w": 0.14, "angle": 72, "c": "#d9d0ff", "a": 0.50},
            {"pos": 0.42, "w": 0.16, "angle": 68, "c": "#6a6cd9", "a": 0.45},
            {"pos": 0.64, "w": 0.15, "angle": 74, "c": "#b5d4ff", "a": 0.52},
            {"pos": 0.82, "w": 0.14, "angle": 70, "c": "#8378e3", "a": 0.48},
        ],
    },
    # 2. "OpenAI | INSEAD" reference: warm iridescent lavender-violet, peach-gold, and soft lilac folds
    "ds-eval": {
        "seed": 202,
        "base": ["#806ce0", "#b88ef2", "#9e7ee8", "#f2a97e"],
        "blobs": [
            {"x": 0.18, "y": 0.42, "rx": 0.46, "ry": 0.65, "rot": -25, "c": "#7664dd", "a": 0.75},
            {"x": 0.52, "y": 0.28, "rx": 0.48, "ry": 0.58, "rot": 20, "c": "#d2affc", "a": 0.70},
            {"x": 0.82, "y": 0.58, "rx": 0.46, "ry": 0.62, "rot": 28, "c": "#ffc48c", "a": 0.78},
            {"x": 0.62, "y": 0.80, "rx": 0.50, "ry": 0.44, "rot": -18, "c": "#f7a278", "a": 0.72},
            {"x": 0.44, "y": 0.52, "rx": 0.36, "ry": 0.48, "rot": 15, "c": "#9c7ce8", "a": 0.52},
        ],
        "folds": [
            {"pos": 0.28, "w": 0.13, "angle": 62, "c": "#c8a8fc", "a": 0.52},
            {"pos": 0.52, "w": 0.16, "angle": 58, "c": "#866ee2", "a": 0.46},
            {"pos": 0.74, "w": 0.15, "angle": 64, "c": "#ffd8a8", "a": 0.55},
        ],
    },
    # 3. Row 1 Left ("OpenAI" Межа): pastel periwinkle-blue flowing into lilac, rose-pink & icy cyan highlight
    "agent-ui": {
        "seed": 303,
        "base": ["#628ef2", "#a8c8ff", "#8898f6", "#ea9ce2"],
        "blobs": [
            {"x": 0.20, "y": 0.32, "rx": 0.50, "ry": 0.60, "rot": -18, "c": "#6a98f8", "a": 0.78},
            {"x": 0.68, "y": 0.22, "rx": 0.44, "ry": 0.52, "rot": 22, "c": "#c8e6ff", "a": 0.76},
            {"x": 0.76, "y": 0.68, "rx": 0.48, "ry": 0.58, "rot": -24, "c": "#f5a3e6", "a": 0.78},
            {"x": 0.35, "y": 0.72, "rx": 0.46, "ry": 0.50, "rot": 14, "c": "#b2a4fc", "a": 0.70},
            {"x": 0.48, "y": 0.48, "rx": 0.38, "ry": 0.42, "rot": -10, "c": "#8a9ef6", "a": 0.50},
        ],
        "folds": [
            {"pos": 0.30, "w": 0.16, "angle": 54, "c": "#b8d8ff", "a": 0.50},
            {"pos": 0.58, "w": 0.15, "angle": 50, "c": "#929af6", "a": 0.45},
            {"pos": 0.78, "w": 0.16, "angle": 56, "c": "#f7b2ea", "a": 0.52},
        ],
    },
    # 4. Row 1 Center ("The OpenAI Podcast"): sky blue, cloud white, and warm golden-amber bokeh flare
    "figma-to-design-md": {
        "seed": 404,
        "base": ["#488ce8", "#2d68d8", "#9ecff8", "#d69e3a"],
        "blobs": [
            {"x": 0.22, "y": 0.36, "rx": 0.52, "ry": 0.62, "rot": -15, "c": "#72b4f6", "a": 0.80},
            {"x": 0.36, "y": 0.55, "rx": 0.44, "ry": 0.48, "rot": 12, "c": "#cbe6ff", "a": 0.72},
            {"x": 0.64, "y": 0.68, "rx": 0.42, "ry": 0.54, "rot": -20, "c": "#f5c448", "a": 0.82},
            {"x": 0.82, "y": 0.28, "rx": 0.45, "ry": 0.60, "rot": 25, "c": "#2858c8", "a": 0.76},
            {"x": 0.50, "y": 0.45, "rx": 0.36, "ry": 0.44, "rot": 8, "c": "#5e9ee8", "a": 0.55},
        ],
        "folds": [
            {"pos": 0.34, "w": 0.16, "angle": 65, "c": "#bce0ff", "a": 0.48},
            {"pos": 0.62, "w": 0.15, "angle": 60, "c": "#f7cc5c", "a": 0.50},
            {"pos": 0.80, "w": 0.14, "angle": 68, "c": "#3264d2", "a": 0.48},
        ],
    },
    # 5. Row 3 Left ("OpenAI" sunset/aurora): cobalt-blue -> violet -> magenta-rose -> warm coral-orange
    "ds-lint": {
        "seed": 505,
        "base": ["#2e6ce6", "#7a52e0", "#8458d8", "#f47c48"],
        "blobs": [
            {"x": 0.18, "y": 0.24, "rx": 0.50, "ry": 0.56, "rot": -20, "c": "#3878f0", "a": 0.82},
            {"x": 0.48, "y": 0.42, "rx": 0.48, "ry": 0.54, "rot": 18, "c": "#8e58e4", "a": 0.75},
            {"x": 0.74, "y": 0.58, "rx": 0.48, "ry": 0.56, "rot": -16, "c": "#e05298", "a": 0.78},
            {"x": 0.85, "y": 0.82, "rx": 0.46, "ry": 0.48, "rot": 12, "c": "#f89244", "a": 0.84},
            {"x": 0.30, "y": 0.76, "rx": 0.44, "ry": 0.46, "rot": -10, "c": "#a864dc", "a": 0.68},
        ],
        "folds": [
            {"pos": 0.26, "w": 0.16, "angle": 48, "c": "#4c88f6", "a": 0.46},
            {"pos": 0.54, "w": 0.16, "angle": 45, "c": "#b858c8", "a": 0.46},
            {"pos": 0.78, "w": 0.16, "angle": 50, "c": "#f6824c", "a": 0.52},
        ],
    },
    # 6. Row 3 Right ("OpenAI | aws"): rich cyan-turquoise & cobalt-blue with diagonal shaft of aqua light
    "ds-coverage": {
        "seed": 606,
        "base": ["#0e94c8", "#2264dc", "#1ca8ce", "#1d4ed8"],
        "blobs": [
            {"x": 0.20, "y": 0.55, "rx": 0.48, "ry": 0.64, "rot": -22, "c": "#129ec8", "a": 0.80},
            {"x": 0.52, "y": 0.42, "rx": 0.36, "ry": 0.78, "rot": -28, "c": "#76e4ff", "a": 0.74},
            {"x": 0.80, "y": 0.35, "rx": 0.48, "ry": 0.66, "rot": 18, "c": "#1e56d0", "a": 0.82},
            {"x": 0.60, "y": 0.78, "rx": 0.46, "ry": 0.50, "rot": -15, "c": "#44c2ec", "a": 0.70},
        ],
        "folds": [
            {"pos": 0.46, "w": 0.18, "angle": 64, "c": "#84ecff", "a": 0.56},
            {"pos": 0.70, "w": 0.16, "angle": 66, "c": "#1b52cc", "a": 0.50},
            {"pos": 0.24, "w": 0.15, "angle": 62, "c": "#1498c4", "a": 0.48},
        ],
    },
    # 7. Row 1 Right ("OpenAI ChatGPT Agent"): azure, cobalt & icy sky-blue botanical bokeh
    "ds-context": {
        "seed": 707,
        "base": ["#3882ec", "#5aa4f8", "#68b4fc", "#3264dc"],
        "blobs": [
            {"x": 0.28, "y": 0.35, "rx": 0.46, "ry": 0.58, "rot": -24, "c": "#8eceff", "a": 0.78},
            {"x": 0.72, "y": 0.26, "rx": 0.42, "ry": 0.54, "rot": 28, "c": "#3a56d4", "a": 0.74},
            {"x": 0.64, "y": 0.68, "rx": 0.48, "ry": 0.56, "rot": -18, "c": "#9ad8ff", "a": 0.76},
            {"x": 0.22, "y": 0.72, "rx": 0.42, "ry": 0.48, "rot": 20, "c": "#265cd0", "a": 0.72},
            {"x": 0.50, "y": 0.48, "rx": 0.38, "ry": 0.44, "rot": 10, "c": "#5298f4", "a": 0.60},
        ],
        "folds": [
            {"pos": 0.32, "w": 0.15, "angle": 58, "c": "#a8e0ff", "a": 0.52},
            {"pos": 0.56, "w": 0.16, "angle": 62, "c": "#3868dc", "a": 0.46},
            {"pos": 0.78, "w": 0.14, "angle": 55, "c": "#92d2ff", "a": 0.50},
        ],
    },
    # 8. Row 2 Right ("OpenAI" Times of India): serene atmospheric sky gradient, powder blue to periwinkle
    "ds-health": {
        "seed": 808,
        "base": ["#5a86d6", "#6490dc", "#9ec2f2", "#a8caf6"],
        "blobs": [
            {"x": 0.50, "y": 0.18, "rx": 0.65, "ry": 0.45, "rot": 0, "c": "#4e78c8", "a": 0.76},
            {"x": 0.35, "y": 0.62, "rx": 0.58, "ry": 0.52, "rot": -12, "c": "#8cb6ee", "a": 0.74},
            {"x": 0.70, "y": 0.75, "rx": 0.56, "ry": 0.48, "rot": 10, "c": "#b6d4fa", "a": 0.78},
            {"x": 0.20, "y": 0.40, "rx": 0.45, "ry": 0.48, "rot": -18, "c": "#6e9ae2", "a": 0.65},
        ],
        "folds": [
            {"pos": 0.36, "w": 0.18, "angle": 76, "c": "#7ea8e8", "a": 0.44},
            {"pos": 0.66, "w": 0.18, "angle": 72, "c": "#b2d0f8", "a": 0.46},
        ],
    },
    # 9. Soft violet-indigo, blush rose & warm apricot silk folds
    "ui-repair": {
        "seed": 909,
        "base": ["#6872e0", "#9c82ec", "#8694f2", "#f29cb8"],
        "blobs": [
            {"x": 0.24, "y": 0.34, "rx": 0.48, "ry": 0.60, "rot": -20, "c": "#7482ea", "a": 0.76},
            {"x": 0.66, "y": 0.30, "rx": 0.46, "ry": 0.58, "rot": 22, "c": "#c8b2fc", "a": 0.74},
            {"x": 0.74, "y": 0.70, "rx": 0.48, "ry": 0.56, "rot": -18, "c": "#f7acc2", "a": 0.78},
            {"x": 0.32, "y": 0.74, "rx": 0.46, "ry": 0.50, "rot": 16, "c": "#9caeff", "a": 0.72},
        ],
        "folds": [
            {"pos": 0.28, "w": 0.15, "angle": 66, "c": "#b8c4ff", "a": 0.48},
            {"pos": 0.54, "w": 0.16, "angle": 62, "c": "#7e76e2", "a": 0.45},
            {"pos": 0.76, "w": 0.15, "angle": 68, "c": "#f9bad0", "a": 0.52},
        ],
    },
    # 10. Sky-cerulean, soft aqua-mint & sunlit warm gold horizon
    "prompt-regress": {
        "seed": 1010,
        "base": ["#3e84e4", "#58b4e8", "#74c8dc", "#e8b85c"],
        "blobs": [
            {"x": 0.22, "y": 0.32, "rx": 0.50, "ry": 0.60, "rot": -18, "c": "#4a92ec", "a": 0.78},
            {"x": 0.58, "y": 0.36, "rx": 0.46, "ry": 0.58, "rot": 20, "c": "#8ee0f0", "a": 0.74},
            {"x": 0.76, "y": 0.70, "rx": 0.46, "ry": 0.54, "rot": -22, "c": "#f4ca6c", "a": 0.78},
            {"x": 0.34, "y": 0.72, "rx": 0.48, "ry": 0.50, "rot": 15, "c": "#78c8e8", "a": 0.72},
        ],
        "folds": [
            {"pos": 0.32, "w": 0.16, "angle": 60, "c": "#9ae6f6", "a": 0.50},
            {"pos": 0.58, "w": 0.15, "angle": 56, "c": "#4888e2", "a": 0.45},
            {"pos": 0.78, "w": 0.15, "angle": 62, "c": "#f7d482", "a": 0.50},
        ],
    },
    # Article covers in the same family
    "cursor-figma": {
        "seed": 1111,
        "base": ["#5e78e4", "#7e96f2", "#9eb8fa", "#b8a4f8"],
        "blobs": [
            {"x": 0.28, "y": 0.36, "rx": 0.48, "ry": 0.62, "rot": -22, "c": "#a8c4ff", "a": 0.76},
            {"x": 0.68, "y": 0.32, "rx": 0.44, "ry": 0.60, "rot": 20, "c": "#6670dc", "a": 0.70},
            {"x": 0.72, "y": 0.68, "rx": 0.48, "ry": 0.56, "rot": -18, "c": "#d2befc", "a": 0.76},
        ],
        "folds": [
            {"pos": 0.34, "w": 0.16, "angle": 68, "c": "#c0d4ff", "a": 0.50},
            {"pos": 0.64, "w": 0.16, "angle": 72, "c": "#d8c6ff", "a": 0.50},
        ],
    },
    "design-md": {
        "seed": 1212,
        "base": ["#7868dc", "#a486ec", "#c49ef6", "#f2b094"],
        "blobs": [
            {"x": 0.24, "y": 0.38, "rx": 0.48, "ry": 0.62, "rot": -24, "c": "#6c5cd4", "a": 0.74},
            {"x": 0.62, "y": 0.34, "rx": 0.46, "ry": 0.58, "rot": 18, "c": "#d4b6fc", "a": 0.74},
            {"x": 0.78, "y": 0.68, "rx": 0.48, "ry": 0.56, "rot": -16, "c": "#f8be9c", "a": 0.76},
        ],
        "folds": [
            {"pos": 0.32, "w": 0.16, "angle": 62, "c": "#caa8fa", "a": 0.50},
            {"pos": 0.68, "w": 0.16, "angle": 66, "c": "#facaab", "a": 0.52},
        ],
    },
    "dev-for-designers": {
        "seed": 1313,
        "base": ["#2e78dc", "#4ea2f0", "#76c4f8", "#5868dc"],
        "blobs": [
            {"x": 0.26, "y": 0.36, "rx": 0.48, "ry": 0.62, "rot": -20, "c": "#88d0ff", "a": 0.76},
            {"x": 0.68, "y": 0.30, "rx": 0.44, "ry": 0.58, "rot": 24, "c": "#2e5ed0", "a": 0.72},
            {"x": 0.70, "y": 0.70, "rx": 0.48, "ry": 0.56, "rot": -18, "c": "#a8e0ff", "a": 0.76},
        ],
        "folds": [
            {"pos": 0.36, "w": 0.16, "angle": 64, "c": "#9cd8ff", "a": 0.52},
            {"pos": 0.66, "w": 0.16, "angle": 60, "c": "#3a66d8", "a": 0.48},
        ],
    },
    "intent-os": {
        "seed": 1414,
        "base": ["#2d7a9c", "#5c6ee6", "#4ac29a", "#7e68e8"],
        "blobs": [
            {"x": 0.24, "y": 0.34, "rx": 0.50, "ry": 0.62, "rot": -22, "c": "#7be8b5", "a": 0.72},
            {"x": 0.68, "y": 0.28, "rx": 0.46, "ry": 0.58, "rot": 18, "c": "#8694ff", "a": 0.74},
            {"x": 0.74, "y": 0.68, "rx": 0.48, "ry": 0.56, "rot": -16, "c": "#9ad8ff", "a": 0.74},
            {"x": 0.34, "y": 0.72, "rx": 0.46, "ry": 0.50, "rot": 14, "c": "#5cd6a8", "a": 0.68},
        ],
        "folds": [
            {"pos": 0.30, "w": 0.16, "angle": 62, "c": "#8ef2c4", "a": 0.50},
            {"pos": 0.58, "w": 0.15, "angle": 58, "c": "#7c88f6", "a": 0.48},
            {"pos": 0.78, "w": 0.15, "angle": 64, "c": "#a8e0ff", "a": 0.50},
        ],
    },
}

HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; width: 1600px; height: 900px; overflow: hidden; background: #7b82e8; }
  canvas { display: block; width: 1600px; height: 900px; }
</style>
</head>
<body>
<canvas id="c" width="1600" height="900"></canvas>
<script>
window.renderCover = function(cfg) {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const W = 1600, H = 900;

  function hexToRgb(h) {
    const v = parseInt(h.replace('#', ''), 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  // Offscreen low-res buffer for ultra-smooth bilinear color field + domain-warped folds
  const sw = 400, sh = 225;
  const off = document.createElement('canvas');
  off.width = sw;
  off.height = sh;
  const octx = off.getContext('2d');
  const img = octx.createImageData(sw, sh);
  const d = img.data;

  const c00 = hexToRgb(cfg.base[0]);
  const c10 = hexToRgb(cfg.base[1]);
  const c01 = hexToRgb(cfg.base[2]);
  const c11 = hexToRgb(cfg.base[3]);

  const blobs = cfg.blobs.map(b => ({...b, rgb: hexToRgb(b.c)}));
  const folds = cfg.folds.map(f => ({...f, rgb: hexToRgb(f.c)}));
  const seed = cfg.seed || 1;

  for (let y = 0; y < sh; y++) {
    const ny = y / (sh - 1);
    for (let x = 0; x < sw; x++) {
      const nx = x / (sw - 1);

      // Organic domain warping (like out-of-focus silk / atmospheric currents)
      const warpX = nx + 0.07 * Math.sin(ny * 4.2 + seed * 0.7) + 0.035 * Math.cos((nx + ny) * 6.5 + seed);
      const warpY = ny + 0.06 * Math.cos(nx * 3.8 + seed * 1.1) + 0.03 * Math.sin((nx - ny) * 5.5 + seed * 0.5);

      const u = Math.max(0, Math.min(1, warpX));
      const v = Math.max(0, Math.min(1, warpY));

      // Bilinear base gradient
      let r = (1 - u) * (1 - v) * c00[0] + u * (1 - v) * c10[0] + (1 - u) * v * c01[0] + u * v * c11[0];
      let g = (1 - u) * (1 - v) * c00[1] + u * (1 - v) * c10[1] + (1 - u) * v * c01[1] + u * v * c11[1];
      let b = (1 - u) * (1 - v) * c00[2] + u * (1 - v) * c10[2] + (1 - u) * v * c01[2] + u * v * c11[2];

      // Soft out-of-focus bokeh blobs
      for (let i = 0; i < blobs.length; i++) {
        const bl = blobs[i];
        const ang = (bl.rot * Math.PI) / 180;
        const dx = warpX - bl.x;
        const dy = (warpY - bl.y) * (900 / 1600);
        const rx = dx * Math.cos(ang) - dy * Math.sin(ang);
        const ry = dx * Math.sin(ang) + dy * Math.cos(ang);
        const dist2 = (rx * rx) / (bl.rx * bl.rx) + (ry * ry) / ((bl.ry * (900 / 1600)) ** 2);
        const w = Math.exp(-dist2 * 2.1) * bl.a;
        r = r * (1 - w) + bl.rgb[0] * w;
        g = g * (1 - w) + bl.rgb[1] * w;
        b = b * (1 - w) + bl.rgb[2] * w;
      }

      // Flowing silk / prism light folds
      for (let i = 0; i < folds.length; i++) {
        const fl = folds[i];
        const rad = (fl.angle * Math.PI) / 180;
        const proj = warpX * Math.sin(rad) - (warpY - 0.5) * Math.cos(rad) + 0.045 * Math.sin(warpY * 5.2 + i * 1.9 + seed);
        const diff = (proj - fl.pos) / fl.w;
        const w = Math.exp(-diff * diff * 1.8) * fl.a;
        r = r * (1 - w) + fl.rgb[0] * w;
        g = g * (1 - w) + fl.rgb[1] * w;
        b = b * (1 - w) + fl.rgb[2] * w;
      }

      // Subtle center tonal anchor so crisp white typography pops effortlessly while keeping pastel luminosity
      const cdx = (nx - 0.5) / 0.38;
      const cdy = (ny - 0.5) / 0.32;
      const centerW = Math.exp(-(cdx * cdx + cdy * cdy) * 1.4);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b);
      if (lum > 176) {
        const pull = ((lum - 176) / 255) * 0.42 * centerW;
        r *= (1 - pull);
        g *= (1 - pull);
        b *= (1 - pull * 0.75);
      }

      const idx = (y * sw + x) * 4;
      d[idx]     = Math.max(0, Math.min(255, Math.round(r)));
      d[idx + 1] = Math.max(0, Math.min(255, Math.round(g)));
      d[idx + 2] = Math.max(0, Math.min(255, Math.round(b)));
      d[idx + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);

  // Upscale smoothly from low-res buffer (pure 2D, no GPU filter readback glitch)
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(off, 0, 0, W, H);

  // Add fine photographic film grain (matching the OpenAI reference texture)
  const full = ctx.getImageData(0, 0, W, H);
  const fd = full.data;
  let s = (seed * 2654435761) >>> 0;
  for (let i = 0; i < fd.length; i += 4) {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const u1 = ((t ^ (t >>> 14)) >>> 0) / 4294967296;

    s = (s + 0x6d2b79f5) | 0;
    t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const u2 = ((t ^ (t >>> 14)) >>> 0) / 4294967296;

    // Triangular distribution noise in [-1, 1], amplitude ~8.5 levels
    const n = (u1 + u2 - 1.0) * 8.5;
    fd[i]     = Math.max(0, Math.min(255, fd[i] + n));
    fd[i + 1] = Math.max(0, Math.min(255, fd[i + 1] + n));
    fd[i + 2] = Math.max(0, Math.min(255, fd[i + 2] + n * 1.05));
  }
  ctx.putImageData(full, 0, 0);
};
</script>
</body>
</html>
"""


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    ROOT_DIR.mkdir(parents=True, exist_ok=True)
    tmp_html = Path("/tmp/openai_cover_gen.html")
    tmp_html.write_text(HTML_TEMPLATE, encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1600, "height": 900, "device_scale_factor": 1})
        page.goto(f"file://{tmp_html}")
        for slug, cfg in COVERS.items():
            page.evaluate("cfg => window.renderCover(cfg)", cfg)
            dest = OUT_DIR / f"{slug}.jpg"
            page.screenshot(path=str(dest), type="jpeg", quality=92)
            shutil.copy2(dest, ROOT_DIR / f"{slug}.jpg")
            print(f"Generated {slug}.jpg ({dest.stat().st_size // 1024} KB)")
        browser.close()


if __name__ == "__main__":
    main()
