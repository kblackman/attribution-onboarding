#!/bin/sh
# Renders the recreated empty-state screens to PNGs for the montage (public/assets/hunch/), at 2x.
# Needs Google Chrome. Usage: sh scripts/empty-states/render.sh
set -e
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT=../../public/assets/hunch
mkdir -p "$OUT"
for page in no-events; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size=1512,982 --virtual-time-budget=6000 \
    --screenshot="$OUT/$page.png" "file://$PWD/$page.html" 2>/dev/null
  echo "rendered $OUT/$page.png"
done
