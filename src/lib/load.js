const DB = require("./db");

function load(settings={}){
    if (settings.table != undefined){
        const tableSettings = settings.table;
        const div = document.getElementById(tableSettings.name);
        div.setAttribute("class", "hope-container");
        var data; db = new DB(name="table");

        if (!tableSettings.load){
            data = tableSettings.data;
        } else { data = db.data }

        const tableDiv = document.createElement("table");
        tableDiv.setAttribute("class", "hope-table");
        for(i in data){
            const row = document.createElement("tr");
            row.setAttribute("class", "hope-table");            
            for (o in data[i]){
                var column = document.createElement("th");
                column.innerHTML = data[i][o];
                column.setAttribute("class", "hope-table")
                row.appendChild(column);
            }
            tableDiv.appendChild(row);
        }
        div.appendChild(tableDiv);
    }
}

module.exports = load;