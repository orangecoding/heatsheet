/**
 * For this integration test, we're expecting a fully functional config file with tado user and password
 * further this test assumes that zones are available
 *
 * This test is mainly to check if Tado ever change something on their internal api's which we're leveraging to get the data.
 *
 */

const config = require('../config/config.json');
const Tado = require('node-tado-client');
const tado = new Tado();
const expect = require('chai').expect;
const { formatTimestamp } = require('../lib/timeUtils');

describe('#integration testsuite()', () => {
  it('should collect home id', async () => {
    const homeId = await getHomeId();
    expect(homeId).to.be.a('number');
  });

  it('should collect zones', async () => {
    const homeId = await getHomeId();
    const zones = await tado.getZones(homeId);
    expect(zones).to.be.a('array');
    const heatingZones = zones.filter((zone) => zone.type === 'HEATING');
    expect(heatingZones).to.have.length.above(0);
    expect(heatingZones[0].name).to.be.a('string');
    expect(heatingZones[0].id).to.be.a('number');
  });

  it('should collect data', async () => {
    const homeId = await getHomeId();
    const zones = await tado.getZones(homeId);
    const zoneId = zones[0].id;
    const tadoDate = formatTimestamp(Date.now());
    const data = await tado.getZoneDayReport(homeId, zoneId, tadoDate);

    expect(data.zoneType).to.equal('HEATING');
    expect(data.measuredData).to.be.a('object');
    expect(data.stripes).to.be.a('object');
    expect(data.callForHeat).to.be.a('object');

    const { dataIntervals: callForHeatDataIntervals } = data.callForHeat;
    const { dataPoints: temperatureDatapoints } = data.measuredData.insideTemperature;
    const { dataIntervals: stripeDataIntervals } = data.stripes;

    expect(callForHeatDataIntervals).to.be.a('array');
    expect(temperatureDatapoints).to.be.a('array');
    expect(stripeDataIntervals).to.be.a('array');

    expect(callForHeatDataIntervals).to.have.length.above(0);
    expect(temperatureDatapoints).to.have.length.above(0);
    expect(stripeDataIntervals).to.have.length.above(0);

    expect(callForHeatDataIntervals[0].from).to.be.a('string');
    expect(callForHeatDataIntervals[0].to).to.be.a('string');
    expect(callForHeatDataIntervals[0].value).to.be.a('string');

    expect(temperatureDatapoints[0].timestamp).to.be.a('string');
    expect(temperatureDatapoints[0].value).to.be.a('object');
    expect(temperatureDatapoints[0].value.celsius).to.be.a('number');

    const homeInterval = stripeDataIntervals.find((interval) => interval.value.stripeType === 'HOME');

    expect(homeInterval.from).to.be.a('string');
    expect(homeInterval.to).to.be.a('string');
    expect(homeInterval.value).to.be.a('object');
    expect(homeInterval.value.stripeType).to.be.a('string');
    expect(homeInterval.value.setting).to.be.a('object');
    expect(homeInterval.value.setting).to.be.a('object');
    expect(homeInterval.value.setting.type).to.be.a('string');
    expect(homeInterval.value.setting.power).to.be.a('string');
  });
});

async function getHomeId() {
  await tado.login(config.tado.tadoUser, config.tado.tadoPassword);
  const me = await tado.getMe();
  return me.homes[0].id;
}
