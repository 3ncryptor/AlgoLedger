---
name: soft-motion-ui-v2
description: Soft, rounded, glow-accented SaaS/edu interface style — oversized 2xl-3xl border-radius cards, ultra-diffuse colored shadows, a token-driven navy-heading + electric-blue-accent palette, "color-as-data" themed items, and pervasive Framer Motion choreography (viewport stagger reveals, spring shared-layout indicators, lift-on-hover cards, per-stroke animated icons). Same visual language as soft-motion-ui, except brand colors are shared CSS-variable tokens from @studyzone365/config instead of hardcoded hex, so apps/web and apps/admin can stay visually consistent and re-theme from one place. Use when building or redesigning a marketing site, landing page, or content-grid product (programs, locations, pricing, testimonials) that should feel warm, trustworthy, and gently alive rather than flat/corporate or brutalist.
---

# Protocol: Soft-Motion Card UI Architect (v2, token-driven)

Derived from the same production Next.js + Tailwind v4 + Framer Motion codebase as `soft-motion-ui`. The defining signature is identical: **very round corners + very soft multi-layer shadows + a single saturated accent color used as tints, never as solid fills + everything reveals/lifts/nudges on interaction.** The only difference from `soft-motion-ui` is §3/§6 below: the brand accent is a shared token, not a hex literal copy-pasted per project.

## 1. Protocol Overview

This is not flat minimalism and not glassmorphic excess. It is "calm SaaS with warmth": white/near-white surfaces, oversized rounded corners (32px on cards, full pill on chips/nav), low-opacity color washes instead of solid color blocks, and deliberate — but restrained — motion on every scroll reveal and hover. Content density is handled by structured anatomy (eyebrow → heading → body → grid) repeated section after section, alternating background tone for rhythm. Brand identity (accent blue + heading navy) comes from one shared token source so every app using this skill renders the same brand, and a rebrand is a one-file edit, not a repo-wide find/replace.

## 2. Negative Constraints

- DO NOT use sharp/small corners (`rounded-md`/`rounded-lg`) on cards or hero containers. Cards are `rounded-[2rem]` (32px); chips/badges/pills are `rounded-full`.
- DO NOT use hard, dark, or single-layer `shadow-lg`/`shadow-xl` defaults. Always hand-write diffuse shadows with low-opacity rgba: `shadow-[0_8px_30px_rgba(15,23,42,0.06)]`, intensifying on hover, not flat at rest.
- DO NOT fill large surfaces with a solid accent color. The accent is used as text, thin borders, and ≤10% opacity tints — never as a full-bleed background outside small buttons/badges.
- DO NOT ship a static page. Every section header, card grid, and list must have a Framer Motion viewport reveal; every interactive element must have a hover/active micro-response.
- DO NOT use one global color for everything when displaying a list of distinct entities (categories, locations, plans). Give each item its own accent color (color-as-data, see §6) instead of repeating the brand accent for every card.
- DO NOT use plain static `lucide-react` icons inside feature/nav rows without considering the animated-stroke treatment (§9) for primary visual moments.
- DO NOT skip the eyebrow-label + accent-bar pattern above section headings (§4) — bare `<h2>` headings without it read as generic.
- **DO NOT hardcode a brand hex literal in component code** (no `bg-[#0e7de8]`, no `text-[#201657]`). Always go through the `bg-brand`/`text-brand`/`text-brand-heading` utilities or `var(--brand-primary)`/`var(--brand-heading)` — see §6. A literal hex in a component is this skill's one hard failure mode.

## 3. Stack & Primitives

