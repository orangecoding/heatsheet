const db = require('./lib/db');
const { authentication } = require('./lib/auth');
const { Tado } = require('node-tado-client');
const DataRecording = require('./lib/recording/DataRecording');

const tado = new Tado();

db.init().then(async () => {
  //api and file services
  require('./lib/api/server');
  await authentication(tado);

  //Data recording
  await new DataRecording(tado).startFetchingTadoData();
});
