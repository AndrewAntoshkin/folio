import { CSSProperties } from 'react';
import { ForwardRefExoticComponent } from 'react';
import { HTMLAttributes } from 'react';
import { ReactNode } from 'react';
import { RefAttributes } from 'react';
import * as THREE_2 from 'three';

export declare function createCycle(opts: CycleOptions): Cycle;

export declare function createInstance(opts: CreateInstanceOptions): Instance;

/** Public API */
export declare interface CreateInstanceOptions {
    canvas: HTMLCanvasElement;
    cssWidth: number;
    cssHeight: number;
    preset: PresetMode;
    strength?: number;
    cardBg?: string | null;
    /** Pixel-cell size multiplier (see `Instance.pixelScale`). @default 1 */
    pixelScale?: number;
}

export declare function createReveal(opts: CreateRevealOptions): RevealState;

export declare interface CreateRevealOptions {
    /** The DOM canvas overlay (sibling of the shader canvas). */
    canvas: HTMLCanvasElement;
    cssWidth: number;
    cssHeight: number;
    /** Shader canvas — its opacity is driven by the reveal so the image
     *  cross-fades over it. */
    shaderCanvas: HTMLCanvasElement;
}

export declare interface Cycle {
    start: () => void;
    stop: () => void;
    /** Replace the `excludeSrcs` callback (or clear it by passing `null`). */
    setExcludeSrcs: (fn: CycleOptions['excludeSrcs'] | null) => void;
    /**
     * Fire a single reveal pass *now*, regardless of whether the cycle is
     * currently auto-running. No-op if a reveal is already in progress
     * (`reveal`/`visible`/`hide` phases).
     *
     * `hold: 'auto'` (default) — runs reveal -> hold (`holdMs`) -> hide
     * automatically. When auto-running this re-enters the auto-loop afterwards;
     * otherwise the cycle returns to a stopped idle state.
     *
     * `hold: 'manual'` — runs reveal then stays in the `visible` phase
     * indefinitely. Call `triggerHide()` to fade out.
     */
    triggerOnce: (opts?: {
        hold?: 'auto' | 'manual';
    }) => void;
    /**
     * Manually trigger the hide fade if currently in `reveal` or `visible`
     * phase. No-op otherwise. Useful for "Hide image" buttons that complement
     * a `triggerOnce({ hold: 'manual' })` call.
     */
    triggerHide: () => void;
    /**
     * Dissolve the currently revealed image into a sustained "regenerating"
     * pixel churn: the image breaks into the effect's cell grid, cells pop
     * in/out with the preset's flicker clock, and the shader plays through the
     * gaps (see `RevealState.startBoil`). The cycle returns to a stopped
     * `idle` state so the consumer can end the churn with `triggerOnce()`
     * (reveals the next image over it) or `stop()`. No-op unless currently in
     * `reveal`/`visible`.
     *
     * `autoRevealAfterMs` — when set, the churn ends by itself: after that many
     * ms the cycle fires `triggerOnce({ hold: 'manual' })`, dissolving the next
     * image in over the churn. Any manual `triggerOnce()` / `stop()` before the
     * timer fires cancels it.
     */
    triggerBoil: (opts?: {
        autoRevealAfterMs?: number;
    }) => void;
    /** Current phase of the cycle. Useful for syncing UI button state. */
    getPhase: () => CyclePhase;
    setPaused: (paused: boolean) => void;
    setImages: (images: string[]) => void;
    setOptions: (opts: Partial<Pick<CycleOptions, 'delayRange' | 'holdMs' | 'fadeOutMs' | 'onPhase'>>) => void;
    isRunning: () => boolean;
    dispose: () => void;
}

export declare interface CycleEvent {
    phase: CyclePhase;
    src: string | null;
}

