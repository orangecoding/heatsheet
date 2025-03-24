#!/bin/sh

if [ ! -f "/app/config/config.json" ]; then
  # If there is no configuration file, create it with some default values
  echo "No configuration file"
  echo "Creating a new one"
  # Copy default configuration file
  cp /app/config-example/config.example.json /app/config/config.json
  # Substitute some parameters with jq
  jq '.tado.refreshToken = env.TADO_REFRESH_TOKEN' /app/config/config.json >"/app/config/config.json.tmp" && mv "/app/config/config.json.tmp" "/app/config/config.json"
  jq '.ui.user = env.WEB_USERNAME' /app/config/config.json >"/app/config/config.json.tmp" && mv "/app/config/config.json.tmp" "/app/config/config.json"
  jq '.ui.password = env.WEB_PASSWORD' /app/config/config.json >"/app/config/config.json.tmp" && mv "/app/config/config.json.tmp" "/app/config/config.json"
  jq '.storage.influxdb.token = env.INFLUXDB_TOKEN' /app/config/config.json >"/app/config/config.json.tmp" && mv "/app/config/config.json.tmp" "/app/config/config.json"
  jq '.storage.influxdb.org = env.INFLUXDB_ORG' /app/config/config.json >"/app/config/config.json.tmp" && mv "/app/config/config.json.tmp" "/app/config/config.json"
  jq '.storage.influxdb.bucket = env.INFLUXDB_BUCKET' /app/config/config.json >"/app/config/config.json.tmp" && mv "/app/config/config.json.tmp" "/app/config/config.json"
  jq '.storage.influxdb.enabled = env.INFLUXDB_ENABLED' /app/config/config.json >"/app/config/config.json.tmp" && mv "/app/config/config.json.tmp" "/app/config/config.json"
  jq '.storage.influxdb.url = env.INFLUXDB_URL' /app/config/config.json >"/app/config/config.json.tmp" && mv "/app/config/config.json.tmp" "/app/config/config.json"

else
  echo "Using existing config file"
fi

#in order to mount a bind volume in docker-compose we have to move the db-file in a subfolder; 2 files have to be changed
sed -i "s/const DB_PATH = 'db.json'/const DB_PATH = 'config\/db.json'/g" lib/db.js
sed -i "s/const dbData = require('.\/db.json')/const dbData = require('.\/config\/db.json')/g" influxMigration.js

echo "Starting heatsheet"

exec "$@"