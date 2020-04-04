const db = require('./db')

class Main {
  constructor() {
    console.log('A User Connected')
    this.db = new db('data.db')
  }

  delete_table(data) {
    this.db._table_drop(data.name)
  }

  get_query(data, socket) {
    var page
    if (data.page > 1) {
      page = 0 + 50 * data.page
    } else {
      page = 0
    }
    this.db._read_range(data.name, page, result => {
      socket.emit('client get query', result)
    })
  }

  create_query(data) {
    this.db._insert_v2(data.table_name, data.fields, data.data)
  }

  create_table(data) {
    const query = []
    for (var i = 0; i < data.values.length; i++) {
      var type

      if (data.types[i] == 'number') {
        type = 'INT'
      } else if (data.types[i] == 'text') {
        type = 'TEXT'
      } else {
        type = data.types[i]
      }

      query.push([data.values[i], type])
    }

    this.db._table_new(data.name, query)
    this.db._table_get_names((err, data) => {
      console.log(data)
    })
  }
}

module.exports = Main
