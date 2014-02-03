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
// Note: Remove the object parameter from the listen call to enable debug
// logging.
var io = require('socket.io').listen(app, { log: false });
// FileSystem is used to read the page.html file.
var fs = require('fs');
// Moniker generates the random usernames.
var Moniker = require('moniker');
var uuid = require('node-uuid');
var port = 3250;
app.listen(port);


/**
 * Code for serving static files
 */
var static = require('node-static');
// Create a node-static server instance to serve the './public' folder
var file = new static.Server('./public');
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        //
        // Serve files!
        //
        file.serve(request, response);
    }).resume();
}).listen(8080);
// End code for serving static files.


// Defining global variables. These are shared by _all_ users.
// TUT
var initialWidth = 20;
var currentWidth = initialWidth;
var winWidth = 150;


// Defining ROK variables
var games = [];
var users = {};


/**
 * Event handler for the "connection" event. This is triggered when a new user
 * enters the game.
 * 
 * All other event handlers are defined inside this function.
 * 
 */
io.sockets.on('connection', function (socket) {
  // Create a new user.
  var user = addUser(socket);
  
  // Sends the welcome message to a new user.
  socket.emit("welcome", user);
  
  // Handles users leaving the game.
  socket.on('disconnect', function () {
    removeUser(user);
  });
  
  // Creates a new game and sets the user who created the game as a host.
  socket.on("new_game", function(args) {
    console.log('new_game');
    var game = newGame(user);
  });
  
  // Game host inviting a user to the game.
  socket.on("invite", function(args) {
    console.log("invite-handler");
    console.log(args);
    inviteUser(user, args.socket_id);
  });
  
  // Game host confirming invited players and starting the game.
  socket.on("confirm_game", function() {
    confirmGame(socket);
  });
  
  // Debug game
  socket.on("log_game_state", function(args) {
    console.log(dump(games));
    updateGame(user.game_id);
  });
  
  // Debug users
  socket.on("log_users_state", function(args) {
    console.log(dump(users));
    updateLobby();
  });

  

  // select_monster(monster_id)
  // dice_roll(keep_dice_ids)
  // yield(yield)
  
  // buy(buyable_card_slot)
  // accept_invite
  // reject_invite
});



/**
 * Generates a new random username and appends it to the global "users" array.
 * 
 * @param socket Object The io socket of the current user.
 */
var addUser = function(socket) {
  console.log("addUser");

  var user = {
    name: Moniker.choose(),
    monster_id: 0,
    socket_id: socket.id,
    game_id: 0,
    mode: "",
    clicks: 0 //TUT
  }
  users[socket.id] = user;
  
  updateLobby();
  return user;
}

/**
 * Starts a new game
 * 
 * @param user Object The user creating the new game.
 * 
 * @return Object A new game object
 * 
 */
var newGame = function(user) {
  var game_id = uuid.v4();
  user.game_id = game_id;
  user.mode = "host";
  
  var game_users = {};
  game_users[user.socket_id] = user.socket_id;
  
  var game = {
    id: game_id,
    host: user.name,
    game_state: "lobby",
    turn_phase: "",
    next_input_from_user: 0,
    users: game_users,
    monsters: [],
    dice_values: [0, 0, 0, 0, 0, 0, 0, 0],
    dice_states: ["r", "r", "r", "r", "r", "r", "r", "r", ],
    monster_to_yield_tokyo_city: 0, // ?
    monster_to_yield_tokyo_bay: 0, // ?
  }
  
  // Generate monsters and save them in the game object. Note index starting
  // from 1 since we don't want a monster with an id of 0.
  for (var i = 1; i <= 6; i++) {
    var monster = new Monster(i);
    game.monsters[i] = monster;
  }
  
  games[game_id] = game;
  updateLobby();
  //console.log( dump(games) );
  return game;
}

/**
 * Class definition for a Monster object
 * 
 * @param id int The id of the Monster being generated, 1-6.
 * 
 * @return null
 * 
 */
function Monster(id) {
  // The user controlling this monster.
  this.user = 0;
  this.health = 10;
  this.victory_points = 0;
  this.energy = 0;
  this.in_tokyo_city = 0;
  this.in_tokyo_bay = 0;
  this.id = id;
  
  // The name of the monster.
  var monster_names = [
    "Alienoid",
    "Cyber Bunny",
    "Giga Zaur",
    "Kraken",
    "Meka Dragon",
    "The King"
  ];
  this.name = monster_names[id - 1];
}


/**
 * Removes a user from the global users array.
 */
var removeUser = function(user) {
  var keys = Object.keys(users);
  for(var i = 0; i < keys.length; i++) {
    var user = users[keys[i]];
    // TODO idenfify by id, not username
    if(user.name === users[keys[i]].name) {
      delete users[keys[i]];
      updateLobby();
      return;
    }
  }
}


