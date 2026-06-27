#!/bin/sh
set -eu

export VITE_BASE="${VITE_BASE:-/}"
export VITE_API_URL="${VITE_API_URL:-https://flourishtravel-rtdye.ondigitalocean.app/api}"

cd website
npm ci --include=dev
npm run build
cd ..

rm -rf dist
cp -r website/dist dist

echo "Build complete — dist contents:"
ls -la dist/
test -f dist/index.html
