---
name: shopify-metafield-wizard
description: Define, validate, and render Shopify metafields and metaobjects in themes. Use when adding new metafield definitions, rendering metafield values in Liquid, handling metaobject references, or setting up custom product/customer/order data structures. Knows the difference between single_line_text_field, list.product_reference, rich_text_field, and the rendering patterns each requires.
---

# Shopify Metafields & Metaobjects

## When this skill applies

- Defining new metafield definitions in the Shopify admin
- Rendering metafield values in Liquid (PDP, collection page, anywhere)
- Working with `metaobject_reference` and `list.*` metafields
- Migrating from product tags or hardcoded content to structured metafields
- Documenting metafield dependencies in the project README

## Theme rule #1: Read-only

**Themes can only READ metafields.** They cannot create, update, or delete them. Any write operation must go through the Admin API (use a custom app or the Admin MCP).

## Access patterns

```liquid
{# Standard metafield #}
{{ product.metafields.custom.tagline }}

{# With null/blank safety (ALWAYS do this) #}
{%- if product.metafields.custom.tagline != blank -%}
  <p class="product-tagline">{{ product.metafields.custom.tagline }}</p>
{%- endif -%}

{# Rich text — use | metafield_tag or | metafield_text #}
{{ product.metafields.custom.long_description | metafield_tag }}

{# List of references #}
{%- for related in product.metafields.custom.related_products.value -%}
  {% render 'product-card', product: related %}
{%- endfor -%}

{# Single metaobject reference #}
{%- assign chef = recipe.metafields.custom.chef.value -%}
<p>By {{ chef.name }}, {{ chef.bio }}</p>
```

## Metafield type → Rendering pattern

| Definition type | `.value` returns | Render pattern |
|-----------------|------------------|----------------|
| `single_line_text_field` | String | `{{ field }}` |
| `multi_line_text_field` | String (with `\n`) | `{{ field \| newline_to_br }}` |
| `rich_text_field` | HTML (sanitized) | `{{ field \| metafield_tag }}` |
| `number_integer` / `number_decimal` | Number | `{{ field }}` or `{{ field \| times: 100 }}` |
| `boolean` | true/false | `{% if field %}...{% endif %}` |
| `date` / `date_time` | Date | `{{ field \| date: '%B %d, %Y' }}` |
| `url` | String | `<a href="{{ field }}">` |
| `color` | Hex string | `style="--accent: {{ field }};"` |
| `weight` / `dimension` / `volume` / `rating` | Object with `value`, `unit` | `{{ field.value }} {{ field.unit }}` |
| `product_reference` | Product object | `{{ field.title }}`, `{{ field.featured_image \| image_url }}` |
| `collection_reference` | Collection object | `{{ field.title }}`, loop `field.products` |
| `variant_reference` | Variant object | `{{ field.title }}`, `{{ field.price \| money }}` |
| `file_reference` | Image or generic file | `{{ field \| image_url }}` if image, `{{ field.url }}` for generic |
| `metaobject_reference` | Metaobject | `{{ field.field_name }}` |
| `list.single_line_text_field` | Array of strings | `{% for item in field.value %}` |
| `list.product_reference` | Array of products | `{% for p in field.value %}` |
| `list.metaobject_reference` | Array of metaobjects | `{% for o in field.value %}` |

## Critical: `.value` accessor

For complex types (references, metaobjects, lists), you must use `.value` to access the resolved object:

```liquid
{# ❌ WRONG — returns the GID string #}
{{ product.metafields.custom.featured_chef }}

{# ✅ CORRECT — returns the metaobject #}
{{ product.metafields.custom.featured_chef.value.name }}
```

For simple types (text, number, boolean), `.value` is optional but works.

## Metaobjects

Metaobjects = reusable structured data with their own fields. Use them for: chefs, authors, ingredients, FAQ items, store locations, anything reused across products.

```liquid
{# Single metaobject reference on a product #}
{%- assign chef = product.metafields.custom.chef.value -%}
{%- if chef != blank -%}
  <div class="chef-card">
    {% if chef.photo %}
      {{ chef.photo | image_url: width: 200, format: 'webp' | image_tag: alt: chef.name }}
    {% endif %}
    <h3>{{ chef.name }}</h3>
    <p>{{ chef.bio }}</p>
  </div>
{%- endif -%}

{# Loop over all entries of a metaobject type (e.g., all chefs) #}
{%- for chef in shop.metaobjects.chef.values -%}
  <li>{{ chef.name }}</li>
{%- endfor -%}
```

## Documenting metafield dependencies

After defining or relying on any metafield, **update the Metafields table in `CLAUDE.md`**:

```markdown
| Namespace | Key | Type | Used in |
|-----------|-----|------|---------|
| `custom` | `tagline` | single_line_text_field | sections/product-info.liquid |
| `custom` | `ingredients` | rich_text_field | sections/product-info.liquid |
| `custom` | `chef` | metaobject_reference (chef) | sections/featured-product.liquid |
```

This prevents the "where does this content come from?" question on every new project.

## Section schema integration (OS 2.0)

Reference metafields as dynamic source defaults so merchants see the metafield value pre-filled in the Theme Editor:

```json
{
  "type": "richtext",
  "id": "description",
  "label": "Description",
  "default": "<p>{{ product.metafields.custom.tagline }}</p>"
}
```

Or in the Theme Editor, the merchant connects a setting to a metafield via the dynamic source button — your job in code is to make sure the metafield definition exists in the store admin.

## When to use metafields vs. metaobjects vs. tags vs. product options

| Use case | Solution |
|----------|----------|
| One free-form value per product (tagline, video URL) | metafield (text/url) |
| Same value type reused, simple list (allergens) | metafield (list.single_line_text) |
| Reusable structured records (chefs, locations, FAQs) | metaobjects |
| Cross-product references (related products, bundle items) | metafield (list.product_reference) |
| Filterable on collection pages | metafield with filtering enabled, OR product tags |
| Purchasable variant difference (size, color) | product options/variants — NOT metafields |

## Gotchas

- **16 KB cap per metafield value.** If text appears truncated, that's the reason — split into multiple fields.
- **Dynamic metafield keys don't work.** You can't construct a key like `product.metafields.custom[some_var]` — Liquid doesn't evaluate that.
- **Metafield definitions must exist in admin** before themes can read them. Document required namespaces/keys in `CLAUDE.md` so the merchant knows what to configure.
- **`metafields.namespace.key`** is the OS 2.0 way. The older `metafields["namespace.key"]` syntax still works but is being phased out.
- **JSON metafields** require parsing: `{% assign data = product.metafields.custom.spec_json.value %}` then access `data.field`.

## Validation

Before committing any code that reads a metafield:

1. Confirm the namespace + key exist in the store's Settings → Custom data.
2. Add the metafield to the table in `CLAUDE.md`.
3. Wrap every output in `{% if field != blank %}` to prevent breakage on products that don't have it set.
4. Run `shopify theme check` — it catches some malformed metafield access patterns.
