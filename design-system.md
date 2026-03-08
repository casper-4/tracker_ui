# tracker_ui — Design System

> Single source of truth for all visual decisions.
> When in doubt, check here first. When you change something here, update globals.css too.

---

## Philosophy

Dark, high-contrast, premium. Black backgrounds, white text, color only in dynamic elements.
Subtle cyberpunk twist — not gamer, not loud. Think Raycast × Arc with biometric data.
Glass surfaces. Neon accents used sparingly. Orbitron only on tags.

---

## Colors

### Backgrounds — layered depth

```
--bg-base:     #000000   ← page background
--bg-surface:  #0A0A0A   ← default card/panel
--bg-elevated: #141414   ← card hover, nested panels
--bg-overlay:  #1C1C1C   ← dropdowns, tooltips
--bg-muted:    #242424   ← disabled, inactive
```

### Borders

```
--border-subtle:  rgba(255,255,255,0.06)
--border-default: rgba(255,255,255,0.09)
--border-strong:  rgba(255,255,255,0.16)   ← top edge of glass cards
```

### Text hierarchy

```
--text-primary:   #FFFFFF                   weight 600+
--text-secondary: rgba(255,255,255,0.70)    weight 500
--text-tertiary:  rgba(255,255,255,0.55)    supporting info
--text-supporting:rgba(255,255,255,0.30)    labels, metadata
--text-disabled:  rgba(255,255,255,0.18)
```

### Accent colors — ONLY in tags, buttons, progress bars, charts, dots

```
--accent-green:  #00FF9F   positive / active / streak / completed
--accent-yellow: #F3E600   warning / energy / goal / PR
--accent-cyan:   #55EAD4   neutral data / trends / cardio
--accent-red:    #FF2060   danger / missed / elevated HR
--accent-violet: #C840FF   special / focus / sleep / recovery
```

**Rule:** Accents never appear on backgrounds or text. Only on interactive/dynamic elements.

### Semantic mapping

```
positive / done    → --accent-green
goal / warning     → --accent-yellow
data / neutral+    → --accent-cyan
danger / negative  → --accent-red
sleep / recovery   → --accent-violet
```

---

## Typography

### Fonts

```
--font-body:   'Geist', ui-monospace, 'SF Mono', monospace   ← everything
--font-accent: 'Orbitron', sans-serif                         ← ONLY tags
```

**Orbitron is only used on tags.** Never on body text, headings, numbers, or labels.

### Scale

```
10px / weight 700 / tracking 0.22em — Orbitron tags
11px                                 — metadata, legend
12px                                 — supporting info
13px / weight 500                    — body, nav items
14px / weight 600                    — list item titles, progress labels
16px / weight 700                    — card headings, section titles
36–48px / weight 700 / tracking -0.05em — metric values (Geist)
```

---

## Spacing & Radius

Base unit: **8px**

```
--radius-sm:  3px    ← tags
--radius-md:  7px    ← buttons, nav items, list rows
--radius-lg:  12px   ← input, inner panels
--radius-xl:  14px   ← cards, widgets
```

---

## Glass Cards

Every card/widget uses the glass pattern:

```css
background: linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.3) 100%);
border: 1px solid rgba(255,255,255,0.09);
border-top: 1px solid rgba(255,255,255,0.16);   ← brighter top edge = light from above
border-radius: 14px;
backdrop-filter: blur(24px);
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

Mouse-follow light (JS): radial-gradient `rgba(255,255,255,0.025)` centered on cursor, opacity 0 → 1 on hover.

Colored glow behind widget content:

```css
position: absolute;
border-radius: 50%;
filter: blur(70px);
opacity: 0.15;
/* use accent color of the widget */
```

---

## Tags

**Orbitron only. No borders.**

```css
font-family: "Orbitron", sans-serif;
font-size: 8px;
font-weight: 700;
letter-spacing: 0.2em;
text-transform: uppercase;
padding: 5px 10px;
border-radius: 7px;
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

Hover: `neon-flicker` animation (opacity dips, single-shot, not looping) + `filter: brightness(1.15)`.

### Tag variants

```
tag-green:  background rgba(0,255,159,0.12);   color #00FF9F
tag-yellow: background rgba(243,230,0,0.12);   color #F3E600
tag-cyan:   background rgba(85,234,212,0.12);  color #55EAD4
tag-red:    background rgba(255,32,96,0.12);   color #FF2060
tag-violet: background rgba(200,64,255,0.12);  color #C840FF
tag-white:  background rgba(255,255,255,0.07); color rgba(255,255,255,0.5)
```

---

## Buttons

