# tracker_ui — Design System

> Single source of truth for all visual decisions.
> When in doubt, check here first. When you change something here, update globals.css too.

---

## Philosophy

Dark, high-contrast, premium. Black backgrounds, white text, color only in dynamic elements.
Subtle cyberpunk twist — not gamer, not loud. Think Raycast × Arc with biometric data.
Glass surfaces. Neon accents used sparingly. Orbitron only on tags.

**Consistency principle:** every value in a component must trace back to a token — never hardcoded.
Follow the 3-tier hierarchy below. This is what makes the UI feel systematic and professional.

---

## Token Hierarchy

All CSS custom properties in `globals.css` follow three tiers:

```
Tier 1 — Primitive tokens     Raw values. Never used directly in components.
Tier 2 — Semantic tokens      Role-based aliases ("what is this FOR?").
                               Use these in components and inline styles.
Tier 3 — Component tokens     Per-component slots. Always map from Tier 2.
                               Changing one here only affects that component.
```

**Rule:** Component code should only ever reference Tier 2 (`--color-*`, `--font-*`, `--shadow-*`)
or Tier 3 (`--card-*`, `--btn-*`, `--tag-*`, etc.) tokens.
Tier 1 primitives (`--primitive-*`) are an implementation detail — if the neon palette ever
changes, only Tier 1 needs updating.

---

## Colors

### Tier 1 — Primitive palette

```
Backgrounds:
  --primitive-black:    #000000
  --primitive-gray-950: #0A0A0A
  --primitive-gray-900: #141414
  --primitive-gray-800: #1C1C1C
  --primitive-gray-750: #242424

White opacity scale:
  --primitive-white:    #FFFFFF
  --primitive-white-70: rgba(255,255,255,0.70)
  --primitive-white-55: rgba(255,255,255,0.55)
  --primitive-white-35: rgba(255,255,255,0.35)
  --primitive-white-30: rgba(255,255,255,0.30)
  --primitive-white-18: rgba(255,255,255,0.18)
  --primitive-white-16: rgba(255,255,255,0.16)
  --primitive-white-09: rgba(255,255,255,0.09)
  --primitive-white-08: rgba(255,255,255,0.08)
  --primitive-white-06: rgba(255,255,255,0.06)
  --primitive-white-04: rgba(255,255,255,0.04)
  --primitive-white-03: rgba(255,255,255,0.03)

Neon palette:
  --primitive-green:     #00FF9F
  --primitive-yellow:    #F3E600
  --primitive-cyan:      #55EAD4
  --primitive-red:       #FF2060
  --primitive-violet:    #C840FF

Neon alpha variants (12% — tag/badge backgrounds):
  --primitive-green-12:  rgba(0,255,159,0.12)
  --primitive-yellow-12: rgba(243,230,0,0.12)
  --primitive-cyan-12:   rgba(85,234,212,0.12)
  --primitive-red-12:    rgba(255,32,96,0.12)
  --primitive-violet-12: rgba(200,64,255,0.12)
```

---

### Tier 2 — Semantic tokens

These are what components must use. They answer "what is this color FOR?"

