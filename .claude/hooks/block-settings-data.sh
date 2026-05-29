#!/usr/bin/env bash
# Block direct edits to config/settings_data.json (contains live merchant content)
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | grep -oP '"(path|file_path)"\s*:\s*"[^"]*"' | head -1 | sed 's/"[^"]*"\s*:\s*"//;s/"$//')

if echo "$FILE_PATH" | grep -qE 'config/settings_data\.json$'; then
  echo "BLOCKED: Direct edits to config/settings_data.json are not allowed." >&2
  echo "This file contains live merchant theme customizations and should only be modified through the Theme Editor." >&2
  echo "If you need to change default settings, edit config/settings_schema.json instead." >&2
  exit 2
fi

exit 0