```css
padding: 9px 18px;
border-radius: 8px;
font-size: 13px;
font-weight: 600;
```

| Variant      | Background  | Color | Use                    |
| ------------ | ----------- | ----- | ---------------------- |
| `btn-white`  | `#FFFFFF`   | #000  | primary CTA            |
| `btn-green`  | `#00FF9F`   | #000  | add / confirm          |
| `btn-yellow` | `#F3E600`   | #000  | log / update           |
| `btn-red`    | `#FF2060`   | #fff  | delete / danger        |
| `btn-ghost`  | transparent | #888  | secondary, nav actions |

Colored buttons have matching `box-shadow: 0 0 20px {color}40` and brighter on hover.
All buttons: `::after` overlay `rgba(255,255,255,0)→0.06` on hover, `scale(0.96)` on click.

Always include an Iconoir icon on the left.

---

## Progress Bars

Track height: **3px** default, **5px** on hover (transition).
Fill: gradient from `{color}28` → `{color}`.
Endpoint dot: `6px` default, `9px` on hover. Color + glow matching fill.
On click: `filter: brightness(1.3)` on fill.

Wrap every progress bar in `.progress-wrap` for hover/click targets.

---

## Icons

**Use only [Iconoir](https://iconoir.com/) (`iconoir-react`).**
Never use lucide-react, heroicons, or any other icon library.

```tsx
import { Dumbbell, HeartRate, Apple } from "iconoir-react";
<Dumbbell width={16} height={16} strokeWidth={1.8} />;
```

Default strokeWidth: `1.8`. On buttons: `2.0–2.2`.

---

## Navigation — Dropdown

Each nav item has its own accent color:

```
Dashboard   → #00FF9F
Workouts    → #F3E600
Nutrition   → #55EAD4
Health data → #FF2060
Settings    → #C840FF
```

On hover (not yet active): dot + icon light up in the item's color.
Active item: dot glows, icon colored, row has subtle background.
Dropdown: `backdrop-filter: blur(24px)`, `border: 1px solid rgba(255,255,255,0.1)`, slides in with `opacity + translateY(-6px)`.

---

## Charts & Data Viz

Mini bar charts:

- Bars: `rgba(255,255,255,0.07)` default, last bar = accent color with glow
- No axes, no grid lines, no labels unless essential
- On hover: `filter: brightness(1.7)` + subtle `scaleY`

Rings (SVG):

- Track: `rgba(255,255,255,0.05)`
- Fill: accent color with `drop-shadow(0 0 6px {color}90)`
- strokeLinecap: `round`

Habit grid:

- Cell default: `rgba(255,255,255,0.03)` + `rgba(255,255,255,0.07)` border
- Done: accent-green + glow
- Partial: accent-yellow at 25% opacity

---

## Animations

```css
/* Card enter on scroll */
.reveal: opacity 0 + translateY(18px) → visible via IntersectionObserver

/* Neon flicker on tag hover — single shot */
@keyframes neon-flicker — opacity dips at 4%, 38%, 70% etc.

/* Sequential loader — one dot at a time through 5 accent colors */
SequentialLoader component — 420ms interval, scale(1.3) + glow on active

/* Progress bar hover */
track height: 3px → 5px, dot: 6px → 9px, transition 0.18s

/* Card mouse-follow light */
radial-gradient spotlight, opacity 0 → 1 on hover, follows cursor
```

General rules:

- Cards: `translateY(-2px)` on hover, `scale(0.994)` on click
- List rows: `rgba(255,255,255,0.04)` background on hover
- Nav items: color + dot transition 0.15s
- No spring physics, no bounces — only `ease` and `cubic-bezier(0.4,0,0.2,1)`

---

## Input

```css
background: rgba(255, 255, 255, 0.04);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 9px;
padding: 10px 14px 10px 36px; /* 36px for icon */
```

Hover: background → `rgba(255,255,255,0.06)`, border → `rgba(255,255,255,0.14)`.
Focus: border → `rgba(255,255,255,0.22)`, `box-shadow: 0 0 0 3px rgba(255,255,255,0.04)`.
Always include a `Search` icon (Iconoir) on the left at `rgba(255,255,255,0.2)`.

---

## What goes where

| Element        | Color / Font             |
| -------------- | ------------------------ |
| Page bg        | #000                     |
| Card bg        | glass gradient           |
| Body text      | Geist, #fff → 0.18 scale |
| Section labels | Geist, uppercase, 0.08em |
| Tags           | Orbitron, 8px, no border |
| Metric numbers | Geist, 36–48px, -0.05em  |
| Icons          | Iconoir only             |
| Accent colors  | Tags, buttons, bars only |
