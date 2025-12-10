#!/usr/bin/env bash
set -euo pipefail

TOPIC="${TOPIC:-bookings.events}"

docker compose exec kafka /opt/kafka/bin/kafka-console-producer.sh \
  --bootstrap-server localhost:9092 \
  --topic "$TOPIC" \
  --property parse.key=true \
  --property key.separator=":"
