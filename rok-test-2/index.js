/**
 * TODO: Don't send the session ids to the clients!
 *
 *
 * TODO: Create a "Quick game" button for development, that:
 *   - Creates a game
 *   - Invites another player
 *   - Confirms the game
 *   - [Selects the monsters for the players]
 *
 * TODO: Randomize the player order on game confirmation
 * TODO: Game attribute turn_player for which player's turn it is. NOTE: This is not the same as next_input_from_player
 *
 * TODO: Clean up player stats when resetting. Game players appear to get stuck?
          /home/erno/Documents/version_control/rok/rok-test-1/index.js:458
            if (games[player.game_id].game_state == "select_monsters") {
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
 *     - next_input_from_player set to the next player in player_order
 * 
 * TODO: Add new game state variable: roll number
 * 
 * TODO: Design a way to pass currently available actions to front end:
 *   - One object, keys contain all existing actions
 *   - values contain players that can currently take the actions
 *   - Front end needs to know this player's id
 *     - 
 */

var http = require('http')
  , path = require('path')
  , connect = require('connect')
  , express = require('express')
  , app = express();

var Moniker = require('moniker');
var uuid = require('node-uuid');

var ROKUtils = require('./rok_utils.js');

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
  console.log('  page - SESSION ID: ' + sessid);
  //console.log('  socket: ' + req.socket.id);
  res.render('page.html');
});

// Defining ROK variables
var games = [];
var players = {};
var current_socket = {};

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
 * Event handler for the "connection" event. This is triggered when a new player
 * enters the game.
 * 
 * All other event handlers are defined inside this function.
 * 
 */
//io.sockets.on('connection', function (socket) {
sessionSockets.on('connection', function (err, socket, session) {
  // Make the socket available everywhere
  current_socket = socket;
  
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

  // Create a new player (returns an existing player if one exists for this
  // session).
  var player = addPlayer(socket, sessid);
  
  if (player.game_id) {
    console.log('Game state: ' + games[player.game_id].game_state);
    if (games[player.game_id].game_state != 'lobby') {
      updateGame();
    }
    else {
      updateLobby();
    }
  }
  else {
    updateLobby();  
  }

  
  
  // Define event handlers:
  
  /**
   * Debug
   */
  
  // Debug game
  socket.on("log_game_state", function(args) {
    console.log(ROKUtils.dump(games));
    updateGame();
  });
  
  // Debug players
  socket.on("log_players_state", function(args) {
    console.log(ROKUtils.dump(players));
    updateLobby();
  });
  
  // Quickly create a game for testing purposes.
  socket.on("quick_game", function(args) {
    console.log("Initializing quick game");
    if (Object.keys(players).length < 2) {
      console.log('Two players required');
      socket.emit('lobby_message', "Two players required");
      return;
    }
    
    // Create new game
    var game = newGame(player);
    
    // Invite one other user
    console.log(players);
    for (var p in players) {
      if (players[p].session_id != player.session_id) {
        invitePlayer(player, players[p].socket_id);
        break;
      }
    }
    
    // Confirm game
    confirmGame(socket);
    
    // Select monsters
    var i = 2;
    for (var p in game.players) {
      console.log('game plr ' + p);
      selectMonster(players[p], i);
      i++;
    }
    
  });


  /**
   * Lobby
   */
  
  // Sends the welcome message to a new player.
  socket.emit("welcome", player);
  
  // Handles players leaving the game.
  socket.on('disconnect', function () {
    removePlayer(player);
  });
  
  // Creates a new game and sets the player who created the game as a host.
  socket.on("new_game", function(args) {
    console.log('new_game');
    var game = newGame(player);
  });
  
  // Game host inviting a player to the game.
  socket.on("invite", function(args) {
    console.log("invite-handler");
    console.log(args);
    invitePlayer(player, args.socket_id);
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
    selectMonster(player, args.monster_id);
  });
  
  /**
   * Player rolling dice.
   */
  socket.on("roll_dice", function(args) {
    rollDice(player, args.keep_dice_ids);
  });

  // dice_roll(keep_dice_ids)
  // yield(yield)
  
  // buy(buyable_card_slot)
  // accept_invite
  // reject_invite
});



/**
 * Generates a new random playername and appends it to the global "players" array.
 * Unless the current session already has a player, in which case that player is
 * returned.
 * 
 * @param socket Object The io socket of the current player.
 */
var addPlayer = function(socket, sessid) {
  console.log("addPlayer");
  
  if (typeof players[sessid] != "undefined") {
    players[sessid].socket_id = socket.id;
    return players[sessid];
  }

  var player = {
    name: Moniker.choose(),
    monster_id: 0,
    socket_id: socket.id,
    session_id: sessid,
    game_id: 0,
    mode: ""
  }

  players[sessid] = player;

  return player;
}

