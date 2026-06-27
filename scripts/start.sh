#!/bin/sh
set -eu

# Fallback khi DO Web Service không chạy build phase (dist bị thiếu lúc runtime)
if [ ! -f dist/index.html ]; then
  echo "dist/ missing — building at startup..."
  export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=460}"
  sh scripts/build.sh
fi

echo "Serving dist/ on port ${PORT:-8080}"
exec npx --yes serve dist -s --listen "tcp://0.0.0.0:${PORT:-8080}"
