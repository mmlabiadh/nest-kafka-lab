#!/usr/bin/env bash
set -euo pipefail

TOPIC="${TOPIC:-bookings.events}"

docker compose exec -T kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --describe \
  --topic "$TOPIC"
