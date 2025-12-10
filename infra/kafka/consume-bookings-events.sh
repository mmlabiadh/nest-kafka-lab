#!/usr/bin/env bash
set -euo pipefail

TOPIC="${TOPIC:-bookings.events}"
GROUP_ID="${GROUP_ID:-bookings-lab}"

docker compose exec kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic "$TOPIC" \
  --group "$GROUP_ID" \
  --from-beginning \
  --property print.key=true \
  --property print.partition=true \
  --property print.offset=true \
  --property key.separator=" | "