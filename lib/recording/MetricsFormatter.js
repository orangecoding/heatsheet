const moment = require('moment');
const { dateRangeOverlaps } = require('../timeUtils');

/**
 * raw data incoming from Tado will be formatted into daily/hourly rollups.
 *
 * Output format contains daily/hourly buckets of temperature, heating states and amount of heating "power"
 * @type {MetricsFormatter}
 */
module.exports = class MetricsFormatter {
  /**
   *
   * @param beginOfDay timestamp of midnight, today
   * @param callForHeat containing infos if the thermostat was on heating mode. if so, it provides values (low, medium, high)
   * @param temperatureValues containing all measured temperatures per thermostat, which will be crunched down to an avg value.
   * @param setupStates provides infos about the actual state of your setup (away, home, off etc)
   */
  constructor(beginOfDay, callForHeat, temperatureValues, setupStates) {
    this.beginOfDay = beginOfDay;
    this.endOfDay = this.beginOfDay + 24 * 60 * 60 * 1000;

    this.callForHeat = callForHeat;
    this.temperature = temperatureValues;
    this.states = setupStates;
  }

  /**
   * the final result
   * @returns {{hour: {
   *     same as for day, just in hourly granularity
   * }, day: {
   *     timestamp: {
   *         temperature: xx(avg value for the day),
   *         heating: {
   *             low: xx(minutes),
   *             medium: xx(minutes),
   *             high: xx(minutes)
   *         },
   *         states: {
   *             on: xx(minutes),
   *             off: xx(minutes),
   *             away: xx(minutes)
   *         }
   *     }
   * }}}
   */
  format = () => {
    return {
      day: this._getDayCalculation(),
      hour: this._getHourCalculation(),
    };
  };

  /**
   * creating daily bucket
   * @returns {{}}
   * @private
   */
  _getDayCalculation = () => {
    const callForHeatData = this._overlappingFilter(this.callForHeat, this.beginOfDay, this.endOfDay)
      //we are not interested if the thermostat did nothing
      .filter((heat) => heat.value.toLowerCase() !== 'none');

    const temperatureData = this._filterForTemperature(this.temperature, this.beginOfDay, this.endOfDay);
    const stateData = this._overlappingFilter(this.states, this.beginOfDay, this.endOfDay);

    return {
      [this.beginOfDay]: {
        heating: this._getHeatingObj(callForHeatData, this.beginOfDay, this.endOfDay),
        temperature: this._getAvgTemperature(temperatureData, 'value.celsius'),
        states: this._getStates(stateData, this.beginOfDay, this.endOfDay),
      },
    };
  };

  /**
   * creating hourly bucket
   * @returns {{}}
   * @private
   */
  _getHourCalculation = () => {
    let data = {};
    const oneHour = 60 * 60 * 1000;

    for (let i = 0; i < 24; i++) {
      const beginOfHour = this.beginOfDay + i * oneHour;
      const endOfHour = this.beginOfDay + i * oneHour + oneHour;

      const callForHeatData = this._overlappingFilter(this.callForHeat, beginOfHour, endOfHour).filter(
        (heat) => heat.value.toLowerCase() !== 'none'
      );

      const temperatureData = this._filterForTemperature(this.temperature, beginOfHour, endOfHour);
      const stateData = this._overlappingFilter(this.states, beginOfHour, endOfHour);

      data[beginOfHour] = {
        heating: this._getHeatingObj(callForHeatData, beginOfHour, endOfHour),
        temperature: this._getAvgTemperature(temperatureData, 'value.celsius'),
        states: this._getStates(stateData, beginOfHour, endOfHour),
      };
    }
    return data;
  };

  /**
   * If a thermostat was on heating mode, Tado provides values like high, medium low, which gives a hint on how much heat
   * was produced. We store for each state the amount of minutes, this thermostat was in this state.
   * @param callForHeatData
   * @param begin timeframe in which to look at
   * @param end
   * @returns {{high: number, low: number, medium: number}}
   * @private
   */
  _getHeatingObj = (callForHeatData, begin, end) => {
    const result = {
      low: 0,
      medium: 0,
      high: 0,
    };

    callForHeatData.forEach((data) => {
      const from = new Date(data.from).getTime();
      const to = new Date(data.to).getTime();

      const startTs = from < begin ? begin : from;
      const endTs = to > end ? end : to;
      //as the data object contains intervals of states, we need to get the duration (in minutes) for each state
      result[data.value.toLowerCase()] += Math.round(
        moment.duration(moment(endTs).utc().diff(moment(startTs).utc())).asMinutes()
      );
    });
    return result;
  };

  /**
   * Same principle as for heating mode, just this time it contains the states
   * @param stateData
   * @param begin
   * @param end
   * @returns {{away: number, off: number, on: number}}
   * @private
   */
  _getStates = (stateData, begin, end) => {
    const states = {
      on: 0,
      off: 0,
      away: 0,
    };

    stateData.forEach((data) => {
      const startTs = new Date(data.from).getTime() < begin ? begin : new Date(data.from).getTime();
      const endTs = new Date(data.to).getTime() > end ? end : new Date(data.to).getTime();
      const minutes = Math.round(moment.duration(moment(endTs).utc().diff(moment(startTs).utc())).asMinutes());
      if (data.value.stripeType === 'HOME') {
        states[data.value.setting.power.toLowerCase()] += minutes;
      } else {
        states['away'] += minutes;
      }
    });
    return states;
  };

  /**
   * as we have rollups, storing the temperature in average for timeframe.
   * @param temperatureData
   * @param key
   * @returns {null|number}
   * @private
   */
  _getAvgTemperature = (temperatureData, key) => {
    if (temperatureData.length === 0) {
      return null;
    }

    let val = temperatureData
      .map((data) => this._get(data, key))
      .filter((val) => val != null)
      .reduce((accumulator, currentValue) => accumulator + currentValue, null);

    if (isNaN(val) || val == null) {
      return null;
    }

    return Math.round((val / temperatureData.length + Number.EPSILON) * 100) / 100;
  };

  /**
   * We're only interested in those data, falling into our current timefram
   * @param temperatureData
   * @param start
   * @param end
   * @returns {*}
   * @private
   */
  _filterForTemperature = (temperatureData, start, end) => {
    return temperatureData.slice(0).filter((data) => {
      const ts = new Date(data.timestamp).getTime();
      return ts >= start && ts <= end;
    });
  };

  _overlappingFilter = (heatingData, begin, end) => {
    return heatingData.slice(0).filter((data) => {
      const beginTimeWindow = new Date(data.from).getTime();
      const endTimeWindow = new Date(data.to).getTime();
      //we need to know all phases, especially in hourly granularity
      return dateRangeOverlaps(begin, end, beginTimeWindow, endTimeWindow);
    });
  };

  /**
   * A VERY naive implementation of lodash's _get function, but just for this single method, importing a whole lib
   * doesn't rly make sense, does it? ;)
   * @param obj
   * @param path
   * @param defaultValue
   * @returns {*}
   * @private
   */
  _get = (obj, path, defaultValue = undefined) => {
    const travel = (regexp) =>
      String.prototype.split
        .call(path, regexp)
        .filter(Boolean)
        .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj);
    const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
    return result === undefined || result === obj ? defaultValue : result;
  };
};
