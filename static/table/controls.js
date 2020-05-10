$(() => {
    $('#years').change(e => {
        fetch(`/table/${e.target.value}`).then(async dataReq => {
            const data = await dataReq.json();
            fillTableData(data);
        });
    });

    //help button
    $('#help').on('click', ()=> {
        $('#explanation').toggleClass('show');
    });
});

function fillTableData(serverData) {
    $('thead').empty();
    $('tbody').empty();

    //table head
    const tableHeadTr = $('<tr>');
    $(tableHead({name: 'Month'})).appendTo(tableHeadTr);
    serverData.header.forEach(name => {
        $(tableHead({name})).appendTo(tableHeadTr);
    });
    tableHeadTr.appendTo('thead');

    //body
    Object.keys(serverData.data)
        .map(ts => parseInt(ts))
        .forEach(ts => {
            const tableBodyTr = $('<tr>');
            //month
            $(tableColumn({name: moment(ts).format('MMMM')})).appendTo(tableBodyTr);
            serverData.header.forEach(name => {
                const data = serverData.data[ts][name];
                $(tableValue({
                    ...data,
                    hasValues: (data.high != null && data.high > 0) ||
                        (data.medium != null && data.medium > 0) ||
                        (data.low != null && data.low > 0)
                })).appendTo(tableBodyTr);
            });
            tableBodyTr.appendTo('tbody');
        });
}


const tableHead = ({name}) => `<th>${name}</th>`;
const tableColumn = ({name}) => `<td>${name}</td>`;
const tableValue = ({low, medium, high, hasValues}) => `<td>
    <div class="color_low">${formatMinutesToHours(low)}</div>
    <div class="color_medium">${formatMinutesToHours(medium)}</div></div>
    <div class="color_high">${formatMinutesToHours(high)}</div>
    
    ${hasValues ? '<div>-----------</div>' : ''}
    ${hasValues ? `<div><b>${formatMinutesToHours(low+high+medium)}</b></div>` : ''}
</td>`;

function formatMinutesToHours(minutes) {
    if (minutes == null || minutes === 0) {
        return '---';
    }
    const now = moment();
    const then = moment()
        .add(minutes, 'minutes');

    const diff = then.diff(now);
    const duration = moment.duration(diff);
    //a little complicated, but with  normal duration, moment falls back to 0 if hours > 24
    return `${Math.floor(duration.asHours())}h ${moment.utc(diff).format('mm')}min`;

}