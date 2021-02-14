const storageService = require('./lib/storageService');
const config = require('./config/config.json');
const dbData = require('./db.json');
const { logInfo, logError } = require('./lib/logger');

if (!config.storage.influxdb.enabled) {
  logError('Influx connection not enabled.');
  return;
}

if (dbData == null) {
  logError('No db.json found.');
  return;
}

storageService
  .migrateToInfluxdb(dbData.data)
  .then(() => {
    logInfo('Migration successful');
  })
  .catch((Exception) => {
    logError('Migration not successful');
    logError(Exception.message);
    logError(Exception.stack);
  });
