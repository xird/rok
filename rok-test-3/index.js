/**
 *
 * FIXME: confirming a game before invitation is accepted jams the game
 *
 * ROKClientGame.js:6: * FIXME If another player snaps status, this player get duplicate rows in monster tables
 *
 * ROKClientGame.js:7: * TODO disable donebuying after click, make sure it gets re-enabled
 * 
 * ROKClientLobby.js:6: * TODO add "leave game" button for invited users
 *
 * ROKServerLobby.js:4: * TODO: For UI reasons (keep the players from jumping up and down in the list),
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

var games = {};
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
    file.serve(request, response);
  }).resume();
}).listen(8080);
// End code for serving static files.


/**
 * Let any clients know that the server has gone away.
 */
process.on('SIGINT', function catchSIGINT() {
  console.log('About to exit.');
  io.sockets.emit("server_has_gone_away");
  process.exit();
});

process.on('uncaughtException', function catchUncaught(e) {
  console.log(e.stack);
  io.sockets.emit("server_has_gone_away");
  process.exit();
});


/**
 * Periodically clean up players that we haven't seen for a while. In other
 * words, 5 seconds. This allows users to accidentally close a browser and 
 * re-open one, or to refresh the browser, while not making others wait too long
 * for players that have actually disconnected.
 */
