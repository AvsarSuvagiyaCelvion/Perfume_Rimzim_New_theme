---
name: section-new
description: Scaffold a new Online Store 2.0 section with schema, blocks, presets, and CSS — $ARGUMENTS
---

Scaffold a new OS 2.0 section. Argument: $ARGUMENTS (e.g., `featured-collection`, `testimonials`, `image-with-text`).

Steps:

1. **Load context:**
   - Read `.claude/skills/shopify-section-builder/SKILL.md` for the canonical section pattern
   - Read `.claude/skills/client-brand-system/SKILL.md` for design tokens, voice, references
   - If a similar section already exists in `sections/`, read it for project conventions

2. **Ask the user** (one question, multi-part):
   - What's the purpose of this section in one sentence?
   - What blocks does it need (e.g., image, text, product, custom)?
   - Where will it appear by default (homepage, PDP, custom landing pages)?
   - Any specific design references from `client-brand-system`?

3. **Generate `sections/$ARGUMENTS.liquid`** following the canonical pattern:
   - Comment block at top (purpose, usage, metafield dependencies)
   - `{% liquid %}` block for variable assigns
   - Semantic HTML with `data-section-id` and `data-section-type`
   - CSS variables on root element for design tokens
   - Block loop with `{% when '@app' %}` support
   - `{% schema %}` at bottom with:
     - Settings alphabetized
     - All blocks defined with proper types
     - `presets` array with sensible default block layout
     - `disabled_on` for header/footer groups (unless intended for those)

4. **Generate matching CSS** in `assets/section-$ARGUMENTS.css` using design tokens from `client-brand-system`. Never hardcode colors/spacing.

5. **Update `layout/theme.liquid`** to include the stylesheet if it's not already auto-loaded.

6. **Add translations** to `locales/en.default.json` for any user-facing strings.

7. **Run `liquid-reviewer` agent** on the new section. Fix any blockers/critical issues before declaring done.

8. **Run `shopify theme push --unpublished`** so the user can preview the section in the Theme Editor.

9. **Report:**

```
✓ NEW SECTION: $ARGUMENTS

Files created:
  + sections/$ARGUMENTS.liquid
  + assets/section-$ARGUMENTS.css

Files modified:
  ~ layout/theme.liquid (added stylesheet include)
  ~ locales/en.default.json (added strings)

Theme Editor:
  1. Open the Theme Editor for the staging preview
  2. Click "Add section" on any page
  3. Look for "{$ARGUMENTS}" in the section picker
  4. Drag in, configure, save

Liquid review: PASS
Theme check:   PASS

Next: Test the section in the Theme Editor and refine settings/defaults.
```
