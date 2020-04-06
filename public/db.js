class DB {
  constructor(name = 'db') {
    this.db = new PouchDB(`/db/${name}`)
  }

  get(name = '', callback) {
    this.db
      .get(name)
      .then(doc => {
        callback(doc)
      })
      .catch(err => {
        callback(err)
      })
  }

  get_clean(name = '', callback) {
    this.get(name, doc => {
      if (doc.status != 404) {
        callback(doc)
      }
    })
  }

  put(name = '', data = {}) {
    data._id = name
    this.db.put(data).catch(err => {
      console.log(err)
    })
  }

  put_v2(name = '', data = {}) {
    data._id = name
    this.db.put(data).catch(err => {
      this.set(name, data)
    })
  }

  set(name = '', data = {}) {
    this.db.get(name).then(doc => {
      data._id = name
      data._rev = doc._rev

      this.db.put(data).catch(err => {
        console.log(err)
      })
    })
  }

  try_put(name = '', data = {}) {
    this.get(name, response => {
      if (response.status != 404) {
        this.set(name, data)
      } else {
        this.put(name, data)
      }
    })
  }

  change(callback) {
    this.db
      .changes({
        since: 'now',
        live: true,
        include_docs: true,
      })
      .on('change', callback)
  }

  delete(name, callback) {
    this.get(name, doc => {
      this.db.remove(doc, (err, resp) => {
        if (err) {
          callback(err)
        }
        callback(resp)
      })
    })
  }
}
