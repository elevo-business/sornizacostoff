#!/usr/bin/env bash
# Builds the deployable site into _site/ (see scripts/build.py).
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/build.py
