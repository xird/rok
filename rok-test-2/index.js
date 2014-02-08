/**
 * TODO: Don't send the session ids to the clients!
 *
 * TODO: Clean up updateGame so that there's no need to pass the game reference.
 * TODO: Create a "Quick game" button for development, that:
 *   - Creates a game
 *   - Invites another user
 *   - Confirms the game
 *   - [Selects the monsters for the users]
 * TODO: Randomize the order of monsters on selection
 * TODO: Randomize the player order on game confirmation
 * TODO: Clean up user stats when resetting. Game users appear to get stuck?
          /home/erno/Documents/version_control/rok/rok-test-1/index.js:458
            if (games[user.game_id].game_state == "select_monsters") {
                                  ^
          TypeError: Cannot read property 'game_state' of undefined
              at selectMonster (/home/erno/Documents/version_control/rok/rok-test-1/index.js:458:26)
              at Socket.<anonymous> (/home/erno/Documents/version_control/
 *
 * TODO: Game states:
 *   - init
 *   - select
 *   - start
 *     - Beginning of a player's turn
 *     - If in Kyoto, increment VP
 *     - Resolve card effects
 *       - Urbavore
 *   - roll
 *     - reset dice
 *     - take cards into account
 *       - extra head
 *       - shrink ray counters
 *     - roll
 *       - take cards into account
 *         - bg dweller
 *     - Number of rerolls defaults to two, but:
 *       - Check if there are cards that give (optional) rerolls
 *       - Not all rerolls affect all dice (reroll any "3"s for example)
 *   - resolve
 *     - final dice results in
 *     - increment money
 *       - and take cards into account
 *         - "Friend of children"
 *     - decrement target health
 *       - not forgetting cards
 *         - extra damage cards
 *         - cards with damage reactions "lightning armor"
 *     - check if anyone died
 *       - check win
 *       - check any cards that react to deaths
 *     - damaged monster in Kyoto?
 *       - Yield input
 *         - Increment VP
 *       - Figure out card "Jets" - decrement health and then restore, or don't decrement
 *         - Must do the latter, otherwise death might be triggered
 *     - Add rolled numbers to VPs
 *       - Take number roll modifier cards into account
 *     - TODO: players should be allowed to resolve dice in any order
 *   - buy
 *     - Optionally buy cards if there's money
 *       - "Alien metabolism"
 *     - Resolve any discard cards
 *       - check win
 *   - end
 *     - Resolve poison counters
 *       - TODO: Check if this is done on the poisened monster's turn or the poisoning monster's turn
 *     - game state to "start"
 *     - next_input_from_user set to the next user in user_order
 * TODO: Game attribute turn_user for which user's turn it is. NOTE: This is not the same as next_input_from_user
 * TODO: When initializing the game, randomize user order into user_order
 * 
 * TODO: Add new game state variable: roll number
 * 
 * TODO: Design a way to pass currently available actions to front end:
 *   - One object, keys contain all existing actions
 *   - values contain users that can currently take the actions
 *   - Front end needs to know this user's id
 *     - 
 */

var http = require('http')
  , path = require('path')
  , connect = require('connect')
  , express = require('express')
  , app = express();

var Moniker = require('moniker');
var uuid = require('node-uuid');

var cookieParser = express.cookieParser('your secret sauce')
  , sessionStore = new connect.middleware.session.MemoryStore();

app.configure(function () {
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'html');

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(cookieParser);
  app.use(express.session({ store: sessionStore }));
  app.use(app.router);
});

var server = http.createServer(app)
  , io = require('socket.io').listen(server, { log: false });

var SessionSockets = require('session.socket.io')
  , sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

/**
 * Main page handler. This is run first, the loaded page then creates the
 * socket connection.
 */
app.get('/', function(req, res) {
  console.log("Page load");
  if (typeof req.session != undefined) {
    var sessid = req.session.id;
  }
  else {
    var sessid = "";
  }
  console.log('page - SESSION ID: ' + sessid);
  res.render('page.html');
});

// Defining ROK variables
var games = [];
var users = {};

server.listen(3250);

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

/**
 * Let any clients know that the server has gone away.
 */
