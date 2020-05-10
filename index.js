const db = require('./lib/db');

const DataRecording = require('./lib/recording/DataRecording');

db.init().then(async () => {
  //api and file services
  require('./lib/api/server');

  //Data recording
  await new DataRecording().startFetchingTadoData();
});
