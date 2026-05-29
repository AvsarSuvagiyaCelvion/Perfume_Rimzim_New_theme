---
name: shopify-section-builder
description: Build Online Store 2.0 sections with proper schemas, blocks, presets, and app block support. Use when creating any new section file (sections/*.liquid), refactoring an existing section to OS 2.0, or adding new blocks to a section. Covers Liquid logic, JSON schema authoring, theme editor settings, and dynamic section rendering.
---

# Shopify Section Builder

## When this skill applies

- Creating any new file in `sections/`
- Refactoring an existing `.liquid` template into a section + JSON template
- Adding blocks to an existing section
- Building app-block-compatible sections

## The OS 2.0 Section Pattern (the canonical structure)

Every section follows this layout:

```liquid
{% comment %}
  Section: {{section name}}
  Purpose: {{one-line description}}
  Used in: {{templates/pages that include it}}
  Metafield dependencies: {{list any product/customer metafields it reads}}
{% endcomment %}

{%- liquid
  # Compute any values needed up front
  assign heading = section.settings.heading | default: 'Featured products'
  assign columns_mobile = section.settings.columns_mobile | default: 1
  assign columns_desktop = section.settings.columns_desktop | default: 4
-%}

<section
  class="featured-grid"
  style="
    --columns-mobile: {{ columns_mobile }};
    --columns-desktop: {{ columns_desktop }};
    padding-block: {{ section.settings.padding_block }}px;
  "
  data-section-id="{{ section.id }}"
  data-section-type="featured-grid"
>
  {%- if heading != blank -%}
    <h2 class="featured-grid__heading">{{ heading | escape }}</h2>
  {%- endif -%}

  <div class="featured-grid__items">
    {%- for block in section.blocks -%}
      {%- case block.type -%}
        {%- when 'product' -%}
          {% render 'product-card', product: block.settings.product, block: block %}
        {%- when 'image' -%}
          {% render 'lifestyle-image', image: block.settings.image, block: block %}
        {%- when '@app' -%}
          {% render block %}
      {%- endcase -%}
    {%- endfor -%}
  </div>
</section>

{% schema %}
{
  "name": "Featured grid",
  "tag": "section",
  "class": "section-featured-grid",
  "disabled_on": {
    "groups": ["header", "footer"]
  },
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Featured products"
    },
    {
      "type": "range",
      "id": "columns_mobile",
      "min": 1,
      "max": 2,
      "step": 1,
      "default": 1,
      "label": "Columns on mobile"
    },
    {
      "type": "range",
      "id": "columns_desktop",
      "min": 2,
      "max": 6,
      "step": 1,
      "default": 4,
      "label": "Columns on desktop"
    },
    {
      "type": "range",
      "id": "padding_block",
      "min": 0,
      "max": 120,
      "step": 4,
      "unit": "px",
      "default": 48,
      "label": "Vertical padding"
    }
  ],
  "blocks": [
    {
      "type": "product",
      "name": "Product",
      "settings": [
        {
          "type": "product",
          "id": "product",
          "label": "Product"
        }
      ]
    },
    {
      "type": "image",
      "name": "Lifestyle image",
      "settings": [
        {
          "type": "image_picker",
          "id": "image",
          "label": "Image"
        }
      ]
    },
    { "type": "@app" }
  ],
  "presets": [
    {
      "name": "Featured grid",
      "blocks": [
        { "type": "product" },
        { "type": "product" },
        { "type": "product" },
        { "type": "product" }
      ]
    }
  ]
}
{% endschema %}
```

## Mandatory rules for every section

1. **Comment block at top** describing purpose, usage, and metafield dependencies.
2. **`{% schema %}` block at bottom** — never at top, never in middle.
3. **`presets` array MUST be defined** — without it, merchants can't add the section via Theme Editor.
4. **`{ "type": "@app" }` MUST be in blocks** — enables app integrations without editing code.
5. **Settings alphabetized within each settings block** (project convention).
6. **`data-section-id` and `data-section-type`** on root element — required for the section JS API.
7. **All user-facing strings translatable** — use `{{ 'sections.featured_grid.heading_default' | t }}` for any default that ships in code.
8. **`disabled_on` set correctly** — most sections should be disabled in header/footer groups.

## Schema setting types reference

Use only Shopify's supported types. Validate via `validate_theme_codeblocks` in the Dev MCP before committing.

| Type | Use for |
|------|---------|
| `text` | Short headings, labels |
| `textarea` | Multi-line text |
| `richtext` | Formatted body copy (bold, italic, links) |
| `inline_richtext` | Rich text without paragraphs |
| `image_picker` | Single image |
| `video` | Shopify-hosted video |
| `url` | Internal or external links |
| `color` | Solid color |
| `color_scheme` | OS 2.0 color schemes (preferred over `color`) |
| `range` | Slider (with min/max/step/unit) |
| `select` | Dropdown with predefined options |
| `radio` | Radio buttons (1-4 options) |
| `checkbox` | Boolean |
| `product` | Single product picker |
| `product_list` | Multiple products |
| `collection` | Single collection |
| `collection_list` | Multiple collections |
| `blog` | Single blog |
| `page` | Single page |
| `metaobject` / `metaobject_list` | Custom metaobject references |
| `font_picker` | Font family |
| `header` | Visual separator in editor (no value) |
| `paragraph` | Helper text in editor (no value) |

## Common patterns

### Conditional rendering with `disabled` block visibility
```liquid
{%- for block in section.blocks -%}
  {%- if block.shopify_attributes != blank -%}
    <div {{ block.shopify_attributes }}>
      ...
    </div>
  {%- endif -%}
{%- endfor -%}
```
The `{{ block.shopify_attributes }}` is required for the Theme Editor to highlight blocks on hover.

### Color schemes (OS 2.0 preferred over raw colors)
```json
{
  "type": "color_scheme",
  "id": "color_scheme",
  "label": "Color scheme",
  "default": "scheme-1"
}
```
In Liquid: `<section class="color-{{ section.settings.color_scheme }}">`

### Lazy-loaded images (mandatory)
```liquid
{{ block.settings.image | image_url: width: 1200, format: 'webp' | image_tag:
  loading: 'lazy',
  sizes: '(min-width: 768px) 50vw, 100vw',
  widths: '300, 600, 900, 1200, 1800',
  alt: block.settings.image.alt | default: block.settings.heading
}}
```

### CSS-in-section via section.id scoping
```liquid
<style>
  #section-{{ section.id }} .my-element { /* scoped styles */ }
