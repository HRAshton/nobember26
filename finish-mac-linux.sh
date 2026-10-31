#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
PYTHON=${PYTHON:-python3}
"$PYTHON" -m venv .venv
.venv/bin/python -m pip install -r requirements-local.txt
.venv/bin/python tools/finish_local.py --strict --standalone
.venv/bin/python tools/create_contact_sheet.py
npm test
printf '\nDone. Run ./start-mac-linux.sh to play.\n'
