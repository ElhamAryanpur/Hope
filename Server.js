const PouchDB = require('pouchdb')
const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const m = require('./lib/main')

//========================================================================//
//========================================================================//

app.use(
  '/db',
  require('express-pouchdb')(PouchDB, {
    configPath: './db/config.json',
  }),
)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

app.get('/:name', (req, res) => {
  var name = req.params.name
  const bundleFolder = __dirname + '/public/'
  res.sendFile(bundleFolder + name)
})

app.get('/build/:name', (req, res) => {
  var name = req.params.name
  const bundleFolder = __dirname + '/public/build/'
  res.sendFile(bundleFolder + name)
})

//========================================================================//
//========================================================================//

io.on('connection', function(socket) {
  const Main = new m()
  socket.on('new table', data => {
    console.log('AAAAAA')
    Main.create_table(data)
  })
  socket.on('new query', data => {
    Main.create_query(data)
  })
  socket.on('get query', data => {
    Main.get_query(data, socket)
  })
})

http.listen(1234, function() {
  console.log('listening on http://localhost:3000')
})
