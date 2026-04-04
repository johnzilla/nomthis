# Design System — nomthis

## Product Context
- **What this is:** AI-powered recipe generator with selectable celebrity chef personalities
- **Who it's for:** Anyone who wants a fun, opinionated take on "what can I make with these ingredients"
- **Space/industry:** Recipe/cooking apps. Competitors (DishGen, ChefGPT, SuperCook) are all generic and personality-free.
- **Project type:** Single-page web app, mobile-first

## Aesthetic Direction
- **Direction:** Playful street food — food truck menu meets indie zine
- **Decoration level:** Intentional — subtle paper grain texture on backgrounds, thick warm borders (2-3px), offset button shadows like screen-printed labels
- **Mood:** Warm, tactile, slightly rough. The feeling of ordering from a food truck with a handwritten specials board. Not polished SaaS, not corporate, not fine dining.
- **Anti-patterns:** No glassmorphism, no blobs, no purple gradients, no 3-column icon grids, no centered-everything layouts

## Typography
- **Display/Hero:** Fraunces 900 — bold optical serif with poster drama. Used for recipe names, hero text, chef names. Tight tracking (-0.03em).
- **Body:** Manrope 400-600 — friendly geometric sans. Used for recipe steps, descriptions, UI text. Line-height 1.7.
- **UI/Labels:** Bebas Neue — condensed all-caps. Used for buttons, section headers, labels. Tracking 0.08em. Feels stamped, not pillowy.
- **Data/Tables:** JetBrains Mono 400 — monospace with tabular-nums. Used for prep/cook times, nutrition data, ingredient quantities.
- **Code:** JetBrains Mono
- **Loading:** Google Fonts CDN
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&family=Manrope:wght@400;500;600;700&family=Bebas+Neue&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  ```
- **Scale:** 0.7rem (meta) / 0.85rem (small) / 0.95rem (body) / 1.15rem (lead) / 1.6rem (h2) / 2rem (h1) / 3.5rem (hero)

## Color
- **Approach:** Warm food palette with per-chef accent colors
- **Background:** `#F5EADB` (Toasted Paper) — not app-white, warm kraft paper
- **Surface/Cards:** `#FFF8EF` (Menu Cream) — laminated menu card feel
- **Text:** `#2A211D` (Espresso) — warm dark brown, not pure black
- **Muted text:** `#6F6259` (Worn Ink)
- **Default accent:** `#EF5B2A` (Hot Sauce) — red-orange, not startup orange
- **Accent deep:** `#B93817` (Deep Sauce) — for shadows and hover states
- **Highlight:** `#FFD15C` (Mustard) — for active/live states, affiliate cards
- **Border:** `#D8BFA7` (Warm Border) — warm brown, not cold gray
- **Per-chef accent colors:** Each personality shifts the UI accent when selected
  - Classic: `#EF5B2A` (default Hot Sauce)
  - Gary Fiery: `#FF2E00` (Sriracha)
  - Chef Gordo: `#FFB800` (Mango)
  - Nonna Sofia: `#2D8C3C` (Basil)
  - Coach Macro: `#3B82F6` (Whey)
- **Semantic:** success `#2D8C3C`, warning `#FFB800`, error `#CC1100`, info `#3B82F6`
- **Dark mode:** Not planned. The warm paper aesthetic is inherently a light theme.

## Spacing
- **Base unit:** 8px
- **Density:** Comfortable — recipes need breathing room
- **Scale:** 2xs(2) xs(4) sm(8) md(16) lg(24) xl(32) 2xl(48) 3xl(64)

## Layout
- **Approach:** Single column, mobile-first
- **Max content width:** 640px
- **Border radius:** 8px (sharper than typical 12px, more intentional)
- **Border style:** 2-3px solid in warm brown (#D8BFA7), not thin gray hairlines
- **Button style:** Solid fills with offset box-shadow (3px 3px 0) for screen-print/stamp aesthetic
- **Active state:** Selected cards get accent border + accent offset shadow

## Motion
- **Approach:** Minimal-functional
- **Recipe streaming is the motion.** Token-by-token text appearance is more alive than any animation.
- **Easing:** ease-out for entrances, ease-in for exits
- **Duration:** 100-200ms for interactive feedback (hover, click), no decorative animations

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-04 | Initial design system | Created by /design-consultation. Three-voice synthesis: Codex (street poster/diner menu), Claude subagent (bodega receipt tape), Claude main (food truck + indie zine). Per-chef accent colors and Fraunces serif were convergent insights across all three voices. |
| 2026-04-04 | Per-chef accent colors | Each personality shifts the UI accent color when selected. Makes personality visual, not just textual. Proposed by all three design voices independently. |
| 2026-04-04 | Offset box-shadows | Screen-print/stamp aesthetic on buttons and active cards. Differentiates from standard drop-shadow patterns. Proposed by Codex voice. |
