const db = require('./db')

class Main {
  constructor(socket) {
    console.log('A User Connected')
    this.db = new db('data.db')

    socket.on('new table', data => {
      this.create_table(data)
    })
    socket.on('new query', data => {
      this.create_query(data)
    })
    socket.on('get query', data => {
      this.get_query(data, socket)
    })
    socket.on('delete table', data => {
      this.delete_table(data)
    })
    socket.on('delete query', data => {
      this.delete_query(data)
    })
  }

  delete_query(data) {
    var statements = ''
    for (var i = 0; i < data.columnNames.length; i++) {
      if (typeof data.data[i] == 'string') {
        statements += `${data.columnNames[i]} = '${data.data[i]}' AND `
      } else {
        statements += `${data.columnNames[i]} = ${data.data[i]} AND `
      }
    }
    statements = statements.substr(0, statements.length - 4)
    statements = `DELETE FROM ${data.name} WHERE ${statements}`
    this.db.db.run(statements, err=>{
      if(err){
        console.log(err);
      }
    })
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