```
Backgrounds (layered depth):
  --color-bg-base:     #000000    ← page background
  --color-bg-surface:  #0A0A0A    ← default card/panel
  --color-bg-elevated: #141414    ← card hover, nested panels
  --color-bg-overlay:  #1C1C1C    ← dropdowns, tooltips
  --color-bg-muted:    #242424    ← disabled, inactive

Foreground (text & icons):
  --color-fg-primary:   #FFFFFF                    weight 600+
  --color-fg-secondary: rgba(255,255,255,0.70)     weight 500
  --color-fg-tertiary:  rgba(255,255,255,0.55)     supporting info
  --color-fg-subtle:    rgba(255,255,255,0.30)     labels, metadata
  --color-fg-disabled:  rgba(255,255,255,0.18)
  --color-fg-nav-idle:  rgba(255,255,255,0.35)     nav icons/labels when inactive

Borders:
  --color-border-subtle:  rgba(255,255,255,0.06)   ← barely visible
  --color-border-default: rgba(255,255,255,0.09)   ← standard
  --color-border-strong:  rgba(255,255,255,0.16)   ← top edge of glass cards

Semantic accent roles — ONLY in tags, buttons, bars, charts:
  --color-success: #00FF9F   positive / active / streak / completed
  --color-warning: #F3E600   goal / energy / PR / caution
  --color-data:    #55EAD4   neutral data / trends / cardio
  --color-danger:  #FF2060   danger / missed / elevated HR
  --color-focus:   #C840FF   sleep / recovery / mental focus

Semantic accent alpha (tag/badge backgrounds):
  --color-success-subtle: rgba(0,255,159,0.12)
  --color-warning-subtle: rgba(243,230,0,0.12)
  --color-data-subtle:    rgba(85,234,212,0.12)
  --color-danger-subtle:  rgba(255,32,96,0.12)
  --color-focus-subtle:   rgba(200,64,255,0.12)
```

**Rule:** Accents never appear on backgrounds or body text. Only on interactive/dynamic elements.

### Semantic mapping (quick reference)

```
positive / done    → --color-success
goal / warning     → --color-warning
data / neutral+    → --color-data
danger / negative  → --color-danger
sleep / recovery   → --color-focus
```

---

### Tier 3 — Component tokens

Consumed per-component. Always map from Tier 2, never Tier 1.
Full definitions live in the component sections below. Quick index:

```
Glass card:   --card-bg, --card-border, --card-border-top, --card-radius,
              --card-backdrop, --card-padding
Tag:          --tag-radius, --tag-font-size, --tag-font-family,
              --tag-letter-spacing, --tag-padding
Button:       --btn-radius, --btn-font-size, --btn-font-weight,
              --btn-padding, --btn-gap
Input:        --input-bg, --input-bg-hover, --input-border,
              --input-border-hover, --input-border-focus, --input-radius,
              --input-padding
Progress bar: --progress-track-height, --progress-track-height-hover,
              --progress-dot-size, --progress-dot-size-hover
States:       --state-hover-bg, --state-focus-ring, --state-disabled-opacity,
              --state-card-hover-y, --state-btn-press-scale
Navigation:   --nav-icon-idle, --nav-label-idle, --nav-label-active,
              --nav-transition
```

---

## Typography

### Fonts

```
--font-body:   'Geist', ui-monospace, 'SF Mono', monospace   ← everything
--font-accent: 'Orbitron', sans-serif                         ← ONLY tags
--font-mono:   alias for --font-geist-mono (SVG text elements)
```

**Orbitron is only used on tags.** Never on body text, headings, numbers, or labels.

### Type scale (Tier 1 primitives)

```
--text-2xs:     10px   → tiny labels, metadata, section/card headers
--text-xs:      11px   → metadata, legend, chart labels
--text-sm:      13px   → body, nav items
--text-md:      14px   → list item titles, progress labels
--text-lg:      16px   → card headings, section titles
--text-xl:      20px   → page section headings
--text-2xl:     24px   → large headings
--text-display: 40px   → metric values (weight 700, tracking -0.05em)
```

### Additional type rules

```
Section labels:  --color-fg-subtle, uppercase, letter-spacing 0.08em
Card headers:    same style as section labels, prefer --text-2xs (10px), uppercase, subtle gray
Metric values:   --text-display, weight 700, letter-spacing -0.05em
Tag text:        8px (Orbitron), weight 700, letter-spacing 0.2em, uppercase
```

---

## Spacing Scale (Tier 1)

Base unit: **8px** (--space-2). All spacing must use these named steps.

```
--space-1:  4px    ← icon gap, tag internal spacing
--space-2:  8px    ← button icon gap, tight inline spacing
--space-3:  12px   ← compact padding
--space-4:  16px   ← standard inline padding
--space-5:  20px   ← medium gap
--space-6:  24px   ← card padding, section gap
--space-8:  32px   ← large section gap
--space-10: 40px   ← between page sections
--space-12: 48px   ← page-level vertical rhythm
--space-16: 64px   ← major layout separation
```

