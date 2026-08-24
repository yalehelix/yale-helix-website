#!/usr/bin/env bash
#
# One-command export of new startup submissions to PDF.
# First run sets up a local Python environment; later runs just generate the
# submissions you don't already have. Pass --force to re-export everything.
#
#   ./scripts/export.sh        (or: yarn export)
#   ./scripts/export.sh --force
#
set -euo pipefail
cd "$(dirname "$0")"

VENV=".venv"
if [ ! -d "$VENV" ]; then
  echo "First run: setting up the Python environment (this happens once)..."
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install --quiet --upgrade pip
  "$VENV/bin/pip" install --quiet -r requirements.txt
  "$VENV/bin/python" -m playwright install chromium
  echo "Setup complete."
fi

exec "$VENV/bin/python" export_submissions.py "$@"
