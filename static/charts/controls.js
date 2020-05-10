window.heatsheet = window.heatsheet || {};
const beginOfDay = () => {
    return moment()
        .startOf('day');
};

const endOfDay = () => {
    return moment()
        .endOf('day');
};

const format = (moment) => {
    return moment.format('MM/DD/YYYY');
};

let timestampStart = moment()
    .startOf('day')
    .subtract(6, 'days');
let timestampEnd = endOfDay();
let granularity = 'daily';

$(() => {

    //date picker
    $('#datepicker').daterangepicker(
        {
            showDropdowns: true,
            showWeekNumbers: true,
            alwaysShowCalendars: true,
            startDate: format(timestampStart),
            endDate: format(timestampEnd),
            ranges: {
                Today: [beginOfDay(), endOfDay()],
                Yesterday: [beginOfDay().subtract(1, 'days'), endOfDay().subtract(1, 'days')],
                'Last 7 Days': [beginOfDay().subtract(6, 'days'), endOfDay()],
                'Last 30 Days': [beginOfDay().subtract(29, 'days'), endOfDay()],
                'This Month': [beginOfDay().startOf('month'), endOfDay().endOf('month')],
                'Last Month': [beginOfDay().subtract(1, 'month').startOf('month'), endOfDay().subtract(1, 'month').endOf('month')],
                'This Year': [beginOfDay().startOf('year'), endOfDay().endOf('year')],
                'Last Year': [beginOfDay().subtract(1, 'year').startOf('year'), endOfDay().subtract(1, 'year').endOf('year')],
            },
        },
        async (start, end) => {
            timestampStart = start;
            timestampEnd = end;
            await window.heatsheet.fetchChartData(start.valueOf(), end.valueOf(), granularity);
        }
    );


    //help button
    $('#help').on('click', ()=> {
        $('#explanation').toggleClass('show');
    });

    //granularity
    $('#granularity').change(async (e)=> {
        granularity = e.target.value;
        await window.heatsheet.fetchChartData(timestampStart.valueOf(), timestampEnd.valueOf(), granularity);
    });

});