process.on('SIGINT', function () {
  console.log('About to exit.');
  io.sockets.emit("server_has_gone_away");
  process.exit();
});
/*process.on('exit', function () {
  console.log('About to exit.');
  io.sockets.emit("server_has_gone_away");
  process.exit();
});*/

/**
 * Event handler for the "connection" event. This is triggered when a new user
 * enters the game.
 * 
 * All other event handlers are defined inside this function.
 * 
 */
//io.sockets.on('connection', function (socket) {
sessionSockets.on('connection', function (err, socket, session) {
  if (typeof session != "undefined") {
    var sessid = session.id;
  }
  else {
    var sessid = "";
  }
  console.log('connection - SESSION ID: ' + sessid);

  if (!sessid) {
    return;
  }

  // Create a new user.
  var user = addUser(socket, sessid);
  updateLobby();
  
  
  // Define event handlers:
  
  /**
   * Debug
   */
  
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


  /**
   * Lobby
   */
  
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

  /**
   * Game
   */
  
  /**
   * Player selecting a monster to play with.
   */
  socket.on("select_monster", function(args) {
    selectMonster(user, args.monster_id);
  });
  
  /**
   * Player rolling dice.
   */
  socket.on("roll_dice", function(args) {
    rollDice(user, args.keep_dice_ids);
  });

  // dice_roll(keep_dice_ids)
  // yield(yield)
  
  // buy(buyable_card_slot)
  // accept_invite
  // reject_invite
});



/**
 * Generates a new random username and appends it to the global "users" array.
 * Unless the current session already has a user, in which that user is
 * returned.
 * 
 * @param socket Object The io socket of the current user.
 */