</style>
<section id="section-{{ section.id }}">...</section>
```

## Validation checklist before declaring section complete

- [ ] `shopify theme check` passes with zero errors
- [ ] Schema is valid JSON (validate via Dev MCP `validate_theme_codeblocks`)
- [ ] `presets` defined
- [ ] `@app` block type included (or explicit reason in comment if not)
- [ ] All images use `image_url` + `image_tag` filters, never raw `img` with `src`
- [ ] All user-facing strings translatable via `{{ 'key' | t }}`
- [ ] Touch targets ≥ 44×44 px on mobile
- [ ] WCAG AA contrast on all text
- [ ] Section is reorderable in Theme Editor (test by dragging it)
- [ ] Section is removable in Theme Editor without breaking page

## What NOT to do

- ❌ Don't write Liquid templates in `templates/*.liquid` — always use `templates/*.json` for OS 2.0.
- ❌ Don't use `{% include %}` — use `{% render %}` (`include` is deprecated, leaks scope).
- ❌ Don't reference `settings` directly across sections — use `section.settings` to keep section state isolated.
- ❌ Don't hardcode brand colors, fonts, or spacing — use design tokens from `client-brand-system`.
- ❌ Don't add JavaScript that requires `DOMContentLoaded` — sections can be inserted/removed dynamically in the Theme Editor. Listen to `shopify:section:load` and `shopify:section:unload` events.
