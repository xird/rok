/**
 * See tutorial at
 * http://krasimirtsonev.com/blog/article/Real-time-chat-with-NodeJS-Socketio-and-ExpressJS
 */

/**
 * This method reads the .html page and simply sends it to the browser.
 */
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
var Moniker = require('moniker');
var port = 3250;
app.listen(port);

// Defining global variables. These are shared by _all_ users.
var initialWidth = 20;
var currentWidth = initialWidth;
var winWidth = 150;
var users = [];

/**
 * Event handler for the "connection" event. This is triggered when a new user
 * enters the game.
 */
io.sockets.on('connection', function (socket) {
  var user = addUser();
  updateWidth();
  socket.emit("welcome", user);
  socket.on('disconnect', function () {
    removeUser(user);
  });
  socket.on("click", function() {
    currentWidth += 1;
    user.clicks += 1;
    if(currentWidth == winWidth) {
      currentWidth = initialWidth;
      io.sockets.emit("win", { message: "<strong>" + user.name + "</strong> rocks!" });
    }
    updateWidth();
    updateUsers();
  });
});

/**
 * Function definition for "addUser". Generates a new random username and
 * appends it to the global "users" array.
 */
var addUser = function() {
  var user = {
    name: Moniker.choose(),
    clicks: 0
  }
  users.push(user);
  updateUsers();
  return user;
}

/**
 * Removes a user from the global users array.
 */
var removeUser = function(user) {
  for(var i=0; i<users.length; i++) {
    if(user.name === users[i].name) {
      users.splice(i, 1);
      updateUsers();
      return;
    }
  }
}

/**
 * Generates an HTML string from the usernames in the global users
 * variable, and sends ("emits") the string to all sockets.
 */
var updateUsers = function() {
  var str = '';
  for(var i=0; i<users.length; i++) {
    var user = users[i];
    str += user.name + ' <small>(' + user.clicks + ' clicks)</small><br/>';
  }
  io.sockets.emit("users", { users: str });
}

/**
 * Sends the value of the global width variable to all sockets.
 */
var updateWidth = function() {
  io.sockets.emit("update", { currentWidth: currentWidth });
}