var addUser = function(socket, sessid) {
  console.log("addUser");
  
  if (typeof users[sessid] != "undefined") {
    return users[sessid];
  }

  var user = {
    name: Moniker.choose(),
    monster_id: 0,
    socket_id: socket.id,
    session_id: sessid,
    game_id: 0,
    mode: ""
  }

  users[sessid] = user;

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
  game_users[user.session_id] = user.session_id;
  
  // TODO: randomize initial values for dice
  // TODO: Prepare for extra dice
  var game = {
    id: game_id,
    host: user.name,
    game_state: "lobby",
    turn_phase: "",
    next_input_from_user: 0,
    users: game_users,
    monsters: [],
    dice: [
      {
          value: "",
          state: "i"
      },
      {
          value: "",
          state: "i"
      },
      {
          value: "",
          state: "i"
      },
      {
          value: "",
          state: "i"
      },
      {
          value: "",
          state: "i"
      },
      {
          value: "",
          state: "i"
      },
    ],
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
  /*
  console.log('removeUser');
  var game_id = user.game_id;
  var keys = Object.keys(users);
  for(var i = 0; i < keys.length; i++) {
    var user = users[keys[i]];
    // TODO idenfify by id, not username
    // TODO: Clean up also from the game object, in game.users and game.monsters
    if(user.name === users[keys[i]].name) {
      delete users[keys[i]];
      updateLobby();
      // If the user was a part of a game, update that game.
      if (game_id) {
        updateGame(game_id);        
      }
      return;
    }
  }
  */
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
    console.log("socket_id: " + socket_id);
    // Get game id from current user
    var game_id = user.game_id;
    console.log("game_id: " + game_id);
    // Update game id of invited user
    // TODO make sure the user still exists(?)
    var invitedUser = getUserBySocketId(socket_id);
    console.log(invitedUser);
    invitedUser.game_id = game_id;
    invitedUser.mode = "client";
    
    // Add the user ids in the game object.
    games[user.game_id].users[invitedUser.session_id] = invitedUser.session_id;
    
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
 * @param socket_id int The socket id of the user.
 *
 * @return Object The user object whose socket was given.
 */
var getUserBySocketId = function(socket_id) {
  console.log("getUserBySocketId");
  console.log(users);
  var keys = Object.keys(users);
  for (var i = 0; i < keys.length; i++) {
    if (users[keys[i]].socket_id == socket_id) {
      return users[keys[i]];
    }
  }
  return false;
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

  var current_user = getUserBySocketId(socket.id);
  
  // Check that the user running this is a host.
  if (current_user.mode == 'host') {
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
  for (var game_user_sessid in games[game_id].users) {
    var target_socket = io.sockets.socket(users[game_user_sessid].socket_id);
    target_socket.emit("start_game");
  }
}

/**
 * Sends the game state to the users belonging to the game.
 * 
 */ 
var updateGame = function(game_id) {
  console.log("updateGame " + game_id);
  
  var current_game = games[game_id];
  
  // Re-format game users for easier handling on the front end.
  var new_users = [];
  for (var u in current_game.users) {
    var user_object = users[u];
    var new_user = {};
    new_user.socket = user_object.socket_id;
    new_users.push(new_user);
  }
  current_game.formatted_users = new_users;
  
  // Drop the empty zero monster, it's not needed on the front end.
  // TODO: If the game is confirmed, drop any monsters not in play.
  var new_monsters = [];
  for (var i = 1; i <= current_game.monsters.length - 1; i++) {
    if (typeof current_game.monsters[i] != undefined) {
      var new_monster = JSON.parse(JSON.stringify(current_game.monsters[i]));
      new_monsters.push(new_monster);
    }
  }
  current_game.formatted_monsters = new_monsters;
  
  // Loop through all users in this game and send them the data.
  for (var game_user in games[game_id].users) {
    current_game.this_user = game_user;
    var user_object = users[game_user];
    var target_socket = io.sockets.socket(user_object.socket_id);
    target_socket.emit("update_game", current_game);
  }
}

/**
 * Assigns a monster to a user
 */
var selectMonster = function (user, monster_id) {
  // TODO: Make sure the monster isn't selected already
  console.log("selectMonster");
  console.log("user.game_id: " + user.game_id);
  if (games[user.game_id].game_state == "select_monsters") {
    // Check that the user hasn't already selected a monster.
    if (user.monster_id == 0) {
      user.monster_id = monster_id;
      games[user.game_id].monsters[monster_id].user = user.socket_id;
      
      // If this was the last player to select a monster, advance the game state.
      var game_users = games[user.game_id].users;
      //console.log(game_users);
      var ready = 1;
      for (var game_user in game_users) {
        if (users[game_user].monster_id == 0) {
          ready = 0;
        }
      }
      
      if (ready) {
        console.log(games);
        // TODO: Select the player order randomly.
        games[user.game_id].game_state = 1;
        games[user.game_id].turn_phase = 'r1';
        games[user.game_id].next_input_from_user = 1; // TODO: Do we need this?
      }
      
      updateGame(user.game_id);
    }
    else {
      console.log('already selected error');
      var msg = "You have already selected a monster.";
      io.sockets.socket(user.socket_id).emit("game_message", msg);
    }  
  }
  else {
    console.log('not in monster_selection error');
    var msg = "This is not the time to select a monster.";
    io.sockets.socket(user.socket_id).emit("game_message", msg);   
  }
}

/**
 * Player rolling dice.
 * 
 * @param keep_dice_ids array The ids of the dice that are not to be
 * re-rolled.
 */
var rollDice = function (user, keep_dice_ids) {
  console.log('rollDice');

  
  // TODO fix user references versus game_state "1"
  
  
  
  // TODO check that it's the correct game_state for rolling.

  // TODO allow re-rolls!
  var faces = [
    1,
    2,
    3,
    'P',
    'H',
    'E'
  ];
  // TODO only roll the not-kept dice.
  if (games[user.game_id].turn_phase == 'r1') {
    console.log('state r1');
    // TODO: take into account possible extra dice
    for (var i = 0; i < 6; i++) {
      var r = getRandomInt(0, 5);
      games[user.game_id].dice[i].value = faces[r];
      if (games[user.game_id].dice[i].state = 'i') {
        // TODO: If there are more re-rolls, set dice states to r.
        games[user.game_id].dice[i].state = 'r';
      }
    }
  }
  
  // TODO: Except for kept dice, which should be kept as k
  // TODO: Otherwise, set dice states to f (final)
  
  // TODO increment game_state
  
  updateGame(user.game_id);
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

/**
 * TODO find the node.js way of doing this.
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


