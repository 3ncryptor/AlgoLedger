---
name: animated-svg-retrace
description: Convert any SVG into a stroke-retracing animated version. Each path/circle/line/rect/polyline/ellipse redraws its own stroke on trigger (hover, mount, scroll, or loop). Supports Framer Motion (pathLength) and pure CSS (stroke-dasharray/dashoffset). Use when asked to animate an SVG, create a draw-in or retrace effect, or build animated icon/logo/illustration components.
---

# Animated SVG Retrace — Skill Protocol

Derived from the production implementation in `apps/web/components/icons/`. The core idea: instead of animating the whole SVG as a single unit, each drawable child element individually retraces its own stroke boundary. This makes multi-stroke icons and illustrations read as a deliberate, choreographed sequence rather than a simultaneous flash.

---

## 1. The Core Technique

### How stroke drawing works

Every SVG stroked element has two CSS/SVG properties that control dash patterns:

- `stroke-dasharray` — length of the dash, then the gap. Set both to the total path length → one dash that covers the whole stroke.
- `stroke-dashoffset` — how far to shift the dash. At `totalLength`, the dash is fully offset out of view (invisible). At `0`, it is fully in view (drawn).

Animating `stroke-dashoffset` from `totalLength → 0` draws the stroke. Reversing it erases it.

**The `pathLength="1"` normalization trick** (used throughout this codebase):
Add `pathLength="1"` as an SVG attribute on any `<path>`. The browser normalizes the path's coordinate system so `stroke-dasharray="1"` and `stroke-dashoffset` values between `0` and `1` work regardless of actual path length — no JavaScript measurement required.

In **Framer Motion**, the `pathLength` motion value (0–1) handles all of this automatically — it sets `pathLength="1"` on the element and animates `stroke-dashoffset` for you.

### Three animation modes

| Mode | Values | Effect |
|---|---|---|
| **Retrace** | `pathLength: [1, 0, 1]` | Stroke erases itself then redraws — the signature effect |
| **Draw-in** | `pathLength: [0, 1]` | Stroke appears from start to end |
| **Erase** | `pathLength: [1, 0]` | Stroke disappears from end to start |
| **Loop draw** | `pathLength: [0, 1]` + `repeat: Infinity` | Continuously draws |

---

## 2. Step-by-Step: Convert Any SVG

### Step 1 — Parse the SVG source

Open the SVG file or markup and extract every drawable child element. Drawable elements are:

```
path  circle  ellipse  line  polyline  polygon  rect
```

Ignore: `defs`, `clipPath`, `mask`, `filter`, `title`, `desc`, and purely decorative `g` wrappers with no stroke.

**Check stroke vs. fill:**
- `fill="none"` + `stroke="..."` → ready to animate directly.
- `fill="currentColor"` + no stroke → add `fill="none"` and a `stroke` attribute to make it drawable. The outline of the filled shape becomes the stroke.
- Both fill and stroke → animate stroke, leave `fill` attribute intact.

### Step 2 — Build the element definition array

Represent each element as a tuple `[tag, attrs]`. Copy attributes verbatim from the SVG source. Drop presentation attributes that conflict with the animation (`stroke-dasharray`, `stroke-dashoffset` — these will be owned by the animation system).

```ts
// Format used in this codebase (apps/web/components/icons/icon-defs.ts)
type SvgTag = "path" | "circle" | "ellipse" | "line" | "polyline" | "polygon" | "rect";
type SvgElementDef = [SvgTag, Record<string, string | number>];

// Example: a simple arrow SVG
const ARROW_ELEMENTS: SvgElementDef[] = [
  ["path", { d: "M5 12h14", key: "shaft" }],
  ["path", { d: "m12 5 7 7-7 7", key: "head" }],
];
```

### Step 3 — Choose a trigger

| Trigger | When to use |
|---|---|
| `"hover"` | Interactive icons, nav items, CTAs — user controls playback |
| `"mount"` | Logos, hero illustrations — plays once when component loads |
| `"inview"` | Section decorations — triggers when entering viewport |
| `"loop"` | Loading spinners, ambient patterns |

### Step 4 — Plan choreography

Decide which elements animate, in what order, and how far apart.

- **All elements, sequential** — default, good for simple icons.
- **Selective** — animate only meaningful strokes; keep decorative fills static.
- **Semantic order** — e.g. WiFi arcs ripple innermost-first (feels like signal acquiring).
- **Stagger step** — `Math.min(0.06, 0.5 / numElements)` is the safe default from this codebase.

---

## 3. Implementation: Framer Motion (React)

