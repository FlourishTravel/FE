#!/bin/sh
set -eu

if [ ! -f dist/index.html ]; then
  echo "ERROR: dist/index.html missing at runtime"
  echo "Root:"
  ls -la
  echo "website/:"
  ls -la website/ 2>/dev/null || true
  exit 1
fi

echo "Serving dist/ on port ${PORT:-8080}"
exec serve dist -s --listen "tcp://0.0.0.0:${PORT:-8080}"
