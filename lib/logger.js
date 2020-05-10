const { formatTimestamp } = require('./timeUtils');
const chalk = require('chalk');

/**
 * When log out stuff, having a date in front always makes sense :D
 */

exports.logInfo = (message) => {
  /* eslint-disable no-console */
  console.info(chalk.green(`${formatTimestamp(Date.now(), true)} ${message}`));
  /* eslint-enable no-console */
};

exports.logWarn = (message) => {
  console.warn(chalk.yellow(`${formatTimestamp(Date.now(), true)} ${message}`));
};

exports.logError = (message) => {
  console.error(chalk.red(`${formatTimestamp(Date.now(), true)} ${message}`));
};
