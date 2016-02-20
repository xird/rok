/**
 * This is the main server file that sets up servers for the pages, static files
 * and the socket connections.
 *
 * This would be the "C" in the MVC model, more or less.
 *
 * This file takes the user input and makes the appropriate calls to the game
 * object. The game object shouldn't know anything about any user interactions.
 *
 * Likewise, this file should not have any game-specific code, apart from
 * passing the socket requests to the correct game object methods.
 *
 */

var socketIo = require('socket.io');
var http     = require('http');
var express  = require('express');
var expressCookieParser = require('cookie-parser');
var expressSession = require('express-session');
var Moniker = require('moniker');
var uuid = require('node-uuid');

var viewspath = __dirname + '/views/';

var ROKUtils = require('./public/ROKUtils.js');
var ROKServerGame = require('./ROKServerGame.js');
var ROKServerLobby = require('./ROKServerLobby.js');
var ROKConfig = require('./ROKConfig.js');

var PORT = process.env.PORT || 8080,
    HOST = process.env.HOST || '127.0.0.1';

var games = {};
var players = {};
var lobby = new ROKServerLobby();
var utils = new ROKUtils();

var app = express();
app.set('view engine', 'ejs');

// Serving static files from the "/public" directory
app.use(express.static('public'));

// Set up session support for the app.
var EXPRESS_SID_KEY = 'connect.sid';
var COOKIE_SECRET = 'very secret string';
var cookieParser = expressCookieParser(COOKIE_SECRET);
var FileStore = require('session-file-store')(expressSession);
app.use(cookieParser);
var session = expressSession({
  //rolling: true,
  store: new FileStore({
    'path': __dirname + '/tmp/sessions'
    //'reapInterval': 10
  }),
  resave: true,
  saveUninitialized: false,
  secret: COOKIE_SECRET,
  name: EXPRESS_SID_KEY,
});
app.use(session);

/**
 * Session Initializer. Sets the user ids in the session data.
 *
 */
app.use(function (req, res, next) {
  utils.log("SESS INIT, uid: " + req.session.uid);
  utils.log(req.session);
  var uid = req.session.uid;
  if (!uid) {
    utils.log("  setting uuid");
    req.session.uid = uuid.v4();
  }

  next();
})

// Serves the main client
app.get('/', function (req, res) {
  utils.log('MAIN, uid: ' + req.session.uid);
  res.render(viewspath + "client", {
    "hostname": req.headers.host
  });
});

// Serves the debugging client
app.get("/dev",function(req, res){
  res.render(viewspath + "dev_client", {
    "hostname": req.headers.host
  });
});

// Serves the "disconnected" notification
app.get("/disconnected",function(req, res){
  res.render(viewspath + "disconnected", {
    "hostname": req.headers.host
  });
});

// 404 Handler, needs to be the last path
app.use("*",function(req, res, next){
  res.statusCode = 404;
  res.render(viewspath + "404", {
    "hostname": req.headers.host
  });
});


// Create HTTP server
server = http.createServer(app);
server.listen(PORT, HOST, null, function() {
  utils.log('Server listening at ' + this.address().address + ":" + this.address().port + " in " + app.settings.env + " mode.");
});

// Create and start the Socket.io server
var io = socketIo({});
io.listen(server);

// Pass the iosocket object to the lobby
lobby.iosockets = io.sockets.sockets;

/**
 * Pass session information to socket.io requests.
 *
 **/
io.use(function(socket, next) {
  utils.log("IO.USE");

  // The user should always have a cookie by now.
  if(!socket.request.headers.cookie) {
    utils.log("No cookie");
    // The bots can't work with this in place, and it doesn't _seem_ to cause
    // problems for the browser clients, either. -E
    //return next(new Error('No cookie transmitted.'));
  }

  // Make the session available for socket requests.
  // http://stackoverflow.com/questions/23494016/socket-io-and-express-4-sessions
  var req = socket.handshake;
  var res = {};
  cookieParser(req, res, function(err) {
    if (err) {
      return next(err);
    }
    session(req, res, next);
  });
});


/**
 * Let any clients know that the server has gone away.
 */
process.on('SIGINT', function catchSIGINT() {
  utils.log('About to exit.');
  io.sockets.emit("server_has_gone_away");
  process.exit();
});

process.on('uncaughtException', function catchUncaught(e) {
  utils.log(e.stack);
  io.sockets.emit("server_has_gone_away");
  process.exit();
});

/**
 * Generates a new random playername and appends it to the global "players" array.
 * Unless the current session already has a player, in which case that player is
 * returned.
 *
 * @param socket Object The io socket of the current player.
 */
var addPlayer = function(socket, sessid) {
  utils.log("addPlayer");

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
        return io.sockets.sockets[this.socket_id];
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
  if (player) {
    player.status = "disconnected";
  }
}


