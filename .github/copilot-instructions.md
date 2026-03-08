# Tracker UI — Copilot Instructions

You are a senior frontend developer working on Tracker UI (`tracker-ui/`).
This is a UI-only playground — no backend, no real persistence, no API calls.
The goal is to design and iterate on the UI. Data and logic come later.

---

## Project structure

```
tracker-ui/
  app/
    _pages/          ← full page views (one file per route)
    components/      ← reusable components
    constants.ts     ← TAB_* constants for routing
    page.tsx         ← main router (useState-based tab switching)
    layout.tsx       ← fonts, LanguageProvider wrapper
    globals.css      ← design tokens, custom-scrollbar
  lib/
    mock.ts          ← ONLY source of data in this project
    i18n.ts          ← ONLY source of UI strings (pl + en)
    language-context.tsx ← useLang() hook + LanguageProvider
    utils.ts         ← cn() helper
  components/
    radar.ts         ← radarNPolygon, roundSvg SVG helpers
  design-system.md   ← visual source of truth ← READ THIS FIRST
```

---

## Absolute rules — never break these

- **No persistence** — no localStorage, no sessionStorage, no cookies, no fetch, no API calls
- **All data from `lib/mock.ts`** — never hardcode data inline in components
- **All UI strings from `lib/i18n.ts`** — never hardcode visible text in components
- **All code in English** — variable names, function names, file names, type names, comments
- No "task" or "Task" anywhere — it's always "quest" / "Quest"
- **No new dependencies** — use what's already installed: `iconoir-react`, `framer-motion`, `recharts`, `clsx`, `tailwind-merge`
- **Icons: Iconoir only** — never lucide-react, heroicons, or anything else

---

## How to handle data

### Adding new properties to mock data

When a UI element needs data that doesn't exist yet in `lib/mock.ts`, always add it to the mock first, then use it in the component. Never invent inline data.

```typescript
// lib/mock.ts — add to type AND to every object
export type Skill = {
  // ...
  streak: number; // days in a row
};

export const MOCK_SKILLS: Skill[] = [
  { id: "skill/guitar", ..., streak: 12 },
  { id: "skill/vocals", ..., streak: 4 },
];
```

### Adding new mock entities

If you need a new data category (e.g. workout history, mood log), add a new exported `const` to `lib/mock.ts` with realistic placeholder values. Always type it properly.

### TODO comments

```typescript
// TODO: [DATA]     — persistence/data logic to implement later
// TODO: [UI]       — UI elements not yet designed
// TODO: [ELECTRON] — Electron IPC calls to add later
```

---

## How to handle UI strings

All visible text must go through i18n:

```typescript
// lib/i18n.ts
pl: { training_streak: "Seria dni" }
en: { training_streak: "Day streak" }

// component
const { lang } = useLang();
<span>{t(lang, "training_streak")}</span>
```

---

## Visual design system

> Full specification lives in `design-system.md`. Read it before making any visual decisions.
> Below is a quick reference. If there's a conflict, `design-system.md` wins.

### Colors

```
Backgrounds:
  --bg-base:     #000000
  --bg-surface:  #0A0A0A
  --bg-elevated: #141414
  --bg-overlay:  #1C1C1C

Text:
  primary:    #FFFFFF           (weight 600+)
  secondary:  rgba(255,255,255,0.70)
  tertiary:   rgba(255,255,255,0.55)
  supporting: rgba(255,255,255,0.30)
  disabled:   rgba(255,255,255,0.18)

Accents — ONLY in tags, buttons, bars, charts:
  green:  #00FF9F   (positive / active / streak)
  yellow: #F3E600   (warning / energy / goal / PR)
  cyan:   #55EAD4   (neutral data / trends)
  red:    #FF2060   (danger / missed / elevated HR)
  violet: #C840FF   (sleep / recovery / focus)
```

### Typography

```
Body:          Geist (monospace stack) — everything
Tags only:     Orbitron — 8px, weight 700, tracking 0.2em, uppercase
Metric values: Geist, 36–48px, weight 700, tracking -0.05em
Section labels: Geist, uppercase, tracking 0.08em, rgba(255,255,255,0.2)
```

**Orbitron is used ONLY on tags. Nowhere else.**

### Cards / Glass pattern

```css
background: linear-gradient(
  160deg,
  rgba(255, 255, 255, 0.06) 0%,
  rgba(255, 255, 255, 0.02) 60%,
  rgba(0, 0, 0, 0.3) 100%
);
border: 1px solid rgba(255, 255, 255, 0.09);
border-top: 1px solid rgba(255, 255, 255, 0.16);
border-radius: 14px;
backdrop-filter: blur(24px);
```

Every card also has:

- A 1px top-edge shine line (::after gradient)
- A mouse-follow light (`radial-gradient`, opacity 0→1 on hover, follows cursor via JS)
- Colored glow blob positioned behind content (blur 70px, opacity 0.15)
- `translateY(-2px)` hover, `scale(0.994)` click

### Tags

No borders. Orbitron font. Top-edge gloss only. Neon-flicker animation on hover (single shot).

### Buttons

Include an Iconoir icon on the left. Hover: brightness overlay. Click: `scale(0.96)`.

### Progress bars

Wrap in `.progress-wrap`. Hover: track thickens 3px→5px, dot grows 6px→9px. Click: fill brightens.

### Icons

**Iconoir only** (`iconoir-react`). Default `strokeWidth={1.8}`. On buttons: `strokeWidth={2.0–2.2}`.

```tsx
import { Dumbbell, HeartRate } from "iconoir-react";
<Dumbbell width={16} height={16} strokeWidth={1.8} />;
```

### Animations

- Scroll reveal: `IntersectionObserver` → `opacity 0 + translateY(18px)` → visible, staggered by index
- Easing: `ease` or `cubic-bezier(0.4,0,0.2,1)` — no bounces, no springs
- Transitions: 150–250ms for UI, 600–800ms for data fills

---

## Component conventions

- Every page: default export in `app/_pages/PageName.tsx`
- Every page accepts props via a typed `Props` object
- Use `useLang()` at the top of every component that renders text
- Use `framer-motion` for page transitions (already set up in `app/page.tsx`)
- Radar charts use helpers from `app/components/radar.ts`
- Wrap scrollable card lists in a `Reveal` component for scroll animations

---

## What to focus on

When given a UI task:

1. Read `design-system.md` for relevant patterns
2. Build visual first — layout, spacing, colors, typography
3. Use realistic mock data (add to `lib/mock.ts` if needed)
4. Add interactions (hover, click, open/close) with `useState`
5. Don't worry about whether data makes sense logically — make it look right
6. Leave `// TODO: [DATA]` wherever real data would eventually come from

**When in doubt about a design decision — go bolder.**
This is a dark, high-contrast, premium personal OS. Glass surfaces, neon accents used sparingly, Orbitron only on tags. Think biometric dashboard, not wellness app.

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