Best for React projects already using Framer Motion. Zero new dependencies.

### Core reusable component

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

type SvgTag = "path" | "circle" | "ellipse" | "line" | "polyline" | "polygon" | "rect";
type SvgElementDef = [SvgTag, Record<string, string | number>];

interface ChoreographyDef {
  /** Which element indices animate; rest are static. Default: all. */
  animateIndices?: number[];
  /** Play order — list of indices from animateIndices. Default: sequential. */
  order?: number[];
  /** Seconds between each element's start. Default: min(0.06, 0.5/n). */
  staggerStep?: number;
}

interface AnimationDef {
  /** pathLength keyframes: [1,0,1]=retrace, [0,1]=draw-in, [1,0]=erase */
  pathLength: number[];
  /** Framer Motion times array (0–1), same length as pathLength. */
  times?: number[];
  duration?: number;
  ease?: string | number[];
  repeat?: number;
  repeatType?: "loop" | "reverse" | "mirror";
}

interface RetracingSvgProps {
  elements: SvgElementDef[];
  viewBox?: string;
  width?: number | string;
  height?: number | string;
  strokeWidth?: number;
  stroke?: string;
  className?: string;
  trigger?: "hover" | "mount" | "inview" | "loop";
  animation?: AnimationDef;
  choreography?: ChoreographyDef;
}

const MOTION_TAG: Record<SvgTag, React.ElementType> = {
  path: motion.path,
  circle: motion.circle,
  ellipse: motion.ellipse,
  line: motion.line,
  polyline: motion.polyline,
  polygon: motion.polygon,
  rect: motion.rect,
};

export const RETRACE: AnimationDef = {
  pathLength: [1, 0, 1],
  times: [0, 0.45, 1],
  duration: 0.6,
  ease: "easeInOut",
};

export const DRAW_IN: AnimationDef = {
  pathLength: [0, 1],
  times: [0, 1],
  duration: 0.7,
  ease: [0.23, 1, 0.32, 1],
};

export function RetracingSvg({
  elements,
  viewBox = "0 0 24 24",
  width = 24,
  height = 24,
  strokeWidth = 2,
  stroke = "currentColor",
  className,
  trigger = "hover",
  animation = RETRACE,
  choreography = {},
}: RetracingSvgProps) {
  const reducedMotion = useReducedMotion();

  const animateIndices = choreography.animateIndices ?? elements.map((_, i) => i);
  const order = choreography.order ?? [...animateIndices];
  const staggerStep =
    choreography.staggerStep ?? Math.min(0.06, 0.5 / Math.max(animateIndices.length, 1));

  const isHover = trigger === "hover";
  const isLoop = trigger === "loop";

  const svgProps = isHover
    ? { initial: "rest", whileHover: "animate" }
    : trigger === "inview"
    ? { initial: "rest", whileInView: "animate", viewport: { once: true, amount: 0.3 } }
    : { initial: "rest", animate: "animate" };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={width}
      height={height}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...svgProps}
    >
      {elements.map(([tag, attrs], i) => {
        const { key, ...rest } = attrs as Record<string, unknown> & { key?: string };
        const Tag = MOTION_TAG[tag];
        const shouldAnimate = animateIndices.includes(i) && !reducedMotion;

        if (!shouldAnimate) {
          return <Tag key={key ?? i} {...(rest as object)} />;
        }

        const delay = order.indexOf(i) * staggerStep;

        return (
          <Tag
            key={key ?? i}
            {...(rest as object)}
            variants={{
              rest: { pathLength: animation.pathLength[0] },
              animate: {
                pathLength: animation.pathLength,
                transition: {
                  duration: animation.duration ?? 0.6,
                  times: animation.times,
                  ease: animation.ease ?? "easeInOut",
                  delay,
                  repeat: isLoop ? Infinity : (animation.repeat ?? 0),
                  repeatType: animation.repeatType ?? "loop",
                },
              },
            }}
          />
        );
      })}
    </motion.svg>
  );
}
```

### Usage examples

```tsx
// 1. Hover retrace — any icon
const ARROW_ELEMENTS: SvgElementDef[] = [
  ["path", { d: "M5 12h14", key: "shaft" }],
  ["path", { d: "m12 5 7 7-7 7", key: "head" }],
];
<RetracingSvg elements={ARROW_ELEMENTS} trigger="hover" />

// 2. Logo draw-in on mount
<RetracingSvg
  elements={LOGO_ELEMENTS}
  viewBox="0 0 200 80"
  width={200}
  height={80}
  trigger="mount"
  animation={DRAW_IN}
  choreography={{ staggerStep: 0.08 }}
