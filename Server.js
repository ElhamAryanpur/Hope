const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const m = require('./lib/main')
const Main = new m()

//========================================================================//
//========================================================================//

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
  console.log('a user connected')
})

http.listen(3000, function() {
  console.log('listening on http://localhost:3000')
})
