---
name: review
description: Full code review on staged changes — Liquid quality, accessibility, performance, security
---

Run a comprehensive review on all staged git changes (`git diff --cached`).

For each changed file:

1. **If `.liquid`, `.json` (schema), or `.css` in `sections/`, `snippets/`, `templates/`, `assets/`, `layout/`, `blocks/`:**
   - Delegate to the `liquid-reviewer` agent.
2. **If `.liquid` or `.json` and the change introduces user-facing UI:**
   - Also delegate to the `a11y-auditor` agent for WCAG 2.2 AA check.
3. **If the change touches the PDP, collection page, or layout/theme.liquid:**
   - Also delegate to the `schema-validator` agent.
4. **For any file:**
   - Scan for committed secrets (shpat_*, sk-*, AKIA*, ghp_*).
   - Scan for hardcoded brand colors / fonts (should be tokens).
   - Scan for `console.log`, `debugger`, commented-out code.

Aggregate findings into a single report:

```
═══════════════════════════════════════════════════
  CODE REVIEW REPORT
═══════════════════════════════════════════════════

Files reviewed: N
Agents invoked: liquid-reviewer, a11y-auditor, schema-validator

🚫 BLOCKERS (must fix before commit):
  [list]

🔴 CRITICAL:
  [list]

🟡 WARNINGS:
  [list]

🟢 TIPS:
  [list]

═══════════════════════════════════════════════════
Status: PASS / FAIL
═══════════════════════════════════════════════════
```

If FAIL, do NOT proceed to commit. Report the issues and wait for the user to fix or override.

If PASS, output the commit-ready message in Conventional Commits format and ask the user to confirm before committing.