---

## Border Radius Scale (Tier 1)

```
--radius-2xs: 3px    ← scrollbar thumb, Orbitron tag chip
--radius-xs:  5px    ← small chips, pill indicators
--radius-sm:  7px    ← tags, buttons, nav items, list rows
--radius-md:  9px    ← inputs, inner panels
--radius-lg:  12px   ← large inner panels
--radius-xl:  14px   ← cards, widgets  ← most common card radius
--radius-2xl: 20px   ← modals, full overlays
```

---

## Shadow & Depth (Tier 2)

Two separate systems — never conflate them:

### Structural shadows (depth / elevation)

```
--shadow-xs: 0 1px 2px rgba(0,0,0,0.5)     ← subtle lift
--shadow-sm: 0 2px 8px rgba(0,0,0,0.6)     ← cards
--shadow-md: 0 8px 24px rgba(0,0,0,0.7)    ← modals, overlays
```

### Neon glows (accent emphasis)

```
--shadow-success: 0 0 20px rgba(0,255,159,0.25)
--shadow-warning: 0 0 20px rgba(243,230,0,0.25)
--shadow-data:    0 0 20px rgba(85,234,212,0.25)
--shadow-danger:  0 0 20px rgba(255,32,96,0.25)
--shadow-focus:   0 0 20px rgba(200,64,255,0.25)
```

Use structural shadows for elevation/depth cues. Use neon glows for emphasis on accent
elements (active buttons, filled progress bars, active state dots). Never on backgrounds.

---

## Interactive State Matrix

Every interactive element must define all five states. No exceptions.

```
State       What changes                                  Token
──────────────────────────────────────────────────────────────────────
default     Baseline style                                —
hover       Background or color shift                     --state-hover-bg
pressed     Scale or brightness feedback                  --state-btn-press-scale
focus       Keyboard focus ring (box-shadow)              --state-focus-ring
disabled    Reduced opacity, no pointer events            --state-disabled-opacity
```

### Focus ring (universal — apply to every focusable element)

```css
box-shadow: var(--state-focus-ring); /* 0 0 0 3px rgba(255,255,255,0.06) */
outline: none;
```

### Disabled (universal)

```css
opacity: var(--state-disabled-opacity); /* 0.35 */
cursor: not-allowed;
pointer-events: none;
```

### Cards hover/press

```css
/* hover  */
transform: translateY(var(--state-card-hover-y)); /* -2px */
/* press  */
transform: scale(0.994);
```

### Buttons press

```css
/* press  */
transform: scale(var(--state-btn-press-scale)); /* 0.96 */
```

---

## Glass Cards (Tier 3: --card-\*)

Every card/widget uses this pattern via component tokens:

```css
background: var(--card-bg);
border: 1px solid var(--card-border);
border-top: 1px solid var(--card-border-top);
border-radius: var(--card-radius);
backdrop-filter: var(--card-backdrop);
padding: var(--card-padding);
```

Top-edge shine line (::after):

```css
position: absolute;
top: 0;
left: 10%;
right: 10%;
height: 1px;
background: linear-gradient(
  90deg,
  transparent,
  rgba(255, 255, 255, 0.22) 50%,
  transparent
);
```

Mouse-follow light (JS): `radial-gradient rgba(255,255,255,0.025)` centered on cursor,
opacity 0 → 1 on hover, follows `mousemove`.

Colored glow blob (positioned behind content):

```css
position: absolute;
border-radius: 50%;
filter: blur(70px);
opacity: 0.15;
/* color = --color-success / --color-warning / etc. for this widget */
```

---

## Tags (Tier 3: --tag-\*)

**Orbitron only. No borders.**

