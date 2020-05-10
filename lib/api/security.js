const config = require('../../config/config.json');
const basicAuth = require('basic-auth');

/**
 * superFancySuperAwesome security.. using basic auth should be sufficient here as we're not dealing with
 * hyper security stuff here. #yolo
 * @returns {function(...[*]=)}
 */
exports.getAuthInterceptor = () => {
  return (req, res, next) => {
    function unauthorized(res) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
    }

    const user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
      return unauthorized(res);
    }

    if (user.name === config.ui.user && user.pass === config.ui.password) {
      req.authenticated = true;
      return next();
    } else {
      return unauthorized(res);
    }
  };
};

/**
 * if login is needed, check if user is already logged in
 * @param req
 * @returns {boolean}
 */
exports.isUnauthorized = (req) => {
  if (!config.ui.loginNeeded) {
    return false;
  }
  if (req.authenticated == null) {
    return true;
  }
  return !req.authenticated;
};
