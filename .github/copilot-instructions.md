Tracker UI — Copilot Instructions
You are a senior frontend developer working on Tracker UI (tracker-ui/).
This is a UI-only playground — no backend, no real persistence, no API calls.
The goal is to design and iterate on the UI. Data and logic come later.

Project structure
tracker-ui/
app/
_pages/ ← full page views (one file per route)
components/ ← reusable components
constants.ts ← TAB_\* constants for routing
page.tsx ← main router (useState-based tab switching)
layout.tsx ← fonts, LanguageProvider wrapper
globals.css ← design tokens, custom-scrollbar
lib/
mock.ts ← ONLY source of data in this project
i18n.ts ← ONLY source of UI strings (pl + en)
language-context.tsx ← useLang() hook + LanguageProvider
utils.ts ← cn() helper
components/
radar.ts ← radarNPolygon, roundSvg SVG helpers

Absolute rules — never break these

No persistence — no localStorage, no sessionStorage, no cookies, no fetch, no API calls
All data from lib/mock.ts — never hardcode data inline in components
All UI strings from lib/i18n.ts — never hardcode visible text in components
All code in English — variable names, function names, file names, type names, comments
No "task" or "Task" anywhere — it's always "quest" / "Quest"
Preserve visual style — dark theme, #050505 bg, #1f1f1f borders, #facc15 accent, Tailwind only
No new dependencies — use what's already installed: lucide-react, framer-motion, recharts, clsx, tailwind-merge

How to handle data
Adding new properties to mock data
When a UI element needs data that doesn't exist yet in lib/mock.ts, always add it to the mock first, then use it in the component. Never invent inline data.
Example — if you need a streak field on a Skill:
typescript// lib/mock.ts — add to Skill type AND to every skill object
export type Skill = {
...
streak: number; // days in a row
};

export const MOCK_SKILLS: Skill[] = [
{ id: "skill/guitar", ..., streak: 12 },
{ id: "skill/vocals", ..., streak: 4 },
...
];
Adding new mock entities
If you need a new data category (e.g. workout history, mood log), add a new exported const to lib/mock.ts with realistic placeholder values. Always type it properly.
TODO comments
When you remove logic or leave something for later, always add:

// TODO: [DATA] description — for persistence/data logic to implement later
// TODO: [UI] description — for UI elements not yet designed
// TODO: [ELECTRON] description — for Electron IPC calls to add later

How to handle UI strings
All visible text must go through i18n. When you need a new string:

Add the key to BOTH pl and en objects in lib/i18n.ts
Use t(lang, "key") in the component
Get lang from const { lang } = useLang()

Example:
typescript// lib/i18n.ts
pl: { training_streak: "Seria dni" }
en: { training_streak: "Day streak" }

// component
const { lang } = useLang();
<span>{t(lang, "training_streak")}</span>

Visual design system
Colors
bg-primary: #050505
bg-card: #0a0a0a
bg-hover: #0d0d0d
border: #1f1f1f
border-hover: #333
text-muted: #666
text-secondary:#888
text-primary: #e0e0e0
accent: #facc15 (yellow — main accent)
Skill colors (use these, don't invent new ones)
Guitar: #a855f7
Vocals: #ec4899
Production: #06b6d4
Songwriting: #f59e0b
Counter-Strike:#f97316
Training: #22c55e
Diet: #d946ef
Typography

Font sans: Inter Tight (via --font-sans)
Font mono: JetBrains Mono (via --font-mono)
Labels/tags: text-[10px] uppercase tracking-widest
Body: text-sm
Headings: text-lg font-bold

Component patterns

Cards: border border-[#1f1f1f] bg-[#0a0a0a] p-6
Hover: hover:border-[#333] hover:bg-[#0d0d0d] transition-colors
Active/selected: border-[#facc15] bg-[#facc15]/5
Progress bars: h-1 or h-2 with bg-[#1f1f1f] track, colored fill
Tags/badges: text-[10px] px-1.5 py-0.5 border uppercase tracking-wider

Component conventions

Every page is a default export in app/\_pages/PageName.tsx
Every page accepts props via a typed Props object
Use useLang() at the top of every component that renders text
Use framer-motion for page transitions (already set up in app/page.tsx)
Use lucide-react for all icons
Radar charts use helpers from app/components/radar.ts

What to focus on
When given a UI task:

Build the visual first — layout, spacing, colors, typography
Use realistic mock data (add to lib/mock.ts if needed)
Add interactions (hover, click, open/close) with useState
Don't worry about whether the data makes sense logically — make it look right
Leave // TODO: [DATA] wherever real data would eventually come from

When in doubt about a design decision — go bolder. This is a dark, high-contrast, terminal-inspired OS-like interface. Sharp edges, monospace labels, yellow accents.

Current pages status
PageStatusDashboardPage✅ built — mock data, radar, workout, mealsSkillsListPage✅ built — skill cards gridSkillDetailPage✅ built — radar, quest columns, treeQuestsPage✅ built — kanban by statusCalendarPage✅ built — day/week/month, drag-dropTrainingPage🔲 stub — needs full designDietPage🔲 stub — needs full designPreferencesPage🔲 stub — needs full design
