const DB = require("./db");

function load(settings={}){
    if (settings.table != undefined){
        const tableSettings = settings.table;
        const div = document.getElementById(tableSettings.name);
        div.setAttribute("class", "hope-container");
        var data; db = new DB(name="table");

        if (!tableSettings.load){
            data = tableSettings.data;
        } else { data = db.loadData() }

        // TODO: Make A Table From Data And Add It To The Div

    }
}

module.exports = load;