var cleanUpIdlePlayers = function () {
  //console.log("cleanUpIdlePlayers");
  var now = Date.now();
  var idle_players = [];
  for (var pid in players) {
    var diff = now - players[pid].last_seen;
    if (diff > 5000) {
      idle_players.push(players[pid]);
    }
  }
  
  for (var i = 0; i < idle_players.length; i++) {
    console.log('Cleaning up idle player ' + idle_players[i].name);
    // Remove the player from the lobby
    lobby.removePlayer(idle_players[i].id);
  
    // Remove the player from any game.
    if (idle_players[i].game_id) {
      var player_mode = idle_players[i].mode;
      var game = idle_players[i].getGame();
      game.leaveGame(idle_players[i]);
      
      // If it was the host leaving, drop the other players to the lobby.
      console.log('mode: ' + player_mode);
      if (player_mode == 'host') {
        for (var pid in game.players) {
          game.players[pid].getSocket().emit('lobby_message', "The host has disconnected.");
          game.leaveGame(game.players[pid]);
          lobby.addPlayer(players[pid]);
        }
        lobby.snapState();
      }
      
    }
    
    // Remove the player from the global players object.
    delete players[idle_players[i].id];
    
    lobby.snapState();
  }
  
  // Clean up empty games. If any games ended up without players due to the
  // cleanup, or because the game ended and all the players left, delete those
  // games as well.
  for (var game_id in games) {
    console.log(game_id);
    var game_players = games[game_id].players;
    if (Object.keys(game_players).length == 0) {
      console.log("Deleting empty game");
      delete games[game_id];
      lobby.snapState();
    }
    else {
      console.log("Game still has players");
    }
  }
  
  setTimeout(cleanUpIdlePlayers, 5000);
}
cleanUpIdlePlayers();


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
  console.log(player);
  player.status = "connected";

  // Depending on the user's status, either update the lobby or the game.
  if (player.game_id) {
    console.log('Game state: ' + games[player.game_id].game_state);
    if (games[player.game_id].game_state == 'lobby') {
      lobby.snapState();
    }
    else {
      // The game must be in progress, so dump all the game data.
      // TODO: Only to the player connecting! The others already have/will have
      // the same data.
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
   * A client reporting that it's still there.
   */
  socket.on("keep_alive", function keepAlive() {
    //console.log('keepAlive');
    player.last_seen = Date.now();
  });

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
      console.log('ERROR: Two players required');
      socket.emit('lobby_message', "Two players required");
      return;
    }
    
    if (player.game_id) {
      console.log('ERROR: You already have a game');
      socket.emit('game_message', "You already have a game");
      return;
    }
    
    // Create new game
    var game = new ROKServerGame(player);
    games[game.id] = game;

    // For a quick game, one other user is added to the game without invitation.
    for (var p in players) {
      if (players[p].id != player.id) {
        game.addPlayer(players[p]);
        break;
      }
    }
    
    // Confirm game. If the game can be successfully confirmed, remove the
    // players from the lobby.
    if (game.confirmGame(player)) {
      // TODO is there any need to snap the game state when we're just showing 
      // monster selection?
      game.snapState();
      for (var p in game.players) {
        lobby.removePlayer(p);
      }
      lobby.snapState();
    }
    
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
  

  /**
   * Game host inviting a player to the game.
   * @param Integer invitee_id 
   *   The id of the player being invited.
   *
   */
  socket.on("invite", function lobbyInvite(invitee_id) {
    console.log("lobbyInvite");
    lobby.invitePlayer(player, players[invitee_id]);
    lobby.snapState();
  });
  
  socket.on("accept", function lobbyAccept() {
    console.log("lobbyAccept");
    if (player.inviter_player_id) {
      var inviter = players[player.inviter_player_id];
      var game = games[inviter.game_id];
      player.invited_to_game_id = 0;
      player.inviter_player_id = 0;
      console.log(player);
      game.addPlayer(player);
      lobby.snapState();    
    }
    else {
      console.log("ERROR: There is no invite");
      var msg = "There is no invitation to accept.";
      player.getSocket().emit('lobby_message', msg);      
    }

  });
  
  socket.on("decline", function lobbyDecline() {
    console.log("lobbyDecline");

    var msg = "Your invitation was declined.";
    players[player.inviter_player_id].getSocket().emit('lobby_message', msg);

    player.invited_to_game_id = 0;
    player.inviter_player_id = 0;
        
    lobby.snapState();
  });


  /**
   * Game host confirming invited players and starting the game.
   * 
   * This is left in the main code file since it handles both the game and the
   * lobby object.
   *
   */
  socket.on("confirm_game", function lobbyConfirmGame() {
    console.log("lobbyConfirmGame");
    
    // Check that the player has a game
    if (typeof games[player.game_id] == "object") {
      // If the game can be successfully confirmed, remove the players from the
      // lobby.
      if (games[player.game_id].confirmGame(player)) {
        // TODO: Shouldn't need to snap here, since we're just moving to monster
        // selection?
        games[player.game_id].snapState();
        for (var p in games[player.game_id].players) {
          lobby.removePlayer(p);
        }
        lobby.snapState();
      }
    }
    else {
      console.log("ERROR: Create a game first");
      socket.emit('game_message', "Create a game first.");
    }
  });

  /**
   * Game host canceling the game instead of confirming it.
   * 
   * This is left in the main code file since it handles both the game and the
   * lobby object.
   *
   */
  socket.on("cancel_game", function lobbyCancelGame() {
    console.log('lobbyCancelGame');
    console.log(player);
    console.log(games);
    if (player.mode == "host") {
      var game = games[player.game_id];
      player.mode = "";
      
      // Remove game reference from game players
      for (var pid in game.players) {
        players[pid].game_id = 0;
        // Notify players other than the host about the cancellation.
        if (pid != player.id) {
          players[pid].getSocket().emit('lobby_message', "The host canceled the game.");        
        }

      }

      // Reset invitations of invited players by looping through global players.
      for (var pid in players) {
        players[pid].invited_to_game_id = 0;
        players[pid].inviter_player_id = 0;
      }
      
      // Delete game
      console.log('trying to delete game ' + game.id);
      delete games[game.id];
      
      lobby.snapState();
    }
    else {
      console.log("ERROR: Canceling game hosted by someone else.");
      socket.emit('game_message', "You can only cancel your own games."); 
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


  /**
   * Player is responding to yield question.
   */
  socket.on("resolve_yield", function resolveYield (args) {
    games[player.game_id].resolveYield(args.kyoto, args.yield);
  });


  /**
   * Player is leaving the game.
   */
  socket.on("leave_game", function leaveGame (args) {
    games[player.game_id].leaveGame(player);
    lobby.addPlayer(player);
    lobby.snapState();
  });

  
  // CARDS: buy(buyable_card_slot)
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
      invited_to_game_id: 0,
      inviter_player_id: 0,
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

