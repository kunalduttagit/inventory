#!/usr/bin/env bash
# Seeds the *deployed* (Render) database with the same Indian fixtures as
# scripts/seed.sh, but talks to the public API and uses an external psql
# connection for backdating timestamps.
#
# Run from the repo root:
#   ./scripts/seed-render.sh
#
# Env (override if you've rotated creds):
#   API     — public backend URL
#   PG_URL  — external Postgres connection string from Render

set -euo pipefail

API="${API:-https://api.inv.kunaldutta.com}"
PG_URL="${PG_URL:-postgresql://root:AmRVII6NYSfGRHJzVTFdvnbvGFRLuvPT@dpg-d8o7l4ugvqtc7381crm0-a.oregon-postgres.render.com/inventory_xm51}"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
muted() { printf '\033[2m%s\033[0m\n' "$*"; }

post() {
  local path="$1"; shift
  curl -sS -X POST "${API}${path}" -H 'Content-Type: application/json' -d "$1"
}

psql_exec() {
  docker compose exec -T db psql "${PG_URL}" -v ON_ERROR_STOP=1 -tA -c "$1" >/dev/null
}

backdate_order() {
  local id="$1"; local days="$2"
  psql_exec "UPDATE orders SET created_at = NOW() - INTERVAL '${days} days' - INTERVAL '$((RANDOM % 18)) hours' - INTERVAL '$((RANDOM % 60)) minutes' WHERE id = ${id};"
}

if ! curl -sSf "${API}/health" >/dev/null; then
  echo "Backend not reachable at ${API}." >&2
  exit 1
fi

bold "› Seeding customers"
post /customers '{"full_name":"Kunal Dutta","email":"kunal@kunaldutta.com","phone":"+91 98765 43210"}' >/dev/null
post /customers '{"full_name":"Aarav Sharma","email":"aarav.sharma@example.com","phone":"+91 99887 76655"}' >/dev/null
post /customers '{"full_name":"Priya Patel","email":"priya.patel@example.com","phone":"+91 91234 56789"}' >/dev/null
post /customers '{"full_name":"Rohan Mehta","email":"rohan.mehta@example.com","phone":"+91 90011 22334"}' >/dev/null
post /customers '{"full_name":"Ananya Iyer","email":"ananya.iyer@example.com","phone":"+91 98112 23344"}' >/dev/null
muted "  5 customers"

bold "› Seeding products"
post /products '{"name":"Mechanical Keyboard","sku":"KB-001","price":4999,"quantity":25,"description":"RGB backlit, brown switches"}' >/dev/null
post /products '{"name":"Wireless Mouse","sku":"MS-002","price":1299,"quantity":48,"description":"Ergonomic, 2.4GHz + Bluetooth"}' >/dev/null
post /products '{"name":"USB-C Hub 7-in-1","sku":"HUB-003","price":2499,"quantity":6,"description":"HDMI, USB-A, SD, microSD"}' >/dev/null
post /products '{"name":"27\" 4K Monitor","sku":"MON-004","price":24999,"quantity":11,"description":"IPS, 60Hz, HDR400"}' >/dev/null
post /products '{"name":"Standing Desk","sku":"DESK-005","price":18999,"quantity":7,"description":"Electric height adjust"}' >/dev/null
post /products '{"name":"Ergonomic Office Chair","sku":"CHR-006","price":12499,"quantity":14,"description":"Mesh back, lumbar support"}' >/dev/null
post /products '{"name":"HD Webcam","sku":"CAM-007","price":3499,"quantity":32,"description":"1080p, built-in mic"}' >/dev/null
post /products '{"name":"Noise-Cancelling Headphones","sku":"HP-008","price":6999,"quantity":20,"description":"Over-ear, 30hr battery"}' >/dev/null
post /products '{"name":"Notebook A5","sku":"NB-009","price":299,"quantity":180,"description":"Dotted, 200 pages"}' >/dev/null
post /products '{"name":"Gel Pen Set","sku":"PEN-010","price":499,"quantity":150,"description":"Pack of 10, blue ink"}' >/dev/null
post /products '{"name":"Desk Lamp","sku":"LMP-011","price":1899,"quantity":4,"description":"LED, adjustable color temp"}' >/dev/null
post /products '{"name":"Whiteboard 4x3","sku":"WB-012","price":3299,"quantity":9,"description":"Magnetic, with marker tray"}' >/dev/null
muted "  12 products"

