#!/usr/bin/env bash
# Alim Study Dashboard — one-command local launcher (macOS/Linux)
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js is not installed. Get it from https://nodejs.org"
  exit 1
fi

if [ ! -f .env ]; then
  echo "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/alim_study" > .env
  echo "Created .env — edit it if your local PostgreSQL credentials differ."
fi

[ -d node_modules ] || npm install
npx drizzle-kit push
[ -d .next ] || npm run build

( sleep 2; (command -v open >/dev/null && open http://localhost:3000) || (command -v xdg-open >/dev/null && xdg-open http://localhost:3000) || true ) &
npm run start
