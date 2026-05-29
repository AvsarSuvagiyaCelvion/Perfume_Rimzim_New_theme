#!/usr/bin/env bash
# Auto-format Liquid and JSON files after Claude edits them
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -oP '"(path|file_path)"\s*:\s*"[^"]*"' | head -1 | sed 's/"[^"]*"\s*:\s*"//;s/"$//')

[ -z "$FILE_PATH" ] && exit 0
[ ! -f "$FILE_PATH" ] && exit 0

# Format based on file extension
case "$FILE_PATH" in
  *.liquid)
    # Use prettier-plugin-liquid if installed
    if command -v prettier >/dev/null 2>&1 && [ -f node_modules/@shopify/prettier-plugin-liquid/package.json ]; then
      prettier --write "$FILE_PATH" --plugin=@shopify/prettier-plugin-liquid 2>/dev/null || true
    fi
    ;;
  *.json)
    # Pretty-print JSON if jq is available
    if command -v jq >/dev/null 2>&1; then
      jq . "$FILE_PATH" > "$FILE_PATH.tmp" 2>/dev/null && mv "$FILE_PATH.tmp" "$FILE_PATH" || rm -f "$FILE_PATH.tmp"
    fi
    ;;
esac

exit 0
