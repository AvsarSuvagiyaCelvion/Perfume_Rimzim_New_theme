---
name: shopify-cro-patterns
description: High-converting Shopify patterns for product pages, cart drawers, checkout, and mobile. Use when designing or refactoring any conversion-critical page (PDP, cart, collection, homepage hero), implementing trust signals, structuring product information, or auditing existing pages for conversion leakage. Based on Baymard Institute research, top-performer benchmarks, and Shopify-specific UX patterns.
---

# Shopify CRO Patterns

## When this skill applies

- Designing or refactoring a PDP, cart, collection page, or homepage hero
- Implementing trust signals, urgency mechanics, or social proof
- Auditing an existing store for conversion friction
- Mobile-specific conversion work (mobile is 70%+ of Shopify traffic but converts ~50% lower than desktop)

## Baseline targets

| Metric | Underperforming | Average | Top decile |
|--------|----------------|---------|------------|
| Overall CVR | < 1% | 1.4–3.2% | 4–6%+ |
| Mobile CVR | < 0.8% | 1.0–1.5% | 2.5%+ |
| Add-to-cart rate | < 5% | 8–12% | 15%+ |
| Cart abandonment | > 75% | ~70% | < 60% |

If a store is below average, fix foundations before testing tactics. Order: speed → mobile UX → PDP clarity → cart friction → checkout → personalization.

## The high-converting PDP layout (mobile-first)

```
┌──────────────────────────────────┐
│ ◀ Back  Breadcrumbs              │  Persistent
├──────────────────────────────────┤
│                                  │
│        Product Image Gallery     │  60% of viewport on mobile
│        ● ○ ○ ○                   │  Pagination dots
│                                  │
├──────────────────────────────────┤
│ Product Title                    │  Large, immediate
│ ★★★★☆ 4.8 (1,247 reviews)        │  Social proof, scannable
│ $48 • Subscribe & save 15%       │  Price + value framing
├──────────────────────────────────┤
│ "One sentence that answers       │  EMOTIONAL HOOK
│  why this product, in one line"  │  before configuration
├──────────────────────────────────┤
│ Color                            │  Visual swatches, NOT dropdowns
│ [●] [●] [●] [●]                  │
│ Size                             │
│ [S] [M] [L] [XL]                 │  Buttons/tiles, NOT dropdowns
├──────────────────────────────────┤
│ ┌──────────────────────────┐     │
│ │ ADD TO BAG — $48         │     │  Sticky on scroll
│ └──────────────────────────┘     │
│ Delivers Wed Jan 24 to {ZIP}     │  Concrete delivery date
│ Free shipping over $50           │
├──────────────────────────────────┤
│ ▸ What it does                   │  Accordion, not walls of text
│ ▸ Ingredients                    │
│ ▸ How to use                     │
│ ▸ Reviews (1,247)                │
├──────────────────────────────────┤
│ Related: shop the routine        │
└──────────────────────────────────┘
```

## The 7 rules for high-converting PDPs

### 1. Emotional hook before configuration

Most stores: title → price → size/color dropdowns → description.
**Better:** title → price → **one-line emotional hook** → configuration.

```liquid
<h1>{{ product.title }}</h1>
<div class="rating">★★★★☆ {{ product.metafields.reviews.rating }} ({{ product.metafields.reviews.count }})</div>
<div class="price">{{ product.price | money }}</div>

{%- if product.metafields.custom.hook != blank -%}
  <p class="hook">{{ product.metafields.custom.hook }}</p>
{%- endif -%}

{% comment %} Then configuration {% endcomment %}
```

Why: people justify purchases emotionally first, then rationally. Asking them to make decisions (size, color) before establishing desire creates cognitive strain.

### 2. Replace dropdowns with visual selectors

```liquid
{# ❌ AVOID #}
<select name="size">
  <option>Small</option>
  <option>Medium</option>
  <option>Large</option>
</select>

{# ✅ PREFER #}
<fieldset class="variant-picker" role="radiogroup" aria-label="Size">
  <legend class="visually-hidden">Size</legend>
  {%- for value in product.options_by_name['Size'].values -%}
    <label class="variant-tile">
      <input type="radio" name="size" value="{{ value }}" {% if forloop.first %}checked{% endif %}>
      <span>{{ value }}</span>
    </label>
  {%- endfor -%}
</fieldset>
```

Why: dropdowns hide options. Tiles let users see all choices at once. Color swatches let users *see* the color, not read it.

### 3. Concrete delivery dates, not vague promises

```liquid
{# ❌ AVOID #}
<p>Ships in 2–3 business days</p>

{# ✅ PREFER (computed server-side or via JS based on location) #}
<p>Order in the next <strong>3h 24m</strong> for delivery <strong>Wed, Jan 24</strong></p>
```

Why: Baymard research shows unclear delivery timing is a top abandonment cause. The brain flags uncertainty.

### 4. Sticky add-to-cart on mobile

