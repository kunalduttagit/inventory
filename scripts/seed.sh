#!/usr/bin/env bash
# Seeds the inventory database with Indian fixtures (customers, products, orders).
# Requires the stack to be running. Run from anywhere:
#   ./scripts/seed.sh
#
# Env:
#   API   — backend URL (default: http://localhost:8000)
#   DB    — db service name in docker-compose (default: db)

set -euo pipefail

API="${API:-http://localhost:8000}"
DB="${DB:-db}"

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
muted() { printf '\033[2m%s\033[0m\n' "$*"; }

post() {
  local path="$1"; shift
  curl -sS -X POST "${API}${path}" -H 'Content-Type: application/json' -d "$1"
}

require_api() {
  if ! curl -sSf "${API}/health" >/dev/null; then
    echo "Backend is not reachable at ${API}." >&2
    echo "Start the stack first: docker compose up -d" >&2
    exit 1
  fi
}

backdate_order() {
  # backdate_order <order_id> <days_ago>
  local id="$1"; local days="$2"
  docker compose exec -T "${DB}" \
    psql -U root -d inventory -v ON_ERROR_STOP=1 -tA \
    -c "UPDATE orders SET created_at = NOW() - INTERVAL '${days} days' - INTERVAL '$((RANDOM % 12)) hours' WHERE id = ${id};" \
    >/dev/null
}

require_api

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

bold "› Placing orders"
# Format: customer_id | items_json | days_ago
declare -a ORDERS=(
  "1|[{\"product_id\":1,\"quantity\":1},{\"product_id\":2,\"quantity\":2}]|6"
  "2|[{\"product_id\":4,\"quantity\":1},{\"product_id\":6,\"quantity\":1}]|6"
  "3|[{\"product_id\":9,\"quantity\":5},{\"product_id\":10,\"quantity\":3}]|5"
  "1|[{\"product_id\":3,\"quantity\":1},{\"product_id\":7,\"quantity\":1}]|4"
  "4|[{\"product_id\":1,\"quantity\":2}]|4"
  "5|[{\"product_id\":8,\"quantity\":1},{\"product_id\":2,\"quantity\":1}]|3"
  "2|[{\"product_id\":5,\"quantity\":1},{\"product_id\":11,\"quantity\":2}]|3"
  "3|[{\"product_id\":12,\"quantity\":1},{\"product_id\":9,\"quantity\":10}]|2"
  "1|[{\"product_id\":4,\"quantity\":1}]|2"
  "4|[{\"product_id\":6,\"quantity\":2},{\"product_id\":10,\"quantity\":5}]|1"
  "5|[{\"product_id\":7,\"quantity\":2},{\"product_id\":3,\"quantity\":1}]|1"
  "1|[{\"product_id\":8,\"quantity\":2},{\"product_id\":2,\"quantity\":1}]|0"
  "2|[{\"product_id\":1,\"quantity\":1}]|0"
  "3|[{\"product_id\":11,\"quantity\":1},{\"product_id\":9,\"quantity\":2}]|0"
)

count=0
for row in "${ORDERS[@]}"; do
  IFS='|' read -r cust items days <<< "${row}"
  body=$(printf '{"customer_id":%s,"items":%s}' "${cust}" "${items}")
  resp=$(post /orders "${body}")
  # The first "id":N in the response is the order's id (order JSON has nested ids for items/customer too).
  oid=$(printf '%s' "${resp}" | grep -oE '"id":[0-9]+' | head -1 | grep -oE '[0-9]+')
  if [[ -n "${oid}" && "${days}" -gt 0 ]]; then
    backdate_order "${oid}" "${days}"
  fi
  count=$((count + 1))
done
muted "  ${count} orders (timestamps spread across the last 7 days)"

bold "✓ Seed complete"
muted "Open http://localhost:3000 — Kunal Dutta is customer #1."