export declare interface CycleOptions {
    reveal: RevealState;
    /** Image pool. Random pick per cycle, never same as previous. */
    images: string[];
    /** Random seconds in `idle` phase (shader-only). */
    delayRange: [number, number];
    /**
     * Time the image stays visible after the reveal completes.
     * - `number` — fixed ms.
     * - `[min, max]` — random ms per cycle, re-rolled each reveal.
     */
    holdMs: number | [number, number];
    /** ms cross-fade back to shader. */
    fadeOutMs: number;
    /** Random initial delay seed so multiple cycles don't sync. */
    initialDelayMs?: number;
    /** Cycle event hook. */
    onPhase?: (event: CycleEvent) => void;
    /**
     * Optional callback invoked just before each pick that returns a list of
     * src strings the cycle MUST avoid this round (in addition to its own
     * "no immediate repeat" rule). Use this to coordinate multiple cycles so
     * they never display the same image at the same time. If every candidate
     * is excluded the cycle falls back to the standard random pick.
     */
    excludeSrcs?: () => string[] | Set<string> | null | undefined;
}

export declare type CyclePhase = 'idle' | 'reveal' | 'visible' | 'hide';

export declare function destroyInstance(inst: Instance): void;

export declare function ease(key: EasingKey, t: number): number;

export declare type EaseFn = (t: number) => number;

export declare type EasingKey = 'linear' | 'smoothstep' | 'easeOutCubic' | 'easeOutQuint' | 'easeInOutCubic' | 'easeOutExpo' | 'easeOutBack';

/** Hex (#rrggbb) currently in effect for this instance, accounting for override. */
export declare function effectiveCardBg(inst: Instance): string;

/* Excluded from this release type: EngineMosaicConfig */

/* Excluded from this release type: EnginePresetMode */

/* Excluded from this release type: EngineRevealConfig */

/** Read the current cap (frames per second). */
export declare function getFrameRate(): number;

/** Read the current MAX_DPR cap. */
export declare function getMaxDpr(): number;

/**
 * `#rrggbb` -> normalized [r, g, b] in 0..1.
 *
 * @deprecated Use {@link parseCssColor} instead. `hexToRgb` only handles
 * `#rgb` / `#rrggbb` input — passing anything else (e.g. `rgba(...)`,
 * a colour name, `hsl(...)`) produces `NaN` channels and breaks shader
 * uniforms. Kept exported for backward compatibility; internal callers
 * now route through `parseCssColor`.
 */
export declare function hexToRgb(hex: string): [number, number, number];

export declare const ImageGeneration: ForwardRefExoticComponent<ImageGenerationProps & RefAttributes<ImageGenerationHandle>>;

/** Phase event emitted by the auto-reveal scheduler. */
export declare type ImageGenerationCycleEvent = CycleEvent;

/**
 * Imperative handle exposed via `ref` on `<ImageGeneration>`. Lets callers
 * trigger a single reveal from a button click or other user action without
 * enabling `autoReveal`.
 *
 * The wrapper element itself is also reachable via `handle.element`.
 */
export declare interface ImageGenerationHandle {
    /** The wrapper `<div>` element. */
    element: HTMLDivElement | null;
    /**
     * Run a reveal pass now.
     *
     * - No-op if a reveal is already in progress (currently revealing, holding
     *   the image visible, or fading back to the shader).
     * - `hold: 'auto'` (default) — runs reveal -> hold (`revealHoldMs`) -> hide
     *   automatically, mirroring the auto-loop's pass.
     * - `hold: 'manual'` — runs reveal then stays in the visible phase until
     *   `triggerHide()` is called. Use this for "Reveal / Hide" toggle buttons.
     *
     * Requires a non-empty `images` prop; otherwise it's a silent no-op.
     */
    triggerReveal: (opts?: {
        hold?: 'auto' | 'manual';
    }) => void;
    /**
     * Manually trigger the hide fade if an image is currently revealed (in
     * `reveal` or `visible` phase). No-op otherwise.
     */
    triggerHide: () => void;
    /**
     * Regenerate the currently revealed image in place: the image breaks into
     * the effect's pixel-cell grid, the cells churn (pop in/out with the
     * preset's flicker clock) while the shader plays through the gaps, and
     * after `durationMs` the next image from the pool dissolves in over the
     * churn (held like `triggerReveal({ hold: 'manual' })`).
     *
     * By default the effect is also recolored from the outgoing image — its
     * palette is sampled from the visible pixels and mapped onto the preset's
     * palette slots by luminance rank, so the churn reads as pixelation born
     * from that image rather than the preset's stock colors. The preset
     * palette (or the `colors` prop, when set) is restored automatically once
     * the new image is fully visible.
     *
     * The churn always runs on a pixel-mosaic preset (`pixels-mechanic` /
     * `pixels-organic`). When the active preset is `sweep-gradient`, the effect
     * temporarily switches to a randomly-picked pixel preset for the churn and
     * restores the authored preset once the new image is fully visible.
     *
     * Options:
     * - `durationMs` — churn length before the next image auto-reveals.
     *   @default 4000
     * - `tintFromImage` — recolor the effect from the outgoing image.
     *   @default true
     * - `autoReveal` — set to `false` to churn indefinitely instead; end it
     *   manually with `triggerReveal()` (next image dissolves in over the
     *   churn) or `triggerHide()`.
     *   @default true
     *
     * No-op unless an image is currently revealed (`reveal` or `visible`
     * phase). Emits an `idle` cycle event when the churn starts.
     */
    triggerRegenerate: (opts?: {
        durationMs?: number;
        tintFromImage?: boolean;
        autoReveal?: boolean;
    }) => void;
    /**
     * Returns true while an image is showing on top of the shader (any of the
     * `reveal`, `visible`, or `hide` phases). Useful for driving the label /
     * icon of a Reveal/Hide toggle button.
     */
    isImageActive: () => boolean;
}

