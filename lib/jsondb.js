const fs = require('fs')
const path = require('path')

class JSONDB {
  constructor(filename = 'jsondb.db', callback) {
    this.filename = this._joinPath(__dirname, filename)
    fs.readFile(this.filename, (err, data) => {
      if (err) {
        console.error(err)
      }

      try {
        this.data = JSON.parse(data.toString())
      } catch {
        console.error(
          `COULD NOT PARSE FILE '${this.filename}'. MAYBE NOT JSON FILE...`,
        )
        this.data = {}
      }

      callback()
    })
  }

  set(key = '', value = '') {
    this.data[key] = value

    this.save()
  }

  get(key = '') {
    try {
      return this.data[key]
    } catch {
      return null
    }
  }

  save() {
    fs.writeFile(this.filename, JSON.stringify(this.data), 'utf-8', err=>{
        console.error(err)
    })
  }

  _joinPath(base, target) {
    return path.join(base, target)
  }
}