const MetricsFormatter = require('../lib/recording/MetricsFormatter');
const testData = require('./testData.json');
const expect = require('chai').expect;

const beginOfDay = 1588543200000;

describe('#metricsFormatter testsuite()', () => {
  it('should format days correctly', () => {
    const formattedData = new MetricsFormatter(
      //begin if date at which I took the fake data probe
      beginOfDay,
      testData.callForHeat.dataIntervals,
      testData.measuredData.insideTemperature.dataPoints,
      testData.stripes.dataIntervals
    ).format();

    expect(formattedData.day).to.be.a('object');

    const { day } = formattedData;

    expect(day).to.have.property(beginOfDay);
    expect(day[beginOfDay].temperature).to.equal(21.33);

    expect(day[beginOfDay].heating.low).to.equal(0);
    expect(day[beginOfDay].heating.medium).to.equal(0);
    expect(day[beginOfDay].heating.high).to.equal(0);

    expect(day[beginOfDay].states.on).to.equal(0);
    expect(day[beginOfDay].states.off).to.equal(1440);
    expect(day[beginOfDay].states.away).to.equal(0);
  });

  it('should format hours correctly', () => {
    const formattedData = new MetricsFormatter(
      //begin if date at which I took the fake data probe
      beginOfDay,
      testData.callForHeat.dataIntervals,
      testData.measuredData.insideTemperature.dataPoints,
      testData.stripes.dataIntervals
    ).format();

    expect(formattedData.hour).to.be.a('object');

    const { hour } = formattedData;

    expect(Object.keys(hour).length).to.equal(24);

    for (let i = 0; i < 24; i++) {
      const index = beginOfDay + i * 60 * 60 * 1000 + '';
      expect(Object.keys(hour).indexOf(index)).to.not.equal(-1);
      expect(hour[index].states.off).to.equal(60);
    }
  });

  it('should format correctly when replacing a value', () => {
    const newStripes = testData.stripes.dataIntervals.slice(0);
    newStripes[0].to = '2020-05-04T10:15:00.000Z';
    newStripes.push({
      from: '2020-05-04T10:15:00.000Z',
      to: '2020-05-04T11:15:00.000Z',
      value: {
        stripeType: 'AWAY',
        setting: { type: 'HEATING', power: 'OFF' },
      },
    });
    newStripes.push({
      from: '2020-05-04T11:15:00.000Z',
      to: '2020-05-04T22:15:00.000Z',
      value: {
        stripeType: 'HOME',
        setting: { type: 'HEATING', power: 'ON' },
      },
    });

    const formattedData = new MetricsFormatter(
      //begin if date at which I took the fake data probe
      beginOfDay,
      testData.callForHeat.dataIntervals,
      testData.measuredData.insideTemperature.dataPoints,
      newStripes
    ).format();

    expect(formattedData.hour).to.be.a('object');
    expect(formattedData.day).to.be.a('object');

    const { day, hour } = formattedData;

    expect(day[beginOfDay].states.on).to.equal(645);
    expect(day[beginOfDay].states.off).to.equal(735);
    expect(day[beginOfDay].states.away).to.equal(60);

    expect(hour[new Date('2020-05-04T10:00:00.000Z').getTime()].states.away).to.equal(45);
    expect(hour[new Date('2020-05-04T11:00:00.000Z').getTime()].states.away).to.equal(15);
  });
});
