$(()=>{
    fetch(`/years`).then(async list => {

        const years = await list.json();
        years.reverse().forEach(year => {
            $(yearOptionTemplate({value: year})).appendTo('#years');
        });

        //initial table Data
        if(years.length > 0) {
            fetch(`/table/${years[0]}`).then(async dataReq => {
                const data = await dataReq.json();
                window.fillTableData(data);
            });
        }
    });

    const yearOptionTemplate = ({value}) => `
        <option value="${value}">${value}</option>`;
});