const sqlite3 = require("sqlite3");
const fs = require("fs");

class DB{
    constructor(file="db.db"){
        this.file = file;
        this.db = new sqlite3.Database(file);
    }

    _insert(name="myTable", query=[]){
        console.log(query)
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

    _read_specific(name="myTable", callback, key="id", value="1", operator="="){
        this.db.all(`SELECT * FROM ${name} WHERE ${key} ${operator} ${value}`, (err, all)=>{
            if (err) console.log(err);
            else { callback(all) }
        });
    }

    _table_new(name="myTable", query=[["Field", "TEXT"]]){
        var q = ""; const saveQuery = [];
        for(var i=0; i<query.length; i++){
            q += `${query[i][0]} ${query[i][1]},`;
            saveQuery.push(query[i][0]);
        } q = q.substr(0, q.length - 1);

        var command = `CREATE TABLE IF NOT EXISTS ${name} (${q})`;
        this.db.run(command);

        this.query = saveQuery; this.p_save_settings();
    }

    _table_drop(name="myTable"){
        this.db.run(`DROP TABLE ${name}`);
    }

    //============================ PRIVATE ===============================//

    p_load_settings(){
        fs.readFile(__dirname + `${this.file}_dbSetting.json`, (err, data)=>{
            if (err){ console.log(err) }
            else {
                data = JSON.parse(data);
                this.query = data.query;
            }
        })
    }

    p_save_settings(){
        const settings = {
            query: this.query
        }

        fs.writeFile(__dirname + `${this.file}_dbSetting.json`, JSON.stringify(settings), (err)=>{
            console.log(`Saving Settings Error: ${err}`);
        });
    }
}

module.exports = DB;