Implement as a `position: sticky` bar that appears once the primary CTA scrolls out of view. Adds 5–12% to mobile conversion in most stores.

```liquid
<div class="sticky-atc" data-sticky-atc>
  <span class="sticky-atc__name">{{ product.title }}</span>
  <button class="sticky-atc__cta" data-add-to-cart>Add — {{ product.price | money }}</button>
</div>

<script>
  // Show sticky bar when main CTA leaves viewport
  const mainCta = document.querySelector('[data-main-cta]');
  const stickyBar = document.querySelector('[data-sticky-atc]');
  new IntersectionObserver(([entry]) => {
    stickyBar.classList.toggle('is-visible', !entry.isIntersecting);
  }).observe(mainCta);
</script>
```

### 5. Accordions for everything below the fold

Long product descriptions, ingredient lists, FAQs, sizing charts. Don't make users scroll past walls of text to reach reviews.

### 6. Reviews above-the-fold (rating + count, not the reviews themselves)

A `★★★★☆ 4.8 (1,247)` line near the title is one of the highest-leverage trust signals. Full reviews can live further down.

### 7. Free shipping threshold progress bar

In the cart drawer:
```
You're $12 away from FREE SHIPPING
[████████░░░░] $38 / $50
```

Lifts AOV by 12–18% in most stores. Add to the cart drawer header.

## Cart drawer essentials

Cart drawer (slide-out from right) > full cart page. Reduces abandonment vs. full-page redirect.

Required elements, in order:
1. **Header:** "Cart (3)" + close button
2. **Free shipping progress bar** (if AOV strategy allows)
3. **Line items:** image (60×60), name, variant, qty stepper (+/-, NOT dropdown), price, remove
4. **Upsell row:** "Frequently bought with" (1–3 items)
5. **Subtotal + shipping disclaimer**
6. **Primary CTA:** "Checkout — $48" (full width, brand color, sticky on mobile)
7. **Secondary trust:** payment method icons, return policy link, security badge

Anti-patterns:
- ❌ Forcing account creation before checkout
- ❌ Discount code field as the first interactive element (signals "you should have a code")
- ❌ Showing shipping cost only after entering address (sticker shock at checkout step 2)

## Mobile-specific rules

- Body text ≥ 16px (no zoom needed)
- Touch targets ≥ 44×44 px
- Sticky add-to-cart on PDPs
- One-thumb reachable primary CTAs (bottom 1/3 of screen)
- Apple Pay / Google Pay buttons above standard checkout (1-tap purchasing)
- Image gallery: swipeable, pinch-to-zoom, 1:1 aspect ratio

## Trust signals that move the needle

Ranked by impact:
1. **Customer reviews** (rating + count near title) — biggest lift
2. **Real customer photos** in reviews (not just stars)
3. **Press logos** under hero on homepage
4. **Money-back guarantee** prominently displayed near CTA
5. **Free shipping threshold**
6. **Secure checkout badges** in cart/checkout
7. **Founder story** for premium brands

Avoid (low-quality trust signals that signal *dropshipping*):
- ❌ Countdown timers (unless legitimately tied to inventory or sale end)
- ❌ Fake "X people are viewing this" notifications
- ❌ Generic "1000+ happy customers" without proof
- ❌ Stock badge apps for stores with no real inventory pressure

## A/B testing framework

Before testing tactics, ensure foundations are solid (speed, mobile UX, trust). Then test:

**High-impact tests to run first:**
1. Sticky ATC on mobile (binary: on/off)
2. Free shipping threshold value ($50 vs $75 vs $100)
3. Hero copy variations (benefit-led vs feature-led vs social-proof-led)
4. PDP image gallery format (carousel vs gallery vs vertical)
5. Cart drawer vs cart page

Run via Intelligems, Shopify's native A/B testing, or a custom Liquid flag. Run for 2–4 weeks, minimum 1000 conversions per variant for significance.

## What to audit on a new client store

Run through this in order. Score 1–5 on each, prioritize fixes by lowest score × revenue impact.

- [ ] Mobile Lighthouse Performance score
- [ ] Above-the-fold load time on a slow 3G connection
- [ ] Hero clarity (5-second test: what is this brand?)
- [ ] PDP emotional hook present
- [ ] Variant selectors are buttons, not dropdowns
- [ ] Delivery date is concrete and shown near CTA
- [ ] Sticky ATC on mobile
- [ ] Reviews above fold (rating + count)
- [ ] Cart drawer (not full-page redirect)
- [ ] Free shipping progress bar
- [ ] Apple Pay / Shop Pay in cart
- [ ] No fake urgency (countdown timers, fake stock alerts)
- [ ] Guest checkout enabled
- [ ] Trust badges in checkout
- [ ] Abandoned cart email automation set up (Klaviyo or Shopify Email)

The first 5 fixes from this list typically move overall CVR by 30–50% in underperforming stores.
