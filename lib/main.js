const db = require('./db')

class Main {
  constructor() {
    console.log('A User Connected')
    this.db = new db('data.db')
  }

  create_query(data) {
    this.db._insert(data.table_name, data.data)
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
