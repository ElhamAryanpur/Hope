const DB = require("./db");

function load(settings={}){
    if (settings.table != undefined){
        const tableSettings = settings.table;
        const div = document.getElementById(tableSettings.name);
        div.setAttribute("class", "hope-container");
        div.innerHTML = "";
        var data; db = new DB(name="table");
        var settingsTable = new DB(name="table-settings");

        if (!tableSettings.load){
            data = tableSettings.data;
        } else { data = db.data }

        const tableDiv = document.createElement("table");
        tableDiv.setAttribute("class", "hope-table");
        const rowFirst = document.createElement("tr");
        rowFirst.setAttribute("class", "hope-table");

        for (i in settingsTable.data){
            const tableHeader = document.createElement("th");
            tableHeader.setAttribute("class", "hope-table");
            tableHeader.innerHTML = settingsTable.data[i].name;
            rowFirst.appendChild(tableHeader);
        } tableDiv.appendChild(rowFirst);

        console.log(data)

        for(i in data){
            const row = document.createElement("tr");
            row.setAttribute("class", "hope-table");          
            for (o in data[i]){
                var column = document.createElement("th");
                column.setAttribute("class", "hope-table");
                const edit = document.createElement("input");
                edit.id = `${i}-${o}`;
                edit.value = data[i][o];
                edit.setAttribute("class", "hope-input");
                column.appendChild(edit);
                row.appendChild(column);
            }
            tableDiv.appendChild(row);
        }
        div.appendChild(tableDiv);
    }
}

module.exports = load;