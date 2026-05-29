#!/usr/bin/env bash
# Block any shopify theme push --live unless user explicitly confirmed
# Reads tool input from stdin (JSON)

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | grep -oP '"command"\s*:\s*"[^"]*"' | head -1 | sed 's/"command"\s*:\s*"//;s/"$//')

# Match the dangerous pattern
if echo "$COMMAND" | grep -qE 'shopify\s+theme\s+push.*--live'; then
  # Check if "confirmed" appears anywhere in the recent context
  # This is a heuristic — in production you'd parse the full transcript
  USER_MESSAGE_FILE="${CLAUDE_USER_MESSAGE_FILE:-/dev/null}"
  if [ -f "$USER_MESSAGE_FILE" ] && grep -qiE '\b(confirmed|yes push live|deploy to production)\b' "$USER_MESSAGE_FILE"; then
    exit 0  # User confirmed, allow
  fi
  echo "BLOCKED: 'shopify theme push --live' requires explicit user confirmation." >&2
  echo "Ask the user to type 'confirmed' in their next message to proceed." >&2
  exit 2  # Exit 2 = block tool call and surface message to Claude
fi

exit 0
