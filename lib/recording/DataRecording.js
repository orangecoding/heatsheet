const { beginOfToday, formatTimestamp } = require('../timeUtils');
const MetricsFormatter = require('./MetricsFormatter');
const storageService = require('../storageService');
const { logInfo, logError } = require('../logger');
const config = require('../../config/config.json');
const Tado = require('node-tado-client');
const moment = require('moment');
const db = require('../db');

const user = config.tado.tadoUser;
const password = config.tado.tadoPassword;

const tado = new Tado();

module.exports = class DataRecording {
  constructor() {
    if (!config.storage.dataRecording) {
      logInfo('Data recording is disabled per config.');
    }
  }

  startFetchingTadoData = async () => {
    //only start the recording if the config allows us to do so
    if (config.storage.dataRecording) {
      //run it once immediately
      await this._run();
      setInterval(() => {
        this._run();
        //running this every 10 minutes. Basically this is a naive approach as we only collect data on a daily
        //basis, but since js does not provide a native cron support and importing a cron lib is too much overhead
        //this is ok Ib guess
      }, 10 * 60 * 1000);
      logInfo('Started recording scheduler');
    }
  };

  _run = async () => {
    tado.login(user, password).then(async () => {
      const me = await tado.getMe();
      const homeId = me.homes[0].id;

      //if an initial migration is needed, we're trying to get ALL data from Tado for each thermostat. This
      //will take a while. Unfortunately we don't have a possibility to check what the mindate is, so we can't estimate
      //how long this really takes. For my 8 thermostats (and ~2 years of data), it takes ~15 minutes.
      const isInitialMigrationNeeded = await db.isInitialMigrationNeeded();

      if (isInitialMigrationNeeded) {
        logInfo('Initial Migration is needed. Starting now. This might take a while, grab a cup of coffee...');
        await this._fetchData(homeId, null);
        logInfo('Initial Migration done :)');
      } else {
        const lastRecordingTimestamp = await db.getLastRecordingTimestamp();
        if (lastRecordingTimestamp < beginOfToday()) {
          await this._fetchData(homeId, lastRecordingTimestamp);
          logInfo(`Successfully stored data for ${formatTimestamp(lastRecordingTimestamp)}`);
        }
      }
    });
  };

  /**
   * This is where the magic happens. Here we start fetching data from Tado and store them into our database
   *
   * @param homeId Our homeId (unique for each home setup=
   * @param minDate Can be null if we want to initially fetch all data
   * @returns {Promise<*>}
   * @private
   */
  _fetchData = async (homeId, minDate) => {
    //as we're running this every 10 minutes and we only collect data for yesterday, we can skip everything from today
    if (minDate != null && beginOfToday >= minDate) {
      return;
    }

    logInfo(`Running recorder for home with id ${homeId} and minDate ${formatTimestamp(Date.now())}`);
    const data = {};

    //Tado clusters it's thermostats in zones. Each zone has a name, configured by the user (Living room etc)
    //BE AWARE! We're storing the data by zoneId. This means if you ever decides to change the name of the zone,
    //it is automatically being shown on the ui for the whole timeframe
    const zones = await tado.getZones(homeId);
    const heatingZones = zones.filter((zone) => zone.type === 'HEATING');

    for (let zone of heatingZones) {
      data[zone.id] = data[zone.id] || {
        name: zone.name,
        days: {},
        hours: {},
      };

      let dataAvailable = true;
      let dateCounter = 0;

      //the only approach we can do here is trying to get data for each zone unless we're getting an Exception with
      //http status 404 (not found) which indicates we've reached the earliest timeframe were data is available
      //for this thermostat
      while (dataAvailable) {
        const date = moment().startOf('day').subtract(dateCounter, 'days').utc();

        const tadoDate = date.format('YYYY-MM-DD');
        const beginOfDay = moment(tadoDate).utc().valueOf();

        if (minDate != null && beginOfDay < minDate) {
          dataAvailable = false;
          continue;
        }

        try {
          const metrics = await tado.getZoneDayReport(homeId, zone.id, tadoDate);
          const transformedData = new MetricsFormatter(
            beginOfDay,
            metrics.callForHeat.dataIntervals,
            metrics.measuredData.insideTemperature.dataPoints,
            metrics.stripes.dataIntervals
          ).format();

          data[zone.id].hours = {
            ...data[zone.id].hours,
            ...transformedData.hour,
          };
          data[zone.id].days = {
            ...data[zone.id].days,
            ...transformedData.day,
          };
          logInfo('Processed ' + tadoDate + ' from zone ' + zone.name);
          dateCounter++;
        } catch (e) {
          if (!e.response) {
            console.error(e);
            return;
          }
          if (e.response.status === 404) {
            dataAvailable = false;
            logInfo('Import done for zone ' + zone.name);
          } else {
            logError(e);
          }
        }
      }
    }
    logInfo('Everything processed, starting to store data');
    //finally upserting data
    return storageService.upsertData(data);
  };
};