/>

// 3. WiFi — arcs ripple innermost-first (semantic choreography)
const WIFI_ELEMENTS: SvgElementDef[] = [
  ["path", { d: "M12 20h.01", key: "dot" }],                      // index 0 — static
  ["path", { d: "M2 8.82a15 15 0 0 1 20 0", key: "outer" }],     // index 1
  ["path", { d: "M5 12.86a10 10 0 0 1 14 0", key: "mid" }],      // index 2
  ["path", { d: "M8.5 16.43a5 5 0 0 1 7 0", key: "inner" }],     // index 3
];
<RetracingSvg
  elements={WIFI_ELEMENTS}
  trigger="hover"
  choreography={{
    animateIndices: [1, 2, 3],  // dot stays static
    order: [3, 2, 1],           // inner → mid → outer (signal-acquiring ripple)
    staggerStep: 0.13,
  }}
/>

// 4. Scroll-triggered illustration draw
<RetracingSvg
  elements={ILLUSTRATION_ELEMENTS}
  viewBox="0 0 400 300"
  width={400}
  height={300}
  trigger="inview"
  animation={{ pathLength: [0, 1], times: [0, 1], duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
  choreography={{ staggerStep: 0.15 }}
/>
```

---

## 4. Implementation: Pure CSS (No Framework)

Best for vanilla HTML, Vue, Svelte, or any project without Framer Motion.

### The `pathLength="1"` trick

Add `pathLength="1"` as an SVG attribute to any `<path>`. This normalizes the path's total length to `1`, so `stroke-dasharray: 1; stroke-dashoffset: 1` hides it fully, and animating `stroke-dashoffset` to `0` draws it — no JavaScript measurement needed.

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round"
     class="icon-retrace">
  <path pathLength="1" d="M5 12h14" class="anim-path" style="--delay: 0s" />
  <path pathLength="1" d="m12 5 7 7-7 7" class="anim-path" style="--delay: 0.08s" />
</svg>
```

```css
.icon-retrace .anim-path {
  stroke-dasharray: 1;
  stroke-dashoffset: 0; /* fully drawn at rest */
}

/* Retrace on hover */
.icon-retrace:hover .anim-path {
  animation: retrace 0.6s ease-in-out var(--delay, 0s) both;
}

@keyframes retrace {
  0%   { stroke-dashoffset: 0; } /* drawn */
  45%  { stroke-dashoffset: 1; } /* erased */
  100% { stroke-dashoffset: 0; } /* redrawn */
}

/* Draw-in on mount */
.draw-on-mount .anim-path {
  stroke-dasharray: 1;
  stroke-dashoffset: 1; /* starts hidden */
  animation: draw-in 0.7s cubic-bezier(0.23, 1, 0.32, 1) var(--delay, 0s) forwards;
}

@keyframes draw-in {
  to { stroke-dashoffset: 0; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .anim-path {
    animation: none !important;
    stroke-dashoffset: 0 !important;
  }
}
```

### For `circle`, `rect`, `line`, `ellipse` in pure CSS

`pathLength="1"` only works on `<path>`. For other shapes, convert them to path equivalents:

```js
// circle(cx, cy, r) → path
const circleToPath = (cx, cy, r) =>
  `M ${cx - r},${cy} A ${r},${r} 0 1,0 ${cx + r},${cy} A ${r},${r} 0 1,0 ${cx - r},${cy}`;

// rect(x, y, w, h, rx) → path  
const rectToPath = (x, y, w, h, rx = 0) =>
  `M ${x + rx},${y} h ${w - 2*rx} a ${rx},${rx} 0 0 1 ${rx},${rx} v ${h - 2*rx}` +
  ` a ${rx},${rx} 0 0 1 -${rx},${rx} h -${w - 2*rx} a ${rx},${rx} 0 0 1 -${rx},-${rx}` +
  ` v -${h - 2*rx} a ${rx},${rx} 0 0 1 ${rx},-${rx} Z`;

// line(x1, y1, x2, y2) → path
const lineToPath = (x1, y1, x2, y2) => `M ${x1},${y1} L ${x2},${y2}`;
```

Or measure at runtime when path conversion is impractical:

```js
document.querySelectorAll(".anim-path").forEach(el => {
  const len = el.getTotalLength();
  el.style.strokeDasharray = len;
  el.style.strokeDashoffset = len;
});
```

---

## 5. Handling Any SVG Input

### Parsing checklist

Given any SVG (icon, logo, illustration, diagram):

1. **Check fill vs. stroke** — see Step 1 above. Convert fill-only shapes by swapping `fill` → `stroke` + `fill="none"`.

2. **Flatten `<g>` groups** — extract child elements out of groups. If the `<g>` carries a `transform`, apply it to child coordinates using a tool like [SVGOMG](https://jakearchibald.github.io/svgomg/) (enable "Flatten transforms") or Figma's "Flatten" shortcut before extracting.

3. **Strip conflicting attributes** — remove `stroke-dasharray`, `stroke-dashoffset`, and inline `animation`/`transition` styles. Control stroke width at the wrapper `<svg>` level.

4. **Assign keys** — give each element a unique `key` string for React reconciliation.

5. **Mark static vs. animated** — fill-only shapes that don't read well as outlines should be `static` (excluded from `animateIndices`).

### Red flags

| SVG characteristic | What to do |
|---|---|
| `clip-path` or `mask` on elements | Keep those attributes — animation still works inside clips |
| Nested `<svg>` | Extract inner elements into the flat list |
| Very complex single `<path>` with many subpaths | Split at `M` commands for per-subpath stagger |
| Rotational symmetry (gears, stars) | Animate the whole element at once, not per-spoke |
| `<text>` elements | Do not use pathLength — use opacity or clip-path instead |
| Fills + gradients | Leave fill alone; only add stroke for the draw effect |

---

## 6. Choreography Patterns

### Sequential (default)
Every element in source order. Good for arrows, checkmarks, progress indicators.
```ts
// No config needed — this is the default behavior
```

### Innermost-first (signal ripple)
For concentric shapes: WiFi arcs, sound waves, radar rings.
```ts
choreography: { animateIndices: [1, 2, 3], order: [3, 2, 1] }
// Index 3 (innermost) plays first → outward ripple
```

### Outermost-first (closing-in)
For target/scope/focus icons. Creates a narrowing-in feel.
```ts
choreography: { order: [0, 1, 2] } // outer ring → bullseye
```

### Static anchor + animated details
Keep the main silhouette static; animate only detail strokes. Used for face/body icons where the identity is in the outline, not the strokes.
```ts
// Body at index 0 stays, eyes/details at 1,2,3 retrace
choreography: { animateIndices: [1, 2, 3] }
```

---

## 7. Timing Reference

| Use case | `duration` | `staggerStep` | `ease` |
|---|---|---|---|
| Small icon hover (2–3 paths) | 0.5–0.6s | 0.06s | `"easeInOut"` |
| Medium icon hover (4–8 paths) | 0.55–0.65s | 0.05–0.08s | `"easeInOut"` |
| Complex icon hover (9+ paths) | 0.5s | `min(0.06, 0.5/n)` | `"easeInOut"` |
| Logo draw-in on mount | 0.8–1.2s | 0.10–0.15s | `[0.23,1,0.32,1]` |
| Illustration on scroll | 1.0–1.5s | 0.12–0.20s | `[0.23,1,0.32,1]` |
| Loop spinner | 1.0s | 0 | `"linear"` |

For retrace `times: [0, erase_at, 1]`: use `erase_at: 0.45` — erase occupies 45% of the duration, redraw 55%. The asymmetry makes the redraw feel more deliberate.

---

## 8. Accessibility

**Framer Motion:**
```tsx
const reducedMotion = useReducedMotion();
// Skip animation entirely for reduced-motion users — render elements fully drawn, no variants
if (reducedMotion) return <Tag {...attrs} />;
```

**Pure CSS:**
```css
@media (prefers-reduced-motion: reduce) {
  .anim-path { animation: none !important; stroke-dashoffset: 0 !important; }
}
```

Only add `aria-hidden` to SVGs that are purely decorative. Meaningful animated SVGs should have a `<title>` element.

---

## 9. Execution Checklist

When asked to animate any SVG, follow this order:

1. Read the SVG source — identify all drawable elements and their tags/attributes.
2. Check fill vs. stroke; convert fill-only shapes if needed.
3. Choose trigger: hover / mount / inview / loop based on context.
4. Build the `SvgElementDef[]` array, assigning `key` strings.
5. Plan choreography: which elements animate, what order, stagger step.
6. Choose mode: retrace `[1,0,1]`, draw-in `[0,1]`, or erase `[1,0]`.
7. Pick implementation: Framer Motion (React) or pure CSS.
8. Add `prefers-reduced-motion` guard.
9. Verify: trigger the animation and confirm the stagger feels intentional — neither rushed nor dragging.
10. Export as a named component (React) or a self-contained BEM class block (CSS).