/** Bundled preset names. Each preset ships both a dark and light tunings block. */
export declare type ImageGenerationPreset = PresetName;

export declare interface ImageGenerationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    /**
     * Single host element to wrap. The wrapper sizes itself to the child; the
     * shader paints inside the wrapper at full size, clipped to the child's
     * border-radius.
     */
    children: ReactNode;
    /**
     * Selects which bundled preset to render.
     *
     * - `pixels-organic` - Chromium Flow rendered as a pixel mosaic.
     * - `pixels-mechanic`- Nebula rendered as a pixel mosaic.
     * - `sweep-gradient` - Gradient Sweep rendered as a pixel mosaic.
     *
     * @default 'pixels-organic'
     */
    preset?: ImageGenerationPreset;
    /**
     * Theme mode. `'auto'` resolves via `matchMedia('(prefers-color-scheme: dark)')`
     * and switches live when the OS theme changes.
     * @default 'auto'
     */
    theme?: ImageGenerationTheme;
    /**
     * Effect strength (0..1). Multiplies the shader canvas opacity. The shader
     * keeps animating at full intensity at any value; only the rendered alpha
     * is scaled down.
     * @default 1
     */
    strength?: number;
    /**
     * Pixel-cell size multiplier for the mosaic effect. Scales the on-screen
     * size of each pixel cell (and the matching reveal dissolve) without
     * touching the preset:
     *
     *   - `1` (default) — the preset's authored cell size.
     *   - `0.5` — cells at half size (finer grid, effect reads as "zoomed out").
     *   - `2` — cells at double size (chunkier grid, "zoomed in").
     *
     * Implemented by dividing the shader grid's base cell count by this value,
     * so the shader mosaic and the reveal pixel dissolve stay in lockstep. The
     * grid always keeps a floor of 2 cells, so extreme values are safe.
     * @default 1
     */
    pixelScale?: number;
    /**
     * Card background colour. Accepts any CSS colour string the browser can
     * parse — hex (`#rgb` / `#rrggbb` / `#rrggbbaa`), `rgb()` / `rgba()`,
     * `hsl()` / `hsla()`, named colours, modern `color(...)` syntax — and is
     * applied two ways:
     *
     *   1. Verbatim as the wrapper element's CSS `background`, so the
     *      original alpha is preserved visually.
     *   2. Parsed to an opaque RGB triple for the shader's `u_cardBg`
     *      uniform, which drives colour-proximity / contrast logic so any
     *      shader colours that match the card background get faded out and
     *      the effect stays visually balanced.
     *
     * Alpha is intentionally dropped when feeding the shader — the renderer
     * has no source for what's behind a translucent card and can't composite
     * correctly. If precise shader behaviour matters under a translucent
     * surface, pass the opaque colour you want the shader to reason against.
     *
     * Useful for keeping colours in sync when the host card surface changes
     * (e.g. dark-mode card swatch). When omitted, the preset's bundled
     * `cardBg` (always opaque hex) is used.
     */
    cardBg?: string;
    /**
     * Optional palette override for the running effect (up to 7 CSS colors,
     * one per shader palette slot). A slot with a value replaces the preset
     * color verbatim; `null` / `undefined` slots keep the preset color. Pass
     * `undefined` (or omit) to use the preset palette.
     *
     * Useful for re-tinting the effect from external data — e.g. colors
     * sampled from the image being regenerated — while keeping the exact same
     * animation and cell grid.
     */
    colors?: (string | null | undefined)[];
    /**
     * Image pool used by the reveal animation. Pass a single string to reveal
     * the same image every cycle, or an array for random pick (never
     * repeating the previous index).
     * @default []
     */
    images?: string | string[];
    /**
     * When true, runs the auto-reveal scheduler:
     *   shader (random delay) -> reveal -> hold -> hide -> repeat.
     * @default false
     */
    autoReveal?: boolean;
    /**
     * Random shader-only delay range in seconds between reveals.
     * @default [2, 4]
     */
    revealDelayRange?: [number, number];
    /**
     * One-time delay applied before the very first reveal (after `autoReveal`
     * is enabled or `triggerReveal` runs the first cycle). Subsequent reveals
     * follow `revealDelayRange`.
     *
     * - `number`: exact seconds.
     * - `[min, max]`: seconds range, randomised once at cycle creation.
     * - `undefined` (default): library picks a small jitter (0-1.5 s) so
     *   multiple instances on the same page don't tick in lockstep.
     *
     * Useful for staggering hero cards (e.g. card #2 = `[1, 3]`, card #3 =
     * `[1, 3]`) so they don't all reveal at once.
     */
    revealInitialDelay?: number | [number, number];
    /**
     * Time the image stays fully visible after the reveal animation completes,
     * before the hide cross-fade kicks in.
     *
     * - `number` — fixed milliseconds.
     * - `[min, max]` — random milliseconds per cycle, picked fresh each reveal.
     *
     * @default 2000
     */
    revealHoldMs?: number | [number, number];
    /** ms cross-fade back to the shader. @default 300 */
    revealFadeOutMs?: number;
    /**
     * Optional explicit corner radius (CSS px). When omitted, reads the
     * computed `border-radius` of the wrapped child each resize.
     */
    borderRadius?: number;
    /** Freezes the shader and the auto-reveal scheduler. @default false */
    paused?: boolean;
    /** Phase event hook for the auto-reveal cycle. */
    onCycle?: (event: ImageGenerationCycleEvent) => void;
    /**
     * Optional callback invoked just before each image pick that returns a list
     * of src strings the cycle MUST avoid this round. Use this to coordinate
     * multiple `<ImageGeneration>` instances that share an image pool so they
     * never display the same image at the same time.
     *
     * The callback runs on every pick (including manual `triggerReveal()`) so
     * it can read live state. If every candidate is excluded, the cycle falls
     * back to a normal random pick so it never gets stuck.
     */
    excludeSrcs?: () => string[] | Set<string> | null | undefined;
    /** Forwarded class name for the wrapper element. */
    className?: string;
    /** Forwarded inline styles for the wrapper element. */
    style?: CSSProperties;
}