- Tailwind CSS v4 (`@theme inline` tokens), `tw-animate-css`, optional shadcn base layer for oklch grayscale tokens (background/card/border/ring etc.) — **and brand colors are also `@theme inline` tokens**, sourced from the shared `@studyzone365/config` package rather than hex literals in component code (contrast with `soft-motion-ui` v1, which hardcodes hex per project).
- `framer-motion` for all motion (variants, `whileInView`, `layoutId` shared transitions, `useInView`, `AnimatePresence`).
- `lucide-react` for icon glyphs.
- `class-variance-authority` (cva) + `clsx` + `tailwind-merge` via a `cn()` helper for variant-driven components (Button is the canonical example).
- Font: a geometric sans with real weight range (Plus Jakarta Sans 400–700) loaded via `next/font/google`, exposed as `--font-sans`.

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Setup (once per app):** if the app's `package.json` doesn't already depend on `@studyzone365/config`, add `"@studyzone365/config": "workspace:*"` and run `pnpm install`. Then, at the top of the app's `app/globals.css`, import the shared token file before the app's own `@theme inline` block:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@studyzone365/config/theme/soft-motion-tokens.css";
```

That single import defines `--brand-primary`, `--brand-primary-hover`, `--brand-secondary`, `--brand-heading` in `:root`, plus the `@theme inline` mapping that turns them into `bg-brand`, `text-brand`, `border-brand`, `text-brand-heading` (and `-hover`/`-secondary` variants) Tailwind utilities — usable identically in `apps/web` and `apps/admin`.

## 4. Page & Section Anatomy

Every major section follows the same skeleton:

```
<section className="relative overflow-hidden bg-{white|slate-50|slate-900} py-20 sm:py-24 border-b border-slate-200/80 dark:border-slate-800/80">
  {/* 1. Ambient blobs, absolutely positioned, decorative only */}
  <div aria-hidden className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-brand/10 dark:bg-brand/15 blur-3xl" />
  <div aria-hidden className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-brand/8 dark:bg-brand/10 blur-3xl" />
  {/* 2. Optional hairline top separator */}
  <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/20 dark:via-brand/25 to-transparent" />

  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* 3. Centered header block — always this exact order */}
    <motion.div className="mx-auto mb-5 h-1.5 w-20 rounded-full bg-brand" .../>                {/* accent bar */}
    <motion.p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand">        {/* eyebrow */}
      Section Eyebrow
    </motion.p>
    <motion.h2 className="mt-3 text-3xl font-bold tracking-tight text-brand-heading dark:text-white sm:text-4xl md:text-5xl">
      Section Heading
    </motion.h2>
    <motion.p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
      Supporting one-liner.
    </motion.p>

    {/* 4. Content grid / list */}
    {/* 5. Optional bottom centered link-out CTA */}
  </div>
</section>
```

- Container is always `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`.
- Section vertical rhythm is always `py-20 sm:py-24` (heroes can go to `min-h-screen`).
- Alternate section backgrounds between `bg-white`, `bg-slate-50`/`#f8fafc`, and `bg-slate-900` in dark mode to create rhythm without needing dividers everywhere.
- Headings: `text-brand-heading dark:text-white`, body copy: `text-slate-500/600 dark:text-slate-400`, accent: `text-brand`.

## 5. Card Anatomy ("the mechanism")

Two recurring card shapes — pick based on content:

**A. Image-header card** (locations, course/program cards):
```
<article className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-[transform,box-shadow,border-color] duration-[250ms] ease-out hover:-translate-y-2 hover:border-brand/25 hover:shadow-[0_24px_56px_rgba(15,23,42,0.14)] dark:hover:shadow-[0_24px_56px_rgba(0,0,0,0.35)]">
  <div className="relative h-52 overflow-hidden">
    <Image fill className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105" .../>
  </div>
  <div className="flex flex-1 flex-col gap-4 p-6">
    {/* title + meta row */}
    <div className="h-px w-full bg-linear-to-r from-slate-200 via-slate-100 to-transparent dark:from-slate-700 dark:via-slate-800 dark:to-transparent" /> {/* divider */}
    {/* stat chips: rounded-xl, bg tinted via inline style backgroundColor: `${accentColor}0d` (entity color-as-data, see §6 — not the brand token) */}
    {/* CTA pinned to bottom via mt-auto */}
  </div>
</article>
```

**B. Stacked list-row card** (feature lists, "what we provide"):
- One outer `rounded-[2rem]` container, internal rows separated by `divide-y divide-slate-200 dark:divide-slate-700`, each row gets a numbered eyebrow (`01`, `02`...) plus an icon badge, and highlights on `group-hover:bg-brand/5`.