/**
 * Starts a new game. Game attributes are as follows:
 *   - id
 *   - host
 *   - host_name
 *   - game_state: Tracks the progress of the preparation of the game.
 *   - turn_phase: Tracks the progress of a single turn taken by a player.
 *   - turn_player: The player whose turn it is at the moment.
 *   - next_input_from_player: Sometimes a player needs to give input outside of
 *     the player's turn. For example, plr A is attacking plr B, and plr B wants
 *     to spend money on rapid healing.
 * 
 * @param player Object The player creating the new game.
 * 
 * @return Object A new game object
 * 
 */
var newGame = function(player) {
  console.log("newGame");
  var game_id = uuid.v4();
  player.game_id = game_id;
  player.mode = "host";
  
  var game_players = {};
  game_players[player.session_id] = player.session_id;
  
  // TODO: randomize initial values for dice
  // TODO: Prepare for extra dice
  // TODO: Make sure the host's session id doesn't leak to client
  var game = {
    id: game_id,
    host: player.session_id,
    host_name: player.name,
    game_state: "lobby",
    turn_phase: "",
    turn_player: "",
    next_input_from_player: "",
    players: game_players,
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
  
  // Generate monsters and save them in the game object.
  for (var i = 0; i < 6; i++) {
    var monster = new Monster(i + 1);
    game.monsters[i] = monster;
  }
  
  game.monsters = ROKUtils.shuffleArray(game.monsters);
  
  games[game_id] = game;
  updateLobby();
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
  // The player controlling this monster.
  this.player = 0;
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
 * Removes a player from the global players array.
 */
var removePlayer = function(player) {
  /*
  console.log('removePlayer');
  var game_id = player.game_id;
  var keys = Object.keys(players);
  for(var i = 0; i < keys.length; i++) {
    var player = players[keys[i]];
    // TODO idenfify by id, not playername
    // TODO: Clean up also from the game object, in game.players and game.monsters
    if(player.name === players[keys[i]].name) {
      delete players[keys[i]];
      updateLobby();
      // If the player was a part of a game, update that game.
      if (game_id) {
        updateGame();
      }
      return;
    }
  }
  */
}


/**
 * Invites a player to join a game.
 * 
 * NOTE: The current implementation doesn't just invite, it automatically adds
 * the player to the game.
 * TODO: Allow the invited player to accept or reject the invite.
 * 
 * @param player Object The player doing the invite.
 * @param socket_id String The socket id of the player being invited.
 */
var invitePlayer = function (player, socket_id) {
  console.log("invitePlayer");
  
  // Check that the current player has created a new game.
  if (player.game_id) {
    console.log("socket_id: " + socket_id);
    // Get game id from current player
    var game_id = player.game_id;
    console.log("game_id: " + game_id);
    // Update game id of invited player
    // TODO make sure the player still exists(?)
    var invitedPlayer = getPlayerBySocketId(socket_id);
    console.log(invitedPlayer);
    invitedPlayer.game_id = game_id;
    invitedPlayer.mode = "client";
    
    // Add the player ids in the game object.
    games[player.game_id].players[invitedPlayer.session_id] = invitedPlayer.session_id;
    
    updateLobby();   
  }
  else {
    console.log('no game error');
    // Notify the player that he needs a game.
    var msg = "Please create a new game before inviting players.";
    console.log(player);
    io.sockets.socket(player.socket_id).emit("lobby_message", msg);
  }
}


/**
 * @param socket_id int The socket id of the player.
 *
 * @return Object The player object whose socket was given.
 */
var getPlayerBySocketId = function(socket_id) {
  console.log("getPlayerBySocketId");
  console.log("  " + socket_id);
  console.log(players);
  var keys = Object.keys(players);
  for (var i = 0; i < keys.length; i++) {
    if (players[keys[i]].socket_id == socket_id) {
      return players[keys[i]];
    }
  }
  return false;
}

/**
 * Updates data on players in the lobby. 
 */
var updateLobby = function() {
  console.log("updateLobby");
  
  arr = [];
  for(var i in players) {
    // TODO: Only push players that are not in a confirmed game.
    arr.push(players[i]);
  }
  
  io.sockets.emit("update_lobby", { players: arr });
}


/**
 * Starts the game with the invited players
 * 
 * @param socket Object The socket for the host player.
 */
var confirmGame = function(socket) {
  console.log("confirmGame");

  var current_player = getPlayerBySocketId(socket.id);
  console.log(current_player);
  
  // Check that the player running this is a host.
  if (current_player.mode == 'host') {
    // Check that there are at least two players in the game
    console.log(games[current_player.game_id]);
    
    if (Object.keys(games[current_player.game_id].players).length >= 2) {
      games[current_player.game_id].game_state = 'select_monsters';
      
      // Randomize player order
      games[current_player.game_id].players = ROKUtils.shuffleArray(games[current_player.game_id].players);
      
      
      // TODO: Update the players list to remove the playing players from the list.
      updateLobby();
      
      // Start the game
      startGame(current_player.game_id);
      // Emit event "update_game" to players in this game     
      updateGame();
    }
    else {
      console.log('not enough players error');
      // Notify the player.
      var msg = "At least two players are needed to play.";
      io.sockets.socket(current_player.socket_id).emit("lobby_message", msg);     
    }
  }
  else {
    console.log('not a host error');
    // Notify the player that he needs to be a host to confirm a game.
    var msg = "Only the host can confirm a game.";
    io.sockets.socket(current_player.socket_id).emit("lobby_message", msg);
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
  // Loop through all players in this game.
  for (var game_player_sessid in games[game_id].players) {
    var target_socket = io.sockets.socket(players[game_player_sessid].socket_id);
    target_socket.emit("start_game");
  }
}

/**
 * Sends the game state to the players belonging to the game.
 * 
 */ 
var updateGame = function() {
  // Get the current game id from the current player's data.
  var current_player = getPlayerBySocketId(current_socket.id);
  var game_id = current_player.game_id;
  console.log("updateGame " + game_id);
  console.log("Current player:");
  console.log(current_player);
    
  var current_game = games[game_id];
  
  // Re-format game players for easier handling on the front end.
  var new_players = [];
  for (var u in current_game.players) {
    var player_object = players[u];
    var new_player = {};
    new_player.socket = player_object.socket_id;
    new_players.push(new_player);
  }
  current_game.formatted_players = new_players;
  
  // TODO: If the game is confirmed, drop any monsters not in play.
  var new_monsters = [];
  for (var i = 0; i < current_game.monsters.length; i++) {
    var new_monster = JSON.parse(JSON.stringify(current_game.monsters[i]));
    new_monsters.push(new_monster);
  }
  current_game.formatted_monsters = new_monsters;
  
  // Loop through all players in this game and send them the data.
  for (var game_player in games[game_id].players) {
    current_game.this_player = game_player;
    var player_object = players[game_player];
    var target_socket = io.sockets.socket(player_object.socket_id);
    target_socket.emit("update_game", current_game);
  }
}

/**
 * Assigns a monster to a player
 *
 * @param player Object A player object.
 */
var selectMonster = function (player, monster_id) {
  // TODO: Make sure the monster isn't selected already
  console.log("selectMonster");
  console.log("player.game_id: " + player.game_id);
  if (games[player.game_id].game_state == "select_monsters") {
    // Check that the player hasn't already selected a monster.
    if (player.monster_id == 0) {
      player.monster_id = monster_id;
      
      setMonsterToPlayer(player.game_id, monster_id, player.session_id);
      
      // If this was the last player to select a monster, advance the game state.
      var game_players = games[player.game_id].players;
      //console.log(game_players);
      var ready = 1;
      for (var game_player in game_players) {
        if (players[game_player].monster_id == 0) {
          ready = 0;
        }
      }
      
      if (ready) {
        console.log(games);
        // TODO: Select the player order randomly.
        games[player.game_id].game_state = 1;
        games[player.game_id].turn_phase = 'r1';
        games[player.game_id].next_input_from_player = 1; // TODO: Do we need this?
      }
      
      updateGame();
    }
    else {
      console.log('already selected error');
      var msg = "You have already selected a monster.";
      io.sockets.socket(player.socket_id).emit("game_message", msg);
    }  
  }
  else {
    console.log('not in monster_selection error');
    var msg = "This is not the time to select a monster.";
    io.sockets.socket(player.socket_id).emit("game_message", msg);   
  }
}


var setMonsterToPlayer = function(game_id, monster_id, session_id) {
  for (var i = 0; i < games[game_id].monsters.length; i++) {
    if (games[game_id].monsters[i].id == monster_id) {
      games[game_id].monsters[i].player = session_id;
    }
  }
}


/**
 * Player rolling dice.
 * 
 * @param keep_dice_ids array The ids of the dice that are not to be
 * re-rolled.
 */
var rollDice = function (player, keep_dice_ids) {
  console.log('rollDice');

  
  // TODO fix player references versus game_state "1"
  
  
  
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
  if (games[player.game_id].turn_phase == 'r1') {
    console.log('state r1');
    // TODO: take into account possible extra dice
    for (var i = 0; i < 6; i++) {
      var r = ROKUtils.getRandomInt(0, 5);
      games[player.game_id].dice[i].value = faces[r];
      if (games[player.game_id].dice[i].state = 'i') {
        // TODO: If there are more re-rolls, set dice states to r.
        games[player.game_id].dice[i].state = 'r';
      }
    }
  }
  
  // TODO: Except for kept dice, which should be kept as k
  // TODO: Otherwise, set dice states to f (final)
  
  // TODO increment game_state
  
  updateGame();
}



