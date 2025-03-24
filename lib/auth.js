const config = require('../config/config.json');
const fs = require('fs');
const path = require('path');
const configPath = path.join(__dirname, '../config/config.json');

/* eslint-disable no-console */
exports.authentication = async (tado) => {
  tado.setTokenCallback(console.log);
  const refreshToken = config.tado.refreshToken || null;
  const [verify, futureToken] = await tado.authenticate(refreshToken);
  if (verify) {
    console.log('------------------------------------------------');
    console.log('Tado authentication required.');
    console.log('Please visit the following website in a browser.');
    console.log('');
    console.log(`${verify.verification_uri_complete}`);
    console.log('');
    console.log(`Checks will occur every ${verify.interval}s up to a maximum of ${verify.expires_in}s`);
    console.log('------------------------------------------------');
  }
  const token = await futureToken;
  const newRefreshToken = token.refresh_token;
  if (newRefreshToken !== refreshToken) {
    console.log('Replacing refresh token in config');
    config.tado.refreshToken = newRefreshToken;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  }
};
/* eslint-enable no-console */
