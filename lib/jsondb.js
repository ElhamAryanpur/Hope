const fs = require("fs");
const path = require("path");
const sha256 = require("simple-sha256");

class JSONDB {
  constructor(filename = "jsondb.db", callback = false) {
    this.filename = this._joinPath(process.cwd(), filename);
    fs.readFile(this.filename, (err, data) => {
      if (err) {
        console.error(err);
      }

      try {
        this.data = JSON.parse(data.toString());
      } catch {
        console.error(
          `COULD NOT PARSE FILE '${this.filename}'. MAYBE NOT JSON FILE...`
        );
        const exec = require("child_process").exec;
        if (process.platform === "win32") {
          exec(
            `type nul > ${sha256.sync(this.filename)}.jsondb`,
            (err, stdout, stderr) => {
              if (err || stderr) {
                console.error("ERROR!");
              } else {
                console.log(stdout);
              }
            }
          );
        } else {
          exec(
            `touch ${sha256.sync(this.filename)}.jsondb`,
            (err, stdout, stderr) => {
              if (err || stderr) {
                console.error("ERROR!");
              } else {
                console.log(stdout);
                this.jsondb[data.name] = new jsondb(
                  `${sha256.sync(data.name)}.jsondb`
                );
              }
            }
          );
        }
        this.data = {};
      }

      if (callback == "function") {
        callback();
      }
    });
  }

  set(key = "", value = "") {
    this.data[key] = value;

    this.save();
  }

  get(key = "") {
    try {
      return this.data[key];
    } catch {
      return null;
    }
  }

  delete(key = "", callback = false) {
    try {
      delete this.data[key];
      this.save();
      if (callback == "function") {
        callback();
      }
    } catch (err) {
      console.error(err);
    }
  }

  save() {
    fs.writeFile(this.filename, JSON.stringify(this.data), "utf-8", (err) => {
      console.error(err);
    });
  }

  _joinPath(base, target) {
    return path.join(base, target);
  }
}

module.exports = JSONDB;
