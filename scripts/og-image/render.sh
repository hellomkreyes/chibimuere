#!/bin/sh
# Renders og-image.html (1200×630, the site's own fonts and colours) to
# public/og-image.jpg, the link-preview image for every page.
#   sh scripts/og-image/render.sh
# Needs Google Chrome (macOS path below; set CHROME to override) and macOS `sips`
# for the JPEG step. JPEG keeps the film grain around ~150 KB instead of ~650 KB as PNG.
set -e
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
  --force-device-scale-factor=1 --window-size=1200,630 --virtual-time-budget=3000 \
  --screenshot="$PWD/og-image.png" "file://$PWD/og-image.html" >/dev/null 2>&1
sips -s format jpeg -s formatOptions 88 og-image.png --out ../../public/og-image.jpg >/dev/null
rm og-image.png
echo "public/og-image.jpg updated"