```css
font-family: var(--tag-font-family); /* Orbitron */
font-size: var(--tag-font-size); /* 10px */
font-weight: 700;
letter-spacing: var(--tag-letter-spacing); /* 0.2em */
text-transform: uppercase;
padding: var(--tag-padding); /* 5px 10px */
border-radius: var(--tag-radius); /* 7px */
border: none;
```

Top-edge gloss (::before):

```css
top: 0;
left: 0;
right: 0;
height: 50%;
background: linear-gradient(
  180deg,
  rgba(255, 255, 255, 0.08) 0%,
  transparent 100%
);
```

Hover: `neon-flicker` animation (single-shot, not looping) + `filter: brightness(1.15)`.
Add `.tag-neon` class to get this behaviour from globals.css.

### Tag variants

```
Use --color-*-subtle for background, --color-* for text color:

tag-success: background var(--color-success-subtle); color var(--color-success)
tag-warning: background var(--color-warning-subtle); color var(--color-warning)
tag-data:    background var(--color-data-subtle);    color var(--color-data)
tag-danger:  background var(--color-danger-subtle);  color var(--color-danger)
tag-focus:   background var(--color-focus-subtle);   color var(--color-focus)
tag-muted:   background var(--primitive-white-04);   color var(--color-fg-subtle)
```

---

## Buttons (Tier 3: --btn-\*)

```css
padding: var(--btn-padding); /* 9px 18px */
border-radius: var(--btn-radius); /* 7px */
font-size: var(--btn-font-size); /* 13px */
font-weight: var(--btn-font-weight); /* 600 */
gap: var(--btn-gap); /* 8px */
```

| Variant      | Background           | Color                | Use             |
| ------------ | -------------------- | -------------------- | --------------- |
| `btn-white`  | `--color-fg-primary` | `--color-bg-base`    | primary CTA     |
| `btn-green`  | `--color-success`    | `--color-bg-base`    | add / confirm   |
| `btn-yellow` | `--color-warning`    | `--color-bg-base`    | log / update    |
| `btn-red`    | `--color-danger`     | `--color-fg-primary` | delete / danger |
| `btn-ghost`  | transparent          | `--color-fg-subtle`  | secondary       |

Colored buttons have a matching neon glow:

```css
box-shadow: var(--shadow-success); /* or --shadow-warning, etc. */
```

All buttons:

- `::after` overlay `rgba(255,255,255,0)` → `0.06` on hover
- `scale(var(--state-btn-press-scale))` on click
- Always include an Iconoir icon on the left, `strokeWidth={2.0}`

---

## Progress Bars (Tier 3: --progress-\*)

Wrap every progress bar in `.progress-wrap`. CSS in globals.css handles the rest.

```css
/* track */
height: var(--progress-track-height); /* 3px, → 5px on hover */
/* dot */
width/height: var(--progress-dot-size); /* 6px, → 9px on hover */
```

Fill: gradient from `{color}28` → `{color}`.
Dot: same accent color + matching neon glow.
On click: `filter: brightness(1.3)` on fill via `.progress-wrap:active .progress-fill`.

---

## Icons

