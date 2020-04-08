const fs = require('fs')
const path = require('path')

class JSONDB {
  constructor(filename = 'jsondb.db', callback = false) {
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

      if (callback == 'function') {
        callback()
      }
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

  delete(key = '', callback = false) {
    try {
      delete this.data[key]
      this.save()
      if (callback == 'function') {
        callback()
      }
    } catch {
      continue
    }
  }

  save() {
    fs.writeFile(this.filename, JSON.stringify(this.data), 'utf-8', err => {
      console.error(err)
    })
  }

  _joinPath(base, target) {
    return path.join(base, target)
  }
}

module.exports = JSONDB
