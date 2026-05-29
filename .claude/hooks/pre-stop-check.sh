#!/usr/bin/env bash
# Run before Claude declares a task complete (Stop event)
# Catches: theme check errors, leaked secrets, broken JSON schema

# Skip if not a shopify theme repo
[ ! -f config/settings_schema.json ] && exit 0

ISSUES=()

# 1. Theme check (errors only)
if command -v shopify >/dev/null 2>&1; then
  THEME_CHECK_OUTPUT=$(shopify theme check --fail-level error 2>&1 || true)
  if echo "$THEME_CHECK_OUTPUT" | grep -qE 'error\b'; then
    ISSUES+=("theme check has errors — run 'shopify theme check' for details")
  fi
fi

# 2. Secret scan in staged + unstaged files
SECRET_PATTERNS='(shpat_[a-zA-Z0-9]{32,}|shpss_[a-zA-Z0-9]{32,}|sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36})'
if git rev-parse --git-dir >/dev/null 2>&1; then
  LEAKED=$(git diff HEAD 2>/dev/null | grep -E "^\+" | grep -E "$SECRET_PATTERNS" || true)
  if [ -n "$LEAKED" ]; then
    ISSUES+=("possible secrets detected in working tree changes — review before committing")
  fi
fi

# 3. settings_data.json check (should not be modified)
if git rev-parse --git-dir >/dev/null 2>&1; then
  if git diff --name-only 2>/dev/null | grep -q '^config/settings_data\.json$'; then
    ISSUES+=("config/settings_data.json was modified — this should not be edited directly")
  fi
fi

if [ "${#ISSUES[@]}" -gt 0 ]; then
  echo "⚠ Pre-stop checks found issues:" >&2
  for issue in "${ISSUES[@]}"; do
    echo "  • $issue" >&2
  done
  echo "" >&2
  echo "Consider addressing these before ending the session." >&2
  # exit 0 (not 2) — warn but don't block; let user decide
fi

exit 0
