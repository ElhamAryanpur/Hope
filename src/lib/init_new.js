const DB = require("./db");

function init(settings={}){
    if (settings.table != undefined){
        var initReturn = initOfInit(settings);
        const tableSettings = initReturn[0]; const DIV = initReturn[1];
        const db = new DB("table");
        const table = document.createElement("table");
        table.setAttribute("class", "hope-table");

        makeRow({div: DIV});

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
for (var i=0; i<5; i++){

    

}
}

module.exports = init;