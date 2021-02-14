const { InfluxDB, DEFAULT_WriteOptions } = require('@influxdata/influxdb-client');
const { Point } = require('@influxdata/influxdb-client');
const { logInfo, logError } = require('./logger');
const config = require('../config/config.json');
const db = require('./db');
let influxDbClient = null;

const { url, token, bucket, org } = config.storage.influxdb;

const flushBatchSize = DEFAULT_WriteOptions.batchSize;

if (config.storage.influxdb.enabled) {
  influxDbClient = new InfluxDB({
    url,
    token,
    requestTimeout: 2 * 60 * 1000,
  });
}

const writeOptions = {
  /* the maximum points/line to send in a single batch to InfluxDB server */
  batchSize: flushBatchSize + 1, // don't let automatically flush data
  /* maximum time in millis to keep points in an unflushed batch, 0 means don't periodically flush */
  flushInterval: 0,
  /* maximum size of the retry buffer - it contains items that could not be sent for the first time */
  maxBufferLines: 30_000,
  /* the count of retries, the delays between retries follow an exponential backoff strategy if there is no Retry-After HTTP header */
  maxRetries: 3,
  /* maximum delay between retries in milliseconds */
  maxRetryDelay: 15000,
  /* minimum delay between retries in milliseconds */
  minRetryDelay: 1000, // minimum delay between retries
  /* a random value of up to retryJitter is added when scheduling next retry */
  retryJitter: 1000,
};

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
  const writeApi = influxDbClient.getWriteApi(org, bucket, 'ms', writeOptions);

  let count = 0;
  for (const metric of Object.values(newData)) {
    for (const timestamp of Object.keys(metric.hours)) {
      const hourlyMetric = metric.hours[timestamp];
      const nanoSecondsTimestamp = parseInt(timestamp);

      const temperaturePoint = new Point('HeatSheet')
        .tag('room', metric.name)
        .tag('type', 'temperature')
        .floatField('temperature', hourlyMetric.temperature || 0)
        .timestamp(nanoSecondsTimestamp);

      const heatingPoint = new Point(metric.name)
        .tag('room', metric.name)
        .tag('type', 'heating')
        .intField('low', hourlyMetric.heating.low || 0)
        .intField('medium', hourlyMetric.heating.medium || 0)
        .intField('high', hourlyMetric.heating.high || 0)
        .timestamp(nanoSecondsTimestamp);

      const statesPoint = new Point(metric.name)
        .tag('room', metric.name)
        .tag('type', 'states')
        .intField('on', hourlyMetric.states.on || 0)
        .intField('off', hourlyMetric.states.off || 0)
        .intField('away', hourlyMetric.states.away || 0)
        .timestamp(nanoSecondsTimestamp);

      writeApi.writePoints([temperaturePoint, heatingPoint, statesPoint]);

      if ((count + 1) % flushBatchSize === 0) {
        logInfo(`Flushing Data to InfluxDB: Chunk #${(count + 1) / flushBatchSize}`);
        try {
          await writeApi.flush();
        } catch (e) {
          logError(e);
        }
      }
      count++;
    }
  }

  return writeApi.close();
};

exports.migrateToInfluxdb = writeToInfluxDb;
