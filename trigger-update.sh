#!/bin/bash
# Trigger first league standings update

# You'll need to set these environment variables:
# export SUPABASE_URL="https://gyxqczdhzsndzcqfqmgl.supabase.co"
# export SUPABASE_ANON_KEY="sb_publishable_hbu5EdKJaaAO2nYREXTt-w___IQ2V8b"

SUPABASE_URL="https://gyxqczdhzsndzcqfqmgl.supabase.co"
SUPABASE_ANON_KEY="sb_publishable_hbu5EdKJaaAO2nYREXTt-w___IQ2V8b"

echo "Triggering league standings update..."

curl -X POST \
  "${SUPABASE_URL}/functions/v1/fetch-league-standings" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{}'

echo ""
echo "Update triggered!"
