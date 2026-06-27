#!/bin/sh
set -eu

cd website
npm ci --include=dev
npm run build
cd ..

rm -rf dist
cp -r website/dist dist

echo "Build complete — dist contents:"
ls -la dist/
test -f dist/index.html
