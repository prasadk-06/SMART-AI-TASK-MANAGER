# Design Brief: Smart AI Task Manager Pro

## Direction
Smart AI Task Manager Pro — premium dark-mode SaaS productivity dashboard with semantic color coding for task status and priority.

## Tone
Refined minimalism, professional and calm. Every element serves clarity and task focus. Zero decoration, maximum information density.

## Differentiation
Semantic color system at a glance: task status (green=done, red=overdue), priority levels (blue=low, amber=medium, coral=high), and tag categories (Work, Study, Personal) create instant visual parsing.

## Color Palette

| Token          | OKLCH               | Role                           |
|----------------|---------------------|--------------------------------|
| background     | 0.145 0.014 260    | Deep charcoal, calm foundation |
| foreground     | 0.95 0.01 260      | Near-white text, high contrast |
| card           | 0.18 0.014 260     | Elevated surfaces, content zones |
| primary        | 0.75 0.15 190      | Cyan accent, interactive focus |
| secondary      | 0.22 0.02 260      | Subtle toggle states            |
| muted          | 0.22 0.02 260      | Disabled, inactive states       |
| destructive    | 0.55 0.2 25        | Overdue, alerts, high priority  |
| success        | 0.65 0.18 145      | Completed tasks, emerald        |
| warning        | 0.75 0.15 85       | Medium priority, amber          |
| border         | 0.28 0.02 260      | Card separators, subtle borders |

## Typography

- Display: Space Grotesk — headings, hero text, app title (modern SaaS feel)
- Body: DM Sans — task labels, descriptions, UI text (clean and readable)
- Mono: Geist Mono — code snippets, timestamps if needed
- Scale: Hero `text-5xl font-bold tracking-tight`, H2 `text-3xl font-bold`, Labels `text-sm font-semibold uppercase`, Body `text-base`

## Elevation & Depth

Two-layer elevation: cards on `bg-card` with subtle `0.5px` borders, hover lift (+2px translateY). No box-shadows beyond hover states — clarity over depth.

## Structural Zones

| Zone    | Background           | Border                      | Notes                          |
|---------|----------------------|-----------------------------|---------------------------------|
| Header  | `bg-card` + `border-b` | `border-border` | Elevated, contains title/search |
| Sidebar | `bg-card` with `border-r` | `border-border` | Navigation, clean hierarchy |
| Content | `bg-background` | — | Spacious grid, task cards alternate |
| Stats   | `bg-card` cards | `border-border` | 4-column metric display |
| Footer  | `bg-background` | — | Subtle, if needed |

## Spacing & Rhythm

4px base rhythm: sections separated by `gap-8`, cards use `p-6`, microtext uses `text-xs` with `tracking-wide`. Breathing room between tasks prevents cognitive fatigue during long work sessions.

## Component Patterns

- Buttons: primary `bg-primary` text-white rounded-md, destructive `bg-destructive` for delete, ghost `bg-transparent hover:bg-muted`
- Cards: `bg-card` with `rounded-lg border border-border`, hover lift, smooth transitions
- Priority badges: inline colored left border (3px), semantic colors, no padding excess
- Tags: mini pills with `bg-[color]/15 text-[color]` semantic styling
- Inputs: `bg-input border-border` with focus ring `ring-primary`

## Motion

- Entrance: fade-in + slight scale (100ms), cards cascade staggered
- Hover: card lift (2px translateY), button color shift (0.2s ease)
- Drag: visual feedback via opacity change + outline highlight during reorder
- Transitions: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)

## Constraints

- No full-page gradients or decorative elements — clarity first
- No excessive shadows — subtle elevation only on hover
- All colors semantic: no arbitrary rainbow, only status/priority system
- Dark mode only (light mode available via theme toggle if requested, but dark is primary)
- Maximum 5 colors: primary, secondary, destructive, success, warning

## Signature Detail

Semantic left-border color coding on task cards: high-priority=red, medium=amber, low=blue, completed=emerald. One glance reveals task health at scale (the "WOW" of premium SaaS).
