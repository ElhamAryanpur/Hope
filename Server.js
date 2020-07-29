const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const m = require("./lib/main");
const open = require("open");

//========================================================================//
//========================================================================//

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/:name", (req, res) => {
  var name = req.params.name;
  const bundleFolder = __dirname + "/public/";
  res.sendFile(bundleFolder + name);
});

app.get("/build/:name", (req, res) => {
  var name = req.params.name;
  const bundleFolder = __dirname + "/public/build/";
  res.sendFile(bundleFolder + name);
});

//========================================================================//
//========================================================================//

io.on("connection", function (socket) {
  const Main = new m(socket);
});

http.listen(8080, function () {
  console.log("listening on:");
  var os = require('os');
  var ifaces = os.networkInterfaces();
  var choosen = false;
  var choose = "";

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ('IPv4' !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log(ifname + ':sss' + alias, iface.address);

        
      } else {
        // this interface has only one ipv4 adress
        console.log(ifname, iface.address);
      }
      ++alias;

      if (choosen == false){
        choose = iface.address
        choosen = true
      }
    });
  });
  open(`http://${choose}:8080`)
});