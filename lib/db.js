const sqlite3 = require("sqlite3");

class DB{
    constructor(file="db.db"){
        this.db = new sqlite3.Database(file);
    }

    _table_new(name="myTable", query=[["Field", "TEXT"]]){
        var q = "";
        for(var i=0; i<query.length; i++){
            q += `${query[i][0]} ${query[i][1]},`;
        } q = q.substr(0, q.length - 1);

        var command = `CREATE TABLE IF NOT EXISTS (${q})`;
        this.db.run(command);
    }
}

module.exports = DB;