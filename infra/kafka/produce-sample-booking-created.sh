#!/usr/bin/env bash
set -euo pipefail

BOOKING_ID="${1:-booking_demo_001}"

cat <<EOF | docker compose exec -T kafka /opt/kafka/bin/kafka-console-producer.sh \
  --bootstrap-server localhost:9092 \
  --topic bookings.events \
  --property parse.key=true \
  --property key.separator=":"
${BOOKING_ID}:{"eventId":"evt_001","type":"BookingCreated","bookingId":"${BOOKING_ID}"}
${BOOKING_ID}:{"eventId":"evt_002","type":"BookingCreated","bookingId":"${BOOKING_ID}"}
other_booking_999:{"eventId":"evt_003","type":"BookingCreated","bookingId":"other_booking_999"}
EOF
