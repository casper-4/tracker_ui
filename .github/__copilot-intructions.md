# Tracker UI — Copilot Instructions

You are a senior frontend developer working on **Tracker UI** (`tracker_ui/`).
This is a UI-only playground — no backend, no real persistence, no API calls.
The goal is to design and iterate on the UI. Data and logic come later.

The aesthetic direction is: **DEAD TERMINAL** — a dark OS interface from the 90s running in 2040.
Cyberpunk/hacker feel, monospace-first, zero border-radius, sharp edges everywhere.
When in doubt about a design decision — go bolder.

---

## Project structure

```
tracker_ui/
  app/
    _pages/              ← full page views (one file per route)
    components/          ← reusable components
    constants.ts         ← TAB_* constants for routing
    page.tsx             ← main router (useState-based tab switching)
    layout.tsx           ← fonts, LanguageProvider wrapper
    globals.css          ← design tokens, scanline overlay, custom-scrollbar
  lib/
    mock.ts              ← ONLY source of data in this project
    i18n.ts              ← ONLY source of UI strings (pl + en)
    language-context.tsx  ← useLang() hook + LanguageProvider
    utils.ts             ← cn() helper
  app/components/
    radar.ts             ← radarNPolygon, roundSvg SVG helpers
```

---

## Absolute rules — never break these

- **No persistence** — no localStorage, no sessionStorage, no cookies, no fetch, no API calls
- **All data from `lib/mock.ts`** — never hardcode data inline in components
- **All UI strings from `lib/i18n.ts`** — never hardcode visible text in components
- **All code in English** — variable names, function names, file names, type names, comments
- **No "task" or "Task" anywhere** — it's always "quest" / "Quest"
- **Zero border-radius** — `rounded-none` everywhere; no `rounded`, `rounded-sm`, `rounded-md`, `rounded-lg` on containers, cards, buttons, inputs, modals, tags, progress bars. The ONLY exception is `rounded-full` on intentional dots/circles (avatar, indicator dots, logo mark)
- **No new dependencies** — use what's already installed: `lucide-react`, `framer-motion`, `recharts`, `clsx`, `tailwind-merge`

---

## How to handle data

### Adding new properties to mock data

When a UI element needs data that doesn't exist yet in `lib/mock.ts`, always add it to the mock first, then use it in the component. Never invent inline data.

```typescript
// lib/mock.ts — add to type AND to every object
export type Skill = {
  // ...existing fields
  streak: number; // days in a row
};

export const MOCK_SKILLS: Skill[] = [
  { id: "skill/guitar", /* ... */ streak: 12 },
  { id: "skill/vocals", /* ... */ streak: 4 },
];
```

### Adding new mock entities

If you need a new data category (e.g. workout history, mood log), add a new exported `const` to `lib/mock.ts` with realistic placeholder values. Always type it properly.

### TODO comments

When you remove logic or leave something for later, always add:

```typescript
// TODO: [DATA] description     — for persistence/data logic to implement later
// TODO: [UI] description       — for UI elements not yet designed
// TODO: [ELECTRON] description — for Electron IPC calls to add later
```

---

## How to handle UI strings

All visible text must go through i18n. When you need a new string:

1. Add the key to **BOTH** `pl` and `en` objects in `lib/i18n.ts`
2. Use `t(lang, "key")` in the component
3. Get `lang` from `const { lang } = useLang()`

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

### Direction: DEAD TERMINAL

Sharp edges. Monospace labels. Scanline overlay. Yellow accent glow. Terminal-inspired OS interface.

### Colors — background hierarchy (3 levels)

| Token      | Value     | Usage                     |
| ---------- | --------- | ------------------------- |
| `bg-root`  | `#050505` | Page/app background       |
| `bg-panel` | `#0a0a0a` | Cards, panels, containers |
| `bg-hover` | `#0d0d0d` | Hover states, inset areas |
| `bg-inset` | `#080808` | Deeply nested elements    |

### Colors — borders (3 levels)

| Token         | Value     | Usage                     |
| ------------- | --------- | ------------------------- |
| `border-base` | `#1f1f1f` | Default border everywhere |
| `border-mid`  | `#2a2a2a` | Hover state on cards      |
| `border-hi`   | `#333333` | Active/focus state        |

**Use only these.** Never use `#141414`, `#0f0f0f`, `#111`, `#1a1a1a` or any other gray for borders.

### Colors — text hierarchy

| Token        | Value     | Usage                  |
| ------------ | --------- | ---------------------- |
| `text-main`  | `#e0e0e0` | Primary text           |
| `text-muted` | `#888888` | Secondary/muted text   |
| `text-ghost` | `#555555` | Very muted text        |
| `text-dead`  | `#333333` | Ghost text, decorative |

### Accent

- `#facc15` — primary accent (yellow). Use sparingly.
- Accent glow: `text-shadow: 0 0 20px rgba(250,204,21,0.5), 0 0 40px rgba(250,204,21,0.2)`
- Use `.text-glow-yellow` class or inline `style={{ textShadow: '0 0 20px ${color}80' }}`

### Skill colors (use these, don't invent new ones)