**Shared rules for both:**
- Border radius: `rounded-[2rem]` for cards, `rounded-2xl`/`rounded-xl` for nested icon badges and stat chips, `rounded-full` for pills/tags/CTAs-as-links.
- Shadow at rest is barely-there (`rgba(15,23,42,0.03–0.08)`); on hover it roughly doubles in spread and opacity, paired with `-translate-y-1.5` to `-translate-y-2`.
- Icon badge: `flex size-12 items-center justify-center rounded-2xl border` with a tinted background (`bg-brand/8 dark:bg-brand/15`) and matching border (`border-brand/20 dark:border-brand/30`); scales up slightly (`scale-110` or `group-hover:scale-105`) when active/hovered.
- Tag/pill chips: `rounded-full px-2.5–3 py-0.5–1 text-[10–11px] font-semibold uppercase tracking-wider` on a `bg-slate-100 dark:bg-slate-800` or `bg-brand/8` background.
- Dual-action footer inside a card is a 2-col grid: one neutral `outline`-style button + one filled accent (`bg-brand`) button, both `rounded-xl`, `active:scale-[0.97]`, with the primary's trailing icon nudging via a `group/btn` + `group-hover/btn:translate-x-0.5`.
- Divider hairlines are never solid: always `bg-linear-to-r from-slate-200 via-slate-100 to-transparent`.

## 6. Color System

- **Neutral scale**: Tailwind `slate-50…900` for all backgrounds, borders, and body text (light surfaces in light mode, `slate-800/900` in dark mode) — unchanged from `soft-motion-ui`.
- **Brand accents (shared tokens, not hex literals)**: defined once in `packages/config/theme/soft-motion-tokens.css` as CSS custom properties (`--brand-primary`, `--brand-primary-hover`, `--brand-secondary`, `--brand-heading`) and mapped to Tailwind utilities via that same file's `@theme inline` block (`bg-brand`, `text-brand`, `text-brand-heading`, etc.). Import it once per app (§3 Setup) — never redefine or hardcode the hex in component code.
- **Re-theming**: to change the brand pair for every app at once, edit the four `--brand-*` values in `packages/config/theme/soft-motion-tokens.css`. To override for a single app only, redefine the same custom properties in that app's own `:root` block, positioned *after* the shared import — component code never changes either way.
- **Tint-not-fill rule**: accent color appears as text, 1–2px borders, and backgrounds only at low opacity — `bg-brand/8`, `border-brand/20`, or via inline style `backgroundColor: `${hex}0d`` for computed per-entity colors (below). Never `bg-brand` at full opacity on anything larger than a button/badge.
- **Color-as-data pattern**: when rendering a list of distinct entities (categories, locations, plans), give each item its own `color`/`accentColor`/`textColor`/`bgAccent`/`borderAccent`/`glowColor` fields in the data, and derive every themed class or inline style from that field — don't reach for the shared `bg-brand` token across heterogeneous items; that token is for singular brand moments (headers, primary CTAs, nav), not per-entity theming. Example shape:
  ```ts
  { id, title, color: "indigo", textColor: "text-indigo-600 dark:text-indigo-400",
    bgAccent: "bg-indigo-50/70 dark:bg-indigo-950/20",
    borderAccent: "border-indigo-200 dark:border-indigo-800/50",
    glowColor: "rgba(99,102,241,0.15)" }
  ```
  Active/selected states then add a soft colored glow shadow using that item's `glowColor` via inline `style={{ boxShadow: ... }}`.

## 7. Buttons (variant system)

Use `cva` for a button with this matrix — the shadcn-style `bg-primary`/`bg-secondary` slots come from the app's own neutral theme tokens; wire a `brand` variant to the shared accent for on-brand CTAs:

```ts
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium transition-all outline-none select-none active:translate-y-px disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/80",
        brand: "bg-brand text-white hover:bg-brand-hover",
        outline: "border-border bg-background hover:bg-muted",
        secondary: "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)]",
        ghost: "hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: { default: "h-8 px-2.5", sm: "h-7 px-2.5 text-[0.8rem]", lg: "h-9 px-2.5", icon: "size-8" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);
```
Tactile feedback (`active:translate-y-px` or `active:scale-[0.97/0.98]`) is mandatory on every clickable element, including plain `<a>`/`<button>` outside this component.

## 8. Navbar Pattern

- Sticky, translucent, blurred: `sticky top-0 z-50 border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-md`.
- Desktop nav links live inside a pill container: `rounded-full border bg-slate-50/80 dark:bg-slate-800/80 p-1`, individual links are `rounded-full px-4 py-2`.
- Active link indicator is a shared-layout animated underline, not a static class:
  ```tsx
  {isActive && (
    <motion.span layoutId="nav-underline" className="absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-brand" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
  )}
  ```
