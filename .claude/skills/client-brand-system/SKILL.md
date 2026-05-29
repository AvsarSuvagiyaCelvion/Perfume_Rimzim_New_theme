---
name: client-brand-system
description: Brand voice, design system, typography, color palette, and visual references for {{CLIENT_NAME}}. Auto-loads when working on any visual, content, or design task in this repository. Use whenever generating UI, writing copy, picking colors, choosing fonts, or making creative decisions.
---

# {{CLIENT_NAME}} — Brand System

> **CUSTOMIZE THIS FILE FOR EACH CLIENT.** This is the single most important per-client file.
> Fill in every `{{PLACEHOLDER}}` based on the client's brand guidelines.

---

## Brand Essence

- **Brand name:** {{CLIENT_NAME}}
- **Tagline:** {{e.g., "Clean skincare for sensitive skin"}}
- **Mission:** {{one-sentence mission}}
- **Audience:** {{e.g., "Women 28-45 in urban areas, household income $80k+, value transparency and ingredient quality over flashy marketing"}}
- **Competitors we benchmark against:** {{e.g., Glossier, Aesop, Maap}}
- **Brands we explicitly DO NOT want to look like:** {{e.g., Generic dropshipping stores, fast fashion, aggressive D2C}}

---

## Voice & Tone

- **Voice personality:** {{e.g., "Confident, warm, knowledgeable. Like a trusted friend who happens to be a chemist."}}
- **Vocabulary preferences:**
  - Use: {{e.g., "ingredients", "skin", "you", "we"}}
  - Avoid: {{e.g., "consumers", "users", "leverage", "synergize", any AI clichés like "delve" or "tapestry"}}
- **Tone in copy:**
  - Headlines: {{e.g., short, declarative, lowercase}}
  - Body: {{e.g., conversational, 2nd person, sentences under 20 words}}
  - CTAs: {{e.g., action-first verbs: "Shop the bundle", not "Click here"}}
- **Banned phrases:**
  - "Game-changer", "revolutionary", "elevate your routine", "unlock", any em-dash overuse — these are AI tells.

---

## Color Palette (OKLCH-first)

Use OKLCH for all color tokens — it's perceptually uniform and what Tailwind v4, CSS Color Level 4, and modern design tools have standardized on.

```css
@theme {
  /* Brand primary — {{describe the feeling: warm, cool, grounded, etc.}} */
  --color-brand-50:  oklch(0.97 0.02 {{HUE}});
  --color-brand-100: oklch(0.94 0.04 {{HUE}});
  --color-brand-200: oklch(0.88 0.07 {{HUE}});
  --color-brand-300: oklch(0.80 0.11 {{HUE}});
  --color-brand-400: oklch(0.70 0.15 {{HUE}});
  --color-brand-500: oklch(0.60 0.18 {{HUE}});  /* Primary brand color */
  --color-brand-600: oklch(0.50 0.18 {{HUE}});
  --color-brand-700: oklch(0.40 0.16 {{HUE}});
  --color-brand-800: oklch(0.30 0.13 {{HUE}});
  --color-brand-900: oklch(0.20 0.09 {{HUE}});
  --color-brand-950: oklch(0.12 0.05 {{HUE}});

  /* Neutral — slightly brand-tinted, never pure gray */
  --color-neutral-0:   oklch(0.99 0.003 {{HUE}});
  --color-neutral-50:  oklch(0.96 0.005 {{HUE}});
  --color-neutral-100: oklch(0.92 0.008 {{HUE}});
  --color-neutral-300: oklch(0.78 0.01 {{HUE}});
  --color-neutral-500: oklch(0.55 0.015 {{HUE}});
  --color-neutral-700: oklch(0.35 0.02 {{HUE}});
  --color-neutral-900: oklch(0.15 0.015 {{HUE}});

  /* Semantic */
  --color-background:   var(--color-neutral-0);
  --color-foreground:   var(--color-neutral-900);
  --color-muted:        var(--color-neutral-100);
  --color-muted-fg:     var(--color-neutral-500);
  --color-border:       var(--color-neutral-100);
  --color-success:      oklch(0.55 0.15 145);
  --color-warning:      oklch(0.70 0.17 75);
  --color-danger:       oklch(0.55 0.22 25);
}
```

### Color usage rules

- **Primary brand color** (`--color-brand-500`): use for primary CTAs, key accents, brand moments. Never as a background fill behind text.
- **Pure white/black:** never used. Always tinted neutrals.
- **Accent ratio:** 60/30/10 rule — 60% neutral, 30% secondary, 10% brand accent.
- **Contrast:** all text/background pairs must hit WCAG 2.2 AA minimum (4.5:1 for body, 3:1 for large text). Validate with the design-auditor skill.

---

## Typography

