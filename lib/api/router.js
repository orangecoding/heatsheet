const { isUnauthorized } = require('./security');
const db = require('../db');

/**
 * Rest api routes and endpoints for handlebars renderings
 * @param app express
 */
module.exports = function constructRoutes(app) {
  //Chart renderings
  app.get('/', function (req, res) {
    const props = {
      viewName: 'Charts',
    };
    res.render('chart', props);
  });

  //Table renderings
  app.get('/table', function (req, res) {
    const props = {
      viewName: 'Table Reports',
    };
    res.render('table', props);
  });

  app.get('/zones', async (req, res) => {
    if (isUnauthorized(req)) {
      return res.status(401).send();
    }
    res.send(await db.getZones());
  });

  //Years dropdown for tables
  app.get('/years', async (req, res) => {
    if (isUnauthorized(req)) {
      return res.status(401).send();
    }
    const years = await db.getAvailableYears();
    res.send(Array.from(years).sort());
  });

  app.get('/hourly/:zone/:start/:end', async (req, res) => {
    if (isUnauthorized(req)) {
      return res.status(401).send();
    }
    const { zone, start, end } = req.params;
    res.send(await db.getHourlyData(zone, start, end));
  });

  app.get('/daily/:zone/:start/:end', async (req, res) => {
    if (isUnauthorized(req)) {
      return res.status(401).send();
    }
    const { zone, start, end } = req.params;
    res.send(await db.getDailyData(zone, start, end));
  });

  app.get('/table/:year', async (req, res) => {
    if (isUnauthorized(req)) {
      return res.status(401).send();
    }
    const { year } = req.params;
    res.send(await db.getTableData(year));
  });

  app.get('/signOut', function (req, res) {
    //a little stupid, but HTTP Specs does not offer any other way to kill the current "session"
    res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
    return res.sendStatus(401);
  });
};
