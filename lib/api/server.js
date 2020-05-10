const { getAuthInterceptor } = require('./security');
const config = require('../../config/config.json');
const authInterceptor = getAuthInterceptor();
const constructRoutes = require('./router');
const bodyParser = require('body-parser');
const handlebars = require('express-hbs');
const { logInfo } = require('../logger');
const express = require('express');
const path = require('path');
const app = express();

const PORT = config.ui.apiPort || '9988';

app.use(bodyParser.json());
//handlebars
app.set('view engine', 'hbs');
app.engine(
  'hbs',
  handlebars.express4({
    partialsDir: __dirname + '/../../views/partials',
  })
);

//if desired, enable security
if (config.ui.loginNeeded) {
  app.use('/', authInterceptor);
}

//serve assets statically
app.use(express.static(path.join(__dirname, '../../static')));

//rest api routes
constructRoutes(app);

app.listen(PORT, () => {
  logInfo(`Started API service on port ${PORT}`);
});
