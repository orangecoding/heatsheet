window.heatsheet = window.heatsheet || {};

/**
 * Rendering a chart with the given scales
 * @param temperature
 * @param lowHeating
 * @param mediumHeating
 * @param highHeating
 * @param away
 * @param off
 * @param on
 * @param id
 */
window.heatsheet.renderChart = function renderChart(
  temperature,
  lowHeating,
  mediumHeating,
  highHeating,
  away,
  off,
  on,
  id
) {
  Highcharts.chart(id, {
    chart: {
      zoomType: 'x',
    },
    title: {
      text: '',
    },
    time: {
      useUTC: false,
    },
    yAxis: [
      {
        labels: {
          format: '{value} min.',
          style: {
            color: Highcharts.getOptions().colors[0],
          },
        },
        title: {
          text: 'Heating times',
          style: {
            color: Highcharts.getOptions().colors[0],
          },
        },
        opposite: true,
      },
      {
        gridLineWidth: 0,
        title: {
          text: 'Temperature',
          style: {
            color: '#999999',
          },
        },
        labels: {
          format: '{value}°C',
          style: {
            color: '#999999',
          },
        },
      },
      {
        labels: {
          format: '{value} min.',
          style: {
            color: Highcharts.getOptions().colors[3],
          },
        },
      },
    ],
    xAxis: {
      type: 'datetime',
      crosshair: {
        snap: false,
      },
    },
    plotOptions: {
      column: {
        stacking: 'normal',
      },
    },
    tooltip: {
      shared: true,
    },
    series: [
      {
        name: 'Temperature',
        type: 'spline',
        data: temperature,
        yAxis: 1,
        color: '#cccccc',
        tooltip: {
          valueSuffix: ' °C',
        },
      },
      {
        name: 'High Heating',
        type: 'column',
        yAxis: 0,
        stack: 1,
        data: highHeating,
        tooltip: {
          valueSuffix: ' min.',
        },
        color: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, '#ff3737'], // start
            [1, '#db2828'], // end
          ],
        },
      },
      {
        name: 'Medium Heating',
        type: 'column',
        yAxis: 0,
        stack: 1,
        data: mediumHeating,
        tooltip: {
          valueSuffix: ' min.',
        },
        color: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, '#ff8c00'], // start
            [1, '#e07b01'], // end
          ],
        },
      },
      {
        name: 'Low Heating',
        type: 'column',
        yAxis: 0,
        stack: 1,
        data: lowHeating,
        tooltip: {
          valueSuffix: ' min.',
        },
        color: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, '#08b1e3'], // start
            [1, '#0794be'], // end
          ],
        },
      },
      {
        name: 'Away Mode',
        type: 'column',
        yAxis: 2,
        stack: 2,
        data: away,
        visible: false,
        tooltip: {
          valueSuffix: ' min.',
        },
        color: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, '#cccccc'], // start
            [1, '#aaaaaa'], // end
          ],
        },
      },
      {
        name: 'Heating off',
        type: 'column',
        yAxis: 2,
        stack: 2,
        data: off,
        visible: false,
        tooltip: {
          valueSuffix: ' min.',
        },
        color: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, '#666666'], // start
            [1, '#444444'], // end
          ],
        },
      },
      {
        name: 'Heating on',
        type: 'column',
        yAxis: 2,
        stack: 2,
        data: on,
        visible: false,
        tooltip: {
          valueSuffix: ' min.',
        },
        color: {
          linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
          stops: [
            [0, '#65de3f'], // start
            [1, '#51b232'], // end
          ],
        },
      },
    ],
  });
};
