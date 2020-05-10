window.heatsheet = window.heatsheet || {};

window.heatsheet.fetchChartData = async function fetchChartData(start, end, granularity = 'daily') {
    const zones = await fetch('/zones');
    const zoneData = await zones.json();
    let rowCounter = 0;
    let colCounter = 0;

    $('#chartSection').empty();

    for (const key of Object.keys(zoneData)) {

        $('<div class="row" id=row_' + rowCounter + '></div>').appendTo('#chartSection');

        const metricsReq = await fetch(`/${granularity}/${key}/${start}/${end}`);
        const metrics = await metricsReq.json();

        const zoneName = zoneData[key];

        const temperature = [];

        const lowHeating = [];
        const mediumHeating = [];
        const highHeating = [];

        const away = [];
        const off = [];
        const on = [];


        Object.keys(metrics)
            .map(key => parseInt(key))
            .forEach(key => {
                temperature.push([key, metrics[key].temperature]);

                lowHeating.push([key, metrics[key].heating.low]);
                mediumHeating.push([key, metrics[key].heating.medium]);
                highHeating.push([key, metrics[key].heating.high]);

                away.push([key, metrics[key].states.away]);
                off.push([key, metrics[key].states.off]);
                on.push([key, metrics[key].states.on]);

            });

        $(chartContainerTemplate({label: zoneName, rowId: `col_${colCounter}`})).appendTo('#row_' + rowCounter);
        window.heatsheet.renderChart(temperature, lowHeating, mediumHeating, highHeating, away, off, on, `col_${colCounter}`);
        colCounter++;
        rowCounter++;
    }
};

const chartContainerTemplate = ({label, rowId}) => `
    <div class="col">
        <div class="card mb-4 box-shadow">
            <div class="card-header">
            <h4 class="my-0 font-weight-normal">${label}</h4>
            </div>
            <div class="card-body" id="${rowId}">
                <!--chart appears here -->
            </div>
        </div>
    </div>
`;
