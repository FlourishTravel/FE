#!/bin/sh
set -eu

export VITE_BASE="${VITE_BASE:-/}"
export VITE_API_URL="${VITE_API_URL:-https://flourishtravel.khanhtn45.id.vn/api}"
# Collapse accidental /api/api from DO env (e.g. API_BASE_URL + /api)
while echo "$VITE_API_URL" | grep -q '/api/api$'; do
  VITE_API_URL="${VITE_API_URL%/api}"
done
export VITE_API_URL

cd website
npm ci --include=dev
npm run build
cd ..

rm -rf dist
cp -r website/dist dist

echo "Build complete — dist contents:"
ls -la dist/
test -f dist/index.html
