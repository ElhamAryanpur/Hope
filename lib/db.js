const sqlite3 = require("sqlite3");
const fs = require("fs");

class DB{
    constructor(file="db.db"){
        this.db = new sqlite3.Database(file);
        this.query;
    }

    _insert(name="myTable", query=[]){
        var q = "";
        for (var i=0; i<query.length; i++){
            
            if (typeof(query[i]) == 'string'){
                q += `'${query[i]}', `
            } else { q += `${query[i]}, ` }
        }
        q = q.substr(0, q.length - 2);
        console.log(`INSERT INTO ${name} VALUES (${q})`)
        
        this.db.run(`INSERT INTO ${name} VALUES (${q})`);
    }

    _read_all(name="myTable", callback){
        this.db.all(`SELECT * FROM ${name}`, (err, all)=>{
            if (err) console.log(err);
            else { callback(all) }
        });
    }

    _table_new(name="myTable", query=[["Field", "TEXT"]]){
        var q = "";
        for(var i=0; i<query.length; i++){
            q += `${query[i][0]} ${query[i][1]},`;
        } q = q.substr(0, q.length - 1);

        var command = `CREATE TABLE IF NOT EXISTS ${name} (${q})`;
        this.db.run(command);
    }

    _table_drop(name="myTable"){
        this.db.run(`DROP TABLE ${name}`);
    }
}

module.exports = DB;