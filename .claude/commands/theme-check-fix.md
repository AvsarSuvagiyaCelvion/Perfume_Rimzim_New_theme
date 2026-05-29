---
name: theme-check-fix
description: Run shopify theme check, auto-fix safe issues, report the rest
---

1. Run `shopify theme check --output=json` and capture the output.

2. Parse the JSON. For each issue, categorize:

   **Safe auto-fix** (apply these without asking):
   - `MissingTranslation` — add the key to `locales/en.default.json` with a TODO value
   - `UnusedAssign` — remove the unused variable
   - `UnreachableCode` — remove the unreachable block (with a comment explaining)
   - `ImgLazyLoading` — add `loading="lazy"` to below-fold images
   - `ImgWidthAndHeight` — add `width` and `height` attributes
   - `SyntaxError` (auto-fixable by Shopify's CLI) — use `shopify theme check --auto-correct`
   - `JSONMissingBlock` (where defaults are obvious)

   **Recommend, don't fix** (surface to user):
   - `LiquidTag` errors — could break logic
   - `ParserBlockingScript` — needs human decision about whether script is critical
   - `MissingTemplate` — needs structural change
   - `ValidSchemaName` — schema design issue
   - Anything in section schemas that affects merchant-facing options

3. After applying safe fixes, re-run `shopify theme check` and verify the issue count dropped to 0 for those categories.

4. Output a report:

```
THEME CHECK REPORT

Initial issues: N
Auto-fixed:     M  (categories: MissingTranslation, UnusedAssign, ...)
Remaining:      P  (require human decision — listed below)

REMAINING ISSUES:

[file:line] [check_name]  Description
  → Why this needs you: [explanation]
  → Suggested fix: [recommendation]

Final theme check status: [PASS / FAIL]
```

5. If FAIL, do NOT commit. Wait for the user to address remaining issues.
