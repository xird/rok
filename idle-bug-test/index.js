
var handler = function(req, res) {
  fs.readFile('./page.html', function (err, data) {
    if(err) throw err;
    res.writeHead(200);
    res.end(data);
  });
}

// Include dependencies, set up the server and make it listen to the port.
var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);
var fs = require('fs');
var port = 3250;
app.listen(port);

io.sockets.on('connection', function (socket) {
  socket.on("foo", function() {
    var now = new Date();
    console.log('got foo at ' + now.getSeconds());
  });
});
