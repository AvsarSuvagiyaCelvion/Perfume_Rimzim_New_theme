---
name: schema-audit
description: Audit JSON-LD structured data across all page types
---

Run a full JSON-LD audit of the theme. Steps:

1. Grep for all `application/ld+json` blocks across `layout/`, `sections/`, `snippets/`, `templates/`.

2. Map each schema block to its page type:
   - `layout/theme.liquid` → site-wide schemas (Organization, WebSite)
   - `templates/index.json` + its sections → homepage schemas
   - `templates/product.json` + its sections → PDP schemas
   - `templates/collection.json` + its sections → collection page schemas
   - `templates/article.json` + its sections → blog post schemas

3. Delegate to the `schema-validator` agent for each page type. The agent will check:
   - Required schemas are present
   - All schemas use current (non-deprecated) types
   - Product schemas have `hasMerchantReturnPolicy` and `shippingDetails` (2026 requirement)
   - No fake/synthetic data (fake ratings, fake reviews)
   - JSON is syntactically valid

4. Aggregate into a coverage matrix:

```
SCHEMA COVERAGE MATRIX

Page Type      | Required Schemas               | Status
---------------|--------------------------------|--------
Homepage       | Organization, WebSite          | ✓ ✓
Product (PDP)  | Product+Offer, Breadcrumb      | ✓ ✗  ← missing shippingDetails
Collection     | Breadcrumb                     | ✓
Blog post      | Article, Breadcrumb            | ✗ ✗  ← no schema at all
Pages          | Breadcrumb                     | ✗

GAPS TO FIX (prioritized):

1. [HIGH] Product offer missing hasMerchantReturnPolicy and shippingDetails
   Impact: Google rich result eligibility lost
   File: sections/product-info.liquid
   → Use the schema-validator skill's Product template

2. [MEDIUM] No Article schema on blog post template
   Impact: No "Top Stories" eligibility
   File: sections/article-template.liquid
   → Generate using schema-validator skill

3. [LOW] No Breadcrumb on page templates
   Impact: No breadcrumb rich result on pages
   File: templates/page.json sections
   → Add a breadcrumb snippet

VALIDATION CHECK

After fixes, validate via:
  - https://search.google.com/test/rich-results
  - npx schema-dts-validator < {URL}
```

5. Do NOT auto-generate schema with fake data. If a site has no reviews, do not invent an `aggregateRating`. Recommend installing a reviews app first.
