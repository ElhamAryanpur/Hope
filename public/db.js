class DB {
  constructor(name = 'db') {
    this.ch = false
    this.db = name
    window.socket.emit('db init', { name: this.db })
  }

  get(name = '', callback) {
    window.socket.emit('db get', { name: this.db, key: name })
    window.socket.on('db get client', async data => {
      await callback(data)
    })
  }

  get_clean(name = '', callback) {
    this.get(name, doc => {
      if (doc != null) {
        callback(doc)
      }
    })
  }

  put(name = '', data = {}) {
    window.socket.emit('db set', { name: this.db, key: name, value: data })
    if (this.ch == 'function') {
      this.ch()
    }
  }

  change(callback) {
    this.ch = callback
  }

  delete(name, callback) {
    window.socket.emit('db delete', {
      name: this.db,
      key: name,
      callback: callback,
    })
  }
}
