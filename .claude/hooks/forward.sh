#!/bin/bash
# Forward AskUserQuestion hook events to Electric Agent studio.
# Blocks until the user answers in the web UI.
BODY="$(cat)"
RESPONSE=$(curl -s -X POST "http://host.docker.internal:4400/api/sessions/a84272b1-d45a-4d8b-85e5-8cbc214a93f1/hook-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 59b12177e9e1cbda4c3a9f345bd186442099792bbc43062d2d6f05b4e942657d" \
  -d "${BODY}" \
  --max-time 360 \
  --connect-timeout 5 \
  2>/dev/null)
if echo "${RESPONSE}" | grep -q '"hookSpecificOutput"'; then
  echo "${RESPONSE}"
fi
exit 0