/**
 * Theme mode for the img-fx effect.
 *
 * - `auto` (default): walks a small priority chain and updates live on any
 *   change:
 *     1. `<html data-theme="dark|light">`             — shadcn / SSR apps
 *     2. `<html class="dark">` / `class="light">`     — Tailwind v3 darkMode
 *     3. `<html style="color-scheme: dark|light">`    — CSS-only toggles
 *     4. `matchMedia('(prefers-color-scheme: dark)')` — OS preference
 *     5. `'dark'` fallback (SSR-safe; re-resolves on hydration)
 *   A MutationObserver on `<html>` re-resolves whenever class / style /
 *   data-theme changes, so JS theme toggles propagate without a remount.
 * - `dark` / `light`: pin to a specific mode regardless of system / app
 *   preference.
 */
export declare type ImageGenerationTheme = 'auto' | 'dark' | 'light';

/** Instance handle returned by `createInstance`. Each <ImageGeneration> owns one. */
export declare interface Instance {
    /** Visible 2D canvas painted into the host wrapper. */
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    /** CSS-px size (synced from ResizeObserver). */
    cssWidth: number;
    cssHeight: number;
    /** GL render DPR cached at creation; refreshed on resize. Caps at
     *  `maxDpr` (default 1.25) — this is the cheap-fragment-shader knob. */
    dpr: number;
    /** Display DPR for the visible 2D canvas (and reveal image). Caps at
     *  `MAX_CANVAS_DPR` (default 2). May exceed `dpr`: when it does, the
     *  low-DPR GL framebuffer is upscaled into the visible canvas with
     *  `imageSmoothingEnabled = false` so the cell mosaic stays crisp at
     *  no extra GL cost, while the reveal image — drawn directly into
     *  this canvas with smoothing enabled — gets the device's full pixel
     *  density. Fixes blur on iOS Safari/Firefox where DPR=3. */
    canvasDpr: number;
    /** Active preset mode block (dark or light).
     *
     * Typed as `EnginePresetMode` (the wider engine-internal shape)
     * even though the public `setInstancePreset` accepts a narrower
     * `PresetMode` — the cast is sound because the runtime objects
     * exported via PRESETS always carry the dot-mode fields. */
    preset: EnginePresetMode;
    /** Optional override for `preset.cardBg` (#rrggbb). When set, this color is
     *  used as the shader's `u_cardBg` and forwarded to the reveal helper so
     *  background-derived shader logic stays in sync with the host card color. */
    cardBgOverride: string | null;
    /** Optional per-slot palette override (CSS colors, up to 7 entries). A slot
     *  with a value replaces the preset color verbatim (bypassing the card-bg
     *  linked remap); missing/undefined slots fall back to the preset palette.
     *  Lets consumers re-tint the running effect (e.g. from an image) without
     *  authoring a whole preset. */
    colorsOverride: (string | null | undefined)[] | null;
    /** Strength multiplier 0..1 (drives `canvas.style.opacity`). */
    strength: number;
    /** Pixel-cell on-screen size multiplier. 1 = preset default, 0.5 = cells at
     *  half size (finer / zoomed out), 2 = double size (chunkier / zoomed in).
     *  Applied by dividing the shader grid's base cell count so both the shader
     *  mosaic and the reveal dissolve share the same scaled grid. */
    pixelScale: number;
    /** True when in viewport. */
    visible: boolean;
    /** True when the user has paused this instance. */
    paused: boolean;
    /** Dirty flag - true until uniforms have been re-uploaded. */
    uniformsDirty: boolean;
    /** Reveal state (image overlay drawn on top of shader). Null when no overlay. */
    reveal: RevealState | null;
    /** Per-instance accumulated time so each card animates at its own preset.speed. */
    accumulatedTime: number;
    /** When created (ms) — used for first-tick init only. */
    startedAtMs: number;
}

