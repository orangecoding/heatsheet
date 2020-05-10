const DB_PATH = 'db.json';

const FileAsync = require('lowdb/adapters/FileAsync');
const { beginOfToday } = require('./timeUtils');
const adapter = new FileAsync(DB_PATH);
const { logInfo } = require('./logger');
const moment = require('moment');
const low = require('lowdb');
const lowdb = low(adapter);

let db = null;

/**
 * Currently, we're using lowDB which essentially is a json file with a neat abstraction layer. I've tried it with 5 years
 * of data and 10 thermostats and it still works well. However this abstraction layer should make it easy to connect
 * any other db like mongo or something. For now, having a file based db is just a simply and working way to have a
 * persistence layer
 */

/**
 * Initially loading the datanbase
 * @returns {Promise<unknown>}
 */
exports.init = () => {
  return new Promise((resolve) => {
    //warmup
    lowdb.then((database) => {
      db = database;

      //set a default scheme if db is empty
      db.defaults({
        data: {},
        lastMigration: null,
      }).write();

      logInfo('Warming up database successful');
      resolve();
    });
  });
};

exports.isInitialMigrationNeeded = async () => {
  const lastMigration = await db.get('lastMigration');
  return lastMigration.value() == null;
};

exports.getLastRecordingTimestamp = async () => {
  const lastMigration = await db.get('lastMigration');
  return lastMigration.value();
};

const getZones = async () => {
  const data = await db.get('data').value();
  const zones = {};
  Object.keys(data).forEach((key) => {
    zones[key] = data[key].name;
  });
  return zones;
};

//as getZones is being used locally in here, export it later
exports.getZones = getZones;

exports.getHourlyData = async (zone, startTimestamp, endTimestamp) => {
  const data = await db.get(`data.${zone}.hours`).value();

  return filterMetricsForTimeframe(data, startTimestamp, endTimestamp);
};

exports.getDailyData = async (zone, startTimestamp, endTimestamp) => {
  const data = await db.get(`data.${zone}.days`).value();
  return filterMetricsForTimeframe(data, startTimestamp, endTimestamp);
};

exports.getAvailableYears = async () => {
  const data = await db.get(`data`).value();
  let years = new Set();
  Object.values(data).forEach((val) => {
    Object.keys(val.days).forEach((key) => years.add(new Date(parseInt(key)).getFullYear()));
  });
  return years;
};

/**
 * not sure if this logic should be in here tho, but this method reformats the data for the desired year
 * to be able to show it on the table
 * @param year
 * @returns {Promise<{data: {}, header: []}>}
 */
exports.getTableData = async (year) => {
  const dbData = await db.get(`data`).value();
  const result = {
    header: [],
    data: {},
  };

  const zones = await getZones();
  result.header = Object.values(zones);

  Object.values(dbData).forEach((val) => {
    const { name } = val;
    for (let i = 1; i < 13; i++) {
      const start = moment(`${year}-${i}`, 'YYYY-M');
      const end = start.clone().endOf('month');

      if (start > Date.now()) {
        continue;
      }

      const startTs = start.valueOf();
      result.data[startTs] = result.data[startTs] || {};
      result.data[startTs][name] = result.data[startTs][name] || {
        low: 0,
        medium: 0,
        high: 0,
      };

      Object.keys(val.days)
        .map((ts) => parseInt(ts))
        .filter((ts) => ts >= start.valueOf() && ts <= end.valueOf())
        .forEach((ts) => {
          const data = val.days[ts];
          result.data[startTs][name].low += data.heating.low || 0;
          result.data[startTs][name].medium += data.heating.medium || 0;
          result.data[startTs][name].high += data.heating.high || 0;
        });
    }
  });
  return result;
};

exports.upsertData = async (newData) => {
  return db
    .update('data', (oldData) => {
      return mergeNewData(oldData, newData);
    })
    .set('lastMigration', beginOfToday())
    .write();
};

/**
 * depending on what timeframe the ui requests, we need to filter the data.
 * @param data
 * @param startTimestamp
 * @param endTimestamp
 * @returns {{}}
 */
function filterMetricsForTimeframe(data, startTimestamp, endTimestamp) {
  const transformed = {};
  Object.keys(data)
    .map((key) => parseInt(key))
    .filter((key) => {
      return key >= startTimestamp && key <= endTimestamp;
    })
    .sort()
    .forEach((key) => {
      transformed[key] = data[key];
    });

  return transformed;
}

function mergeNewData(oldData, newData) {
  const data = { ...oldData };
  Object.keys(newData).forEach((key) => {
    if (data[key] == null) {
      data[key] = newData[key];
    } else {
      data[key].days = {
        ...data[key].days,
        ...newData[key].days,
      };
      data[key].hours = {
        ...data[key].hours,
        ...newData[key].hours,
      };
    }
  });
  return data;
}