bold "› Placing orders (uneven across the last 14 days)"
# Format: customer_id | items_json | days_ago
# Deliberately uneven distribution to make the dashboard chart interesting.
declare -a ORDERS=(
  "2|[{\"product_id\":1,\"quantity\":1},{\"product_id\":2,\"quantity\":1}]|13"
  "3|[{\"product_id\":7,\"quantity\":2}]|12"
  "1|[{\"product_id\":4,\"quantity\":1},{\"product_id\":6,\"quantity\":1}]|11"
  "4|[{\"product_id\":9,\"quantity\":4},{\"product_id\":10,\"quantity\":3}]|11"
  "5|[{\"product_id\":8,\"quantity\":1}]|10"
  "2|[{\"product_id\":1,\"quantity\":1},{\"product_id\":11,\"quantity\":1}]|9"
  "3|[{\"product_id\":2,\"quantity\":3},{\"product_id\":7,\"quantity\":1}]|8"
  "1|[{\"product_id\":4,\"quantity\":1}]|7"
  "4|[{\"product_id\":5,\"quantity\":1},{\"product_id\":12,\"quantity\":2}]|6"
  "5|[{\"product_id\":3,\"quantity\":1},{\"product_id\":9,\"quantity\":5}]|6"
  "1|[{\"product_id\":1,\"quantity\":2},{\"product_id\":2,\"quantity\":2},{\"product_id\":7,\"quantity\":1}]|5"
  "2|[{\"product_id\":10,\"quantity\":4}]|5"
  "3|[{\"product_id\":6,\"quantity\":1},{\"product_id\":8,\"quantity\":1}]|5"
  "5|[{\"product_id\":11,\"quantity\":1}]|4"
  "4|[{\"product_id\":4,\"quantity\":1},{\"product_id\":3,\"quantity\":1}]|3"
  "1|[{\"product_id\":2,\"quantity\":1},{\"product_id\":9,\"quantity\":6}]|3"
  "2|[{\"product_id\":7,\"quantity\":1},{\"product_id\":12,\"quantity\":1}]|3"
  "3|[{\"product_id\":1,\"quantity\":1},{\"product_id\":8,\"quantity\":1},{\"product_id\":10,\"quantity\":2}]|2"
  "5|[{\"product_id\":5,\"quantity\":1}]|2"
  "4|[{\"product_id\":2,\"quantity\":1}]|1"
  "1|[{\"product_id\":6,\"quantity\":1},{\"product_id\":4,\"quantity\":1}]|1"
  "2|[{\"product_id\":9,\"quantity\":3}]|0"
  "3|[{\"product_id\":7,\"quantity\":2},{\"product_id\":11,\"quantity\":1}]|0"
  "5|[{\"product_id\":1,\"quantity\":1}]|0"
)

count=0
for row in "${ORDERS[@]}"; do
  IFS='|' read -r cust items days <<< "${row}"
  body=$(printf '{"customer_id":%s,"items":%s}' "${cust}" "${items}")
  resp=$(post /orders "${body}")
  oid=$(printf '%s' "${resp}" | grep -oE '"id":[0-9]+' | head -1 | grep -oE '[0-9]+')
  if [[ -n "${oid}" && "${days}" -gt 0 ]]; then
    backdate_order "${oid}" "${days}"
  fi
  count=$((count + 1))
done
muted "  ${count} orders spread across the last 14 days"

bold "✓ Render seed complete"
muted "Visit https://inv.kunaldutta.com — Kunal Dutta is customer #1."
