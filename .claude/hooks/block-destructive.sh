#!/usr/bin/env bash
# Block destructive commands that are commonly catastrophic when run by an agent
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -oP '"command"\s*:\s*"[^"]*"' | head -1 | sed 's/"command"\s*:\s*"//;s/"$//')

# Patterns to block outright
BLOCKED_PATTERNS=(
  'shopify\s+theme\s+delete'
  'git\s+push.*--force(\s|$)'
  'git\s+push.*-f(\s|$)'
  'git\s+reset\s+--hard\s+(origin|HEAD~)'
  'rm\s+-rf\s+/'
  'rm\s+-rf\s+~'
  'rm\s+-rf\s+\$HOME'
  'productDelete\b'
  'customerDelete\b'
  'orderDelete\b'
  'shopOwnerChange\b'
)

for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qE "$pattern"; then
    echo "BLOCKED: This command matches a destructive pattern ('$pattern')." >&2
    echo "If this is intentional, ask the user to run it manually outside Claude Code." >&2
    exit 2
  fi
done

exit 0