**Pairings to use:** {{display-font}} for display + {{body-font}} for body text.

```css
@theme {
  --font-display: "{{DISPLAY_FONT}}", Georgia, serif;     /* Headings, hero */
  --font-body:    "{{BODY_FONT}}", system-ui, sans-serif; /* Paragraphs, UI */
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;

  /* Type scale — major third (1.25) */
  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px — body minimum on mobile */
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
  --text-5xl:  3rem;
  --text-6xl:  3.75rem;
  --text-7xl:  4.5rem;
}
```

### Typography rules

- **Body minimum:** 16px on mobile, 18px on desktop. Never smaller for readable copy.
- **Line height:** 1.6 for body, 1.2 for display.
- **Line length:** max 70 characters per line on body text.
- **Banned fonts (AI tells — never use these):**
  - Inter, Roboto, Arial, Helvetica, Space Grotesk, system-ui as a primary brand font.
- **Allowed system fallbacks:** only as the *last* item in `font-family`.

---

## Spacing & Layout

```css
@theme {
  /* 4px base grid */
  --space-1:  0.25rem;  /* 4 */
  --space-2:  0.5rem;   /* 8 */
  --space-3:  0.75rem;  /* 12 */
  --space-4:  1rem;     /* 16 */
  --space-6:  1.5rem;   /* 24 */
  --space-8:  2rem;     /* 32 */
  --space-12: 3rem;     /* 48 */
  --space-16: 4rem;     /* 64 */
  --space-24: 6rem;     /* 96 */
  --space-32: 8rem;     /* 128 */

  --radius-sm:  0.25rem;
  --radius-md:  0.5rem;
  --radius-lg:  1rem;
  --radius-full: 9999px;

  --container-narrow: 640px;
  --container-prose:  768px;
  --container-wide:   1280px;
  --container-full:   1536px;
}
```

### Layout rules

- **All spacing** must be a token, not arbitrary pixel values. No `padding: 13px`.
- **Touch targets:** minimum 44×44 CSS px on mobile (Apple HIG and WCAG 2.2 SC 2.5.8).
- **Grids:** prefer CSS Grid for page layout, Flexbox for component-internal alignment.

---

## Motion

- **Default duration:** 200ms for interactive feedback, 400ms for transitions, 600ms for hero/scroll reveals.
- **Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` (Material-like) for most things; `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring) for delightful moments.
- **Respect motion preferences:** always wrap meaningful animation in `@media (prefers-reduced-motion: no-preference)`.
- **Banned:** parallax-on-everything, gratuitous scroll-jacking, autoplay videos with sound, full-page transitions that block content > 600ms.

---

## Visual References

The client admires (build *in the spirit of*, never copy):

1. **{{REFERENCE_1}}** — what to emulate: {{e.g., "Aesop's restraint, generous whitespace, editorial typography"}}
2. **{{REFERENCE_2}}** — what to emulate: {{e.g., "Maap's product photography energy, single-color hero treatments"}}
3. **{{REFERENCE_3}}** — what to emulate: {{e.g., "Glossier's PDP information hierarchy, no-fluff ingredient lists"}}

**Anti-references** (do NOT look like):
- {{e.g., "Any Shopify dropshipping theme with countdown timers and exit-intent popups"}}
- {{e.g., "Generic SaaS landing pages with purple gradients"}}

---

## Shopify-Specific Design Decisions

- **Product image style:** {{e.g., "Square 1:1, off-white background #f5f1ec, lifestyle shots interspersed with product on white"}}
- **PDP layout:** {{e.g., "Image gallery left (60%), info right (40%); on mobile, image on top, sticky add-to-cart bar"}}
- **Cart style:** {{e.g., "Slide-out drawer from right; minimal; free shipping progress bar at top"}}
- **Trust signals:** {{e.g., "Press logos under hero on homepage, customer photos on PDPs, ingredient transparency block above add-to-cart"}}
- **Reviews app:** {{e.g., "Judge.me with custom Liquid template"}}

---

## How to Use This Skill

When you receive this skill in context, before producing any visual output:

1. **Reject AI defaults.** Inter, purple gradients, rounded-corner-everything, generic hero sections. If the brand DNA above doesn't include them, don't use them.
2. **Pick a clear aesthetic direction** from the references — don't blend three styles into mush.
3. **Use only the tokens above** — no arbitrary colors, no off-grid spacing.
4. **Validate before declaring done:**
   - WCAG AA contrast for every text/background pair.
   - Touch targets ≥ 44×44 px on mobile.
   - Reduced-motion alternative for any animation.
5. **When uncertain about a design decision**, prefer the more restrained option. {{CLIENT_NAME}}'s brand favors restraint over showmanship.

If a request would require breaking one of these rules, **flag it and ask** before proceeding.
