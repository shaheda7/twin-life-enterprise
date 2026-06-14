#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:5001}
API_KEY=${SIM_API_KEY:-devkey}

if ! command -v jq >/dev/null 2>&1; then
  echo "[smoke] error: 'jq' is required. Install via 'brew install jq' or your distro package manager." >&2
  exit 10
fi

echo "[smoke] Base URL: $BASE_URL"

echo "[smoke] 1) Health check"
HC=$(curl -sS -H "Authorization: Bearer $API_KEY" "$BASE_URL/health") || { echo "[smoke] health: no response" >&2; exit 2; }
echo "$HC" | jq -e '.status=="ok"' >/dev/null && echo "[smoke] health: OK" || { echo "[smoke] health: FAILED - $HC" >&2; exit 2; }

echo "[smoke] 2) /compare"
COMPARE_RESP=$(curl -sS -X POST "$BASE_URL/compare" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"scenarioA": {"name":"A","workload":1000}, "scenarioB": {"name":"B","workload":1200}}')

echo "$COMPARE_RESP" | jq '.' >/dev/null || { echo "[smoke] compare: invalid JSON" >&2; echo "$COMPARE_RESP"; exit 3; }
echo "[smoke] compare: OK"

REC=$(echo "$COMPARE_RESP" | jq -r '.comparison.recommendation // empty')
if [ -n "$REC" ]; then
  echo "[smoke] recommendation: $REC"
else
  echo "[smoke] compare: WARNING - no recommendation field" >&2
fi

echo "[smoke] 3) /simulate and /results"
SIM_RESP=$(curl -sS -X POST "$BASE_URL/simulate" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"smoke-test","workload":500}')

echo "$SIM_RESP" | jq '.' >/dev/null || { echo "[smoke] simulate: invalid JSON" >&2; echo "$SIM_RESP"; exit 4; }

SIM_ID=$(echo "$SIM_RESP" | jq -r '.id // empty')
if [ -z "$SIM_ID" ]; then
  echo "[smoke] simulate: no id returned" >&2
  exit 5
fi
echo "[smoke] simulate: created id $SIM_ID"

RESULTS=$(curl -sS -H "Authorization: Bearer $API_KEY" "$BASE_URL/results/$SIM_ID")
echo "$RESULTS" | jq '.' >/dev/null || { echo "[smoke] results: invalid JSON" >&2; echo "$RESULTS"; exit 6; }
echo "[smoke] results: OK"

echo "[smoke] All smoke tests passed."
