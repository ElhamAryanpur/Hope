const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const m = require("./lib/main");
const open = require("open");
const DB = require("./lib/db");
const { send } = require("process");

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

//=================== API ===================== //

const db = new DB("data.db");

function clean(result) {
  const decoded = [];
  for (var i = 0; i < result.length; i++) {
    const keys = Object.keys(result[i]);
    const row = {};
    for (var o = 0; o < keys.length; o++) {
      row[db.base64.urlDecode(keys[o])] = result[i][keys[o]];
    }
    decoded.push(row);
  }
  return decoded;
}

app.get("/apiv1/get/:table/:field/:keyword", (req, res) => {
  const table = req.params["table"];
  const field = req.params["field"];
  const keyword = req.params["keyword"];

  db._read_specific(
    table,
    (result) => {
      res.send(JSON.stringify(clean(result)));
    },
    field,
    keyword,
    "="
  );
});

app.get("/apiv1/getall/:table", (req, res) => {
  const table = req.params["table"];
  db._read_all(table, (result) => {
    res.send(JSON.stringify(clean(result)));
  });
});

app.get("/apiv1/auth/:pass", (req, res) => {
  try {
    const pass = db.base64.urlDecode(req.params["pass"]);
    if (pass == "Password") {
      res.send(JSON.stringify({ auth: true }));
    } else {
      res.send(JSON.stringify({ auth: false }));
    }
  } catch {
    res.send(JSON.stringify({ auth: false }));
  }
});

//========================================================================//
//========================================================================//

var result = "false";
try {
  result = process.argv[2];
} catch {
  result = "true";
}
if (result.toLowerCase() == "true") {
  io.on("connection", function (socket) {
    const Main = new m(socket, true);
  });
} else {
  io.on("connection", function (socket) {
    const Main = new m(socket, false);

    socket.emit("no edit", {});
  });
}

var port = 8080;
try {
  port = parseInt(process.argv[3]);
} catch {
  port = 8080;
}
http.listen(port, function () {
  console.log("listening on:");
  var os = require("os");
  var ifaces = os.networkInterfaces();
  var choosen = false;
  var choose = "";

  Object.keys(ifaces).forEach(function (ifname) {
    var alias = 0;

    ifaces[ifname].forEach(function (iface) {
      if ("IPv4" !== iface.family || iface.internal !== false) {
        // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
        return;
      }

      if (alias >= 1) {
        // this single interface has multiple ipv4 addresses
        console.log(ifname + ":sss" + alias, iface.address);
      } else {
        // this interface has only one ipv4 adress
        console.log(ifname, iface.address);
      }
      ++alias;

      if (choosen == false) {
        choose = iface.address;
        choosen = true;
      }
    });
  });
  console.log("Port:");
  console.log(port);
  console.log(`\n\n   -- Final Form: http://${choose}:${port} --\n\n`);
  open(`http://${choose}:${port}`);
});
