// @ts-nocheck

const db = require("./db");
const jsondb = require("./jsondb");
const sha256 = require("./sha256");

class Main {
  constructor(socket, editable) {
    console.log(`USER CONNECTED! ID: ${socket.id}`);
    this.jsondb = {};
    this.db = new db("data.db");

    socket.on("db init", (data) => {
      this.jsondb[data.name] = new jsondb(`${sha256(data.name)}.jsondb`, {
        tableNames: {
          names: [],
        },
      });
    });

    if (editable == true) {
      socket.on("db set", (data) => {
        this.jsondb[data.name].set(data.key, data.value);
      });
    }
    socket.on("db get", (data) => {
      const d = this.jsondb[data.name].get(data.key);
      socket.emit("db get client", d);
    });

    if (editable == true) {
      socket.on("db delete", (data) => {
        if (data.callback == "function") {
          this.jsondb[data.name].delete(data.key, data.callback);
        } else {
          this.jsondb[data.name].delete(data.key);
        }
      });
    }

    if (editable == true) {
      socket.on("new table", (data) => {
        this.create_table(data, socket);
      });
    }
    if (editable == true) {
      socket.on("new query", (data) => {
        this.create_query(data);
      });
    }
    socket.on("get query", (data) => {
      this.get_query(data, socket);
    });
    if (editable == true) {
      socket.on("delete table", (data) => {
        this.delete_table(data);
      });
    }
    if (editable == true) {
      socket.on("delete query", (data) => {
        this.delete_query(data);
      });
    }
    if (editable == true) {
      socket.on("update query", (data) => {
        this.update_query(data);
      });
    }
    socket.on("filter query", (data) => {
      this.filter_query(data, socket);
    });

    if (editable == true) {
      socket.on("script save", (data) => {
        this.jsondb[data.name].set("script", data.code);
      });
    }

    socket.on("script get", (data) => {
      console.log(data.name);
      try {
        socket.emit("script get client", {
          result: this.jsondb[data.name].get("script"),
        });
      } catch {
        socket.emit("script get client", {
          result: null,
        });
      }
    });
  }

  filter_query(data, socket) {
    var isDate = function (date) {
      return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
    };

    var name = this.db.base64.urlEncode(data.table);
    var key = this.db.base64.urlEncode(data.field);
    var value = data.value[0];
    var value2 = data.value[1];
    var command = "";

    if (isDate(value)) {
      command = `SELECT * FROM ${name} WHERE ${key} BETWEEN '${value}' AND '${value2}'`;
    } else if (value2.length <= 0) {
      command = `SELECT * FROM ${name} WHERE ${key} LIKE '${value}' COLLATE NOCASE`;
    } else {
      command = `SELECT * FROM ${name} WHERE ${key} BETWEEN ${value} AND ${value2}`;
    }

    this.db.db.all(command, (err, all) => {
      if (err) console.log(err);
      else {
        for (var i = 0; i < all.length; i++) {
          delete all[i]["aWQ"];
        }
        socket.emit("filter query client", all);
      }
    });
  }

  delete_query(data) {
    var statements = "";
    for (var i = 0; i < data.columnNames.length; i++) {
      if (typeof data.data[i] == "string") {
        statements += `${this.db.base64.urlEncode(data.columnNames[i])} = '${
          data.data[i]
        }' AND `;
      } else {
        statements += `${this.db.base64.urlEncode(data.columnNames[i])} = ${
          data.data[i]
        } AND `;
      }
    }
    statements = statements.substr(0, statements.length - 4);
    statements = `DELETE FROM ${this.db.base64.urlEncode(
      data.name
    )} WHERE ${statements}`;
    this.db.db.run(statements, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  update_query(data) {
    var statements = "";
    for (var i = 0; i < data.columnNames.length; i++) {
      if (typeof data.data[i] == "string") {
        statements += `${this.db.base64.urlEncode(data.columnNames[i])} = '${
          data.data[i]
        }', `;
      } else {
        statements += `${this.db.base64.urlEncode(data.columnNames[i])} = ${
          data.data[i]
        }, `;
      }
    }

    var def = "";
    for (var i = 0; i < data.columnNames.length; i++) {
      if (typeof data.default[i] == "string") {
        def += `${this.db.base64.urlEncode(data.columnNames[i])} = '${
          data.default[i]
        }' AND `;
      } else {
        def += `${this.db.base64.urlEncode(data.columnNames[i])} = ${
          data.default[i]
        } AND `;
      }
    }

    statements = statements.substr(0, statements.length - 2);
    def = def.substr(0, def.length - 4);
    statements = `UPDATE ${this.db.base64.urlEncode(
      data.name
    )} SET ${statements} WHERE ${def}`;

    this.db.db.run(statements, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  delete_table(data) {
    this.db._table_drop(data.name);
  }

  get_query(data, socket) {
    var page;
    if (data.page > 1) {
      page = 0 + 50 * data.page;
    } else {
      page = 0;
    }
    this.db._read_range(data.name, page, (result) => {
      socket.emit("client get query", result);
      socket.broadcast.emit("update");
    });
  }

  create_query(data) {
    this.db._insert_v2(data.table_name, data.fields, data.data);
  }

  create_table(data, socket) {
    const query = [];
    for (var i = 0; i < data.values.length; i++) {
      var type;

      if (data.types[i] == "number") {
        type = "INT";
      } else if (data.types[i] == "text") {
        type = "TEXT";
      } else {
        type = data.types[i];
      }

      query.push([data.values[i], type]);
    }

    this.db._table_new(data.name, query);
    socket.broadcast.emit("update table");
  }
}

module.exports = Main;