/**
 * Load (and cache) an image. Resolves once the bitmap is decoded and ready.
 *
 * Note: we do NOT set `img.crossOrigin` — for same-origin assets that would
 * trigger an unnecessary CORS preflight that most static dev servers don't
 * satisfy. Drawing images into a 2D canvas does not taint the canvas if the
 * image is same-origin. Consumers serving cross-origin images should set
 * proper CORS headers on their CDN.
 */
export declare function loadImage(src: string): Promise<HTMLImageElement>;

export declare type MaskShape = 'shader' | 'shaderHighlight' | 'shaderColor1' | 'shaderColor2' | 'shaderColor3' | 'shaderColor4' | 'shaderColor5' | 'radialCenter' | 'radialCorner' | 'linearTop' | 'linearBottom' | 'linearLeft' | 'linearRight' | 'diagonalTL' | 'diagonalBR' | 'diamond' | 'blindsH' | 'blindsV' | 'gradientSweep';

/** Per-cell mosaic configuration for pixel-mode rendering. */
export declare interface MosaicConfig {
    /** Cell-size 0..1; converted in shader to `floor(6 + cellSize*74)` cells. */
    cellSize: number;
    /** Inter-cell spacing 0..1. */
    gap: number;
    /** Highlight scale boost 0..1. */
    hlScale: number;
    /** Background fill opacity. */
    fillOpacity: number;
    /** Edge fade band in CSS px. */
    edgeFade: number;
    /** Edge fade strength 0..1. */
    fadeStr: number;
}

