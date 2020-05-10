const moment = require('moment');

/**
 * Midnight today
 * @returns {number}
 */
exports.beginOfToday = () => {
  return moment().startOf('day').utc().valueOf();
};

/**
 * Tado requires a date with a specific format
 * @param ts
 * @param withTime
 * @returns {string}
 */
exports.formatTimestamp = (ts, withTime = false) => {
  const formatter = `YYYY-MM-DD${withTime ? ' HH:mm:ss' : ''}`;
  return moment(ts).format(formatter);
};

/**
 * check if 2 dates overlaps
 * @param a_start
 * @param a_end
 * @param b_start
 * @param b_end
 * @returns {boolean}
 */
exports.dateRangeOverlaps = (a_start, a_end, b_start, b_end) => {
  if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
  if (a_start <= b_end && b_end <= a_end) return true; // b ends in a
  if (b_start < a_start && a_end < b_end) return true; // a in b
  return false;
};
