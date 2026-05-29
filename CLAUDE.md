# {{CLIENT_NAME}} Shopify Theme — Project Context

> **Per-client setup checklist:** Fill in every `{{PLACEHOLDER}}` in this file before starting work.
> Replace this banner once done.

---

## WHAT this project is

- **Client:** {{CLIENT_NAME}}
- **Store URL:** {{STORE}}.myshopify.com (custom domain: {{CUSTOM_DOMAIN}})
- **Plan:** {{Basic | Shopify | Advanced | Plus}}
- **Stack:** Liquid + Online Store 2.0 (Dawn-based fork)
- **Theme directory:** Standard — `assets/`, `config/`, `layout/`, `sections/`, `snippets/`, `templates/`, `locales/`, `blocks/`
- **JS approach:** Vanilla JS + web components (no React unless `/components/` directory exists)
- **CSS approach:** {{Vanilla CSS with variables | Tailwind v4 via CLI build}}
- **Deployment:** `shopify theme push` to staging on every merge to `develop`; `--live` only via manual approval on `main`

---

## WHY it matters (business context)

- **Primary goal:** {{e.g., increase mobile conversion rate from 1.2% to 2.5%}}
- **Audience:** {{e.g., women 28-45, premium skincare buyers, mobile-first}}
- **Performance targets:** Mobile Lighthouse ≥ 80 Performance, ≥ 95 Accessibility, ≥ 100 SEO, LCP < 2.5s, INP < 200ms, CLS < 0.1
- **Accessibility:** WCAG 2.2 Level AA. The client is in {{jurisdiction}} — ADA/EAA compliance is required.
- **Brand voice:** See `.claude/skills/client-brand-system/SKILL.md`

---

## HOW to work in this repo

### Local Development

```bash
# Start the dev server (auto-hot-reloads on file save)
shopify theme dev --store {{STORE}}.myshopify.com

# Run the Liquid linter (run before every commit)
shopify theme check

# Push to an unpublished theme for client preview
shopify theme push --unpublished --json

# Run Playwright smoke tests against the local dev server
npm run test:e2e

# Run Lighthouse CI against staging
npm run test:lighthouse
```

### Conventions

- **Section schema settings** are alphabetized within each `settings` block.
- **All new sections** must include `presets` and support `{"type": "@app"}` in blocks.
- **Images** always use `{{ product.featured_image | image_url: width: 800, format: 'webp' }}`.
- **File naming:** kebab-case (`product-card.liquid`, NOT `productCard.liquid` or `product_card.liquid`).
- **Snippets:** keep under 100 lines; if longer, split into multiple snippets or a section.
- **Translations:** every user-facing string goes in `locales/en.default.json`, accessed via `{{ 'section.key' | t }}`.

### Danger Zones — Require explicit user confirmation

- **NEVER** run any of these without me typing "confirmed" in the current turn:
  - `shopify theme push --live`
  - `shopify theme delete`
  - Any direct edit to `config/settings_data.json`
  - Any GraphQL `productDelete`, `customerDelete`, `orderDelete` mutation
- **NEVER** commit:
  - `.env`, `.env.*`, `*.pem`, `*.key`, `credentials.json`
  - `config/settings_data.json` (already in `.gitignore`)
  - `node_modules/`, `.shopify/`, build artifacts

### Metafields This Theme Depends On

> Update this list whenever you add a new metafield definition.

| Namespace | Key | Type | Used in |
|-----------|-----|------|---------|
| `custom` | `tagline` | single_line_text | `sections/product-info.liquid` |
| `custom` | `ingredients` | rich_text | `sections/product-info.liquid` |
| `custom` | `featured_review_id` | product_reference | `sections/featured-product.liquid` |
| {{add more as you build}} | | | |

---

## Quality Gates (enforced by hooks)

The hooks in `.claude/settings.json` will block tool calls that violate these:

1. **Pre-commit:** `shopify theme check` must pass with zero errors.
2. **Pre-commit:** No secrets in staged files (env files, API keys, private keys).
3. **PreToolUse on Bash:** Block any `theme push --live` without explicit confirmation in the message.
4. **PreToolUse on Edit:** Block any direct edit to `config/settings_data.json`.

If a hook blocks a commit, **fix the underlying issue** rather than bypassing the hook.

---

## Decision Log

> Append architectural decisions here. Format: `YYYY-MM-DD — [decision] — [reason]`

- {{DATE}} — Started from Dawn v15 — chose Dawn over a paid theme for app-block compatibility and OS 2.0 maturity.
- {{add new decisions as the project evolves}}

---

## What to Tell Claude

Common prompts that work well in this repo:

- "Build a new section called X following our section-builder skill."
- "Audit `sections/product-info.liquid` with the liquid-reviewer agent."
- "Run `/cwv-audit` and propose fixes for the top 3 LCP offenders."
- "Generate JSON-LD for the product page and validate it with the schema-validator agent."
- "Run `/ship-staging` and give me the preview URL."

**Skills to invoke explicitly when needed:**
- `client-brand-system` — brand voice, colors, typography, references (auto-loaded for design tasks)
- `shopify-section-builder` — OS 2.0 section with schema + presets + app blocks
- `shopify-metafield-wizard` — metafield definitions and rendering patterns
- `shopify-cro-patterns` — high-converting PDP/cart/checkout patterns
- `frontend-design` — avoid AI-slop aesthetics (Anthropic official)
- `ui-ux-pro-max` — design system intelligence (color, typography, layout)
- `ux-designer` — Nielsen heuristics, Laws of UX, WCAG 2.2

Keep this file under 200 lines. If a rule is critical and non-negotiable, encode it as a hook in `.claude/settings.json` rather than a paragraph here.