/**
 * Parse any CSS colour string to normalised `[r, g, b]` in 0..1.
 *
 * Accepts every value the host browser understands: hex (`#rgb`,
 * `#rrggbb`, `#rrggbbaa`), `rgb()` / `rgba()`, `hsl()` / `hsla()`, named
 * colours (`white`, `crimson`, …), and modern syntaxes like
 * `color(display-p3 …)`.
 *
 * **Alpha is dropped.** The shader's `u_cardBg` uniform is opaque RGB —
 * the renderer has no source for what's behind the card, so it can't
 * composite a translucent background colour correctly. The wrapper's CSS
 * `background` keeps the original string with its alpha intact, so
 * visually the card surface stays translucent; the shader's contrast /
 * proximity logic just uses the underlying opaque tint. If precise shader
 * behaviour matters, pass the opaque colour you actually want the shader
 * to reason against.
 *
 * Hex strings take a synchronous fast path that works in SSR. Everything
 * else needs the browser; if no canvas is available (Node, broken DOM) or
 * the input is unparseable, falls back to `[0, 0, 0]` (black).
 */
export declare function parseCssColor(input: string): [number, number, number];

/** Pull a random image from `pool`, never repeating the previous index. */
export declare function pickRandomImage(pool: string[], lastIdx: number): {
    src: string;
    idx: number;
} | null;

export declare interface Preset {
    name: PresetName;
    modes: Record<PresetTheme, PresetMode>;
}

/** A single theme-mode block of a preset (mirrors the JSON shape). */
export declare interface PresetMode {
    theme: PresetTheme;
    effectIndex: number;
    colors: [string, string, string, string, string, string, string];
    alphas: [number, number, number, number, number, number, number];
    cardBg: string;
    /** 0 = off (raw shader), 1 = pixels. */
    dotMode: 0 | 1;
    pixelConfig: MosaicConfig;
    /** Drift angle (degrees). */
    direction: number;
    speed: number;
    intensity: number;
    scale: number;
    softness: number;
    distortion: number;
    /** Gradient sweep cell flicker amplitude 0..1. */
    flicker?: number;
    complexity: number;
    shape: number;
    blur: number;
    highlight: number;
    vignette: number;
    vigOpacity: number;
    shaderOpacity: number;
    /** Gradient sweep movement easing type (0..4). */
    sweepEase?: number;
    revealConfig: RevealConfig;
    /** Human-readable effect name for diagnostics. */
    effect: string;
}

export declare type PresetName = 'pixels-organic' | 'pixels-mechanic' | 'sweep-gradient';

export declare const PRESETS: Record<PresetName, Preset>;

export declare type PresetTheme = 'dark' | 'light';

/** Reveal animation tunings (per-mode). */
export declare interface RevealConfig {
    /** Duration of the shader-based reveal mask animation (sec). */
    duration: number;
    /** Easing key applied during the reveal animation. */
    easing: EasingKey;
    /** Mask-shape type (geometric or shader-driven). */
    maskShape: MaskShape;
    /** Mask edge softness 0..1. */
    softness: number;
    /** Max CSS-px blur applied to the mask canvas during reveal. */
    blur: number;
    /** Pixel-cell dissolve duration (sec). */
    pixDuration: number;
    /** Easing for the pixel-cell dissolve. */
    pixEasing: EasingKey;
}

export declare interface RevealStartOptions {
    /** Image to reveal. */
    image: HTMLImageElement;
    /** Output canvas size (CSS px). Reveal canvas matches the shader canvas. */
    cssWidth: number;
    cssHeight: number;
    /** Phase scheduler hooks. */
    onRevealComplete?: () => void;
}

export declare interface RevealState {
    /** The DOM canvas painted on top of the shader canvas. */
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    /** Per-frame hook invoked after the shader has rendered. Decides what to do
     *  with the overlay this frame (paint mask, hold, fade out, idle). */
    afterShaderFrame: (s: SharedRenderer, inst: Instance, nowMs: number) => void;
    /** Begin a new reveal animation. */
    startReveal: (opts: RevealStartOptions) => void;
    /** Begin the fade-out (hide) phase. */
    startHide: (durationMs?: number) => void;
    /**
     * Dissolve the currently held image into a sustained "generating" state:
     * the image is broken into the effect's pixel-cell grid and the cells churn
     * (pop in/out with the preset's flicker clock) indefinitely while the
     * shader effect plays through the gaps. No-op unless an image is currently
     * revealed/held. Ends when `startReveal` (next image) or `startHide` runs.
     */
    startBoil: () => void;
    /** Force-clear the overlay back to idle. */
    clear: () => void;
    /** True while a reveal/hold/hide is in progress. */
    isActive: () => boolean;
    dispose: () => void;
}

