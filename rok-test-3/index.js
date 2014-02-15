/**
 *
 * TODO: Cleanup disconnected players who haven't been seen for a while.
 *
 * TODO: Terminate game-button
 *       - Delete the game object
 *       - Reset players' game reference
 *       - Add players to lobby
 *
 * TODO: Game state: "over", i.e. win checks
 *
 */

var http = require('http')
  , path = require('path')
  , connect = require('connect')
  , express = require('express')
  , app = express();

var Moniker = require('moniker');
var uuid = require('node-uuid');

var ROKUtils = require('./public/ROKUtils.js');
var ROKServerGame = require('./ROKServerGame.js');
var ROKServerLobby = require('./ROKServerLobby.js');

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

// The ROKServerGame class needs the sockets so it can send data to the clients.
// This should probably be cleaned up somehow.
global.io = io;

var SessionSockets = require('session.socket.io')
  , sessionSockets = new SessionSockets(io, sessionStore, cookieParser);

/**
 * Main page handler. This is run first, the loaded page then creates the
 * socket connection.
 */
app.get('/', function getHandler(req, res) {
  console.log("Client page load");
  if (typeof req.session != undefined) {
    var sessid = req.session.id;
  }
  else {
    var sessid = "";
  }
  console.log('Client page load - SESSION ID: ' + sessid);
  res.render('client.html');
});

var games = [];
var players = {};
var lobby = new ROKServerLobby();
var utils = new ROKUtils();

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
/*
process.on('exit', function () {
  console.log('About to exit.');
  io.sockets.emit("server_has_gone_away");
  process.exit();
});
*/

process.on('uncaughtException', function(e) {
  console.log(e.stack);
  io.sockets.emit("server_has_gone_away");
  process.exit();
});


/**
 * Event handler for the "connection" event. This is triggered when a new player
 * enters the game (i.e. a player loads the page).
 * 
 * All other event handlers are defined inside this function.
 * 
 */
sessionSockets.on('connection', function onConnection(err, socket, session) {
  console.log('onConnection');

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
  player.status = "connected";

  // Depending on the user's status, either update the lobby or the game.
  if (player.game_id) {
    console.log('Game state: ' + games[player.game_id].game_state);
    if (games[player.game_id].game_state == 'lobby') {
      lobby.snapState();
    }
    else {
      // The game must be in progress, so dump all the game data.
      games[player.game_id].snapState();
    }
  }
  else {
    lobby.snapState();
  }

  // Send the welcome message to a new player.
  socket.emit("welcome", player);

  
  // Define event handlers:  
  /**
   * Debug
   */
  
  // Debug game
  socket.on("log_lobby_state", function debugLobbyState() {
    console.log(utils.dump(lobby));
  });
  
  // Debug game
  socket.on("log_game_state", function debugGameState() {
    console.log(utils.dump(games));
  });
  
  // Debug players
  socket.on("log_players_state", function debugPlayerState() {
    console.log("debugPlayerState");
    console.log(utils.dump(players));
  });
  
  // Quickly create a game for testing purposes.
  socket.on("quick_game", function debugQuickGame(args) {
    console.log("Initializing quick game");
    if (Object.keys(players).length < 2) {
      console.log('Two players required');
      socket.emit('lobby_message', "Two players required");
      return;
    }
    
    if (player.game_id) {
      console.log('You already have a game');
      socket.emit('game_message', "You already have a game");
      return;
    }
    
    // Create new game
    var game = new ROKServerGame(player);
    games[game.id] = game;

    // Invite one other user
    for (var p in players) {
      if (players[p].id != player.id) {
        lobby.invitePlayer(player, players[p]);
        break;
      }
    }
    
    // Confirm game
    game.confirmGame(player);
    
    // Select monsters
    var i = 2;
    for (var p in game.player_ids) {
      game.selectMonster(players[p], i);
      i++;
    }
  });

  /**
   * Lobby
   */
  
  // Handles players leaving the game.
  socket.on('disconnect', function lobbyRemovePlayer() {
    removePlayer(player);
  });
  
  
  // Creates a new game and sets the player who created the game as a host.
  socket.on("new_game", function lobbyNewGame(args) {
    console.log('new_game');
    var game = new ROKServerGame(player);
    games[game.id] = game;
    lobby.snapState();
  });
  
  //
  /**
   * Game host inviting a player to the game.
   * @param Integer player_id 
   *   The id of the player being invited.
   *
   */
  socket.on("invite", function lobbyInvite(invitee_id) {
    console.log("invite-handler");
    lobby.invitePlayer(player, players[invitee_id]);
    lobby.snapState();
  });


  /**
   * Game host confirming invited players and starting the game.
   */
  socket.on("confirm_game", function lobbyConfirmGame() {
    console.log("lobbyConfirmGame");
    if (games[player.game_id].confirmGame(player)) {
      games[player.game_id].snapState();
      // Remove playing players from the lobby.
      for (var p in games[player.game_id].players) {
        console.log('removing player ' + p + ' from lobby');
        lobby.removePlayer(p);
      }
    }
  });


  /**
   * Game
   */
  
  /**
   * Player selecting a monster to play with.
   */
  socket.on("select_monster", function gameSelectMonster(monster_id) {
    games[player.game_id].selectMonster(player, monster_id);
  });


  /**
   * Player rolling dice.
   */
  socket.on("roll_dice", function gameRollDice(keep_dice_ids) {
    games[player.game_id].rollDice(player, keep_dice_ids);
  });


  /**
   * Player is done buying cards.
   */
  socket.on("done_buying", function gameDoneBuying(args) {
    games[player.game_id].doneBuying(player);
  });


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
  
  // Get player by session id
  for (var p in players) {
    if (players[p].session_id == sessid) {
      var player = players[p];
    }
  }
  
  if (typeof player != "undefined") {
    // Existing player, update the socket reference.
    player.socket_id = socket.id;
    player.last_seen = Date.now();
    return player;
  }
  else {
    // This session doesn't have a player yet, so let's create one. Note the 
    // getSocket() and getGame() functions, which are there instead of direct
    // references to the objects, in order to avoid circular references.
    var player = {
      id: uuid.v4(),
      name: Moniker.choose(),
      monster_id: 0,
      socket_id: socket.id,
      getSocket: function() {
        return io.sockets.socket(this.socket_id);
      },
      session_id: sessid,
      game_id: 0,
      mode: "",
      getGame: function() {
        return games[this.game_id]
      },
      last_seen: Date.now(),
      status: "connected",
    }
    
    // Add the new player to the global players array.
    players[player.id] = player;
    
    // Add the new player to the lobby:
    lobby.addPlayer(player);

    return player;  
  }
}


/**
 * Removes a player from the global players array.
 */
var removePlayer = function(player) {
  player.status = "disconnected";
}
