const http = require('http')
const io = require('socket.io')(http)
const opn = require('opn')

//========================================================================//
//========================================================================//

const app = http.createServer((req, res)=>{
  if(req.url == '/'){
    res.write("AAAAAAA");
    res.end();
  }
})

//========================================================================//
//========================================================================//

io.on('connection', function(socket) {
  console.log('AAAAAa someone CONNECTED!')
})

app.listen(8080);