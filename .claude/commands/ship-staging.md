---
name: ship-staging
description: Test, build, and push to an unpublished staging theme — returns preview URL
---

Ship the current working tree to an unpublished theme for client review.

Steps:

1. **Pre-flight checks** (abort and report if any fail):
   - `git status` shows no uncommitted changes (or user explicitly confirms shipping uncommitted work)
   - `shopify theme check` passes with 0 errors
   - No secrets in working tree (grep for shpat_, sk-, AKIA)
   - `tests/playwright/*.spec.ts` exists and passes (`npm run test:e2e`)

2. **Push to unpublished theme:**

   ```bash
   shopify theme push --unpublished --json --name="staging-{branch}-{timestamp}"
   ```

   Capture the JSON output to get the preview URL and theme ID.

3. **Run Lighthouse against the preview URL** (mobile preset only, for speed):

   ```bash
   npx -y lighthouse {previewUrl} \
     --output=json --output-path=./tmp/lh-staging.json \
     --only-categories=performance,accessibility,seo \
     --quiet --chrome-flags="--headless"
   ```

4. **Validate JSON-LD on PDPs:** delegate to `schema-validator` agent on the product template.

5. **Report:**

```
✓ SHIPPED TO STAGING

Theme name: staging-feature-pdp-redesign-20260520-1430
Theme ID:   gid://shopify/OnlineStoreTheme/123456789
Preview:    https://{store}.myshopify.com?preview_theme_id=123456789

LIGHTHOUSE (mobile)
  Performance:    {score} / 100
  Accessibility:  {score} / 100
  SEO:            {score} / 100
  LCP / INP / CLS: {values}

QUALITY GATES
  ✓ theme check passed
  ✓ Playwright smoke tests passed (5/5)
  ✓ No secrets detected
  ✓ Schema validation passed
  ✓ Lighthouse targets met (≥ 80 / 95 / 100)

SHARE WITH CLIENT
  {previewUrl}

NEXT STEPS
  - Share preview link with client
  - Address client feedback
  - When approved: merge to main → manual approval triggers --live deploy
```

6. **If any quality gate fails:** abort the push, report what failed, and propose fixes. DO NOT push to live.

7. **Never use `--live` from this command.** If the user asks to deploy to production, that's a different workflow that requires explicit confirmation, code freeze checks, and a backup plan.
