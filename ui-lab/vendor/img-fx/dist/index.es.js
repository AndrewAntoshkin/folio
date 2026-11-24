import { jsxs as pt, jsx as Le } from "react/jsx-runtime";
import { forwardRef as ht, useRef as ee, useState as Ve, useImperativeHandle as gt, useLayoutEffect as je, useEffect as de, useMemo as ke } from "react";
import * as ne from "three";
const mt = {
  name: "pixels-mechanic",
  modes: {
    dark: {
      theme: "dark",
      effectIndex: 11,
      colors: ["#949494", "#2d2d2d", "#333333", "#3a3a3a", "#0b0b0b", "#060606", "#2f2f2f"],
      alphas: [1, 1, 1, 1, 1, 1, 1],
      cardBg: "#0f0f0f",
      dotMode: 1,
      pixelConfig: {
        cellSize: 0.22,
        gap: 0.14,
        dotOpacity: 0.68,
        dotSize: 0.8,
        dotSoftness: 0.1,
        hlScale: 0.8,
        fillOpacity: 0.44,
        edgeFade: 24,
        fadeStr: 1
      },
      dotConfig: {
        cellSize: 0.58,
        gap: 0,
        dotOpacity: 1,
        dotSize: 0.22,
        dotSoftness: 0.1,
        hlScale: 0.26,
        fillOpacity: 0,
        edgeFade: 34,
        fadeStr: 0.34
      },
      direction: 0,
      speed: 0.7,
      intensity: 1,
      scale: 1.4,
      softness: 0.76,
      distortion: 0.3,
      flicker: 0.5,
      complexity: 0.2,
      shape: 0.52,
      blur: 1,
      highlight: 0.32,
      vignette: 0.26,
      vigOpacity: 1,
      shaderOpacity: 1,
      revealConfig: {
        duration: 3,
        easing: "easeOutCubic",
        maskShape: "shaderColor4",
        softness: 0.5,
        blur: 0,
        pixDuration: 2.65,
        pixEasing: "easeOutCubic",
        dotDuration: 2.05,
        dotEasing: "easeOutCubic"
      },
      effect: "Nebula"
    },
    light: {
      theme: "light",
      effectIndex: 11,
      colors: ["#e0e0e0", "#fdfdfd", "#f2f2f2", "#0a0a0a", "#dcdcdc", "#f5f5f5", "#f5f5f5"],
      alphas: [1, 1, 1, 1, 1, 1, 1],
      cardBg: "#f5f5f5",
      dotMode: 1,
      pixelConfig: {
        cellSize: 0.22,
        gap: 0.14,
        dotOpacity: 0.68,
        dotSize: 0.8,
        dotSoftness: 0.1,
        hlScale: 0.8,
        fillOpacity: 0.18,
        edgeFade: 20,
        fadeStr: 1
      },
      dotConfig: {
        cellSize: 0.58,
        gap: 0,
        dotOpacity: 1,
        dotSize: 0.22,
        dotSoftness: 0.1,
        hlScale: 0.26,
        fillOpacity: 0,
        edgeFade: 34,
        fadeStr: 0.34
      },
      direction: 25,
      speed: 0.55,
      intensity: 0.85,
      scale: 0.9,
      softness: 0.76,
      distortion: 0.3,
      flicker: 0.5,
      complexity: 0.2,
      shape: 0.52,
      blur: 1,
      highlight: 0.92,
      vignette: 0,
      vigOpacity: 0,
      shaderOpacity: 1,
      revealConfig: {
        duration: 3,
        easing: "easeOutCubic",
        maskShape: "shaderColor3",
        softness: 0.5,
        blur: 0,
        pixDuration: 2.6,
        pixEasing: "easeOutCubic",
        dotDuration: 2.05,
        dotEasing: "easeOutCubic"
      },
      effect: "Nebula"
    }
  }
}, vt = {
  name: "pixels-organic",
  modes: {
    dark: {
      theme: "dark",
      effectIndex: 22,
      colors: ["#0f0f0f", "#4a4949", "#b9b9b9", "#0f0f0f", "#d8d8d8", "#0f0f0f", "#2f2f2f"],
      alphas: [1, 1, 1, 1, 1, 1, 1],
      cardBg: "#0f0f0f",
      dotMode: 1,
      pixelConfig: {
        cellSize: 0.22,
        gap: 0.14,
        dotOpacity: 0.68,
        dotSize: 0.8,
        dotSoftness: 0.1,
        hlScale: 0.8,
        fillOpacity: 0.44,
        edgeFade: 24,
        fadeStr: 1
      },
      dotConfig: {
        cellSize: 0.58,
        gap: 0,
        dotOpacity: 1,
        dotSize: 0.22,
        dotSoftness: 0.1,
        hlScale: 0.26,
        fillOpacity: 0,
        edgeFade: 34,
        fadeStr: 0.34
      },
      direction: 0,
      speed: 0.3,
      intensity: 1,
      scale: 1,
      softness: 0.76,
      distortion: 0.3,
      complexity: 0.2,
      shape: 0.52,
      blur: 1,
      highlight: 0.2,
      vignette: 0.26,
      vigOpacity: 1,
      shaderOpacity: 1,
      revealConfig: {
        duration: 3,
        easing: "easeOutCubic",
        maskShape: "shaderColor4",
        softness: 0.5,
        blur: 0,
        pixDuration: 2.65,
        pixEasing: "easeOutCubic",
        dotDuration: 2.05,
        dotEasing: "easeOutCubic"
      },
      effect: "Chromium Flow"
    },
    light: {
      theme: "light",
      effectIndex: 22,
      colors: ["#e3e3e3", "#ffffff", "#f5f5f5", "#f5f5f5", "#080808", "#f5f5f5", "#f5f5f5"],
      alphas: [1, 1, 1, 1, 1, 1, 1],
      cardBg: "#f5f5f5",
      dotMode: 1,
      pixelConfig: {
        cellSize: 0.22,
        gap: 0.14,
        dotOpacity: 0.68,
        dotSize: 0.8,
        dotSoftness: 0.1,
        hlScale: 0.8,
        fillOpacity: 0.18,
        edgeFade: 20,
        fadeStr: 1
      },
      dotConfig: {
        cellSize: 0.58,
        gap: 0,
        dotOpacity: 1,
        dotSize: 0.22,
        dotSoftness: 0.1,
        hlScale: 0.26,
        fillOpacity: 0,
        edgeFade: 34,
        fadeStr: 0.34
      },
      direction: 25,
      speed: 0.3,
      intensity: 0.85,
      scale: 1,
      softness: 0.76,
      distortion: 0.3,
      complexity: 0.2,
      shape: 0.52,
      blur: 1,
      highlight: 0.7,
      vignette: 0,
      vigOpacity: 0,
      shaderOpacity: 1,
      revealConfig: {
        duration: 3,
        easing: "easeOutCubic",
        maskShape: "shaderColor4",
        softness: 0.5,
        blur: 0,
        pixDuration: 2.55,
        pixEasing: "easeOutCubic",
        dotDuration: 2.05,
        dotEasing: "easeOutCubic"
      },
      effect: "Chromium Flow"
    }
  }
}, xt = {
  name: "sweep-gradient",
  modes: {
    dark: {
      theme: "dark",
      effectIndex: 25,
      colors: ["#0f0f0f", "#0f0f0f", "#282828", "#3a3a3a", "#525252", "#0f0f0f", "#0f0f0f"],
      alphas: [1, 1, 1, 1, 1, 1, 1],
      cardBg: "#0f0f0f",
      dotMode: 1,
      pixelConfig: {
        cellSize: 0.22,
        gap: 0.14,
        dotOpacity: 0.68,
        dotSize: 0.8,
        dotSoftness: 0.1,
        hlScale: 0.8,
        fillOpacity: 0.44,
        edgeFade: 24,
        fadeStr: 1
      },
      dotConfig: {
        cellSize: 0.58,
        gap: 0,
        dotOpacity: 1,
        dotSize: 0.22,
        dotSoftness: 0.1,
        hlScale: 0.26,
        fillOpacity: 0,
        edgeFade: 34,
        fadeStr: 0.34
      },
      direction: 0,
      speed: 2.65,
      intensity: 1,
      scale: 1,
      softness: 0.76,
      distortion: 0.3,
      flicker: 0.5,
      complexity: 0.2,
      shape: 0.52,
      blur: 1,
      highlight: 0.32,
      vignette: 0.26,
      vigOpacity: 1,
      shaderOpacity: 1,
      sweepEase: 1,
      revealConfig: {
        duration: 3,
        easing: "easeOutCubic",
        maskShape: "gradientSweep",
        softness: 0.5,
        blur: 0,
        pixDuration: 2.65,
        pixEasing: "easeOutCubic",
        dotDuration: 2.05,
        dotEasing: "easeOutCubic"
      },
      effect: "Gradient Sweep"
    },
    light: {
      theme: "light",
      effectIndex: 25,
      colors: ["#f5f5f5", "#f5f5f5", "#ededed", "#eaeaea", "#d2d2d2", "#f5f5f5", "#f5f5f5"],
      alphas: [1, 1, 1, 1, 1, 1, 1],
      cardBg: "#f5f5f5",
      dotMode: 1,
      pixelConfig: {
        cellSize: 0.22,
        gap: 0.14,
        dotOpacity: 0.68,
        dotSize: 0.8,
        dotSoftness: 0.1,
        hlScale: 0.8,
        fillOpacity: 0.18,
        edgeFade: 20,
        fadeStr: 1
      },
      dotConfig: {
        cellSize: 0.58,
        gap: 0,
        dotOpacity: 1,
        dotSize: 0.22,
        dotSoftness: 0.1,
        hlScale: 0.26,
        fillOpacity: 0,
        edgeFade: 34,
        fadeStr: 0.34
      },
      direction: 0,
      speed: 2.65,
      intensity: 0.85,
      scale: 1,
      softness: 0.76,
      distortion: 0.3,
      flicker: 0.5,
      complexity: 0.2,
      shape: 0.52,
      blur: 1,
      highlight: 0.92,
      vignette: 0,
      vigOpacity: 0,
      shaderOpacity: 1,
      sweepEase: 1,
      revealConfig: {
        duration: 3,
        easing: "easeOutCubic",
        maskShape: "gradientSweep",
        softness: 0.5,
        blur: 0,
        pixDuration: 2.6,
        pixEasing: "easeOutCubic",
        dotDuration: 2.05,
        dotEasing: "easeOutCubic"
      },
      effect: "Gradient Sweep"
    }
  }
}, wt = {
  "pixels-organic": vt,
  "pixels-mechanic": mt,
  "sweep-gradient": xt
}, We = wt;
function pa(e) {
  let t = e.replace("#", "");
  return t.length === 3 && (t = t[0] + t[0] + t[1] + t[1] + t[2] + t[2]), [
    parseInt(t.slice(0, 2), 16) / 255,
    parseInt(t.slice(2, 4), 16) / 255,
    parseInt(t.slice(4, 6), 16) / 255
  ];
}
let Re;
function yt() {
  if (Re !== void 0) return Re;
  if (typeof document > "u")
    return Re = null, null;
  const e = document.createElement("canvas");
  return e.width = 1, e.height = 1, Re = e.getContext("2d"), Re;
}
function be(e) {
  if (typeof e != "string" || e.length === 0) return [0, 0, 0];
  if (e[0] === "#") {
    let l = e.slice(1);
    if (l.length === 3 && (l = l[0] + l[0] + l[1] + l[1] + l[2] + l[2]), (l.length === 6 || l.length === 8) && /^[0-9a-fA-F]+$/.test(l))
      return [
        parseInt(l.slice(0, 2), 16) / 255,
        parseInt(l.slice(2, 4), 16) / 255,
        parseInt(l.slice(4, 6), 16) / 255
      ];
  }
  const t = yt();
  if (!t) return [0, 0, 0];
  t.fillStyle = "#000000", t.fillStyle = e;
  const a = t.fillStyle;
  t.fillStyle = "#ffffff", t.fillStyle = e;
  const n = t.fillStyle;
  if (a !== n)
    return [0, 0, 0];
  const o = a;
  if (o[0] === "#")
    return [
      parseInt(o.slice(1, 3), 16) / 255,
      parseInt(o.slice(3, 5), 16) / 255,
      parseInt(o.slice(5, 7), 16) / 255
    ];
  const i = o.match(/^rgba?\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)/);
  if (i) {
    const l = (c) => Math.max(0, Math.min(255, c)) / 255;
    return [l(parseFloat(i[1])), l(parseFloat(i[2])), l(parseFloat(i[3]))];
  }
  return [0, 0, 0];
}
const bt = (
  /* glsl */
  `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`
), _t = (
  /* glsl */
  `
  uniform vec2 u_resolution;
  uniform float u_dpr;
  uniform float u_time;
  uniform vec3 u_color1, u_color2, u_color3, u_color4, u_color5, u_color6, u_color7, u_cardBg;
  uniform float u_alpha1, u_alpha2, u_alpha3, u_alpha4, u_alpha5, u_alpha6, u_alpha7;
  uniform float u_speed, u_intensity, u_scale, u_direction;
  uniform float u_softness, u_distortion, u_complexity, u_shape, u_flicker;
  uniform float u_vignette, u_vigOpacity, u_blur, u_highlight, u_shaderOpacity;
  uniform float u_cellSize, u_gap, u_dotSize, u_dotSoftness, u_dotOpacity, u_hlScale, u_fillOpacity, u_edgeFade, u_fadeStr;
  uniform float u_dotMode;
  uniform int u_effect;
  uniform int u_sweepEase;

  // Reference card edge length (CSS px) at which the original preset cellSize
  // gives the canonical cell count. Cell PIXEL size stays constant across card
  // sizes by scaling gridSize proportionally to (currentCssDim / REF_DIM).
  const float REF_DIM = 320.0;

  /** Anisotropic cell count: returns the number of cells along x and y so that
   *  each cell stays SQUARE in screen space regardless of the card's aspect
   *  ratio. A 600×300 card gets twice as many cells horizontally as vertically;
   *  cells stay the same physical size as on a 300×300 card. */
  vec2 gridCounts(float baseCount) {
    vec2 cssRes = u_resolution / max(u_dpr, 0.0001);
    return max(vec2(2.0), floor(baseCount * cssRes / REF_DIM));
  }

  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec2 mod289v2(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289((x * 34.0 + 1.0) * x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289v2(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x_) - 0.5;
    vec3 ox = floor(x_ + 0.5);
    vec3 a0 = x_ - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 p, float oct) {
    float val = 0.0, amp = 0.5;
    int n = int(oct);
    for (int i = 0; i < 4; i++) {
      if (i >= n) break;
      val += amp * snoise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return val;
  }

  float nfbm(vec2 p) { return fbm(p, 2.0 + u_complexity * 2.0); }

  vec3 palette(float t) {
    t = clamp(t, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);
    float k = 64.0;
    float w1 = u_alpha1 * exp(-k * t * t);
    float w2 = u_alpha2 * exp(-k * (t - 0.25) * (t - 0.25));
    float w3 = u_alpha3 * exp(-k * (t - 0.5)  * (t - 0.5));
    float w4 = u_alpha4 * exp(-k * (t - 0.75) * (t - 0.75));
    float w5 = u_alpha5 * exp(-k * (t - 1.0)  * (t - 1.0));
    float total = w1 + w2 + w3 + w4 + w5 + 0.0001;
    return (u_color1*w1 + u_color2*w2 + u_color3*w3 + u_color4*w4 + u_color5*w5) / total;
  }

  vec3 softBlend(float a, float b, float c) {
    a = clamp(a, 0.0, 1.0); a *= a;
    b = clamp(b, 0.0, 1.0); b *= b;
    c = clamp(c, 0.0, 1.0); c *= c;
    float d = clamp(a * 0.7 + c * 0.3, 0.0, 1.0); d *= d;
    float e = clamp(b * 0.5 + c * 0.5, 0.0, 1.0); e *= e;
    a *= u_alpha1; b *= u_alpha2; c *= u_alpha3; d *= u_alpha4; e *= u_alpha5;
    float total = a + b + c + d + e;
    float floorW = max(0.001 - total, 0.0);
    vec3 fallback = (u_color1 + u_color2 + u_color3 + u_color4 + u_color5) * 0.2;
    return (u_color1 * a + u_color2 * b + u_color3 * c + u_color4 * d + u_color5 * e + fallback * floorW) / (total + floorW);
  }

  vec2 warp(vec2 p, float t) {
    float str = u_distortion * 2.0;
    return vec2(
      nfbm(p + vec2(t * 0.1, 0.0)),
      nfbm(p + vec2(0.0, t * 0.12) + 5.0)
    ) * str;
  }

  float sweepEase(float x) {
    if (u_sweepEase == 1) return x * x * (3.0 - 2.0 * x);
    if (u_sweepEase == 2) {
      float p = 1.0 - x;
      return 1.0 - p * p * p;
    }
    if (u_sweepEase == 3) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) * 0.5;
    }
    if (u_sweepEase == 4) return 1.0 - pow(2.0, -10.0 * x) * (1.0 - x);
    return x;
  }

  float blob(vec2 p, vec2 center, float radius) {
    float r = radius * (0.5 + u_shape * 0.8);
    float soft = 0.05 + u_softness * 0.4;
    return smoothstep(r + soft, r - soft * 0.5, length(p - center));
  }

  vec3 computeEffect(vec2 uv, float aspect, float t, float dist, float soft, float cpx, float shp) {
    vec2 p = (uv - 0.5) * u_scale;
    p.x *= aspect;
    p += vec2(cos(u_direction), sin(u_direction)) * t * 0.15;
    vec3 col = vec3(0.0);

    if (u_effect == 0) {
      float val = sin(p.x * 3.0 + t) * 0.5 + 0.5;
      val += sin(p.y * 2.0 + t * 0.7) * 0.3;
      val += sin((p.x + p.y) * (1.0 + cpx * 3.0) - t * 0.5) * 0.2;
      vec2 w = warp(p, t);
      val += (w.x + w.y) * 0.15;
      col = palette(clamp(val * u_intensity, 0.0, 1.0));

    } else if (u_effect == 1) {
      float freq = 3.0 + cpx * 8.0;
      float val = 0.0;
      val += sin(p.x * freq + t);
      val += sin(p.y * freq + t * 1.3);
      val += sin((p.x + p.y) * freq * 0.7 + t * 0.7);
      val += sin(length(p) * freq * 0.8 - t * 1.5);
      vec2 w = warp(p, t);
      val += (w.x + w.y) * dist;
      val = val * 0.2 * u_intensity + 0.5;
      col = palette(clamp(val, 0.0, 1.0));

    } else if (u_effect == 2) {
      vec2 q = vec2(nfbm(p + t * 0.3), nfbm(p + vec2(5.2, 1.3) + t * 0.2));
      float val = nfbm(p + q * (1.0 + dist * 3.0) + t * 0.1);
      val = val * u_intensity * 0.5 + 0.5;
      col = palette(clamp(val, 0.0, 1.0));

    } else if (u_effect == 3) {
      float d = length(p);
      float val = sin(d * (3.0 + cpx * 6.0) - t * 2.0) * 0.5 + 0.5;
      val *= exp(-d * (0.3 + shp * 1.0));
      val += sin(atan(p.y, p.x) * (1.5 + cpx * 2.0) + t) * 0.15;
      col = palette(clamp(val * u_intensity, 0.0, 1.0));

    } else if (u_effect == 4) {
      vec2 q = vec2(nfbm(p * (0.5 + shp * 0.6) + vec2(t * 0.12, t * 0.08)), nfbm(p * (0.5 + shp * 0.6) + vec2(t * 0.09, -t * 0.11)));
      vec2 r = vec2(nfbm(p + q * (1.0 + dist * 2.0) + vec2(1.7, 9.2) + t * 0.06), nfbm(p + q * (1.0 + dist * 2.0) + vec2(8.3, 2.8) - t * 0.08));
      float val = nfbm(p + r * 2.0);
      float lo = -0.3 - soft * 0.5;
      float hi = 0.5 + soft * 0.5;
      val = smoothstep(lo, hi, val * u_intensity);
      col = palette(val);

    } else if (u_effect == 5) {
      float n1 = nfbm(vec2(p.x * 0.5 + t * 0.15, p.y * (1.0 + cpx * 1.5)));
      float n2 = nfbm(vec2(p.x * 0.3 - t * 0.1, p.y * (0.8 + cpx * 1.0) + 3.0));
      float band = sin(p.y * 3.0 + n1 * (1.0 + dist * 2.0) + t * 0.3) * 0.5 + 0.5;
      float shimmer = sin(p.y * 4.0 + n2 * 1.5 - t * 0.2) * 0.5 + 0.5;
      float w1 = band * (0.5 + 0.5 * sin(p.x * 1.5 + t * 0.2 + n1));
      float w2 = shimmer * (0.5 + 0.5 * cos(p.x * 1.0 - t * 0.15 + n2));
      float w3 = nfbm(p * 0.5 + t * 0.05) * 0.5 + 0.5;
      col = softBlend(w1 * u_intensity, w2 * u_intensity, w3 * 0.6 * u_intensity);

    } else if (u_effect == 6) {
      vec2 wp = warp(p * 1.2, t);
      float blobR = 0.15 + shp * 0.2;
      float b1 = blob(p, vec2(sin(t * 0.3) * 0.3, cos(t * 0.2) * 0.4) + wp * 0.2, blobR);
      float b2 = blob(p, vec2(cos(t * 0.25) * 0.4, sin(t * 0.35) * 0.3 - 0.2) + wp * 0.15, blobR * 1.2);
      float b3 = blob(p, vec2(-sin(t * 0.2) * 0.3, -cos(t * 0.3) * 0.35) + wp * 0.18, blobR);
      float bg = nfbm(p * 0.5 + t * 0.05) * 0.3 + 0.15;
      col = softBlend((b1 + bg * 0.5) * u_intensity, (b2 + bg * 0.3) * u_intensity, (b3 + bg * 0.4) * u_intensity);

    } else if (u_effect == 7) {
      float sz = 0.4 + shp * 0.6;
      float sigma = sz * sz * 2.0;
      vec2 a1 = vec2(-0.45 + sin(t * 0.07) * 0.06, 0.45 + cos(t * 0.09) * 0.05);
      vec2 a2 = vec2(0.45 + cos(t * 0.08) * 0.06, 0.45 + sin(t * 0.06) * 0.05);
      vec2 a3 = vec2(0.0 + sin(t * 0.05) * 0.1, 0.0 + cos(t * 0.07) * 0.1);
      vec2 a4 = vec2(-0.4 + cos(t * 0.06) * 0.07, -0.3 + sin(t * 0.08) * 0.06);
      vec2 a5 = vec2(0.4 + sin(t * 0.07) * 0.06, -0.4 + cos(t * 0.05) * 0.06);
      float g1 = exp(-dot(p - a1, p - a1) / sigma);
      float g2 = exp(-dot(p - a2, p - a2) / sigma);
      float g3 = exp(-dot(p - a3, p - a3) / sigma);
      float g4 = exp(-dot(p - a4, p - a4) / sigma);
      float g5 = exp(-dot(p - a5, p - a5) / sigma);
      float nudge = dist > 0.01 ? snoise(p * (0.5 + cpx) + t * 0.04) * dist * 0.08 : 0.0;
      float w1 = (g1 + g4 + nudge) * u_intensity;
      float w2 = (g2 + g5 + nudge) * u_intensity;
      float w3 = (g3 + nudge) * u_intensity;
      col = softBlend(w1, w2, w3);

    } else if (u_effect == 8) {
      vec2 w1 = vec2(nfbm(p * (0.7 + cpx * 0.5) + t * 0.1), nfbm(p * (0.7 + cpx * 0.5) + vec2(3.3, 7.7) + t * 0.08));
      vec2 w2 = vec2(nfbm(p * 0.6 + w1 * (1.0 + dist) + t * 0.06), nfbm(p * 0.6 + w1 * (1.0 + dist) + vec2(1.7, 4.2) - t * 0.07));
      float f1 = nfbm(p + w2 * 1.5);
      float f2 = nfbm(p + w2 * 1.5 + vec2(4.1, 2.3));
      float f3 = nfbm(p + w2 * 1.5 + vec2(7.5, 6.1));
      col = softBlend((f1 * 0.5 + 0.5) * u_intensity, (f2 * 0.5 + 0.5) * u_intensity, (f3 * 0.5 + 0.5) * u_intensity);

    } else if (u_effect == 9) {
      vec2 sw = vec2(sin(p.y * 2.0 + t * 0.3) * 0.15 + snoise(p * 1.5 + t * 0.15) * dist * 0.3, cos(p.x * 1.8 + t * 0.25) * 0.15 + snoise(p * 1.5 + vec2(5.0, 0.0) + t * 0.12) * dist * 0.3);
      vec2 wp = p + sw;
      float caustic = (snoise(wp * (1.5 + cpx * 2.0) + t * 0.2) * 0.5 + 0.5) + (snoise(wp * (2.0 + cpx * 2.0) - t * 0.15) * 0.5 + 0.5) * 0.5;
      caustic = caustic / 1.5;
      float depth = nfbm(vec2(p.x * 0.3, p.y * 0.8) + t * 0.05) * 0.5 + 0.5;
      col = softBlend(depth * u_intensity, (1.0 - depth) * u_intensity, caustic * u_intensity);

    } else if (u_effect == 10) {
      float angle = 0.6 + shp * 1.2;
      float ca = cos(angle), sa = sin(angle);
      vec2 rp = vec2(p.x * ca - p.y * sa, p.x * sa + p.y * ca);
      float n1 = nfbm(rp * 0.8 + t * 0.12) * (1.0 + dist * 2.0);
      float n2 = nfbm(rp * 0.6 + vec2(3.0, 0.0) + t * 0.1) * (1.0 + dist * 1.5);
      float wave = sin(rp.x * (2.0 + cpx * 2.0) + n1 + t * 0.3);
      float wave2 = sin(rp.x * (1.5 + cpx * 1.5) + n2 - t * 0.2);
      float ribbon1 = exp(-2.0 * (rp.y - wave * 0.35) * (rp.y - wave * 0.35)) * u_intensity;
      float ribbon2 = exp(-2.0 * (rp.y - 0.15 - wave2 * 0.3) * (rp.y - 0.15 - wave2 * 0.3)) * u_intensity;
      float bg = nfbm(p * 0.4 + t * 0.03) * 0.5 + 0.5;
      col = softBlend(ribbon1, ribbon2, bg * 0.5 * u_intensity);

    } else if (u_effect == 11) {
      vec2 q = vec2(nfbm(p * 0.5 + vec2(t * 0.05, 0.0)), nfbm(p * 0.5 + vec2(0.0, t * 0.07)));
      vec2 r = vec2(nfbm(p * 0.6 + q * (1.0 + dist * 1.5) + vec2(1.7, 9.2) + t * 0.03), nfbm(p * 0.6 + q * (1.0 + dist * 1.5) + vec2(8.3, 2.8) + t * 0.04));
      float f = nfbm(p + r * 1.5);
      float f2 = nfbm(p * 0.7 + r + vec2(3.0, 7.0));
      col = softBlend((f * 0.5 + 0.5) * u_intensity, (f2 * 0.5 + 0.5) * u_intensity, (nfbm(p * 0.4 - t * 0.02) * 0.5 + 0.5) * u_intensity);

    } else if (u_effect == 12) {
      vec2 w = warp(p * 0.5, t * 0.7);
      float fold1 = sin(p.x * (1.5 + cpx * 2.0) + w.x * 1.5 + t * 0.2) * 0.5 + 0.5;
      float fold2 = sin(p.y * (1.2 + cpx * 1.5) + w.y * 1.5 - t * 0.15) * 0.5 + 0.5;
      float fold3 = sin((p.x - p.y) * (0.8 + cpx * 0.8) + (w.x + w.y) + t * 0.1) * 0.5 + 0.5;
      col = softBlend(fold1 * u_intensity, fold2 * u_intensity, fold3 * 0.7 * u_intensity);

    } else if (u_effect == 13) {
      float spread = 0.25 + shp * 0.35;
      vec2 w = warp(p, t * 0.5);
      vec2 c1 = vec2(sin(t * 0.08) * spread, cos(t * 0.11) * spread) + w * 0.15;
      vec2 c2 = vec2(cos(t * 0.09) * spread * 1.3, sin(t * 0.07) * spread) + w * 0.12;
      vec2 c3 = vec2(-sin(t * 0.1) * spread, -cos(t * 0.08) * spread * 1.2) + w * 0.1;
      float falloff = 0.3 + soft * 0.7;
      float d1 = 1.0 - smoothstep(0.0, falloff, length(p - c1 + w * dist * 0.3));
      float d2 = 1.0 - smoothstep(0.0, falloff, length(p - c2 + w * dist * 0.25));
      float d3 = 1.0 - smoothstep(0.0, falloff, length(p - c3 + w * dist * 0.2));
      float detail = nfbm(p * 2.0 + t * 0.05) * cpx * 0.3;
      col = softBlend((d1 + detail) * u_intensity, (d2 + detail) * u_intensity, (d3 + detail) * u_intensity);

    } else if (u_effect == 14) {
      vec2 w = warp(p * 0.6, t * 0.6);
      float angle = atan(p.y + w.y * dist, p.x + w.x * dist);
      float radius = length(p);
      float field1 = sin(angle * (2.0 + cpx * 4.0) + radius * (3.0 + cpx * 3.0) + t * 0.4 + nfbm(p + t * 0.1) * dist * 2.0) * 0.5 + 0.5;
      float field2 = sin(angle * (1.5 + cpx * 2.5) - radius * 2.0 - t * 0.3 + nfbm(p * 0.6 + t * 0.08) * dist * 1.5) * 0.5 + 0.5;
      float bg = nfbm(p * 0.3 + t * 0.03) * 0.5 + 0.5;
      col = softBlend(field1 * u_intensity, field2 * u_intensity, bg * 0.5 * u_intensity);

    } else if (u_effect == 15) {
      vec2 drift = vec2(t * 0.06, t * 0.03);
      float c1 = nfbm((p + drift) * (0.4 + cpx * 0.5)) * 0.5 + 0.5;
      float c2 = nfbm((p + drift + vec2(3.7, 1.2)) * (0.35 + cpx * 0.4)) * 0.5 + 0.5;
      float c3 = nfbm((p + drift + vec2(7.1, 4.5)) * (0.3 + cpx * 0.35)) * 0.5 + 0.5;
      vec2 w = warp(p * 0.2, t * 0.4);
      c1 += w.x * dist * 0.3;
      c2 += w.y * dist * 0.25;
      col = softBlend(c1 * u_intensity, c2 * u_intensity, c3 * u_intensity);

    } else if (u_effect == 16) {
      vec2 w = warp(vec2(p.x * 0.3, p.y * 0.6), t * 0.5);
      float c1 = sin(p.x * (1.5 + cpx * 2.0) + w.x * (1.0 + dist * 2.0) + t * 0.15) * 0.5 + 0.5;
      float c2 = sin(p.x * (1.0 + cpx * 1.5) + w.y * (1.0 + dist * 1.5) - t * 0.12 + 2.0) * 0.5 + 0.5;
      float c3 = sin(p.x * (0.8 + cpx * 1.0) + (w.x + w.y) * 0.5 * (1.0 + dist) + t * 0.08 + 4.0) * 0.5 + 0.5;
      float fade = nfbm(vec2(p.x * 0.3, p.y * 0.5) + t * 0.03) * 0.5 + 0.5;
      col = softBlend(c1 * fade * u_intensity, c2 * fade * u_intensity, c3 * (1.0 - fade * 0.4) * u_intensity * 0.7);

    } else if (u_effect == 17) {
      vec2 w = warp(p * 0.8, t * 0.6);
      vec2 w2 = warp(p * 0.5 + w * 0.4, t * 0.4);
      float r1 = (snoise((p + w * dist * 0.5) * (1.5 + cpx * 2.0) + t * 0.1) * 0.5 + 0.5) * u_intensity;
      float r2 = (snoise((p + w2 * dist * 0.4) * (1.2 + cpx * 1.5) + t * 0.08 + 3.0) * 0.5 + 0.5) * u_intensity;
      float r3 = (snoise((p + (w + w2) * dist * 0.3) * (0.8 + cpx * 1.0) - t * 0.06 + 7.0) * 0.5 + 0.5) * u_intensity;
      col = softBlend(r1, r2, r3);

    } else if (u_effect == 18) {
      vec2 w = warp(p * 0.5, t * 0.5);
      float blobSize = 0.2 + shp * 0.3;
      float total1 = 0.0, total2 = 0.0;
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        vec2 c1 = vec2(sin(t * 0.1 + fi * 2.1) * 0.4, cos(t * 0.13 + fi * 1.7) * 0.35) + w * dist * 0.15;
        vec2 c2 = vec2(cos(t * 0.12 + fi * 1.9) * 0.35, sin(t * 0.09 + fi * 2.3) * 0.4) + w * dist * 0.12;
        total1 += blobSize * blobSize / (dot(p - c1, p - c1) + 0.02);
        total2 += blobSize * blobSize / (dot(p - c2, p - c2) + 0.02);
      }
      total1 = clamp(total1 * 0.25, 0.0, 1.0);
      total2 = clamp(total2 * 0.25, 0.0, 1.0);
      float total3 = nfbm(p + w * dist * 0.3 + t * 0.05) * 0.5 + 0.5;
      col = softBlend(total1 * u_intensity, total2 * u_intensity, total3 * 0.7 * u_intensity);

    } else if (u_effect == 19) {
      vec2 w = warp(p * 0.4, t * 0.4);
      float angle = atan(p.y, p.x);
      float radius = length(p);
      float s1 = sin(angle * (1.5 + cpx * 2.0) + radius * (3.0 + cpx * 3.0) + t * 0.3 + w.x * dist * 1.5) * 0.5 + 0.5;
      float s2 = sin(angle * (1.2 + cpx * 1.5) - radius * (2.5 + cpx * 2.5) - t * 0.25 + w.y * dist * 1.5 + 1.5) * 0.5 + 0.5;
      float s3 = sin((angle + 3.14) * (0.8 + cpx) + radius * (2.0 + cpx * 2.0) + t * 0.15 + (w.x + w.y) * dist) * 0.5 + 0.5;
      float fade = exp(-radius * (0.5 - shp * 0.3));
      col = softBlend(s1 * fade * u_intensity, s2 * fade * u_intensity, s3 * fade * 0.7 * u_intensity);

    } else if (u_effect == 20) {
      vec2 w = warp(p * 0.5, t * 0.4);
      vec2 wp = p + w * (0.4 + dist * 0.6);
      float scale = 0.6 + cpx * 0.8;
      float h  = nfbm(wp * scale + t * 0.08);
      float eps = 0.06;
      float hx = nfbm((wp + vec2(eps, 0.0)) * scale + t * 0.08) - h;
      float hy = nfbm((wp + vec2(0.0, eps)) * scale + t * 0.08) - h;
      vec3 n = normalize(vec3(-hx * 6.0, -hy * 6.0, 1.0));
      vec3 lightDir = normalize(vec3(0.55, 0.65, 0.8));
      float light = max(dot(n, lightDir), 0.0);
      float spec = pow(light, 6.0 + shp * 26.0);
      float diffuse = light * 0.6 + 0.35;
      float fres = pow(1.0 - max(n.z, 0.0), 2.0);
      float w1 = (diffuse + spec * 0.5) * u_intensity;
      float w2 = (h * 0.5 + 0.5 + spec * 0.3 + fres * 0.3) * u_intensity;
      float w3 = (spec * 1.4 + fres * 0.5) * u_intensity;
      col = softBlend(w1, w2, w3);

    } else if (u_effect == 21) {
      vec2 w = warp(p * 0.4, t * 0.3);
      float angle = 0.2 + shp * 1.3;
      float ca = cos(angle), sa = sin(angle);
      vec2 rp = vec2(p.x * ca - p.y * sa, p.x * sa + p.y * ca);
      float band = sin(rp.y * (3.0 + cpx * 5.0) + w.x * (1.0 + dist * 2.5) + t * 0.35);
      float ridge = 1.0 - abs(band);
      ridge = pow(ridge, 5.0 + shp * 10.0);
      float band2 = sin(rp.y * (2.0 + cpx * 3.0) + w.y * (0.8 + dist * 2.0) - t * 0.22 + 1.4);
      float ridge2 = 1.0 - abs(band2);
      ridge2 = pow(ridge2, 3.0 + shp * 8.0);
      float bg = nfbm(p * 0.45 + t * 0.05) * 0.5 + 0.5;
      float w1 = (ridge * 1.4 + bg * 0.25) * u_intensity;
      float w2 = (ridge2 * 1.0 + bg * 0.45) * u_intensity;
      float w3 = (ridge * 0.5 + ridge2 * 0.5) * u_intensity * 0.8;
      col = softBlend(w1, w2, w3);

    } else if (u_effect == 22) {
      vec2 w  = warp(p * 0.7, t * 0.5);
      vec2 w2 = warp(p * 0.4 + w * 0.3, t * 0.3);
      vec2 wp = p + w * (0.4 + dist * 0.6);
      float n1 = snoise(wp * (1.4 + cpx * 1.6) + t * 0.14);
      float n2 = snoise((wp + w2 * dist * 0.4) * (2.0 + cpx * 2.0) + vec2(3.0, 7.0) - t * 0.1);
      float ridge1 = 1.0 - abs(n1);
      ridge1 = pow(ridge1, 5.0 + shp * 12.0);
      float ridge2 = 1.0 - abs(n2);
      ridge2 = pow(ridge2, 4.0 + shp * 10.0);
      float base = (n1 + n2) * 0.25 + 0.5;
      float w1 = (base * 0.6 + ridge1 * 1.2) * u_intensity;
      float w2c = ((1.0 - base) * 0.6 + ridge2 * 1.0) * u_intensity;
      float w3 = (ridge1 * 0.8 + ridge2 * 0.6) * u_intensity;
      col = softBlend(w1, w2c, w3);

    } else if (u_effect == 23) {
      float angle = 0.1 + shp * 1.4;
      float ca = cos(angle), sa = sin(angle);
      vec2 rp = vec2(p.x * ca - p.y * sa, p.x * sa + p.y * ca);
      vec2 stretch = vec2(rp.x * (5.0 + cpx * 4.0), rp.y * (0.35 + cpx * 0.3));
      vec2 sw = warp(stretch * 0.3, t * 0.3) * dist;
      float n1 = snoise(stretch + sw + t * 0.08);
      float n2 = snoise(stretch * 1.4 + vec2(2.0, 5.0) + sw - t * 0.06);
      float streak = 1.0 - abs(n1);
      streak = pow(streak, 6.0 + shp * 12.0);
      float streak2 = 1.0 - abs(n2);
      streak2 = pow(streak2, 4.0 + shp * 8.0);
      float bg = nfbm(p * 0.4 + t * 0.04) * 0.4 + 0.4;
      float w1 = (streak * 1.4 + bg * 0.3) * u_intensity;
      float w2 = (streak2 * 0.9 + bg * 0.5) * u_intensity;
      float w3 = (streak * 0.7 + streak2 * 0.4) * u_intensity * 0.8;
      col = softBlend(w1, w2, w3);

    } else if (u_effect == 24) {
      vec2 w1 = warp(p * 0.55, t * 0.4);
      vec2 w2 = warp(p * 0.7 + w1 * 0.4, t * 0.3);
      vec2 wp = p + (w1 + w2) * (0.4 + dist * 0.7);

      float scale = 0.65 + cpx * 0.7;
      float n1 = nfbm(wp * scale + vec2(0.0, 0.0) + t * 0.10);
      float n2 = nfbm(wp * scale + vec2(3.7, 5.2) - t * 0.07);
      float n3 = nfbm(wp * scale + vec2(7.1, 2.3) + t * 0.06);
      float n4 = nfbm(wp * scale + vec2(1.8, 8.4) - t * 0.08);
      float n5 = nfbm(wp * scale + vec2(4.9, 1.1) + t * 0.05);
      float n6 = nfbm(wp * scale + vec2(6.3, 7.8) - t * 0.09);
      float n7 = nfbm(wp * scale + vec2(2.4, 4.6) + t * 0.04);

      float pw = 2.5 + shp * 5.0;
      n1 = pow(clamp(n1, 0.0, 1.0), pw);
      n2 = pow(clamp(n2, 0.0, 1.0), pw);
      n3 = pow(clamp(n3, 0.0, 1.0), pw);
      n4 = pow(clamp(n4, 0.0, 1.0), pw);
      n5 = pow(clamp(n5, 0.0, 1.0), pw);
      n6 = pow(clamp(n6, 0.0, 1.0), pw);
      n7 = pow(clamp(n7, 0.0, 1.0), pw);

      float intens = 0.5 + u_intensity * 0.9;
      float a1 = n1 * u_alpha1 * intens;
      float a2 = n2 * u_alpha2 * intens;
      float a3 = n3 * u_alpha3 * intens;
      float a4 = n4 * u_alpha4 * intens;
      float a5 = n5 * u_alpha5 * intens;
      float a6 = n6 * u_alpha6 * intens;
      float a7 = n7 * u_alpha7 * intens;
      float total = a1 + a2 + a3 + a4 + a5 + a6 + a7 + 0.001;
      col = (u_color1 * a1 + u_color2 * a2 + u_color3 * a3 + u_color4 * a4
           + u_color5 * a5 + u_color6 * a6 + u_color7 * a7) / total;

    } else if (u_effect == 25) {
      float d = (uv.x + (1.0 - uv.y)) * 0.5;
      float w = 0.9 / max(u_scale, 0.25);
      float cyc = t * 0.08;
      float pA = mix(-w, 1.0 + w, sweepEase(fract(cyc)));
      float pB = mix(-w, 1.0 + w, sweepEase(fract(cyc + 0.5)));
      float band = max(
        clamp(1.0 - abs(d - pA) / w, 0.0, 1.0),
        clamp(1.0 - abs(d - pB) / w, 0.0, 1.0)
      );
      float v = band * u_intensity;

      vec2 ggs = gridCounts(6.0 + u_cellSize * 74.0);
      if (u_dotMode > 1.5) {
        ggs = max(vec2(2.0), floor(ggs * (1.0 - u_gap * 0.8)));
      }
      vec2 cell = floor(uv * ggs);
      float clk = t * 1.6;
      // Wrap the stepped clock to keep sin() arguments small. u_time grows
      // unbounded over a session; on mediump-float GPUs (older Android, some
      // iOS) large hash inputs lose precision and the flicker bands/freezes.
      // mod(x, 1024) keeps the crossfade continuous across the wrap
      // (step 1023 fades into step 0, whose hash is the next s0).
      float step0 = mod(floor(clk), 1024.0);
      float step1 = mod(step0 + 1.0, 1024.0);
      float fz = smoothstep(0.0, 1.0, fract(clk));
      float cellSeed = dot(cell, vec2(127.1, 311.7));
      float r1 = fract(sin(cellSeed + step0 * 17.23) * 43758.5453);
      float r2 = fract(sin(cellSeed + step1 * 17.23) * 43758.5453);
      float rnd = mix(r1, r2, fz);
      v += (rnd - 0.5) * u_flicker * 0.9 * (0.15 + band * 0.85);

      col = palette(clamp(v, 0.0, 1.0));
    }

    return col;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float aspect = u_resolution.x / u_resolution.y;
    float t = u_time * u_speed;
    float dist = u_distortion;
    float soft = u_softness;
    float cpx = u_complexity;
    float shp = u_shape;

    vec2 sampleUV = uv;
    if (u_dotMode > 0.5) {
      vec2 gs = gridCounts(6.0 + u_cellSize * 74.0);
      if (u_dotMode > 1.5) {
        gs = max(vec2(2.0), floor(gs * (1.0 - u_gap * 0.8)));
      }
      sampleUV = (floor(uv * gs) + vec2(0.5)) / gs;
    }

    vec3 col;
    if (u_blur < 0.01) {
      col = computeEffect(sampleUV, aspect, t, dist, soft, cpx, shp);
    } else {
      float r = u_blur * 0.02;
      col  = computeEffect(sampleUV, aspect, t, dist, soft, cpx, shp) * 0.4;
      col += computeEffect(sampleUV + vec2( r,  0.0), aspect, t, dist, soft, cpx, shp) * 0.15;
      col += computeEffect(sampleUV + vec2(-r,  0.0), aspect, t, dist, soft, cpx, shp) * 0.15;
      col += computeEffect(sampleUV + vec2( 0.0,  r), aspect, t, dist, soft, cpx, shp) * 0.15;
      col += computeEffect(sampleUV + vec2( 0.0, -r), aspect, t, dist, soft, cpx, shp) * 0.15;
    }

    vec3 baseCol = col;
    if (u_dotMode < 0.5) {
      col = pow(col, vec3(1.3));
    }

    // CSS-pixel distance to the nearest edge — keeps the vignette / edge-fade
    // bands a consistent physical width on every side of any aspect ratio.
    vec2 cssRes = u_resolution / max(u_dpr, 0.0001);
    vec2 cssCoord = uv * cssRes;
    float edgeDistPx = min(
      min(cssCoord.x, cssRes.x - cssCoord.x),
      min(cssCoord.y, cssRes.y - cssCoord.y)
    );
    float vigRangePx = 40.0 * (1.0 + u_vignette * 3.0);
    float vig = (edgeDistPx * edgeDistPx) / (vigRangePx * vigRangePx);
    vig = smoothstep(0.0, 1.0, vig);
    col *= mix(1.0, vig, u_vignette * u_vigOpacity);

    float colorAlpha = (u_alpha1 + u_alpha2 + u_alpha3 + u_alpha4 + u_alpha5) / 5.0;
    if (colorAlpha < 0.999) {
      vec3 c1d = col - u_color1, c2d = col - u_color2, c3d = col - u_color3, c4d = col - u_color4, c5d = col - u_color5;
      float prox1 = exp(-8.0 * dot(c1d, c1d));
      float prox2 = exp(-8.0 * dot(c2d, c2d));
      float prox3 = exp(-8.0 * dot(c3d, c3d));
      float prox4 = exp(-8.0 * dot(c4d, c4d));
      float prox5 = exp(-8.0 * dot(c5d, c5d));
      float pTotal = prox1 + prox2 + prox3 + prox4 + prox5 + 0.0001;
      colorAlpha = (prox1*u_alpha1 + prox2*u_alpha2 + prox3*u_alpha3 + prox4*u_alpha4 + prox5*u_alpha5) / pTotal;
    }
    float alpha = colorAlpha;

    if (u_dotMode > 0.5) {
      vec2 gridSize = gridCounts(6.0 + u_cellSize * 74.0);
      if (u_dotMode > 1.5) {
        gridSize = max(vec2(2.0), floor(gridSize * (1.0 - u_gap * 0.8)));
      }
      // cellLocal is in [0,1] within each cell. Because gridSize was chosen so
      // that cell PIXEL size is square, distance / mask math here works in
      // screen-square units even though we're operating in normalised cell uv.
      vec2 cellLocal = fract(uv * gridSize);

      float hlFactor = 0.0;
      if (u_highlight > 0.01 || u_hlScale > 0.01) {
        vec2 cellCenter = (floor(uv * gridSize) + vec2(0.5)) / gridSize;
        vec2 cp2 = (cellCenter - 0.5) * u_scale;
        cp2.x *= aspect;
        float lw = sin(cp2.x * 3.0 + t * 1.5) * 0.5 + 0.5;
        lw *= sin(cp2.y * 2.5 - t * 1.1) * 0.5 + 0.5;
        lw += (snoise(cp2 * 2.0 + t * 0.6) * 0.5 + 0.5) * 0.3;
        hlFactor = clamp(lw, 0.0, 1.0);
        hlFactor *= hlFactor;
      }

      float scaleBoost = 1.0 + smoothstep(0.2, 0.8, hlFactor) * u_hlScale * 1.2;

      float mask = 1.0;
      if (u_dotMode < 1.5) {
        float gapW = u_gap * 0.35 / scaleBoost;
        if (gapW > 0.003) {
          mask = step(gapW, cellLocal.x) * step(gapW, 1.0 - cellLocal.x)
               * step(gapW, cellLocal.y) * step(gapW, 1.0 - cellLocal.y);
        }
      } else {
        // Render the circular dot mask in screen-pixel space rather than
        // cell-local UV. We map the cell-local offset to actual pixels
        // (cellPx = u_resolution / gridSize), then apply a 1-pixel AA
        // floor to the smoothstep edge so the dot rim is crisp and
        // properly anti-aliased even at u_dotSoftness near 0. The user
        // softness slider still scales linearly on top of the floor.
        // No fwidth() / GL_OES_standard_derivatives needed - dPx is
        // already in pixel units, so a fixed 1-px edge IS pixel-perfect.
        // gridCounts() already keeps cells square in screen space, so
        // pxOffset traces true circles (not ellipses) on any aspect.
        vec2 cellPx = u_resolution / gridSize;
        vec2 pxOffset = (cellLocal - 0.5) * cellPx;
        float dPx = length(pxOffset);
        float minCellPx = min(cellPx.x, cellPx.y);
        float radiusPx = u_dotSize * 0.5 * minCellPx * scaleBoost;
        // 0.5-px AA floor (1-px total smoothstep ramp) keeps the rim
        // pixel-perfect at u_dotSoftness=0 while letting the user softness
        // value dominate at the bundled preset defaults (e.g. softness=0.1
        // on a ~28-px cell yields softPx=0.56 -> ~1.1-px ramp, matching
        // the original cell-local behaviour). A larger floor (e.g. 1.0)
        // would widen low-softness dots and visually lighten dot presets.
        float aaPx = 0.5;
        float softPx = u_dotSoftness * 0.2 * minCellPx;
        float edgePx = max(aaPx, softPx);
        mask = 1.0 - smoothstep(radiusPx - edgePx, radiusPx + edgePx, dPx);
      }

      if (u_highlight > 0.01) {
        float hl = hlFactor * u_highlight;
        col = col * (1.0 + hl * 2.5) + vec3(hl * hl * 0.3);
      }

      if (u_edgeFade > 0.5 && u_fadeStr > 0.005) {
        float ef = smoothstep(0.0, u_edgeFade, edgeDistPx);
        mask *= mix(1.0, ef, u_fadeStr);
      }

      float baseOpacity = (u_dotMode < 1.5) ? u_fillOpacity : 0.0;
      alpha = colorAlpha * mix(baseOpacity, u_dotOpacity, mask);

      float bgLum  = dot(u_cardBg, vec3(0.299, 0.587, 0.114));
      float colLum = dot(baseCol, vec3(0.299, 0.587, 0.114));
      alpha *= smoothstep(0.0, 0.33, abs(colLum - bgLum));
    }

    gl_FragColor = vec4(col, alpha * u_shaderOpacity);
  }
`
);
let He = 1e3 / 10, Me = 1.25;
const Ct = 2;
function ot() {
  return typeof window > "u" ? 1 : Math.min(window.devicePixelRatio || 1, Ct);
}
let p = null;
function St() {
  return {
    u_resolution: { value: new ne.Vector2(1, 1) },
    u_dpr: { value: 1 },
    u_time: { value: 0 },
    u_color1: { value: new ne.Color(1710618) },
    u_color2: { value: new ne.Color(8421504) },
    u_color3: { value: new ne.Color(14277081) },
    u_color4: { value: new ne.Color(4210752) },
    u_color5: { value: new ne.Color(12632256) },
    u_color6: { value: new ne.Color(6316128) },
    u_color7: { value: new ne.Color(10526880) },
    u_cardBg: { value: new ne.Color(986895) },
    u_alpha1: { value: 1 },
    u_alpha2: { value: 1 },
    u_alpha3: { value: 1 },
    u_alpha4: { value: 1 },
    u_alpha5: { value: 1 },
    u_alpha6: { value: 1 },
    u_alpha7: { value: 1 },
    u_speed: { value: 1 },
    u_intensity: { value: 1 },
    u_scale: { value: 1.5 },
    u_direction: { value: 0 },
    u_softness: { value: 0.75 },
    u_distortion: { value: 0.3 },
    u_complexity: { value: 0.2 },
    u_shape: { value: 0.5 },
    u_flicker: { value: 0 },
    u_vignette: { value: 0.25 },
    u_vigOpacity: { value: 1 },
    u_blur: { value: 0 },
    u_highlight: { value: 0.4 },
    u_shaderOpacity: { value: 1 },
    u_cellSize: { value: 0.5 },
    u_gap: { value: 0.3 },
    u_dotSize: { value: 0.8 },
    u_dotSoftness: { value: 0.1 },
    u_dotOpacity: { value: 1 },
    u_hlScale: { value: 0 },
    u_fillOpacity: { value: 0 },
    u_edgeFade: { value: 16 },
    u_fadeStr: { value: 1 },
    u_dotMode: { value: 2 },
    u_effect: { value: 4 },
    u_sweepEase: { value: 0 }
  };
}
function Mt() {
  if (p) return p;
  const e = document.createElement("canvas");
  e.width = 8, e.height = 8;
  const t = new ne.WebGLRenderer({
    canvas: e,
    alpha: !0,
    premultipliedAlpha: !1,
    preserveDrawingBuffer: !1,
    antialias: !1,
    powerPreference: "high-performance"
  });
  t.setPixelRatio(Math.min(typeof window < "u" ? window.devicePixelRatio : 1, Me)), t.setClearColor(0, 0), t.autoClear = !0;
  const a = t.getContext(), n = new ne.Scene(), o = new ne.OrthographicCamera(-1, 1, 1, -1, 0, 1), i = St(), l = new ne.ShaderMaterial({
    vertexShader: bt,
    fragmentShader: _t,
    uniforms: i,
    transparent: !0,
    depthTest: !1,
    depthWrite: !1,
    blending: ne.NormalBlending
  }), c = new ne.PlaneGeometry(2, 2), f = new ne.Mesh(c, l);
  n.add(f), p = {
    glCanvas: e,
    gl: a,
    renderer: t,
    scene: n,
    camera: o,
    material: l,
    geometry: c,
    mesh: f,
    uniforms: i,
    instances: /* @__PURE__ */ new Set(),
    rafId: 0,
    lastFrameMs: 0,
    lastTickMs: performance.now(),
    lastInstance: null,
    onContextLost: null,
    onContextRestored: null,
    contextLost: !1
  };
  const s = (u) => {
    u.preventDefault(), p && (p.contextLost = !0, p.rafId !== 0 && (cancelAnimationFrame(p.rafId), p.rafId = 0));
  }, h = () => {
    if (p) {
      p.contextLost = !1, p.lastInstance = null;
      for (const u of p.instances) u.uniformsDirty = !0;
      Ee();
    }
  };
  return e.addEventListener("webglcontextlost", s, !1), e.addEventListener("webglcontextrestored", h, !1), p.onContextLost = s, p.onContextRestored = h, Ee(), p;
}
function Dt() {
  p && (p.rafId !== 0 && cancelAnimationFrame(p.rafId), p.onContextLost && p.glCanvas.removeEventListener("webglcontextlost", p.onContextLost, !1), p.onContextRestored && p.glCanvas.removeEventListener("webglcontextrestored", p.onContextRestored, !1), p.geometry.dispose(), p.material.dispose(), p.renderer.dispose(), p = null);
}
function It(e, t) {
  var f;
  const a = t.preset, n = e.uniforms;
  n.u_effect.value = a.effectIndex, n.u_speed.value = a.speed, n.u_intensity.value = a.intensity, n.u_scale.value = a.scale, n.u_direction.value = a.direction * Math.PI / 180, n.u_softness.value = a.softness, n.u_distortion.value = a.distortion, n.u_complexity.value = a.complexity, n.u_shape.value = a.shape, n.u_flicker.value = a.flicker ?? 0, n.u_vignette.value = a.vignette, n.u_vigOpacity.value = a.vigOpacity, n.u_blur.value = a.blur, n.u_highlight.value = a.highlight, n.u_shaderOpacity.value = a.shaderOpacity, n.u_dotMode.value = a.dotMode, n.u_sweepEase.value = a.sweepEase != null ? Math.floor(a.sweepEase) : 0;
  const o = a.dotMode === 1 ? a.pixelConfig : a.dotConfig;
  n.u_cellSize.value = Oe(o.cellSize, t.pixelScale), n.u_gap.value = o.gap, n.u_dotSize.value = o.dotSize, n.u_dotSoftness.value = o.dotSoftness, n.u_dotOpacity.value = o.dotOpacity, n.u_hlScale.value = o.hlScale, n.u_fillOpacity.value = o.fillOpacity, n.u_edgeFade.value = o.edgeFade, n.u_fadeStr.value = o.fadeStr;
  const [i, l, c] = be(t.cardBgOverride ?? a.cardBg);
  for (let s = 0; s < 7; s++) {
    const h = (f = t.colorsOverride) == null ? void 0 : f[s], [u, g, m] = h != null ? be(h) : ze(t, s);
    n[`u_color${s + 1}`].value.setRGB(u, g, m), n[`u_alpha${s + 1}`].value = a.alphas[s];
  }
  n.u_cardBg.value.setRGB(i, l, c), t.uniformsDirty = !1;
}
function Rt(e) {
  return e.cardBgOverride ?? e.preset.cardBg;
}
function ze(e, t) {
  const a = e.preset, [n, o, i] = be(a.colors[t]);
  if (e.cardBgOverride == null) return [n, o, i];
  const [l, c, f] = be(a.cardBg), s = (h) => Math.round(h * 255);
  return s(n) === s(l) && s(o) === s(c) && s(i) === s(f) ? be(e.cardBgOverride) : [n, o, i];
}
function Et(e) {
  return {
    iw: Math.max(1, Math.floor(e.cssWidth * e.dpr)),
    ih: Math.max(1, Math.floor(e.cssHeight * e.dpr))
  };
}
function lt(e) {
  let t = 0, a = 0;
  for (const h of e.instances)
    !h.visible || h.paused || (h.cssWidth > t && (t = h.cssWidth), h.cssHeight > a && (a = h.cssHeight));
  if (t <= 0 || a <= 0) return;
  const n = e.renderer.getPixelRatio(), o = Math.max(1, Math.floor(t * n)), i = Math.max(1, Math.floor(a * n)), l = e.glCanvas.width, c = e.glCanvas.height;
  if (o <= l && i <= c) return;
  const f = Math.max(t, l / Math.max(n, 1e-4)), s = Math.max(a, c / Math.max(n, 1e-4));
  e.renderer.setSize(f, s, !1);
}
function it(e, t, a) {
  var u;
  if (e.contextLost) return;
  const { iw: n, ih: o } = Et(t), i = Math.max(1, t.cssWidth), l = Math.max(1, t.cssHeight);
  e.renderer.setViewport(0, 0, i, l), e.renderer.setScissor(0, 0, i, l), e.renderer.setScissorTest(!0), e.uniforms.u_resolution.value.set(n, o), e.uniforms.u_dpr.value = t.dpr || 1, e.lastInstance === t && !t.uniformsDirty || (It(e, t), e.lastInstance = t), e.uniforms.u_time.value = t.accumulatedTime, e.renderer.render(e.scene, e.camera);
  const f = Math.max(1, Math.floor(t.cssWidth * t.canvasDpr)), s = Math.max(1, Math.floor(t.cssHeight * t.canvasDpr));
  (t.canvas.width !== f || t.canvas.height !== s) && (t.canvas.width = f, t.canvas.height = s), t.ctx.clearRect(0, 0, f, s);
  const h = e.glCanvas.height - o;
  t.ctx.imageSmoothingEnabled = !1, t.ctx.drawImage(e.glCanvas, 0, h, n, o, 0, 0, f, s), (u = t.reveal) == null || u.afterShaderFrame(e, t, a), t.reveal && t.reveal.isActive() && (e.lastInstance = null);
}
function Ot(e, t, a) {
  !t.visible || t.paused || t.cssWidth < 1 || t.cssHeight < 1 || it(e, t, a);
}
function Be(e) {
  p && (p.contextLost || e.visible && (e.cssWidth < 1 || e.cssHeight < 1 || (lt(p), it(p, e, performance.now()))));
}
function Pt(e) {
  for (const t of e.instances)
    if (t.visible && !t.paused) return !0;
  return !1;
}
const st = (e) => {
  if (!p) return;
  if (p.contextLost) {
    p.rafId = 0;
    return;
  }
  if (!Pt(p)) {
    p.rafId = 0;
    return;
  }
  p.rafId = requestAnimationFrame(st);
  const t = e - p.lastFrameMs;
  if (t < He) return;
  p.lastFrameMs = e - t % He;
  const a = (e - p.lastTickMs) / 1e3;
  p.lastTickMs = e;
  for (const n of p.instances)
    n.visible && !n.paused && (n.accumulatedTime += a);
  lt(p);
  for (const n of p.instances)
    Ot(p, n, e);
};
function Ee() {
  p && (p.contextLost || p.rafId === 0 && (p.lastTickMs = performance.now(), p.lastFrameMs = p.lastTickMs, p.rafId = requestAnimationFrame(st)));
}
function Oe(e, t) {
  return !(t > 0) || t === 1 ? e : ((6 + e * 74) / t - 6) / 74;
}
function kt(e) {
  const t = Mt(), a = e.canvas.getContext("2d");
  if (!a) throw new Error("img-fx: 2D context unavailable");
  const n = {
    canvas: e.canvas,
    ctx: a,
    cssWidth: e.cssWidth,
    cssHeight: e.cssHeight,
    dpr: Math.min(typeof window < "u" ? window.devicePixelRatio : 1, Me),
    canvasDpr: ot(),
    // Public `PresetMode` widens to `EnginePresetMode` at the
    // boundary — see `Instance.preset` for the rationale.
    preset: e.preset,
    cardBgOverride: e.cardBg ?? null,
    colorsOverride: null,
    strength: e.strength ?? 1,
    pixelScale: e.pixelScale != null && e.pixelScale > 0 ? e.pixelScale : 1,
    visible: !0,
    paused: !1,
    uniformsDirty: !0,
    reveal: null,
    accumulatedTime: Math.random() * 1e3,
    startedAtMs: performance.now()
  };
  return t.instances.add(n), Ee(), n;
}
function Bt(e) {
  var t;
  p && (p.instances.delete(e), p.lastInstance === e && (p.lastInstance = null), (t = e.reveal) == null || t.dispose(), e.reveal = null, p.instances.size === 0 && Dt());
}
function Ft(e, t, a) {
  e.cssWidth = t, e.cssHeight = a, typeof window < "u" && (e.dpr = Math.min(window.devicePixelRatio, Me), e.canvasDpr = ot());
}
function At(e, t) {
  e.preset = t, e.uniformsDirty = !0;
}
function zt(e, t) {
  e.cardBgOverride = t, e.uniformsDirty = !0;
}
function Ht(e, t) {
  e.colorsOverride = t && t.length > 0 ? t.slice(0, 7) : null, e.uniformsDirty = !0;
}
function Lt(e, t) {
  e.visible = t, t && Ee();
}
function Wt(e, t) {
  e.paused = t, t || Ee();
}
function Tt(e, t) {
  e.strength = Math.max(0, Math.min(1, t));
}
function Gt(e, t) {
  e.pixelScale = t > 0 ? t : 1, e.uniformsDirty = !0;
}
function ha(e) {
  He = 1e3 / Math.max(1, Math.min(60, e));
}
function ga(e) {
  if (Me = Math.max(1, Math.min(4, e)), !p) return;
  const t = Math.min(typeof window < "u" ? window.devicePixelRatio : 1, Me);
  p.renderer.setPixelRatio(t);
  for (const a of p.instances)
    a.dpr = t, a.uniformsDirty = !0;
  p.lastInstance = null;
}
function ma() {
  return 1e3 / He;
}
function va() {
  return Me;
}
const Ke = {
  linear: (e) => e,
  smoothstep: (e) => e * e * (3 - 2 * e),
  easeOutCubic: (e) => 1 - Math.pow(1 - e, 3),
  easeOutQuint: (e) => 1 - Math.pow(1 - e, 5),
  easeInOutCubic: (e) => e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2,
  easeOutExpo: (e) => e === 1 ? 1 : 1 - Math.pow(2, -10 * e),
  easeOutBack: (e) => 1 + (1.70158 + 1) * Math.pow(e - 1, 3) + 1.70158 * Math.pow(e - 1, 2)
};
function Pe(e, t) {
  return (Ke[e] ?? Ke.smoothstep)(Math.max(0, Math.min(1, t)));
}
const Nt = 64, qt = 96, De = 320, Vt = 6e-3;
function Qe(e, t, a) {
  const n = t / Math.max(1, a), o = e.width / Math.max(1, e.height);
  let i = 0, l = 0, c = e.width, f = e.height;
  o > n ? (c = e.height * n, i = (e.width - c) / 2) : (f = e.width / n, l = (e.height - f) / 2);
  const s = Math.min(c, f) * Vt;
  return c - 2 * s > 1 && f - 2 * s > 1 && (i += s, l += s, c -= 2 * s, f -= 2 * s), { sx: i, sy: l, sw: c, sh: f };
}
const Te = /* @__PURE__ */ new Map();
function Ut(e) {
  let t = Te.get(e);
  return t || (t = new Promise((a, n) => {
    const o = new Image(), i = () => a(o);
    o.onerror = (l) => {
      Te.delete(e), n(l);
    }, typeof o.decode == "function" ? (o.src = e, o.decode().then(i, () => {
      o.complete && o.naturalWidth > 0 ? i() : o.onload = i;
    })) : (o.onload = i, o.src = e);
  }), Te.set(e, t), t);
}
function he(e, t, a, n, o) {
  let i = t === "a" ? e.coverA : e.coverB;
  if (!i) {
    const l = document.createElement("canvas"), c = l.getContext("2d");
    if (!c) throw new Error("img-fx: 2D context unavailable for cover bitmap");
    i = { canvas: l, ctx: c, img: null, w: 0, h: 0 }, t === "a" ? e.coverA = i : e.coverB = i;
  }
  if (i.img !== a || i.w !== n || i.h !== o) {
    i.canvas.width = n, i.canvas.height = o, i.w = n, i.h = o, i.img = a;
    const { sx: l, sy: c, sw: f, sh: s } = Qe(a, n, o);
    i.ctx.clearRect(0, 0, n, o), i.ctx.imageSmoothingEnabled = !0, i.ctx.imageSmoothingQuality = "high", i.ctx.drawImage(a, l, c, f, s, 0, 0, n, o);
  }
  return i.canvas;
}
function rt(e) {
  return e.dotMode === 2 ? qt : Nt;
}
function ct(e) {
  const t = e.revealConfig;
  return e.dotMode === 2 ? { duration: Math.max(0.05, t.dotDuration), easingKey: t.dotEasing } : { duration: Math.max(0.05, t.duration), easingKey: t.easing };
}
function Qt(e, t, a, n) {
  const o = a / (n - 1), i = t / (n - 1), l = o - 0.5, c = i - 0.5;
  switch (e) {
    case "radialCenter":
      return 1 - Math.sqrt(l * l + c * c) * 2;
    case "radialCorner":
      return 1 - Math.sqrt(o * o + i * i) / 1.414;
    case "linearTop":
      return 1 - i;
    case "linearBottom":
      return i;
    case "linearLeft":
      return 1 - o;
    case "linearRight":
      return o;
    case "diagonalTL":
      return 1 - (o + i) / 2;
    case "diagonalBR":
      return (o + i) / 2;
    case "diamond":
      return 1 - (Math.abs(l) + Math.abs(c));
    case "blindsH":
      return 1 - i * 8 % 1;
    case "blindsV":
      return 1 - o * 8 % 1;
    default:
      return -1;
  }
}
function ft(e, t, a, n, o) {
  const i = t.uniforms.u_dotMode.value, l = t.uniforms.u_fillOpacity.value, c = a.preset.dotMode, f = c < 1.5 ? 0 : 1;
  t.uniforms.u_dotMode.value = f, t.uniforms.u_fillOpacity.value = f > 0.5 ? c === 1 ? a.preset.pixelConfig.fillOpacity : a.preset.dotConfig.fillOpacity : 0, t.renderer.render(t.scene, t.camera);
  const s = Math.max(1, Math.floor(a.cssWidth * a.dpr)), h = Math.max(1, Math.floor(a.cssHeight * a.dpr)), u = Math.max(0, t.glCanvas.height - h);
  e.sampleGpuCanvas || (e.sampleGpuCanvas = document.createElement("canvas"), e.sampleGpuCtx = e.sampleGpuCanvas.getContext("2d"));
  const g = e.sampleGpuCanvas, m = e.sampleGpuCtx;
  return (g.width !== o || g.height !== o) && (g.width = o, g.height = o), m.clearRect(0, 0, o, o), m.drawImage(t.glCanvas, 0, u, s, h, 0, 0, o, o), n.clearRect(0, 0, o, o), n.drawImage(g, 0, 0), t.uniforms.u_dotMode.value = i, t.uniforms.u_fillOpacity.value = l, e.sampleImgData = n.getImageData(0, 0, o, o), e.sampleDataCache = e.sampleImgData.data, e.sampleDataCache;
}
function ut(e, t) {
  e.sampleCanvas || (e.sampleCanvas = document.createElement("canvas"), e.sampleCtx = e.sampleCanvas.getContext("2d", { willReadFrequently: !0 })), (e.sampleCanvas.width !== t || e.sampleCanvas.height !== t) && (e.sampleCanvas.width = t, e.sampleCanvas.height = t, e.sampleImgData = null, e.sampleDataCache = null, e.sampleFrameCounter = 0), e.maskGrad || (e.maskGrad = document.createElement("canvas"), e.maskGradCtx = e.maskGrad.getContext("2d")), (e.maskGrad.width !== t || e.maskGrad.height !== t) && (e.maskGrad.width = t, e.maskGrad.height = t, e.maskImgData = null), !e.maskImgData && e.maskGradCtx && (e.maskImgData = e.maskGradCtx.createImageData(t, t));
}
function Xt(e, t, a, n) {
  if (!e.image) return;
  const o = a.preset, i = a.canvas.width, l = a.canvas.height;
  (n.canvas.width !== i || n.canvas.height !== l) && (n.canvas.width = i, n.canvas.height = l), n.clearRect(0, 0, i, l);
  const { duration: c, easingKey: f } = ct(o), s = (performance.now() - e.revealStartMs) / 1e3, h = Math.min(s / c, 1), u = Pe(f, h), g = e.image, { sx: m, sy: v, sw: b, sh: P } = Qe(g, i, l), I = o.revealConfig.blur;
  if (h < 1 && I > 0) {
    const T = I * (1 - u);
    n.canvas.style.filter = T > 0.1 ? `blur(${T.toFixed(1)}px)` : "none";
  } else
    n.canvas.style.filter = "none";
  if (h >= 1) {
    n.imageSmoothingEnabled = !0, n.imageSmoothingQuality = "high", n.drawImage(he(e, "a", g, i, l), 0, 0);
    return;
  }
  const w = rt(o);
  ut(e, w);
  const oe = e.sampleCtx, ie = e.maskGrad, F = e.maskGradCtx, M = o.revealConfig.maskShape, d = o.revealConfig.softness, x = M.startsWith("shader");
  let C = null, y = null, k = null;
  if (x) {
    const T = e.sampleFrameCounter++;
    e.sampleDataCache == null || (T & 1) === 0 ? C = ft(e, t, a, oe, w) : C = e.sampleDataCache;
    const N = {
      shaderColor1: 0,
      shaderColor2: 1,
      shaderColor3: 2,
      shaderColor4: 3,
      shaderColor5: 4
    };
    if (N[M] != null && (y = ze(a, N[M])), M === "shaderHighlight") {
      const E = be(Rt(a));
      k = [];
      for (let U = 0; U < 5; U++) {
        const z = ze(a, U), q = z[0] - E[0], se = z[1] - E[1], r = z[2] - E[2];
        Math.sqrt(q * q + se * se + r * r) > 0.15 && k.push(z);
      }
      k.length === 0 && (k = [ze(a, 0)]);
    }
  }
  const _ = 1 - u * (1 + d), W = M === "gradientSweep";
  let j = 0, S = 0, G = 2;
  const V = o.flicker ?? 0;
  let ae = null, H = null, R = 0, X = 0, A = 0;
  if (V > 3e-3) {
    G = Math.max(2, Math.floor(6 + Oe(o.pixelConfig.cellSize, a.pixelScale) * 74));
    const T = a.accumulatedTime * Math.max(o.speed, 2) * 1.6, Z = Math.floor(T);
    R = Z % 1024, X = (R + 1) % 1024, A = T - Z, A = A * A * (3 - 2 * A);
    const N = (U, z) => {
      const q = Math.sin(U * 127.1 + z * 17.23) * 43758.5453;
      return q - Math.floor(q);
    };
    H = N;
    const E = G * G;
    (!e.gsFlickerTable || e.gsFlickerTable.length !== E) && (e.gsFlickerTable = new Float32Array(E)), ae = e.gsFlickerTable;
    for (let U = 0; U < E; U++) {
      const z = N(U, R) * (1 - A) + N(U, X) * A;
      ae[U] = (z - 0.5) * V * 1.6;
    }
  }
  W && (j = 0.9 / Math.max(o.scale, 0.25), S = -j + u * (1 + 2 * j));
  const pe = e.maskImgData, ce = pe.data;
  for (let T = 0; T < w; T++)
    for (let Z = 0; Z < w; Z++) {
      let N;
      if (x && C) {
        const z = (T * w + Z) * 4, q = C[z] / 255, se = C[z + 1] / 255, r = C[z + 2] / 255;
        if (k) {
          let D = 0;
          for (const K of k) {
            const le = q - K[0], Y = se - K[1], ge = r - K[2], fe = Math.exp(-10 * (le * le + Y * Y + ge * ge));
            fe > D && (D = fe);
          }
          N = D;
        } else if (y) {
          const D = q - y[0], K = se - y[1], le = r - y[2];
          N = Math.exp(-8 * (D * D + K * K + le * le));
        } else
          N = (C[z] * 0.299 + C[z + 1] * 0.587 + C[z + 2] * 0.114) / 255;
      } else W ? N = 0 : N = Qt(M, T, Z, w);
      let E;
      if (W) {
        const z = Z / (w - 1), q = T / (w - 1), se = (z + q) * 0.5;
        E = (S + j - se) / (2 * j);
      } else
        E = (N - _) / d;
      if (ae && E > -0.5 && E < 1.5) {
        const z = E < 0 ? 0 : E > 1 ? 1 : E, q = z * (1 - z) * 4;
        if (q > 1e-3) {
          const se = Z / (w - 1), r = T / (w - 1), D = Math.floor(r * G) * G + Math.floor(se * G);
          E += ae[D] * q;
        }
      }
      E < 0 ? E = 0 : E > 1 && (E = 1), E = E * E * (3 - 2 * E);
      const U = (T * w + Z) * 4;
      ce[U] = 255, ce[U + 1] = 255, ce[U + 2] = 255, ce[U + 3] = E * 255 + 0.5 | 0;
    }
  if (F.putImageData(pe, 0, 0), o.dotMode === 1)
    jt(
      e,
      n,
      g,
      m,
      v,
      b,
      P,
      o,
      s,
      i,
      l,
      a,
      // The gradientSweep mask already flickers along its band edge (via
      // gsTable above); skip the dissolve flicker there to avoid doubling up
      // and keep that preset's approved look unchanged.
      W ? 0 : V,
      H,
      R,
      X,
      A
    );
  else {
    o.dotMode === 2 ? $t(e, n, g, m, v, b, P, Oe(o.pixelConfig.cellSize, a.pixelScale), s, o.revealConfig.pixDuration, o.revealConfig.pixEasing, a, i, l) : (n.imageSmoothingEnabled = !0, n.imageSmoothingQuality = "high", n.drawImage(he(e, "a", g, i, l), 0, 0)), n.globalCompositeOperation = "destination-in";
    const T = o.dotMode === 2 && x;
    T && (n.imageSmoothingEnabled = !1), n.drawImage(ie, 0, 0, i, l), T && (n.imageSmoothingEnabled = !0), n.globalCompositeOperation = "source-over";
  }
}
function $t(e, t, a, n, o, i, l, c, f, s, h, u, g, m) {
  const v = 6 + c * 74, b = Math.max(1, u.cssWidth), P = Math.max(1, u.cssHeight), I = Math.max(2, Math.floor(v * b / De)), w = Math.max(2, Math.floor(v * P / De)), oe = I * w, ie = Math.max(0.05, s), F = Math.max(0, Math.min(1, f / ie)), M = Pe(h, F);
  e.pixCanvas || (e.pixCanvas = document.createElement("canvas"), e.pixCtx = e.pixCanvas.getContext("2d"));
  const d = e.pixCanvas, x = e.pixCtx;
  (d.width !== I || d.height !== w) && (d.width = I, d.height = w), e.pixDrop || (e.pixDrop = document.createElement("canvas"), e.pixDropCtx = e.pixDrop.getContext("2d"));
  const C = e.pixDrop, y = e.pixDropCtx;
  if (C.width !== I || C.height !== w) {
    C.width = I, C.height = w, e.pixDropImgData = y.createImageData(I, w);
    const S = e.pixDropImgData.data;
    for (let G = 0; G < S.length; G += 4)
      S[G] = 255, S[G + 1] = 255, S[G + 2] = 255;
  }
  const k = 0.07, _ = 1 / (2 * k);
  if (!e.pixDropPattern || e.pixDropPatternW !== I || e.pixDropPatternH !== w || e.pixDropRevealStart !== e.revealStartMs) {
    e.pixDropPattern = new Float32Array(oe);
    const S = k, G = 1 - 2 * k;
    for (let V = 0; V < e.pixDropPattern.length; V++)
      e.pixDropPattern[V] = S + Math.random() * G;
    e.pixDropPatternW = I, e.pixDropPatternH = w, e.pixDropRevealStart = e.revealStartMs;
  }
  const W = e.pixDropImgData.data, j = e.pixDropPattern;
  for (let S = 0; S < j.length; S++) {
    let V = 0.5 + (j[S] - M) * _;
    V < 0 ? V = 0 : V > 1 && (V = 1), W[S * 4 + 3] = V * 255 + 0.5 | 0;
  }
  y.putImageData(e.pixDropImgData, 0, 0), x.globalCompositeOperation = "source-over", x.clearRect(0, 0, I, w), x.imageSmoothingEnabled = !0, x.imageSmoothingQuality = "high", x.drawImage(he(e, "a", a, g, m), 0, 0, g, m, 0, 0, I, w), x.globalCompositeOperation = "destination-in", x.imageSmoothingEnabled = !1, x.drawImage(C, 0, 0), x.globalCompositeOperation = "source-over", t.imageSmoothingEnabled = !0, t.imageSmoothingQuality = "high", t.drawImage(he(e, "a", a, g, m), 0, 0), t.imageSmoothingEnabled = !1, t.drawImage(d, 0, 0, I, w, 0, 0, g, m), t.imageSmoothingEnabled = !0;
}
function jt(e, t, a, n, o, i, l, c, f, s, h, u, g, m, v, b, P) {
  const w = 6 + Oe(c.pixelConfig.cellSize, u.pixelScale) * 74, oe = Math.max(1, u.cssWidth), ie = Math.max(1, u.cssHeight), F = Math.max(2, Math.floor(w * oe / De)), M = Math.max(2, Math.floor(w * ie / De)), d = F * M, x = Math.max(0.05, c.revealConfig.pixDuration), C = Math.max(0, Math.min(1, f / x)), y = Pe(c.revealConfig.pixEasing, C);
  e.pixCanvas || (e.pixCanvas = document.createElement("canvas"), e.pixCtx = e.pixCanvas.getContext("2d"));
  const k = e.pixCanvas, _ = e.pixCtx;
  (k.width !== F || k.height !== M) && (k.width = F, k.height = M), e.pixDrop || (e.pixDrop = document.createElement("canvas"), e.pixDropCtx = e.pixDrop.getContext("2d"));
  const W = e.pixDrop, j = e.pixDropCtx;
  if (W.width !== F || W.height !== M) {
    W.width = F, W.height = M, e.pixDropImgData = j.createImageData(F, M);
    const R = e.pixDropImgData.data;
    for (let X = 0; X < R.length; X += 4)
      R[X] = 255, R[X + 1] = 255, R[X + 2] = 255;
  }
  const S = 0.07, G = 1 / (2 * S);
  if (!e.pixDropPattern || e.pixDropPatternW !== F || e.pixDropPatternH !== M || e.pixDropRevealStart !== e.revealStartMs) {
    e.pixDropPattern = new Float32Array(d);
    const R = S, X = 1 - 2 * S;
    for (let A = 0; A < e.pixDropPattern.length; A++)
      e.pixDropPattern[A] = R + Math.random() * X;
    e.pixDropPatternW = F, e.pixDropPatternH = M, e.pixDropRevealStart = e.revealStartMs;
  }
  const V = e.pixDropImgData.data, ae = e.pixDropPattern, H = g > 3e-3 && m != null;
  for (let R = 0; R < ae.length; R++) {
    const X = ae[R];
    let A = 0.5 + (X - y) * G;
    if (A < 0 ? A = 0 : A > 1 && (A = 1), H) {
      const pe = 1 - Math.abs(y - X) * 6.25;
      if (pe > 0) {
        const ce = m(R, v) * (1 - P) + m(R, b) * P;
        A += (ce - 0.5) * g * 1.6 * pe, A < 0 ? A = 0 : A > 1 && (A = 1);
      }
    }
    V[R * 4 + 3] = A * 255 + 0.5 | 0;
  }
  j.putImageData(e.pixDropImgData, 0, 0), _.globalCompositeOperation = "source-over", _.clearRect(0, 0, F, M), _.imageSmoothingEnabled = !0, _.imageSmoothingQuality = "high", _.drawImage(he(e, "a", a, s, h), 0, 0, s, h, 0, 0, F, M), _.globalCompositeOperation = "destination-in", _.imageSmoothingEnabled = !1, _.drawImage(W, 0, 0), _.globalCompositeOperation = "source-over", t.imageSmoothingEnabled = !0, t.imageSmoothingQuality = "high", t.drawImage(he(e, "a", a, s, h), 0, 0), t.imageSmoothingEnabled = !1, t.drawImage(k, 0, 0, F, M, 0, 0, s, h), t.imageSmoothingEnabled = !0, _.globalCompositeOperation = "source-over", _.clearRect(0, 0, F, M), _.imageSmoothingEnabled = !0, _.imageSmoothingQuality = "high", _.drawImage(e.maskGrad, 0, 0, F, M), t.imageSmoothingEnabled = !1, t.globalCompositeOperation = "destination-in", t.drawImage(k, 0, 0, F, M, 0, 0, s, h), t.imageSmoothingEnabled = !0, t.globalCompositeOperation = "source-over";
}
const Ge = 800, Ne = 300, Kt = 1, Yt = 0.5, Zt = 0.03, Ye = 0.6, Ze = 800, Jt = 400, ea = 1200;
function ta(e, t, a, n, o, i) {
  var Se;
  const l = e.image;
  if (!l) return;
  const c = a.preset, f = a.canvas.width, s = a.canvas.height;
  (n.canvas.width !== f || n.canvas.height !== s) && (n.canvas.width = f, n.canvas.height = s), n.canvas.style.filter = "none";
  const u = 6 + Oe(c.pixelConfig.cellSize, a.pixelScale) * 74, g = Math.max(1, a.cssWidth), m = Math.max(1, a.cssHeight), v = Math.max(2, Math.floor(u * g / De)), b = Math.max(2, Math.floor(u * m / De)), P = v * b, I = e.pendingReveal, w = I && e.boilHandoffStartMs > 0 ? i - e.boilHandoffStartMs : -1, oe = (B) => B * B * (3 - 2 * B), ie = w < 0 ? 0 : oe(Math.min(1, w / Ze)), F = w < 0 ? -1 : w - Ze, M = F <= 0 ? 0 : oe(Math.min(1, F / Jt)), d = F <= 0 ? 0 : Math.min(1, F / ea), x = I != null && F > 0, C = i - e.boilStartMs, y = Math.min(1, C / Ge), k = y * y * (3 - 2 * y), _ = y < 1, W = Math.min(
    1,
    Math.max(0, C - (Ge - Ne)) / Ne
  ), j = 1 - W * W * (3 - 2 * W), S = Math.min(
    1,
    Math.max(0, C - (Ge - Ne)) / (Kt * 1e3)
  ), G = S * S * (3 - 2 * S), V = G * Yt;
  o.style.opacity = String(G), e.pixCanvas || (e.pixCanvas = document.createElement("canvas"), e.pixCtx = e.pixCanvas.getContext("2d"));
  const ae = e.pixCanvas, H = e.pixCtx;
  (ae.width !== v || ae.height !== b) && (ae.width = v, ae.height = b), e.pixDrop || (e.pixDrop = document.createElement("canvas"), e.pixDropCtx = e.pixDrop.getContext("2d"));
  const R = e.pixDrop, X = e.pixDropCtx;
  if (R.width !== v || R.height !== b || !e.pixDropImgData) {
    R.width = v, R.height = b, e.pixDropImgData = X.createImageData(v, b);
    const B = e.pixDropImgData.data;
    for (let $ = 0; $ < B.length; $ += 4)
      B[$] = 255, B[$ + 1] = 255, B[$ + 2] = 255;
  }
  if (!e.boilPattern || e.boilPatternW !== v || e.boilPatternH !== b) {
    e.boilPattern = new Float32Array(P);
    for (let B = 0; B < P; B++) e.boilPattern[B] = Math.random();
    e.boilPatternW = v, e.boilPatternH = b;
  }
  const A = Math.max(c.flicker ?? 0, 0.5), pe = a.accumulatedTime * Math.max(c.speed, 2) * 1.6, ce = Math.floor(pe), T = ce % 1024, Z = (T + 1) % 1024;
  let N = pe - ce;
  N = N * N * (3 - 2 * N);
  const E = (B, $) => {
    const ue = Math.sin(B * 127.1 + $ * 17.23) * 43758.5453;
    return ue - Math.floor(ue);
  }, U = e.pixDropImgData.data, z = e.boilPattern, q = rt(c);
  ut(e, q);
  const se = e.sampleFrameCounter++, r = e.sampleDataCache == null || se % 3 === 0, D = !e.boilField || e.boilField.length !== P, K = r ? ft(e, t, a, e.sampleCtx, q) : e.sampleDataCache;
  if (r || D) {
    D && (e.boilField = new Float32Array(P));
    const B = e.boilField;
    let $ = 1, ue = 0;
    for (let Q = 0; Q < b; Q++) {
      const O = Math.min(q - 1, (Q + 0.5) * q / b | 0);
      for (let re = 0; re < v; re++) {
        const J = Math.min(q - 1, (re + 0.5) * q / v | 0), L = (O * q + J) * 4, ve = (K[L] * 0.299 + K[L + 1] * 0.587 + K[L + 2] * 0.114) / 255;
        B[Q * v + re] = ve, ve < $ && ($ = ve), ve > ue && (ue = ve);
      }
    }
    const te = ue - $ > 1e-3 ? 1 / (ue - $) : 0;
    for (let Q = 0; Q < P; Q++)
      B[Q] = te > 0 ? (B[Q] - $) * te : 0.5;
  }
  const le = e.boilField, Y = 1 / (2 * Zt), ge = A * 0.6 * (1 - d), fe = 1 - Ye, we = x ? Pe(c.revealConfig.pixEasing, d) : 0, _e = 1 / (2 * 0.07), Ce = c.flicker ?? 0;
  for (let B = 0; B < P; B++) {
    const $ = E(B, T) * (1 - N) + E(B, Z) * N;
    let te = 0.5 + (le[B] * Ye + z[B] * fe + ($ - 0.5) * ge - V) * Y;
    if (te < 0 ? te = 0 : te > 1 && (te = 1), _) {
      const Q = z[B];
      let O = 0.5 + (k - Q) * _e;
      O < 0 ? O = 0 : O > 1 && (O = 1);
      const re = 1 - Math.abs(k - Q) * 6.25;
      re > 0 && (O += ($ - 0.5) * A * 1.6 * re, O < 0 ? O = 0 : O > 1 && (O = 1)), O < te && (te = O);
    }
    if (x) {
      const Q = z[B];
      let O = 0.5 + (Q - we) * _e;
      if (O < 0 ? O = 0 : O > 1 && (O = 1), Ce > 3e-3) {
        const re = 1 - Math.abs(we - Q) * 6.25;
        re > 0 && (O += ($ - 0.5) * Ce * 1.6 * re, O < 0 ? O = 0 : O > 1 && (O = 1));
      }
      O < te && (te = O);
    }
    U[B * 4 + 3] = te * 255 + 0.5 | 0;
  }
  X.putImageData(e.pixDropImgData, 0, 0), Qe(l, f, s), H.globalCompositeOperation = "source-over", H.clearRect(0, 0, v, b), H.imageSmoothingEnabled = !0, H.imageSmoothingQuality = "high", ie < 1 && H.drawImage(he(e, "a", l, f, s), 0, 0, f, s, 0, 0, v, b), I && ie > 0 && (H.globalAlpha = ie, H.drawImage(he(e, "b", I.image, f, s), 0, 0, f, s, 0, 0, v, b), H.globalAlpha = 1), H.globalCompositeOperation = "destination-in", H.imageSmoothingEnabled = !1, H.drawImage(R, 0, 0), H.globalCompositeOperation = "source-over", n.clearRect(0, 0, f, s), _ && j > 0 ? (n.imageSmoothingEnabled = !0, n.imageSmoothingQuality = "high", n.globalAlpha = j, n.drawImage(he(e, "a", l, f, s), 0, 0), n.globalAlpha = 1) : x && I && M > 0 && (n.imageSmoothingEnabled = !0, n.imageSmoothingQuality = "high", n.globalAlpha = M, n.drawImage(he(e, "b", I.image, f, s), 0, 0), n.globalAlpha = 1), n.imageSmoothingEnabled = !1, n.drawImage(ae, 0, 0, v, b, 0, 0, f, s), n.imageSmoothingEnabled = !0, x && I && d >= 1 && M >= 1 && (e.image = I.image, e.pendingReveal = null, e.boilHandoffStartMs = 0, e.holdPaintedImg = null, e.phase = "hold", o.style.opacity = "0", (Se = e.onRevealComplete) == null || Se.call(e));
}
function aa(e) {
  const t = e.canvas.getContext("2d");
  if (!t) throw new Error("img-fx: 2D context unavailable for reveal canvas");
  const a = {
    active: !1,
    phase: "idle",
    revealStartMs: 0,
    hideStartMs: 0,
    hideDurationMs: 300,
    boilStartMs: 0,
    boilPattern: null,
    boilPatternW: 0,
    boilPatternH: 0,
    boilField: null,
    boilHandoffStartMs: 0,
    pendingReveal: null,
    image: null,
    cssWidth: e.cssWidth,
    cssHeight: e.cssHeight,
    sampleCanvas: null,
    sampleCtx: null,
    sampleImgData: null,
    sampleDataCache: null,
    sampleFrameCounter: 0,
    maskGrad: null,
    maskGradCtx: null,
    maskImgData: null,
    gsFlickerTable: null,
    pixCanvas: null,
    pixCtx: null,
    pixDrop: null,
    pixDropCtx: null,
    pixDropImgData: null,
    pixDropPattern: null,
    pixDropPatternW: 0,
    pixDropPatternH: 0,
    pixDropRevealStart: -1,
    coverA: null,
    coverB: null,
    holdPaintedImg: null,
    holdPaintedW: 0,
    holdPaintedH: 0,
    sampleGpuCanvas: null,
    sampleGpuCtx: null
  }, n = e.shaderCanvas;
  function o(l) {
    a.image = l.image, a.cssWidth = l.cssWidth, a.cssHeight = l.cssHeight, a.onRevealComplete = l.onRevealComplete, a.revealStartMs = performance.now(), a.phase = "reveal", a.active = !0, a.boilHandoffStartMs = 0, a.pendingReveal = null, a.sampleFrameCounter = 0, a.sampleDataCache = null, a.holdPaintedImg = null, t.canvas.style.opacity = "1";
  }
  return {
    canvas: e.canvas,
    ctx: t,
    afterShaderFrame(l, c, f) {
      var u;
      if (a.cssWidth = c.cssWidth, a.cssHeight = c.cssHeight, !a.active) {
        t.canvas.style.filter = "none";
        return;
      }
      const { duration: s, easingKey: h } = ct(c.preset);
      if (a.phase === "reveal" && a.image) {
        const g = (f - a.revealStartMs) / 1e3, m = Math.min(g / s, 1), v = Pe(h, m);
        n.style.opacity = String(1 - v), Xt(a, l, c, t), m >= 1 && (a.phase = "hold", n.style.opacity = "0", (u = a.onRevealComplete) == null || u.call(a));
      } else if (a.phase === "hold" && a.image) {
        t.canvas.style.filter = "none";
        const g = a.image, m = c.canvas.width, v = c.canvas.height;
        (t.canvas.width !== m || t.canvas.height !== v) && (t.canvas.width = m, t.canvas.height = v, a.holdPaintedImg = null), (a.holdPaintedImg !== g || a.holdPaintedW !== m || a.holdPaintedH !== v) && (t.clearRect(0, 0, m, v), t.globalCompositeOperation = "source-over", t.globalAlpha = 1, t.imageSmoothingEnabled = !0, t.imageSmoothingQuality = "high", t.drawImage(he(a, "a", g, m, v), 0, 0), a.holdPaintedImg = g, a.holdPaintedW = m, a.holdPaintedH = v), n.style.opacity = "0";
      } else if (a.phase === "boil" && a.image)
        ta(a, l, c, t, n, f);
      else if (a.phase === "hide") {
        const g = f - a.hideStartMs, m = Math.min(g / Math.max(1, a.hideDurationMs), 1), v = 1 - m;
        t.canvas.style.opacity = String(v), n.style.opacity = String(m), m >= 1 && (a.active = !1, a.phase = "idle", t.canvas.style.opacity = "1", t.clearRect(0, 0, t.canvas.width, t.canvas.height), n.style.opacity = "1", a.image = null);
      }
    },
    startReveal(l) {
      if (a.phase === "boil" && a.active) {
        a.pendingReveal = l, a.onRevealComplete = l.onRevealComplete, a.cssWidth = l.cssWidth, a.cssHeight = l.cssHeight, a.boilHandoffStartMs === 0 && (a.boilHandoffStartMs = performance.now());
        return;
      }
      o(l);
    },
    startHide(l = 300) {
      !a.active || a.phase === "hide" || (a.phase = "hide", a.hideStartMs = performance.now(), a.hideDurationMs = l);
    },
    startBoil() {
      !a.active || !a.image || a.phase !== "hold" && a.phase !== "reveal" || (a.phase = "boil", a.boilStartMs = performance.now(), a.boilHandoffStartMs = 0, a.pendingReveal = null, a.boilPattern = null, a.sampleFrameCounter = 0, a.sampleDataCache = null, a.holdPaintedImg = null, t.canvas.style.opacity = "1");
    },
    clear() {
      const l = a.active;
      a.active = !1, a.phase = "idle", a.image = null, a.boilHandoffStartMs = 0, a.pendingReveal = null, a.holdPaintedImg = null, t.clearRect(0, 0, t.canvas.width, t.canvas.height), l && (t.canvas.style.filter = "none", t.canvas.style.opacity = "1", n.style.opacity = "1");
    },
    isActive() {
      return a.active;
    },
    dispose() {
      a.image = null, a.sampleCanvas = null, a.sampleCtx = null, a.sampleImgData = null, a.sampleDataCache = null, a.sampleFrameCounter = 0, a.maskGrad = null, a.maskGradCtx = null, a.maskImgData = null, a.gsFlickerTable = null, a.pixCanvas = null, a.pixCtx = null, a.pixDrop = null, a.pixDropCtx = null, a.pixDropImgData = null, a.pixDropPattern = null, a.boilPattern = null, a.boilField = null, a.pendingReveal = null, a.coverA = null, a.coverB = null, a.holdPaintedImg = null, a.sampleGpuCanvas = null, a.sampleGpuCtx = null;
    }
  };
}
function Je(e, t) {
  if (e.length === 0) return null;
  if (e.length === 1) return { src: e[0], idx: 0 };
  let a;
  do
    a = Math.floor(Math.random() * e.length);
  while (a === t);
  return { src: e[a], idx: a };
}
function na(e) {
  let t = e.images.slice(), a = e.delayRange, n = e.holdMs, o = e.fadeOutMs, i = e.onPhase, l = e.excludeSrcs, c = "idle", f = null, s = -1, h = !1, u = !1, g = null, m = !1, v = "auto";
  function b(d) {
    c = d, i == null || i({ phase: d, src: g });
  }
  function P() {
    f != null && (clearTimeout(f), f = null);
  }
  function I() {
    if (typeof n == "number") return Math.max(0, n);
    const [d, x] = n, C = Math.max(0, Math.min(d, x)), y = Math.max(0, Math.max(d, x));
    return C + Math.random() * (y - C);
  }
  function w(d) {
    if (!h || u) return;
    b("idle");
    const [x, C] = a, y = x + Math.random() * Math.max(0, C - x), k = d ?? y * 1e3;
    P(), f = setTimeout(() => {
      f = null, F(!0, "auto");
    }, k);
  }
  function oe() {
    u || (b("hide"), e.reveal.startHide(o), P(), f = setTimeout(() => {
      f = null, !u && (g = null, m ? w() : (h = !1, b("idle")));
    }, o));
  }
  function ie() {
    if (t.length === 0) return null;
    const d = l == null ? void 0 : l(), x = d == null ? null : d instanceof Set ? d : new Set(d);
    if (!x || x.size === 0)
      return Je(t, s);
    const C = s >= 0 && s < t.length ? t[s] : null, y = [];
    for (let _ = 0; _ < t.length; _++) {
      const W = t[_];
      x.has(W) || W === C && t.length > x.size + 1 || y.push(_);
    }
    if (y.length === 0)
      return Je(t, s);
    const k = y[Math.floor(Math.random() * y.length)];
    return { src: t[k], idx: k };
  }
  function F(d, x) {
    if (!h || u) return;
    if (t.length === 0) {
      d ? w(500) : h = !1;
      return;
    }
    const C = ie();
    if (!C) {
      d ? w(500) : h = !1;
      return;
    }
    s = C.idx, g = C.src, m = d, v = x, Ut(C.src).then((y) => {
      !h || u || (b("reveal"), e.reveal.startReveal({
        image: y,
        cssWidth: e.reveal.canvas.clientWidth || e.reveal.canvas.width,
        cssHeight: e.reveal.canvas.clientHeight || e.reveal.canvas.height,
        onRevealComplete: () => {
          if (!h || u) return;
          if (b("visible"), x === "manual") {
            P();
            return;
          }
          P();
          const k = I();
          f = setTimeout(() => {
            f = null, !(!h || u) && oe();
          }, k);
        }
      }));
    }).catch(() => {
      g = null, d ? w(500) : h = !1;
    });
  }
  function M(d) {
    if (u || c === "reveal" || c === "visible" || c === "hide") return;
    const x = h;
    P(), x || (h = !0), F(x, (d == null ? void 0 : d.hold) ?? "auto");
  }
  return {
    start() {
      if (h) return;
      h = !0, u = !1;
      const d = e.initialDelayMs ?? Math.random() * 1500;
      w(d);
    },
    stop() {
      h = !1, P(), e.reveal.clear(), g = null, c = "idle";
    },
    triggerOnce(d) {
      M(d);
    },
    triggerHide() {
      u || c !== "reveal" && c !== "visible" || oe();
    },
    triggerBoil(d) {
      if (u || c !== "reveal" && c !== "visible") return;
      P(), e.reveal.startBoil(), g = null, h = !1, b("idle");
      const x = d == null ? void 0 : d.autoRevealAfterMs;
      x != null && Number.isFinite(x) && (f = setTimeout(() => {
        f = null, M({ hold: "manual" });
      }, Math.max(0, x)));
    },
    getPhase() {
      return c;
    },
    setPaused(d) {
      if (u !== d) {
        if (u = d, u)
          P();
        else if (h)
          if (c === "visible") {
            if (v === "manual")
              return;
            P(), f = setTimeout(() => {
              f = null, oe();
            }, Math.min(I(), 500));
          } else c === "hide" ? (P(), f = setTimeout(() => {
            f = null, g = null, w();
          }, o)) : w();
      }
    },
    setImages(d) {
      t = d.slice(), s = -1;
    },
    setExcludeSrcs(d) {
      l = d ?? void 0;
    },
    setOptions(d) {
      d.delayRange && (a = d.delayRange), d.holdMs != null && (n = d.holdMs), d.fadeOutMs != null && (o = d.fadeOutMs), d.onPhase && (i = d.onPhase);
    },
    isRunning() {
      return h && !u;
    },
    dispose() {
      h = !1, P();
    }
  };
}
const et = (e, t, a) => 0.299 * e + 0.587 * t + 0.114 * a, tt = (e, t, a) => `#${[e, t, a].map((n) => Math.round(n).toString(16).padStart(2, "0")).join("")}`, xe = 24;
let Fe = null, Ae = null;
function oa() {
  return Ae || (typeof document > "u" ? null : (Fe = document.createElement("canvas"), Fe.width = xe, Fe.height = xe, Ae = Fe.getContext("2d", { willReadFrequently: !0 }), Ae));
}
function la(e, t) {
  if (e.width === 0 || e.height === 0) return null;
  const a = oa();
  if (!a) return null;
  a.imageSmoothingEnabled = !0, a.clearRect(0, 0, xe, xe), a.drawImage(e, 0, 0, xe, xe);
  let n;
  try {
    n = a.getImageData(0, 0, xe, xe).data;
  } catch {
    return null;
  }
  const o = [];
  let i = 0, l = 0, c = 0;
  for (let u = 0; u < n.length; u += 4) {
    if (n[u + 3] < 8) continue;
    const g = n[u], m = n[u + 1], v = n[u + 2];
    o.push({ r: g, g: m, b: v, lum: et(g, m, v) }), i += g, l += m, c += v;
  }
  if (o.length === 0) return null;
  o.sort((u, g) => u.lum - g.lum);
  const f = tt(i / o.length, l / o.length, c / o.length), s = t.map((u, g) => {
    const [m, v, b] = be(u);
    return { slot: g, lum: et(m, v, b) };
  }).sort((u, g) => u.lum - g.lum), h = new Array(s.length);
  for (let u = 0; u < s.length; u++) {
    const g = 0.05 + 0.9 * u / Math.max(1, s.length - 1), m = o[Math.min(o.length - 1, Math.round(g * (o.length - 1)))];
    h[s[u].slot] = tt(m.r, m.g, m.b);
  }
  return { colors: h, cardBg: f };
}
const at = "img-fx-styles", ia = (
  /* css */
  `
.image-gen-root {
  position: relative;
  display: inline-block;
  isolation: isolate;
  overflow: hidden;
  vertical-align: top;
  line-height: 0;
  flex: 0 0 auto;
}

.image-gen-root > .image-gen-shader,
.image-gen-root > .image-gen-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border-radius: inherit;
  display: block;
}

.image-gen-root > .image-gen-shader {
  z-index: 1;
}

.image-gen-root > .image-gen-overlay {
  z-index: 2;
}

.image-gen-root > .image-gen-child {
  position: relative;
  z-index: 0;
  display: block;
  line-height: normal;
}
`
);
let qe = !1;
function dt() {
  if (typeof document > "u" || qe) return;
  if (document.getElementById(at)) {
    qe = !0;
    return;
  }
  const e = document.createElement("style");
  e.id = at, e.textContent = ia, document.head.appendChild(e), qe = !0;
}
dt();
function nt() {
  if (typeof document > "u") return "dark";
  const e = document.documentElement, t = e.getAttribute("data-theme");
  if (t === "dark" || t === "light") return t;
  if (e.classList.contains("dark")) return "dark";
  if (e.classList.contains("light")) return "light";
  const a = e.style.colorScheme || getComputedStyle(e).colorScheme;
  return a === "dark" ? "dark" : a === "light" ? "light" : typeof window < "u" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : "dark";
}
function sa(e) {
  const [t, a] = Ve(() => e !== "auto" ? e : nt());
  return de(() => {
    if (e !== "auto") {
      a(e);
      return;
    }
    if (typeof window > "u") return;
    const n = () => a(nt());
    n();
    const o = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    o == null || o.addEventListener("change", n);
    let i = null;
    return typeof document < "u" && typeof MutationObserver < "u" && (i = new MutationObserver(n), i.observe(document.documentElement, {
      attributes: !0,
      attributeFilter: ["class", "style", "data-theme"]
    })), () => {
      o == null || o.removeEventListener("change", n), i == null || i.disconnect();
    };
  }, [e]), t;
}
function ra(e) {
  return e ? typeof e == "string" ? [e] : e.slice() : [];
}
const Ue = ["pixels-mechanic", "pixels-organic"];
function ca(e) {
  return Ue.includes(e);
}
const fa = ht(function({
  children: t,
  preset: a = "pixels-organic",
  theme: n = "auto",
  strength: o = 1,
  pixelScale: i = 1,
  cardBg: l,
  colors: c,
  images: f,
  autoReveal: s = !1,
  revealDelayRange: h = [2, 4],
  revealInitialDelay: u,
  revealHoldMs: g = 2e3,
  revealFadeOutMs: m = 300,
  borderRadius: v,
  paused: b = !1,
  onCycle: P,
  excludeSrcs: I,
  className: w,
  style: oe,
  ...ie
}, F) {
  const M = ee(null), d = ee(null), x = ee(null), C = ee(null), y = ee(null), k = ee(null), _ = ee(null), W = ee(P), j = ee(I), [S, G] = Ve(null), [V, ae] = Ve(null);
  gt(
    F,
    () => ({
      get element() {
        return M.current;
      },
      triggerReveal(r) {
        var D;
        (D = _.current) == null || D.triggerOnce(r);
      },
      triggerHide() {
        var r;
        (r = _.current) == null || r.triggerHide();
      },
      triggerRegenerate(r) {
        const D = _.current;
        if (!D || T.current) return;
        const K = D.getPhase();
        if (K !== "reveal" && K !== "visible") return;
        const le = pe.current, Y = ca(le) ? null : Ue[Math.floor(Math.random() * Ue.length)];
        if ((r == null ? void 0 : r.tintFromImage) ?? !0) {
          const fe = x.current;
          if (fe) {
            const we = Y ? We[Y].modes[ce.current].colors : A.current.colors, me = la(fe, we);
            me && G(me);
          }
        }
        Y && ae(Y);
        const ge = (r == null ? void 0 : r.autoReveal) ?? !0;
        D.triggerBoil(
          ge ? { autoRevealAfterMs: (r == null ? void 0 : r.durationMs) ?? 4e3 } : void 0
        );
      },
      isImageActive() {
        var D;
        const r = ((D = _.current) == null ? void 0 : D.getPhase()) ?? "idle";
        return r === "reveal" || r === "visible" || r === "hide";
      }
    }),
    []
  ), je(() => {
    dt();
  }, []), de(() => {
    W.current = P;
  }, [P]), de(() => {
    j.current = I;
  }, [I]);
  const H = sa(n), R = ke(() => We[a].modes[H], [a, H]), X = l ?? R.cardBg, A = ee(R);
  A.current = R;
  const pe = ee(a);
  pe.current = a;
  const ce = ee(H);
  ce.current = H;
  const T = ee(b);
  T.current = b;
  const Z = ke(() => ra(f), [f]), N = ee(Z), E = ee(h), U = ee(g), z = ee(m);
  N.current = Z, E.current = h, U.current = g, z.current = m;
  const q = ee(
    ke(() => {
      if (u == null) return;
      if (typeof u == "number")
        return Math.max(0, u) * 1e3;
      const [r, D] = u, K = Math.max(0, Math.min(r, D)), le = Math.max(0, Math.max(r, D));
      return (K + Math.random() * (le - K)) * 1e3;
    }, [])
  );
  je(() => {
    var re;
    const r = M.current, D = d.current, K = x.current;
    if (!r || !D || !K) return;
    const le = () => {
      var Xe;
      const J = r.getBoundingClientRect(), L = Math.max(1, Math.round(J.width)), ve = Math.max(1, Math.round(J.height));
      let Ie = 0;
      if (typeof v == "number")
        Ie = v;
      else {
        const $e = (Xe = C.current) == null ? void 0 : Xe.firstElementChild;
        if ($e) {
          const ye = parseFloat(getComputedStyle($e).borderTopLeftRadius);
          Number.isFinite(ye) && ye > 0 && (Ie = ye);
        }
        if (Ie === 0) {
          const ye = parseFloat(getComputedStyle(r).borderTopLeftRadius);
          Number.isFinite(ye) && ye > 0 && (Ie = ye);
        }
      }
      return { w: L, h: ve, r: Ie };
    }, Y = le(), ge = kt({
      canvas: D,
      cssWidth: Y.w,
      cssHeight: Y.h,
      preset: R,
      strength: o,
      cardBg: l ?? null,
      pixelScale: i
    });
    y.current = ge, ge.canvas.style.opacity = String(Math.max(0, Math.min(1, o)));
    const fe = aa({
      canvas: K,
      cssWidth: Y.w,
      cssHeight: Y.h,
      shaderCanvas: D
    });
    ge.reveal = fe, k.current = fe;
    const we = na({
      reveal: fe,
      images: N.current,
      delayRange: E.current,
      holdMs: U.current,
      fadeOutMs: z.current,
      initialDelayMs: q.current,
      onPhase: (J) => {
        var L;
        J.phase === "visible" && (G(null), ae(null)), (L = W.current) == null || L.call(W, J);
      },
      excludeSrcs: () => {
        var J;
        return ((J = j.current) == null ? void 0 : J.call(j)) ?? null;
      }
    });
    _.current = we, b && we.setPaused(!0), r.style.setProperty("--image-gen-radius", `${Y.r}px`), r.style.borderRadius = `${Y.r}px`;
    let me = 0, _e = -1, Ce = -1, Se = -1;
    const B = () => {
      me = 0;
      const J = y.current;
      if (!J) return;
      const L = le();
      (L.w !== _e || L.h !== Ce) && (Ft(J, L.w, L.h), _e = L.w, Ce = L.h), L.r !== Se && (r.style.setProperty("--image-gen-radius", `${L.r}px`), r.style.borderRadius = `${L.r}px`, Se = L.r);
    }, $ = () => {
      me === 0 && (me = requestAnimationFrame(B));
    }, ue = new ResizeObserver($);
    ue.observe(r);
    const te = (re = C.current) == null ? void 0 : re.firstElementChild;
    te && ue.observe(te);
    let Q = null;
    te && typeof MutationObserver < "u" && (Q = new MutationObserver($), Q.observe(te, {
      attributes: !0,
      attributeFilter: ["class", "style"]
    })), _e = Y.w, Ce = Y.h, Se = Y.r;
    let O = null;
    return typeof IntersectionObserver < "u" && (O = new IntersectionObserver(
      (J) => {
        const L = y.current;
        if (L)
          for (const ve of J) Lt(L, ve.isIntersecting);
      },
      { rootMargin: "64px" }
    ), O.observe(r)), () => {
      var L;
      ue.disconnect(), Q == null || Q.disconnect(), O == null || O.disconnect(), me !== 0 && cancelAnimationFrame(me), (L = _.current) == null || L.dispose(), _.current = null, fe.dispose(), k.current = null;
      const J = y.current;
      J && Bt(J), y.current = null;
    };
  }, []), de(() => {
    const r = y.current;
    if (!r) return;
    const D = V ? We[V].modes[H] : R;
    At(r, D), Be(r);
  }, [R, V, H]), de(() => {
    const r = y.current;
    r && (zt(r, (S == null ? void 0 : S.cardBg) ?? l ?? null), Be(r));
  }, [l, S]), de(() => {
    const r = y.current;
    r && (Ht(r, (S == null ? void 0 : S.colors) ?? c ?? null), Be(r));
  }, [c, S]), de(() => {
    const r = y.current;
    r && (Tt(r, o), r.canvas && (r.canvas.style.opacity = String(Math.max(0, Math.min(1, o)))));
  }, [o]), de(() => {
    const r = y.current;
    r && (Gt(r, i), Be(r));
  }, [i]), de(() => {
    var D;
    const r = y.current;
    r && Wt(r, b), (D = _.current) == null || D.setPaused(b);
  }, [b]), de(() => {
    var r;
    (r = _.current) == null || r.setImages(Z);
  }, [Z]), de(() => {
    var r;
    (r = _.current) == null || r.setOptions({
      delayRange: h,
      holdMs: g,
      fadeOutMs: m
    });
  }, [h, g, m]), de(() => {
    const r = _.current;
    if (r) {
      if (s)
        return r.start(), () => r.stop();
      r.stop();
    }
  }, [s]);
  const se = ke(() => ({
    // During a regenerate churn the card surface wears the outgoing
    // image's average color so the dropped cells read as image pixels.
    background: (S == null ? void 0 : S.cardBg) ?? X,
    ...oe
  }), [X, S, oe]);
  return /* @__PURE__ */ pt(
    "div",
    {
      ...ie,
      ref: M,
      className: ["image-gen-root", w].filter(Boolean).join(" "),
      "data-preset": a,
      "data-theme": H,
      "data-paused": b ? "true" : void 0,
      style: se,
      children: [
        /* @__PURE__ */ Le("canvas", { ref: d, className: "image-gen-shader", "aria-hidden": "true" }),
        /* @__PURE__ */ Le("canvas", { ref: x, className: "image-gen-overlay", "aria-hidden": "true" }),
        /* @__PURE__ */ Le("div", { ref: C, className: "image-gen-child", children: t })
      ]
    }
  );
});
fa.displayName = "ImageGeneration";
export {
  fa as ImageGeneration,
  We as PRESETS,
  na as createCycle,
  kt as createInstance,
  aa as createReveal,
  Bt as destroyInstance,
  Pe as ease,
  Rt as effectiveCardBg,
  ma as getFrameRate,
  va as getMaxDpr,
  pa as hexToRgb,
  Ut as loadImage,
  be as parseCssColor,
  Je as pickRandomImage,
  la as samplePaletteFromCanvas,
  ha as setFrameRate,
  zt as setInstanceCardBg,
  Ht as setInstanceColors,
  Wt as setInstancePaused,
  At as setInstancePreset,
  Tt as setInstanceStrength,
  Lt as setInstanceVisible,
  ga as setMaxDpr,
  Ft as updateInstanceSize
};
