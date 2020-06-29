const sqlite3 = require("sqlite3");

class DB {
  constructor(file = "db.db") {
    this.file = file;
    this.db = new sqlite3.Database(file);
  }

  _insert(name = "myTable", query = []) {
    name = base64.urlEncode(name);
    var q = "";
    for (var i = 0; i < query.length; i++) {
      if (typeof query[i] == "string") {
        q += `'${query[i]}', `;
      } else {
        q += `${query[i]}, `;
      }
    }
    q = q.substr(0, q.length - 2);

    this.db.run(`INSERT INTO ${name} VALUES (${q})`);
  }

  _insert_v2(name = "myTable", fields = [], query = []) {
    name = base64.urlEncode(name);
    var q = "";
    for (var i = 0; i < query.length; i++) {
      if (typeof query[i] == "string") {
        q += `'${query[i]}', `;
      } else {
        q += `${query[i]}, `;
      }
    }
    q = q.substr(0, q.length - 2);

    var f = "";
    for (var i = 0; i < fields.length; i++) {
      f += `${fields[i]}, `;
    }
    f = f.substr(0, f.length - 2);

    this.db.run(`INSERT INTO ${name}(${f}) VALUES (${q})`);
  }

  _read_all(name = "myTable", callback) {
    name = base64.urlEncode(name);
    this.db.all(`SELECT * FROM ${name}`, (err, all) => {
      if (err) console.log(err);
      else {
        callback(all);
      }
    });
  }

  _read_range(name = "myTable", start = 0, callback) {
    name = base64.urlEncode(name);
    this.db.all(
      `SELECT * FROM ${name} ORDER BY aWQ DESC LIMIT 50 OFFSET ${start}`,
      (err, all) => {
        if (err) console.log(err);
        else {
          for (var i=0; i<all.length; i++){
            delete all[i]["aWQ"]
          }
          callback(all);
        }
      }
    );
  }

  _read_specific(
    name = "myTable",
    callback,
    key = "id",
    value = "1",
    operator = "="
  ) {
    name = base64.urlEncode(name);
    this.db.all(
      `SELECT * FROM ${name} WHERE ${key} ${operator} ${value}`,
      (err, all) => {
        if (err) console.log(err);
        else {
          callback(all);
        }
      }
    );
  }

  _table_new(name = "myTable", query = [["Field", "TEXT"]]) {
    name = base64.urlEncode(name);
    var q = "";
    const saveQuery = [];
    for (var i = 0; i < query.length; i++) {
      q += `${query[i][0]} ${query[i][1]},`;
      saveQuery.push(query[i][0]);
    }
    q = q.substr(0, q.length - 1);

    var command = `CREATE TABLE IF NOT EXISTS ${name} (${q})`;
    this.db.run(command);
    this.query = saveQuery;
  }

  _table_drop(name = "myTable") {
    name = base64.urlEncode(name);
    this.db.run(`DROP TABLE ${name}`);
  }

  _table_get_names(callback) {
    this.db.all(`.tables`, (err, all) => {
      if (err) console.log(err);
      else {
        callback(all);
      }
    });
  }
}

var base64 = exports;

base64.encode = function (unencoded) {
  return new Buffer.from(unencoded || "").toString("base64");
};

base64.decode = function (encoded) {
  return new Buffer.from(encoded || "", "base64").toString("utf8");
};

base64.urlEncode = function (unencoded) {
  var encoded = base64.encode(unencoded);
  return encoded.replace("+", "-").replace("/", "_").replace(/=+$/, "");
};

base64.urlDecode = function (encoded) {
  encoded = encoded.replace("-", "+").replace("_", "/");
  while (encoded.length % 4) encoded += "=";
  return base64.decode(encoded);
};

module.exports = DB;
