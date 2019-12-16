const DB = require("./db");

function init(settings={}){
    if (settings.table != undefined){
        var initReturn = initOfInit(settings);
        const tableSettings = initReturn[0]; const DIV = initReturn[1];
        const db = new DB("table");
        const table = document.createElement("table");
        table.setAttribute("class", "hope-table");

        var test = makeRow({
            div: DIV,
            data: tableSettings.data,
            fill: false
        });

        DIV.appendChild(test);

    }
}

/*==============================================================================*/

function initOfInit(settings){
    const tableSettings = settings.table;
    const DIV = document.getElementById(tableSettings.name);
    DIV.setAttribute("class", "hope-container");

    const db = new DB("table-settings");
    db.data = tableSettings.data;
    db.saveData();

    return [tableSettings, DIV];
}

function makeRow(settings){
    const elements = document.createElement("div");

    for (var i=0; i<settings.data.length; i++){

        const input = document.createElement("input");
        input.setAttribute("class", "hope-input");
        input.setAttribute("type", settings.data[i].type);

        if (settings.fill == true){
            input.value = settings.data[i].name
        } else {
            input.placeholder = settings.data[i].name
        }

        elements.appendChild(input);
    }

    return elements;
}

module.exports = init;