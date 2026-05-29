---
name: cwv-audit
description: Run Lighthouse against staging URL, propose top fixes
---

Run a Core Web Vitals audit and propose prioritized fixes.

Steps:

1. Ask the user for the staging URL if not already known (or read from `.shopify/staging-url` if it exists).

2. Run Lighthouse with both mobile and desktop presets:

   ```bash
   mkdir -p tmp
   npx -y lighthouse {URL} \
     --output=json --output-path=./tmp/lh-mobile.json \
     --quiet --chrome-flags="--headless"

   npx -y lighthouse {URL} \
     --preset=desktop \
     --output=json --output-path=./tmp/lh-desktop.json \
     --quiet --chrome-flags="--headless"
   ```

3. Delegate to the `cwv-auditor` agent with the JSON reports as input.

4. The agent will produce a prioritized action list. Present it to the user.

5. Ask which fixes the user wants to apply now (multi-select). For each chosen fix, apply it directly — but always behind the standard hook protections (don't push live, don't edit settings_data.json).

6. After applying fixes:
   - Run `shopify theme check`
   - Push to staging via `shopify theme push --unpublished --json`
   - Re-run Lighthouse and compare scores

7. Report the before/after delta:

```
LIGHTHOUSE BEFORE/AFTER

                  Before    After    Δ
Performance       72        88       +16
Accessibility     94        97       +3
SEO               92        100      +8
Best Practices    92        92       0

Core Web Vitals (mobile)
LCP               3.8s      2.1s     -1.7s
INP               320ms     180ms    -140ms
CLS               0.18      0.05     -0.13

Status: All targets hit ✓
```
