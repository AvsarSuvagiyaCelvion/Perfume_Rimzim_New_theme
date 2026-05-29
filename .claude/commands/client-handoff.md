---
name: client-handoff
description: Generate a complete handoff package — admin walkthrough doc, video script, post-launch checklist
---

Generate the client handoff materials for the current Shopify theme project.

Steps:

1. **Survey what was built:**
   - List all sections in `sections/` with their purpose (from the comment block at top of each)
   - List all metafield namespaces/keys the theme depends on (from `CLAUDE.md` table)
   - List all custom apps installed (from notes or `.shopify/`)
   - List all third-party services connected (from Klaviyo, Judge.me, etc.)

2. **Generate `docs/HANDOFF.md`** with these sections:

   ### Theme Overview
   - Theme name, version, live URL, staging URL
   - Brief summary of what was built
   - Link to design system reference (Figma if applicable)

   ### Admin Walkthrough (for the merchant)
   - How to log into Shopify admin
   - How to use the Theme Editor (Sections > Add section)
   - For each custom section: what it does, what settings the merchant can change, common edits
   - How to upload product images correctly (size, format, naming)
   - How to set up metafields (every namespace+key required, with example values)

   ### Common Tasks (with screenshots placeholder)
   - How to add a new product (with metafield instructions)
   - How to create a new collection
   - How to update homepage content
   - How to start a discount/sale
   - How to update the announcement bar
   - How to add a new blog post
   - How to update email templates

   ### Apps & Integrations
   - List of installed apps with login instructions and purpose
   - Klaviyo flows that are active and how to edit them
   - Reviews app: how to moderate, respond, embed reviews
   - Analytics: where to check GA4, Shopify Analytics

   ### Maintenance
   - How to request changes (Slack channel, ticket system, email)
   - SLA: response time, change request process
   - What's included in monthly retainer (if applicable)

   ### Emergency Contacts
   - Developer / agency contact
   - Shopify support: 24/7 chat in admin
   - Payment processor support
   - Hosting/CDN issues (if applicable)

3. **Generate `docs/VIDEO-SCRIPT.md`** — a 10-minute Loom video script walking through the admin:
   - 0:00–1:00 Intro: what you'll learn
   - 1:00–3:00 Theme Editor basics: where to find sections
   - 3:00–6:00 Per-page walkthrough: home, PDP, collection, cart
   - 6:00–8:00 Metafields: what they are, how to update product-specific content
   - 8:00–9:30 Common tasks: discounts, blog posts, images
   - 9:30–10:00 Outro: emergency contacts, change request process

4. **Generate `docs/POST-LAUNCH-CHECKLIST.md`** — what to verify in week 1 after launch:
   - DNS propagation complete (test from 3 networks)
   - SSL cert active
   - 301 redirects from old URLs working
   - Sitemap submitted to Google Search Console
   - GA4 firing on all key events (page_view, add_to_cart, begin_checkout, purchase)
   - Klaviyo welcome flow firing
   - Abandoned cart flow firing
   - Mobile Lighthouse score still ≥ 80 on live
   - No console errors on any major page
   - Checkout works end-to-end with a real test order
   - Refund/cancel works end-to-end
   - Email receipts arriving correctly
   - Inventory syncing if multi-channel
   - Tax calculations correct for primary markets

5. **Render the docs to PDF** for the client (optional, ask first):
   ```bash
   npx -y md-to-pdf docs/HANDOFF.md
   ```

6. **Report:**

```
✓ HANDOFF PACKAGE GENERATED

Files created:
  + docs/HANDOFF.md           (admin walkthrough)
  + docs/VIDEO-SCRIPT.md      (Loom recording script)
  + docs/POST-LAUNCH-CHECKLIST.md

Next steps:
  1. Review HANDOFF.md and add screenshots
  2. Record the Loom video using VIDEO-SCRIPT.md
  3. Schedule a 30-minute handoff call with the client
  4. Run through POST-LAUNCH-CHECKLIST.md on launch day
  5. Schedule a 30-day check-in
```