- Dropdown panels: `rounded-2xl border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.10)]` with a small rotated-square caret (`h-3 w-3 rotate-45 border-l border-t`) connecting it to the trigger.
- Mobile nav is a right-side slide-in drawer (`fixed inset-y-0 right-0 w-72 translate-x-full → translate-x-0`) over a blurred backdrop, with accordion sub-sections for grouped links.

## 9. Iconography — Animated Stroke Icons

For primary visual moments (feature icons, nav icons), don't just drop a static `lucide-react` icon — wrap it so each SVG primitive (`path`/`circle`/`line`/etc.) redraws its stroke (`pathLength` 1→0→1) on hover, staggered per element, falling back to the plain icon when `prefers-reduced-motion` is set or no per-icon geometry definition exists:

```tsx
const REST = { rest: { pathLength: 1 } };
// motion.svg wraps the icon's real SVG children as motion.path/motion.circle/...
// each animated element gets variants={{ rest: REST.rest, hover: { pathLength: [1,0,1], transition: { duration: 0.6, ease: "easeInOut", delay: i * staggerStep } } }}
// initial="rest" whileHover="hover" on the parent <motion.svg>, reduced-motion users get <Icon /> unmodified.
```
This is a polish layer, not load-bearing — apply it to icons users actually hover (cards, nav, feature lists), and skip it for decorative or off-screen icons.

## 10. Motion Language

- **Viewport reveal** (the default for every header/card/row): `initial={{opacity:0, y:10-20}} whileInView={{opacity:1, y:0}} viewport={{once:true, amount:0.2-0.4}} transition={{duration:0.4-0.45, ease:[0.23,1,0.32,1]}}`. That cubic-bezier (`[0.23,1,0.32,1]`, a snappy ease-out-quint) is the house easing curve — reuse it everywhere instead of `easeOut`.
- **Stagger containers**: parent has `variants={{hidden:{opacity:0}, show:{opacity:1, transition:{staggerChildren:0.06-0.12, delayChildren:0.05-0.15}}}}`, children use plain `hidden/show` y-offset variants.
- **Tab/filter content swaps**: wrap in `<AnimatePresence mode="wait">` with `exit` variants (`opacity:0, y:-10, scale:0.97`) so switching tabs feels like a deliberate transition, not a flash.
- **Shared element transitions** for active-state indicators (nav underline, active category top-border) use `layoutId` + spring transitions (`type:"spring", stiffness:100-300, damping:15-30`), never instant class toggles.
- **Hover micro-interactions**: cards lift (`-translate-y-1.5/2`), icon badges scale (`scale-105/110`), link rows nudge horizontally (`whileHover={{x:4}}`), buttons press (`whileTap={{scale:0.98}}` or `active:scale-[0.97]`), arrow icons inside CTAs nudge right on hover via a `group/btn` wrapper.
- **Counters**: animate numeric stats with `requestAnimationFrame` + ease-out-cubic (`1 - (1-progress)^3`) gated by `useInView`, not on mount.

## 11. Execution Checklist

When building a new page/section in this style:
1. Confirm the app imports `@studyzone365/config/theme/soft-motion-tokens.css` in its `globals.css` (§3 Setup) — if not, add it before writing any brand-colored markup.
2. Pick the section background tone (alternate from the previous section) and add 2 ambient blurred blobs + optional top hairline.
3. Build the header block in the exact order: accent bar → eyebrow → h2 → supporting paragraph, each as a separate `whileInView` reveal.
4. For any list of distinct entities, define a per-item color/accent object (§6) before writing the grid — don't reach for `bg-brand` on heterogeneous items.
5. Build cards as `rounded-[2rem]`, soft-shadow-at-rest/stronger-on-hover, lift + border-tint on hover, content padded `p-6` with a `mt-auto`-pinned CTA row.
6. Wrap the grid in a stagger container; wrap each card in the item variant.
7. Add tactile feedback (`active:scale`) to every clickable element and arrow-nudge to every "go to X" CTA.
8. Reuse the `[0.23,1,0.32,1]` easing and the `bg-brand`/`text-brand-heading` utilities consistently across the whole page — don't mix easing curves or fall back to a hardcoded hex anywhere.