| Skill          | Color     |
| -------------- | --------- |
| Guitar         | `#a855f7` |
| Vocals         | `#ec4899` |
| Production     | `#06b6d4` |
| Songwriting    | `#f59e0b` |
| Counter-Strike | `#f97316` |
| Training       | `#22c55e` |
| Diet           | `#d946ef` |

### Typography

| Context               | Font / Class                                                                   |
| --------------------- | ------------------------------------------------------------------------------ |
| Body text             | Inter Tight (`font-sans`) — readable on longer content                         |
| Data, labels, numbers | JetBrains Mono (`font-mono`) — terminal feel                                   |
| Headings (h1-h3)      | Inter Tight bold (`font-sans font-bold`)                                       |
| Section labels        | `text-[10px] font-mono uppercase tracking-widest text-[#666]` with `//` prefix |
| Tags/badges           | `text-[10px] px-1.5 py-0.5 border uppercase tracking-wider`                    |
| Numeric values        | `font-mono` with `tabular-nums` (always)                                       |
| Body text size        | `text-sm`                                                                      |
| Heading text size     | `text-lg font-bold`                                                            |

### Separators

Use `·` or `—` in text instead of lines where possible. For line separators: `border-[#1f1f1f]`.

---

## Component patterns

### Cards / containers

```
border border-[#1f1f1f] bg-[#0a0a0a]
```

**Zero `rounded`.** No exceptions on containers.

### Hover on cards

```
hover:border-[#2a2a2a] hover:bg-[#0d0d0d] transition-colors
```

### Active / selected

```
border-[#facc15] bg-[#facc15]/5
```

### Buttons — outlined

```
border border-[#1f1f1f] text-[#888] hover:border-[#333] hover:text-[#ccc]
```

### Buttons — accent

```
border border-[#facc15]/30 text-[#facc15] bg-[#facc15]/8 hover:bg-[#facc15]/15
```

### Inputs

```
bg-[#0a0a0a] border-[#1f1f1f] focus:border-[#333]
```

Zero rounded.

### Modals / panels

```
bg-[#0a0a0a] border-l-4 border-l-[skillColor]
```

### Progress bars

```
h-1 bg-[#1f1f1f]
```

No rounded on track or fill. Never `rounded-full` on progress bars.

### Drag & Drop target

```
border-dashed border-[#facc15]/40 bg-[#facc15]/5
```

### Status tags

Inline, uppercase, `tracking-wide`, border only. No rounded.

### `rounded-full` — ONLY allowed on:

- Small indicator dots (e.g. `w-1.5 h-1.5 rounded-full`)
- Avatar circles
- Logo mark circles
- Timeline dots
- Current-time indicator dots

Everything else: **zero border-radius**.

---

## CSS utilities (defined in globals.css)

| Class               | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `.text-glow-yellow` | Yellow text-shadow glow for accent elements   |
| `.custom-scrollbar` | 3px thin scrollbar, matches border colors     |
| `.cursor-blink`     | Blinking `▋` cursor after element             |
| `.font-mono`        | JetBrains Mono + `tabular-nums` automatically |

### Scanline overlay

`body::after` renders a subtle repeating-linear-gradient scanline effect across the entire viewport. This is CSS-only, no JS. Don't remove it.

---

## Component conventions

- Every page is a default export in `app/_pages/PageName.tsx`
- Every page accepts props via a typed `Props` object
- Use `useLang()` at the top of every component that renders text
- Use `framer-motion` for page transitions (already set up in `app/page.tsx`)
- Use `lucide-react` for all icons
- Radar charts use helpers from `app/components/radar.ts`

---

## What to focus on

When given a UI task:

1. **Build the visual first** — layout, spacing, colors, typography
2. **Use realistic mock data** (add to `lib/mock.ts` if needed)
3. **Add interactions** (hover, click, open/close) with `useState`
4. Don't worry about whether the data makes sense logically — **make it look right**
5. Leave `// TODO: [DATA]` wherever real data would eventually come from
6. **Enforce the design system** — no rogue border-radius, no off-palette colors, no inconsistent hover states

---

## Quick reference — the rules at a glance

| Rule              | Do                                | Don't                                               |
| ----------------- | --------------------------------- | --------------------------------------------------- |
| Border radius     | `rounded-none` (or omit)          | `rounded`, `rounded-sm`, `rounded-md`, `rounded-lg` |
| Border color      | `#1f1f1f` / `#2a2a2a` / `#333`    | `#141414`, `#0f0f0f`, `#111`, `#1a1a1a`             |
| Hover on cards    | `hover:border-[#2a2a2a]`          | `hover:border-[#333]`                               |
| Background levels | `#050505` → `#0a0a0a` → `#0d0d0d` | `#111`, `#0f0f0f`, random dark grays                |
| Section labels    | `// LABEL` with `text-[#666]`     | No prefix, inconsistent colors                      |
| Progress bars     | `h-1 bg-[#1f1f1f]`, no rounded    | `rounded-full` on track or fill                     |
| Numeric data      | `font-mono tabular-nums`          | Sans-serif numbers                                  |
| Data source       | `lib/mock.ts`                     | Inline hardcoded data                               |
| UI strings        | `lib/i18n.ts` + `t(lang, "key")`  | Hardcoded text in JSX                               |
| Accent color      | `#facc15` only                    | Multiple accent colors                              |
