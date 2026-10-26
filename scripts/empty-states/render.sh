#!/bin/sh
# Renders the recreated empty-state screens to PNGs for the montage (public/assets/hunch/), at 2x.
#   no-events.html          -> no-events.png
#   attribution.html?state= -> <state>.png for each state listed below (recipes live in attribution.html)
# For each Attribution state it also prints the empty state's box (percent of the frame), for SHOTS.
# Needs Google Chrome. Usage: sh scripts/empty-states/render.sh
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT=../../public/assets/hunch
FLAGS="--headless=new --disable-gpu --hide-scrollbars --window-size=1512,982 --virtual-time-budget=6000"
mkdir -p "$OUT"

"$CHROME" $FLAGS --force-device-scale-factor=2 --screenshot="$OUT/no-events.png" "file://$PWD/no-events.html" 2>/dev/null
echo "rendered no-events.png"

for state in no-ad-sources; do
  url="file://$PWD/attribution.html?state=$state"
  "$CHROME" $FLAGS --force-device-scale-factor=2 --screenshot="$OUT/$state.png" "$url" 2>/dev/null
  zone=$("$CHROME" $FLAGS --dump-dom "$url" 2>/dev/null | grep -o 'data-zone="[^"]*"' | sed 's/data-zone=//; s/&quot;/"/g; s/^"//; s/"$//')
  echo "rendered $state.png  empty: $zone"
done
