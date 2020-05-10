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
window.heatsheet.renderChart = function renderChart(temperature, lowHeating, mediumHeating, highHeating, away, off, on, id) {
    Highcharts.chart(id, {
        chart: {
            zoomType: 'x'
        },
        title: {
            text: ''
        },
        time: {
            useUTC: false
        },
        yAxis: [
            {
                labels: {
                    format: '{value} min.',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                title: {
                    text: 'Heating times',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                opposite: true
            }, {
                gridLineWidth: 0,
                title: {
                    text: 'Temperature',
                    style: {
                        color: Highcharts.getOptions().colors[5]
                    }
                },
                labels: {
                    format: '{value}°C',
                    style: {
                        color: Highcharts.getOptions().colors[5]
                    }
                }

            },
            {
                labels: {
                    format: '{value} min.',
                    style: {
                        color: Highcharts.getOptions().colors[3]
                    }
                },
                title: {
                    text: 'Heating Modes',
                    style: {
                        color: Highcharts.getOptions().colors[3]
                    }
                },
                opposite: true
            }
        ],
        xAxis: {
            type: 'datetime',
            crosshair: {
                snap: false,
            },
        },
        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },
        tooltip: {
            shared: true
        },
        series: [{
            name: 'Temperature',
            type: 'spline',
            data: temperature,
            yAxis: 1,
            color: Highcharts.getOptions().colors[5],
            tooltip: {
                valueSuffix: ' °C'
            },
        }, {
            name: 'High Heating',
            type: 'column',
            yAxis: 0,
            stack: 1,
            data: highHeating,
            tooltip: {
                valueSuffix: ' min.'
            },
        }, {
            name: 'Medium Heating',
            type: 'column',
            yAxis: 0,
            stack: 1,
            data: mediumHeating,
            tooltip: {
                valueSuffix: ' min.'
            },
        }, {
            name: 'Low Heating',
            type: 'column',
            yAxis: 0,
            stack: 1,
            data: lowHeating,
            tooltip: {
                valueSuffix: ' min.'
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
                    valueSuffix: ' min.'
                },
            }, {
                name: 'Heating off',
                type: 'column',
                yAxis: 2,
                stack: 2,
                data: off,
                visible: false,
                tooltip: {
                    valueSuffix: ' min.'
                },
            }, {
                name: 'Heating on',
                type: 'column',
                yAxis: 2,
                stack: 2,
                data: on,
                visible: false,
                tooltip: {
                    valueSuffix: ' min.'
                },
            }
        ]
    });
};