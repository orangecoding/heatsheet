const { InfluxDB } = require('@influxdata/influxdb-client');
const { Point } = require('@influxdata/influxdb-client');
const config = require('../config/config.json');
const db = require('./db');
let influxDbClient = null;

const { url, token, bucket, org } = config.storage.influxdb;

if (config.storage.influxdb.enabled) {
  influxDbClient = new InfluxDB({ url, token });
}

exports.upsertData = async (newData) => {
  const { enabled: influxDbStorageEnabled } = config.storage.influxdb;
  const promises = [];
  //always store data locally for now
  promises.push(db.upsertData(newData));

  if (influxDbStorageEnabled) {
    promises.push(writeToInfluxDb(newData));
  }

  return Promise.all(promises);
};

const writeToInfluxDb = async (newData) => {
  const writeApi = influxDbClient.getWriteApi(org, bucket);

  Object.values(newData).forEach((metric) => {
    Object.keys(metric.hours).forEach((timestamp) => {
      const hourlyMetric = metric.hours[timestamp];
      const nanoSecondsTimestamp = parseInt(timestamp) * 1000000;

      const temperaturePoint = new Point('HeatSheet')
        .tag('room', metric.name)
        .tag('type', 'temperature')
        .floatField('temperature', hourlyMetric.temperature)
        .timestamp(nanoSecondsTimestamp);

      const heatingPoint = new Point(metric.name)
        .tag('room', metric.name)
        .tag('type', 'heating')
        .intField('low', hourlyMetric.heating.low)
        .intField('medium', hourlyMetric.heating.medium)
        .intField('high', hourlyMetric.heating.high)
        .timestamp(nanoSecondsTimestamp);

      const statesPoint = new Point(metric.name)
        .tag('room', metric.name)
        .tag('type', 'states')
        .intField('on', hourlyMetric.states.on)
        .intField('off', hourlyMetric.states.off)
        .intField('away', hourlyMetric.states.away)
        .timestamp(nanoSecondsTimestamp);

      writeApi.writePoint(temperaturePoint);
      writeApi.writePoint(heatingPoint);
      writeApi.writePoint(statesPoint);
    });
  });

  return writeApi.close();
};
