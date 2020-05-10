$(()=>{
    //initially collect the last week
    const initialStart = moment()
        .startOf('day')
        .subtract(6, 'days');

    const initialEnd = moment()
        .endOf('day');

    window.heatsheet.fetchChartData(initialStart.valueOf(), initialEnd.valueOf());
});