/**
 * Periodically clean up players that we haven't seen for a while. In other
 * words, 5 seconds. This allows users to accidentally close a browser and
 * re-open one, or to refresh the browser, while not making others wait too long
 * for players that have actually disconnected.
 *
 * Note: At least on Mavericks/Safari and Mavericks/Firefox, leaving the browser
 * open but in the background (i.e. some other application has focus) causes the
 * browser to eventually start sending the keep_alive messages at intervals less
 * than 2 seconds, even though that's what's set in the setInterval() function
 * call on the client side. There is extra error handling for that, namely the
 * added die() call in this function, and the "zombie" checks and nuking in the
 * keep_alive event handler.
 *
 */
var cleanUpIdlePlayers = function () {
  var now = Date.now();
  utils.log("cleanUpIdlePlayers " + new Date().getSeconds());
  var idle_players = [];
  utils.log("All players:");
  for (var pid in players) {
    utils.log("  " + players[pid].name + " : " + players[pid].status + ", " + players[pid].last_seen);
    var diff = now - players[pid].last_seen;
    if (diff > 5000) {
      idle_players.push(players[pid]);
    }
  }

  for (var i = 0; i < idle_players.length; i++) {
    utils.log('Cleaning up idle player ' + idle_players[i].name);
    var idle_socket = idle_players[i].getSocket();
    // Remove the player from the lobby
    lobby.removePlayer(idle_players[i].id);

    // Remove the player from any game.
    if (idle_players[i].game_id) {
      var player_mode = idle_players[i].mode;
      var game = idle_players[i].getGame();
      game.leaveGame(idle_players[i]);

      // If it was the host leaving, drop the other players to the lobby.
      utils.log('mode: ' + player_mode);
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

    // Tell the client to disconnect, so the "player" variable set up in the
    // connect event handler won't stick around.
    if (typeof idle_socket != "undefined") {
      idle_socket.emit('die');
    }

    //utils.log("Deleted idle player, players now:");
    //utils.log(players);
    lobby.snapState();
  }

  // Clean up empty games. If any games ended up without players due to the
  // cleanup, or because the game ended and all the players left, delete those
  // games as well.
  for (var game_id in games) {
    var game_players = games[game_id].players;
    if (Object.keys(game_players).length == 0) {
      utils.log("Deleting empty game");
      delete games[game_id];
      lobby.snapState();
    }
  }

  setTimeout(cleanUpIdlePlayers, 5000);
}
if (ROKConfig.clean_up_idle_players) {
  cleanUpIdlePlayers();
}


/**
 * Handle incoming socket connections.
 *
 * Main event handler for the "connection" event. This is triggered when a new
 * player enters the game (i.e. a player loads the page).
 *
 * All other event handlers are defined inside this function.
 *
 */
io.on('connection', function (socket) {
  var iosockets = this;

  utils.log("SOCKET CONN");
  // Make sure that the user has initialized a session.
  if (!socket.handshake.session) {
    utils.log("ERROR: User has no session.");
    // TODO: Make sure to notify the client that things are not cool
    return;
  }
  var session = socket.handshake.session;
  var sessid = session.id;

  utils.log("session id: " + session.id);
  utils.log("session uid: " + session.uid);

  // Create a new player (returns an existing player if one exists for this
  // session).
  var player = addPlayer(socket, sessid);
  //utils.log(player);
  player.status = "connected";

  // Depending on the user's status, either update the lobby or the game.
  if (player.game_id) {
    utils.log('Game state: ' + games[player.game_id].game_state);
    if (games[player.game_id].game_state == 'lobby') {
      lobby.snapState();
    }
    else {
      // The game must be in progress, so dump all the game data. Send only to
      // the player connecting, since the others already have/will have the same
      // data.
      games[player.game_id].snapState(player.id);
    }
  }
  else {
    lobby.snapState();
  }

  // Send the welcome message to a new player.
  socket.emit("welcome", player);


  // BEGIN SOCKET EVENT HANDLERS HERE:






  // Define event handlers:

  /**
   * A client reporting that it's still there.
   */
  socket.on("keep_alive", function keepAlive() {
    if (player == null) {
      // This zombie has been nuked already, but the client is still sticking
      // around for some reason. It probably didn't get the "die" message, or
      // doesn't know that it's meant to die when it gets it. Send it again,
      // just in case.
      utils.log("Zombie still kicking around");
      socket.emit("die");
    }
    else if (typeof players[player.id] == 'undefined') {
      // The "player" variable keeps the idle player in existence even though
      // it's been removed from the global "players" array. So, in case we're
      // dealing with a zombie, get rid of it:
      utils.log("Nuking zombie " + player.name);
      player = null;
    }
    else {
      // Everything is ok, the player hasn't been removed.
      var now = Date.now();
//      utils.log('keeping ' + player.name +' alive at ' + new Date().getSeconds());
      player.last_seen = now;
    }

  });

  /**
   * Debug
   */
  // Kill a monster
  socket.on("kill_monster", function killMonster() {
    console.log("Kill Monster");
    if (ROKConfig.allow_kill_monster) {
      var game = games[player.game_id];
      var monster_id_to_kill = game.monster_order[0];
      game.monsters[monster_id_to_kill].applyDamage(100);
      game.sendStateChanges();
    }
  });

  // Debug game
  socket.on("log_lobby_state", function debugLobbyState() {
    utils.log(utils.dump(lobby));
  });

  // Debug game
  socket.on("log_game_state", function debugGameState() {
    utils.log(utils.dump(games));
  });

  // Debug players
  socket.on("log_players_state", function debugPlayerState() {
    utils.log("debugPlayerState");
    utils.log(utils.dump(players));
  });

  // Quickly create a game for testing purposes.
  socket.on("quick_game", function debugQuickGame(args) {
    utils.log("Initializing quick game");
    if (Object.keys(players).length < 2) {
      utils.log('ERROR: Two players required');
      socket.emit('lobby_message', "Two players required");
      return;
    }

    if (player.game_id) {
      utils.log('ERROR: You already have a game');
      socket.emit('game_message', "You already have a game");
      return;
    }

    // Create new game
    var game = new ROKServerGame(player);
    game.iosockets = iosockets.sockets;
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

  // Quickly create a three player game for testing purposes.
  socket.on("quick_game_3", function debugQuickGame3(args) {
    utils.log("Initializing quick game for three players");
    if (Object.keys(players).length < 3) {
      utils.log('ERROR: Three players required');
      socket.emit('lobby_message', "Three players required");
      return;
    }

    if (player.game_id) {
      utils.log('ERROR: You already have a game');
      socket.emit('game_message', "You already have a game");
      return;
    }

    // Create new game
    var game = new ROKServerGame(player);
    game.iosockets = iosockets.sockets;
    games[game.id] = game;

    // For a quick game, one other user is added to the game without invitation.
    var more = true;
    for (var p in players) {
      if (players[p].id != player.id) {
        game.addPlayer(players[p]);
        if (!more) {
          break;
        }
        more = false;
      }
    }

    // Confirm game. If the game can be successfully confirmed, remove the
    // players from the lobby.
    if (game.confirmGame(player)) {
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
    if (player) {
      utils.log('DISCONNECT player ' + player.name);
      removePlayer(player);
    }
  });


  // Creates a new game and sets the player who created the game as a host.
  socket.on("new_game", function lobbyNewGame(args) {
    utils.log('new_game');
    var game = new ROKServerGame(player);
    game.iosockets = iosockets.sockets;
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
    utils.log("lobbyInvite");
    lobby.invitePlayer(player, players[invitee_id]);
    lobby.snapState();
  });

  socket.on("accept", function lobbyAccept() {
    utils.log("lobbyAccept");
    if (player.inviter_player_id) {
      var inviter = players[player.inviter_player_id];
      var game = games[inviter.game_id];
      player.invited_to_game_id = 0;
      player.inviter_player_id = 0;
      utils.log(player);
      game.addPlayer(player);
      lobby.snapState();
    }
    else {
      utils.log("ERROR: There is no invite");
      var msg = "There is no invitation to accept.";
      player.getSocket().emit('lobby_message', msg);
    }

  });

  socket.on("decline", function lobbyDecline() {
    utils.log("lobbyDecline");

    var msg = "Your invitation was declined.";
    players[player.inviter_player_id].getSocket().emit('lobby_message', msg);

    player.invited_to_game_id = 0;
    player.inviter_player_id = 0;

    lobby.snapState();
  });

  socket.on("leave_invited_game", function lobbyDecline() {
    utils.log("lobbyLeaveInvitedGame");
    games[player.game_id].leaveGame(player);
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
    utils.log("lobbyConfirmGame");

    // Check that the player has a game
    if (typeof games[player.game_id] == "object") {
      // If the game can be successfully confirmed, remove the players from the
      // lobby.
      if (games[player.game_id].confirmGame(player)) {
        // This is the first game state snap. In this case, showing the monsters
        // to be selected.
        games[player.game_id].snapState();
        for (var p in games[player.game_id].players) {
          lobby.removePlayer(p);
        }
        lobby.snapState();
      }
    }
    else {
      utils.log("ERROR: Create a game first");
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
    utils.log('lobbyCancelGame');
    utils.log(player);
    utils.log(games);
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
      utils.log('trying to delete game ' + game.id);
      delete games[game.id];

      lobby.snapState();
    }
    else {
      utils.log("ERROR: Canceling game hosted by someone else.");
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
    games[player.game_id].rollDiceClicked(player, keep_dice_ids);
  });


  /**
   * Player done rolling dice.
   */
  socket.on("done_rolling_dice", function gameDoneRollingDice() {
    games[player.game_id].doneRollingClicked(player);
  });


  /**
   * Player buys a card.
   */
  socket.on("buy_card", function gameBuyCard(available_card_index) {
    games[player.game_id].buyCard(player, available_card_index);
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


  /**
   * Player changes their name.
   */
  socket.on("save_new_name", function saveNewName(new_name) {
    var new_name = new_name.replace(/[^a-zA-Z0-9-_]/g, "");
    player.name = new_name;
    lobby.snapState();
  })
});

