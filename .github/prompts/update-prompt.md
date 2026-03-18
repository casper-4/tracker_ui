Refactor `[FILE PATH]` to match the design system defined in `design-system.md`.

Rules:

- Read `design-system.md` fully before touching anything
- MERGE don't replace — preserve all existing logic, data bindings, i18n keys, props, and component structure
- Design system requirements take priority over current visual choices, but never over functional ones
- Do NOT remove or rewrite any mock data usage, useLang() calls, TODO comments, or business logic
- If a current visual choice isn't covered by design-system.md, keep it

What to migrate:

- Colors, backgrounds, borders → design-system.md tokens
- Text hierarchy → correct opacity scale
- Cards → glass pattern (gradient bg, border-top highlight, shine line, mouse-follow light)
- Tags → Geist, no borders, correct variant, neon-flicker on hover
- Buttons → correct variant + Iconoir icon on the left
- Icons → replace with Iconoir equivalents (iconoir-react), strokeWidth 1.8
- Progress bars → wrap in .progress-wrap, hover effects
- Animations → scroll reveal via IntersectionObserver, no springs/bounces
- Typography → Geist everywhere

What to keep:

- All component props and their types
- All mock.ts data references
- All i18n.ts string references
- All framer-motion page transitions
- All radar chart logic
- Any custom layout or spacing that isn't contradicted by the design system
- All TODO comments

If something is ambiguous — apply the design system visually but leave a `// TODO: [UI]` comment explaining what was unclear.