**Use only [Iconoir](https://iconoir.com/) (`iconoir-react`).** Never lucide-react, heroicons,
or any other icon library.

```tsx
import { Dumbbell, HeartRate } from "iconoir-react";
<Dumbbell width={16} height={16} strokeWidth={1.8} />;
```

Default `strokeWidth: 1.8`. On buttons: `2.0–2.2`.

---

## Navigation

### Dropdown

Each nav item has its own accent color:

```
Dashboard   → --color-success
Workouts    → --color-warning
Nutrition   → --color-data
Health data → --color-danger
Settings    → --color-focus
```

Hover (not active): dot + icon light up in item's color.
Active: dot glows, icon colored, row has `--state-hover-bg` background.
Dropdown: `backdrop-filter: blur(24px)`, `border: 1px solid var(--color-border-default)`,
slides in with `opacity + translateY(-6px)`.

### Sidebar icon states (Tier 3: --nav-\*)

| State          | Icon color           | Label color          | Notes                       |
| -------------- | -------------------- | -------------------- | --------------------------- |
| Default (idle) | `--nav-icon-idle`    | `--nav-label-idle`   | 0.35 opacity, recedes       |
| Hover          | item's `accentColor` | `--nav-label-idle`   | lights up immediately       |
| Active (page)  | item's `accentColor` | `--nav-label-active` | stays lit, label goes white |
| Leave → active | item's `accentColor` | `--nav-label-active` | color kept — page is open   |
| Leave → idle   | `--nav-icon-idle`    | `--nav-label-idle`   | dims back down              |

Transition: `var(--nav-transition)` (150ms), CSS `transition: color`. No glow/shadow on the
icon itself — color change only.

### Sub-items (skill dots)

```
Default: rgba(255,255,255,0.2), no shadow
Hover:   skill.color + box-shadow: 0 0 6px {skill.color}99
Active:  same as hover
```

### Implementation pattern

```tsx
const [hovered, setHovered] = useState(false);
const iconColor = active || hovered ? accentColor : "var(--nav-icon-idle)";

<button
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
>
  <Icon
    style={{ color: iconColor }}
    className="transition-colors duration-150"
  />
</button>;
```

---

## Input

```css
background: var(--input-bg); /* rgba(255,255,255,0.04) */
border: 1px solid var(--input-border);
border-radius: var(--input-radius); /* 9px */
padding: var(--input-padding); /* 10px 14px 10px 36px */
```

State transitions:

```
hover → background: var(--input-bg-hover), border: var(--input-border-hover)
focus → border: var(--input-border-focus), box-shadow: var(--state-focus-ring)
```

Always include a `Search` icon (Iconoir) on the left at `--color-fg-subtle` color.

---

## Charts & Data Viz

Mini bar charts:

- Bars: `--primitive-white-04` default, last bar = accent color with neon glow
- No axes, no grid lines, no labels unless essential
- Hover: `filter: brightness(1.7)` + subtle `scaleY`

Rings (SVG):

- Track: `--primitive-white-04`
- Fill: accent color with `drop-shadow(0 0 6px {color}90)`
- `strokeLinecap: round`

Habit grid:

- Cell default: `--primitive-white-03` fill + `--color-border-subtle` border
- Done: `--color-success` + glow
- Partial: `--color-warning` at 25% opacity

### Radar / Neural Map

N-polygon SVG with per-axis colors.

**Grid (rings + spokes):**

- Rings: `--color-border-subtle` stroke, `0.4px`
- Spokes: per-axis accent color, `opacity: 0.20`, `0.4px`

**Sectors (wedge per axis):**

- Fill at rest: `{color}18` (~10% opacity)
- Fill on hover: `{color}38` (~22% opacity)
- Stroke: axis color, `0.5px` rest → `0.8px` hover
- `opacity` 0.8 rest → 1.0 hover, `transition: 0.2s ease`

**Radar shape:**

- Soft outer glow: `strokeWidth 4`, `opacity 0.14`, `filter: blur(3px)`, color = originating node's accent
- Inner fill: `--primitive-white-03` polygon, no stroke
- Sharp edge: `strokeWidth 1.0`, `opacity 0.85`, SVG `feGaussianBlur stdDeviation 2.2`

**Vertex dots (3-layer):**

```
1. Corona:     r 3.5 → 5.5 on hover, opacity 0.08 → 0.16
2. Inner glow: r 2.2 → 3.5 on hover, opacity 0.14 → 0.28
3. Sharp dot:  r 1.6 → 2.2 on hover — neon filter applied
```

All circles use axis color, `transition: 0.2s ease`.

**Labels:**

- Font: `var(--font-mono)`, `3.2px`, `letterSpacing: 0.06em`
- Color: `--color-fg-subtle` at rest → axis color on hover
- Multi-word: one `<tspan>` per word, `dy="4"` for each line, centered on x
- Positioned at `r = 50` from center

**Size:** `max-w-[210px]` SVG, `viewBox="0 0 100 100"`, outer ring radius = 40.

---

## Animations

```
Scroll reveal:    IntersectionObserver → opacity 0 + translateY(18px) → visible, staggered by index
Neon flicker:     .tag-neon:hover — single-shot, 0.45s ease-out forwards
Dot loader:       .dot-loader — 5-dot stepping, 2.5s linear infinite, one accent color each
Progress hover:   track 3px→5px, dot 6px→9px, 0.18s ease
Card mouse-light: radial-gradient spotlight, opacity 0→1 on hover, follows cursor via JS
```

General rules:

- Cards: `translateY(var(--state-card-hover-y))` on hover, `scale(0.994)` on click
- List rows: `background: var(--state-hover-bg)` on hover
- Nav items: color + dot transition `var(--nav-transition)`
- No spring physics, no bounces — only `ease` and `cubic-bezier(0.4,0,0.2,1)`
- UI transitions: 150–250ms. Data fills: 600–800ms.

---

## What goes where

| Element         | Token to use                                          |
| --------------- | ----------------------------------------------------- |
| Page bg         | `--color-bg-base`                                     |
| Card bg         | `--card-bg` (glass gradient)                          |
| Body text       | `--color-fg-secondary`                                |
| Emphasis text   | `--color-fg-primary`                                  |
| Secondary text  | `--color-fg-tertiary`                                 |
| Labels/metadata | `--color-fg-subtle`                                   |
| Section labels  | `--color-fg-subtle`, uppercase, letter-spacing 0.08em |
| Tags            | `--tag-*` tokens, Orbitron, no border                 |
| Metric numbers  | `--text-display`, weight 700, tracking -0.05em        |
| Accent colors   | `--color-success/warning/data/danger/focus`           |
| Icons           | Iconoir only, `strokeWidth={1.8}`                     |
| Spacing         | `--space-*` scale                                     |
| Border radius   | `--radius-*` scale                                    |
| Depth shadows   | `--shadow-xs/sm/md`                                   |
| Neon glows      | `--shadow-success/warning/data/danger/focus`          |

---

## Backward Compat Aliases (deprecated)

These still resolve correctly via globals.css but **must not be used in new code**.
Migrate components away from these during the Step 6 page audit.

```
Old name            → New Tier 2 token
──────────────────────────────────────────────────
--bg-base           → --color-bg-base
--bg-surface        → --color-bg-surface
--bg-elevated       → --color-bg-elevated
--bg-overlay        → --color-bg-overlay
--bg-muted          → --color-bg-muted
--border-subtle     → --color-border-subtle
--border-default    → --color-border-default
--border-strong     → --color-border-strong
--text-primary      → --color-fg-primary
--text-secondary    → --color-fg-secondary
--text-tertiary     → --color-fg-tertiary
--text-supporting   → --color-fg-subtle
--text-disabled     → --color-fg-disabled
--accent-green      → --color-success
--accent-yellow     → --color-warning
--accent-cyan       → --color-data
--accent-red        → --color-danger
--accent-violet     → --color-focus
--bg-color          → DEPRECATED (remove)
--panel-bg          → DEPRECATED (remove)
--text-main         → DEPRECATED (remove)
--text-muted        → DEPRECATED (remove)
```

---

## Current pages status

| Page            | Status | Notes                            |
| --------------- | ------ | -------------------------------- |
| DashboardPage   | ✅     | mock data, radar, workout, meals |
| SkillsListPage  | ✅     | skill cards grid                 |
| SkillDetailPage | ✅     | radar, quest columns, tree       |
| QuestsPage      | ✅     | kanban by status                 |
| CalendarPage    | ✅     | day/week/month, drag-drop        |
| TrainingPage    | 🔲     | stub — needs full design         |
| DietPage        | 🔲     | stub — needs full design         |
| PreferencesPage | 🔲     | stub — needs full design         |