export declare interface SampledPalette {
    /** One CSS hex color per shader palette slot (7 entries). */
    colors: string[];
    /** Average image color — used as the card surface behind the effect. */
    cardBg: string;
}

/**
 * Sample an image-derived recolor for the running effect from `src` (any
 * drawable canvas — typically the reveal overlay showing the current image).
 *
 * `presetColors` is the active preset mode's 7-slot palette; the returned
 * `colors` array maps image colors onto those slots by luminance rank.
 * Returns null when sampling isn't possible (SSR, empty canvas).
 */
export declare function samplePaletteFromCanvas(src: HTMLCanvasElement, presetColors: readonly string[]): SampledPalette | null;

/**
 * Cap the rAF tick rate (frames per second). Applies globally to every
 * instance sharing the renderer. Values are clamped to a sensible range so
 * a callsite can't accidentally starve the loop or burn CPU at >60.
 *
 * @example setFrameRate(10) // default — best for slow-drift presets
 * @example setFrameRate(15) // smoother for faster custom presets
 * @example setFrameRate(30) // restore the original cap
 */
export declare function setFrameRate(fps: number): void;

export declare function setInstanceCardBg(inst: Instance, cardBg: string | null): void;

/** Per-slot palette override (see `Instance.colorsOverride`). Pass null to
 *  restore the preset palette. */
export declare function setInstanceColors(inst: Instance, colors: (string | null | undefined)[] | null): void;

export declare function setInstancePaused(inst: Instance, paused: boolean): void;

export declare function setInstancePreset(inst: Instance, preset: PresetMode): void;

export declare function setInstanceStrength(inst: Instance, strength: number): void;

export declare function setInstanceVisible(inst: Instance, visible: boolean): void;

/**
 * Cap the device-pixel-ratio used by the GL canvas. Lower values mean
 * fewer fragments to shade per frame (~quadratic GPU saving). Updates the
 * shared `THREE.WebGLRenderer.setPixelRatio` AND every live instance's
 * cached `inst.dpr` so the next render uses the new ratio. Existing
 * instances are forced to re-upload uniforms because the change invalidates
 * the per-instance `u_dpr` value used by the shader's CSS-px calculations.
 *
 * Values are clamped to [1, 4]. Pass `1` for the strongest GPU saving on
 * retina displays; the default is `1.25`.
 */
export declare function setMaxDpr(dpr: number): void;

declare interface SharedRenderer {
    glCanvas: HTMLCanvasElement;
    /** WebGL2 context if available, otherwise WebGL1. */
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    renderer: THREE_2.WebGLRenderer;
    scene: THREE_2.Scene;
    camera: THREE_2.OrthographicCamera;
    material: THREE_2.ShaderMaterial;
    geometry: THREE_2.PlaneGeometry;
    mesh: THREE_2.Mesh;
    uniforms: Record<string, THREE_2.IUniform>;
    instances: Set<Instance>;
    /** 0 means the rAF loop is currently asleep (no active instances).
     *  The loop is re-armed by `wakeLoop()` whenever an instance becomes
     *  visible/unpaused or its size grows past the current GL canvas. */
    rafId: number;
    lastFrameMs: number;
    lastTickMs: number;
    /** Last instance whose uniforms were uploaded to `uniforms`. Used to skip
     *  re-uploading full uniform blocks when the same clean instance renders
     *  again back-to-back (e.g. single-card page, manual repaint). Null after
     *  destroy or when the next instance can't trust this cache. */
    lastInstance: Instance | null;
    /** WebGL context loss handlers — kept so we can detach on dispose. */
    onContextLost: ((e: Event) => void) | null;
    onContextRestored: (() => void) | null;
    contextLost: boolean;
}

export declare function updateInstanceSize(inst: Instance, cssWidth: number, cssHeight: number): void;

export { }
