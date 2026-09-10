#!/usr/bin/env bash
# tests/index.html 을 Chrome 헤드리스로 실행하고 결과를 출력한다.
# 종료코드: 0 = 전부 통과 / 1 = 실패 있음 또는 테스트 0건 / 2 = Chrome 실행 불가
set -uo pipefail
cd "$(dirname "$0")/.."

CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
if [ ! -x "$CHROME" ]; then
  echo "Chrome을 찾을 수 없습니다: $CHROME" >&2
  echo "CHROME 환경변수로 경로를 지정하세요. 예: CHROME=/c/path/to/chrome.exe bash scripts/run-tests.sh" >&2
  exit 2
fi

ROOT="$(pwd -W 2>/dev/null || pwd)"
URL="file:///${ROOT}/tests/index.html"

DOM="$("$CHROME" --headless=new --disable-gpu --no-sandbox \
       --virtual-time-budget=15000 --dump-dom "$URL" 2>/dev/null)"

TEXT="$(printf '%s' "$DOM" | sed -e 's/<[^>]*>/\n/g')"

printf '%s\n' "$TEXT" | grep -E '^FAIL' -A 3 || true

SUMMARY="$(printf '%s\n' "$TEXT" | grep -oE '[0-9]+ passed, [0-9]+ failed' | tail -1)"
if [ -z "$SUMMARY" ]; then
  echo "테스트 결과를 읽지 못했습니다 — 러너가 실행되지 않았습니다." >&2
  exit 1
fi

echo "$SUMMARY"
PASSED="$(printf '%s' "$SUMMARY" | sed -E 's/^([0-9]+) passed.*/\1/')"
FAILED="$(printf '%s' "$SUMMARY" | sed -E 's/.*, ([0-9]+) failed$/\1/')"

if [ "$FAILED" -ne 0 ]; then exit 1; fi
if [ "$PASSED" -eq 0 ]; then
  echo "테스트가 하나도 실행되지 않았습니다." >&2
  exit 1
fi
exit 0