/**
 * Invites a user to join a game.
 * 
 * NOTE: The current implementation doesn't just invite, it automatically adds
 * the user to the game.
 * TODO: Allow the invited user to accept or reject the invite.
 * 
 * @param user Object The user doing the invite.
 * @param socket_id String The socket id of the user being invited.
 */
var inviteUser = function (user, socket_id) {
  console.log("inviteUser");
  
  // Check that the current user has created a new game.
  if (user.game_id) {
    console.log(users);
    console.log("socket_id" + socket_id);
    // Get game id from current user
    var game_id = user.game_id;
    // Update game id of invited user
    // TODO make sure the user still exists(?)
    users[socket_id].game_id = game_id;
    users[socket_id].mode = "client";
    
    // Add the user ids in the game object.
    games[user.game_id].users[socket_id] = socket_id;
    
    updateLobby();   
  }
  else {
    console.log('no game error');
    // Notify the user that he needs a game.
    var msg = "Please create a new game before inviting users.";
    console.log(user);
    io.sockets.socket(user.socket_id).emit("lobby_message", msg);
  }
}


/**
 * Updates data on users in the lobby. 
 */
var updateLobby = function() {
  console.log("updateLobby");
  
  arr = [];
  for(var i in users) {
    // TODO: Only push users that are not in a confirmed game.
    arr.push(users[i]);
  }
  
  io.sockets.emit("update_lobby", { users: arr });
}


/**
 * Starts the game with the invited users
 * 
 * @param socket Object The socket for the host user.
 */
var confirmGame = function(socket) {
  console.log("confirmGame");
  // console.log(users[socket.id].mode);
  
  var current_user = users[socket.id];
  
  // Check that the user running this is a host.
  if (users[socket.id].mode == 'host') {
    // Check that there are at least two users in the game
    console.log(games[current_user.game_id]);
    
    if (Object.keys(games[current_user.game_id].users).length >= 2) {
      games[current_user.game_id].game_state = 'select_monsters';
      // TODO: Update the users list to remove the playing users from the list.
      updateLobby();
      // Start the game
      startGame(current_user.game_id);
      // Emit event "update_game" to users in this game     
      updateGame(current_user.game_id);
    }
    else {
      console.log('not enough users error');
      // Notify the user.
      var msg = "At least two players are needed to play.";
      io.sockets.socket(current_user.socket_id).emit("lobby_message", msg);     
    }
  }
  else {
    console.log('not a host error');
    // Notify the user that he needs to be a host to confirm a game.
    var msg = "Only the host can confirm a game.";
    io.sockets.socket(current_user.socket_id).emit("lobby_message", msg);
  }
}

/**
 * Game functionality.
 */

/**
 * Starts the game.
 * 
 */ 
var startGame = function(game_id) {
  // Loop through all users in this game.
  for (var game_user in games[game_id].users) {
    var target_socket = io.sockets.socket(game_user);
    target_socket.emit("start_game");
  }
}

/**
 * Sends the game state to the users belonging to the game.
 * 
 */ 
var updateGame = function(game_id) {
  console.log("updateGame");
  console.log(game_id);
  
  var current_game = games[game_id];
  
  // Re-format game users for easier handling on the front end.
  var new_users = [];
  for (var u in current_game.users) {
    var new_user = {};
    new_user.socket = u;
    new_users.push(new_user);
  }
  current_game.formatted_users = new_users;
  
  // Drop the empty zero monster, it's not needed on the front end
  var new_monsters = [];
  
  for (var i = 1; i <= current_game.monsters.length - 1; i++) {
    console.log("original monster "+i+":");
    console.log(current_game.monsters[i]);
    if (typeof current_game.monsters[i] != undefined) {
      var new_monster = JSON.parse(JSON.stringify(current_game.monsters[i]));
      console.log(new_monster);
      new_monsters.push(new_monster);
    }
  }
  current_game.formatted_monsters = new_monsters;
  console.log("New monsters");
  console.log(new_monsters);
  
  // Loop through all users in this game and send them the data.
  for (var game_user in games[game_id].users) {
    var target_socket = io.sockets.socket(game_user);
    target_socket.emit("update_game", current_game);
  }
}



// UTILS

/**
 * Function : dump()
 * Arguments: The data - array,hash(associative array),object
 *    The level - OPTIONAL
 * Returns  : The textual representation of the array.
 * This function was inspired by the print_r function of PHP.
 * This will accept some data as the argument and return a
 * text that will be a more readable version of the
 * array/hash/object that is given.
 * Docs: http://www.openjs.com/scripts/others/dump_function_php_print_r.php
 */
function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 1;
	
	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";
	
	if(typeof(arr) == 'object') { //Array/Hashes/Objects 
		for(var item in arr) {
			var value = arr[item];
			
			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}