/**
 * TODO NEXT:
 * - Create a new test directory before deleting any functionality related to dev client 1
 * - Move all possible functions to ROKServerGame
 *
 * - Create a lobbySnap(?) function for dev client 2
 * 
 * TODO: List monsters in monster_order, starting from the monster following the
 *       current player's monster. This leaves the player's monster last, so it
 *       can be rendered separately at the bottom of the screen.
 *
 * TODO: Handle leaving players by keeping their sessions for a while and then
 *       periodically cleaning up idle sessions.
 *
 * TODO: Game state: "over", i.e. win checks
 * 
 * TODO: Design a way to pass currently available actions to front end:
 *   - One object, keys contain all existing actions
 *   - values contain players that can currently take the actions
 *   ..or the actions can be enabled and disabled by the change handler functions.
 *
 */

var http = require('http')
  , path = require('path')
  , connect = require('connect')
  , express = require('express')
  , app = express();

var Moniker = require('moniker');
var uuid = require('node-uuid');

var ROKUtils = require('./rok_utils.js');
var ROKServerGame = require('./rok_server_game.js');

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
app.get('/dev1', function getHandler(req, res) {
  console.log("Page 1 load");
  if (typeof req.session != undefined) {
    var sessid = req.session.id;
  }
  else {
    var sessid = "";
  }
  console.log('  page - SESSION ID: ' + sessid);
  res.render('page.html');
});
app.get('/dev2', function getHandler(req, res) {
  console.log("Page 2 load");
  if (typeof req.session != undefined) {
    var sessid = req.session.id;
  }
  else {
    var sessid = "";
  }
  console.log('  page 2 - SESSION ID: ' + sessid);
  res.render('page2.html');
});

var games = [];
var players = {};

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
 * enters the game (i.e. a player loads the page).
 * 
 * All other event handlers are defined inside this function.
 * 
 */
sessionSockets.on('connection', function defineEventHandlers(err, socket, session) {  
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

  // Create a "current" object in order to pass the current game, player and
  // socket to any called functions.
  if (player.game_id) {
    var current_game = games[player.game_id];
  }
  else {
    var current_game = false;
  }
  var current = {
    player: player,
    socket: socket
  };

  // Depending on the user's status, either update the lobby or the game.
  if (player.game_id) {
    console.log('Game state: ' + games[player.game_id].game_state);
    if (games[player.game_id].game_state == 'lobby') {
      // TODO dc2
      updateLobby();    
    }
    else {
      // The game must be in progress, so dump all the game data.
      games[player.game_id].snapState();
      updateGame(current);
    }
  }
  else {
    // TODO dc2
    updateLobby();  
  }

  // Send the welcome message to a new player.
  socket.emit("welcome", player);

  
  // Define event handlers:  
  /**
   * Debug
   */
  
  // Debug game
  socket.on("log_game_state", function debugGameState(args) {
    console.log(ROKUtils.dump(games));
  });
  
  // Debug players
  socket.on("log_players_state", function debugPlayerState(args) {
    console.log(ROKUtils.dump(players));
  });
  
  // Quickly create a game for testing purposes.
  socket.on("quick_game", function debugQuickGame(args) {
    console.log("Initializing quick game");
    if (Object.keys(players).length < 2) {
      console.log('Two players required');
      socket.emit('lobby_message', "Two players required");
      return;
    }
    
    if (current.player.game_id) {
      console.log('You already have a game');
      socket.emit('game_message', "You already have a game");
      return;
    }
    
    // Create new game
    var game = newGame(current);

    // Invite one other user
    for (var p in players) {
      if (players[p].id != player.id) {
        invitePlayer(current, p);
        break;
      }
    }
    
    // Confirm game
    confirmGame(current);
    
    // Select monsters
    var i = 2;
    for (var p in game.player_ids) {
      // Note: We're manually creating the "current" object, which is hacky, but
      // that's ok since this is for debugging only; normally the players select
      // their own monsters.
      selectMonster(
        {
          player: players[p],
          game: current.game,
          socket: current.socket,
        }, 
        i
      );
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
    var game = newGame(current);
  });
  
  // Game host inviting a player to the game.
  socket.on("invite", function lobbyInvite(args) {
    console.log("invite-handler");
    invitePlayer(current, args.player_id);
  });
  
  // Game host confirming invited players and starting the game.
  socket.on("confirm_game", function lobbyConfirmGame() {
    confirmGame(current);
  });

  /**
   * Game
   */
  
  /**
   * Player selecting a monster to play with.
   */
  socket.on("select_monster", function gameSelectMonster(args) {
    selectMonster(current, args.monster_id);
  });
  
  /**
   * Player rolling dice.
   */
  socket.on("roll_dice", function gameRollDice(args) {
    rollDice(current, args.keep_dice_ids);
  });
  
  /**
   * Player is done buying cards.
   */
  socket.on("done_buying", function gameDoneBuying(args) {
    doneBuying(current);
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
    return player;
  }
  else {
    // This session doesn't have a player yet, so let's create one.
    var player = {
      id: uuid.v4(),
      name: Moniker.choose(),
      monster_id: 0,
      socket_id: socket.id,
      session_id: sessid,
      game_id: 0,
      mode: ""
    }

    players[player.id] = player;

    return player;  
  }
}

/**
 * Starts a new game. 
 * 
 * @param player Object The "current" object.
 * 
 * @return Object A new game object
 * 
 */
var newGame = function(current) {
  console.log("newGame");

  var game = new ROKServerGame();
  
  var game_id = uuid.v4();
  
  game.id = game_id;
  
  current.player.game_id = game_id;
  game.host = current.player.id;
  current.player.mode = "host";
  game.host_name = current.player.name;

  game.players[current.player.id] = current.player;
  game.player_ids[current.player.id] = current.player.id;
  
  for (var i = 0; i < 8; i++) {
    game.dice[i].value = dieRoll();
  }
  
  game.game_state = "lobby";
  game.roll_number = 1;

  // Generate monsters and save them in the game object.
  for (var i = 0; i < 6; i++) {
    var monster = new Monster(i + 1);
    game.monsters[i] = monster;
  }
  
  game.monsters = ROKUtils.shuffleArray(game.monsters);
  
  games[game_id] = game;
  // TODO dc2
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
  // The id of the player controlling this monster.
  this.player_id = 0;
  this.health = 10;
  this.victory_points = 0;
  this.energy = 0;
  this.in_tokyo_city = 0;
  this.in_tokyo_bay = 0;
  this.id = id;
  this.number_of_rolls = 3;
  
  // The name of the monster.
  var monster_names = [
    "Alien",
    "Dragon",
    "Kong",
    "Rabbot",
    "Rex",
    "Squid"
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
        updateGame(current);
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
 * @param current Object The "current" object.
 * @param player_id String The player id of the player being invited.
 */
var invitePlayer = function (current, player_id) {
  console.log("invitePlayer");
  var player = current.player;
  
  // Check that the current player has created a new game.
  if (player.game_id) {
    // Get game id from current player
    var game_id = player.game_id;
    // Update game id of invited player
    var invitedPlayer = players[player_id];
    invitedPlayer.game_id = game_id;
    invitedPlayer.mode = "client";
    
    // Add the player ids in the game object.
    games[player.game_id].player_ids[invitedPlayer.id] = invitedPlayer.id;
    games[player.game_id].players[invitedPlayer.id] = invitedPlayer;
    
    // TODO dc2
    updateLobby();   
  }
  else {
    console.log('no game error');
    // Notify the player that he needs a game.
    var msg = "Please create a new game before inviting players.";
    io.sockets.socket(player.socket_id).emit("lobby_message", msg);
  }
}


/**
 * @param socket_id int The socket id of the player.
 *
 * @return Object The player object whose socket was given.
 */
var getPlayerBySocketId = function(socket_id) {
  //console.log("getPlayerBySocketId " + socket_id);

  var keys = Object.keys(players);
  for (var i = 0; i < keys.length; i++) {
    if (players[keys[i]].socket_id == socket_id) {
      return players[keys[i]];
    }
  }
  return false;
}


/**
 * @return Object The current player.
 */
var getCurrentPlayer = function(current) {
  return getPlayerBySocketId(current.socket.id);
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
  
  io.sockets.emit("update_lobby", { player_ids: arr });
}


/**
 * Starts the game with the invited players
 * 
 * @param current Object The "current" object.
 */
var confirmGame = function(current) {
  console.log("confirmGame");
  var current_player = current.player;
  
  // Check that the player running this is a host.
  if (current_player.mode == 'host') {
    // Check that there are at least two players in the game    
    if (Object.keys(games[current_player.game_id].players).length >= 2) {
      games[current_player.game_id].updateState("game_state", "select_monsters");
      games[current_player.game_id].game_state = 'select_monsters';
            
      // TODO: Update the players list to remove the playing players from the list.
      // TODO dc2
      updateLobby();
      
      // Send the game status change
      updateGame(current);
      games[current_player.game_id].sendStateChanges();
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
var beginGame = function(current, game_id) {
  console.log('beginGame ' + game_id);
  var game = games[game_id];
  game.game_state = 'play';

  // Drop any monsters not in play.
  var played_monsters = [];
  for (var p in game.player_ids) {
    played_monsters.push(players[p].monster_id);
  }
  console.log(played_monsters);
  var new_monsters = [];
  for (var i = 0; i < game.monsters.length; i++) {
    if (played_monsters.indexOf(game.monsters[i].id) != -1) {
      new_monsters.push(game.monsters[i]);
    }
  }
  game.monsters = new_monsters;
  
  // Randomize monster order
  var monster_order = [];
  for (var player_id in games[current.player.game_id].player_ids) {
    monster_order.push(players[player_id].monster_id);
  }
  monster_order = ROKUtils.shuffleArray(monster_order);
  game.monster_order = monster_order;
  
  // Note: We skip the "start" phase of the turn, since there's nothing to do
  // in the beginning of the turn at the start of the game.
  game.turn_phase = 'roll';
  game.turn_monster = game.monster_order[0];
  game.next_input_from_monster = game.monster_order[0];
  
  // Loop through all players in this game.
  for (var game_player_id in games[game_id].player_ids) {
    var target_socket = io.sockets.socket(players[game_player_id].socket_id);
    target_socket.emit("start_game");
  }
}

/**
 * Dev client 1
 *
 * Sends the game state to the players belonging to the game.
 *
 * This is the original function used to send the data to dev client 1. Dev 
 * client 2 uses two separate methods: game.snapState() and 
 * game.sendStateChanges()
 * 
 */ 
var updateGame = function(current) {
  console.log("updateGame");
  //console.log(getCurrentGame(current));
  var current_player = current.player;
  var current_game = getCurrentGame(current);
  var game_id = current_game.id;  
  
  // Loop through all players in this game and send them the data.
  for (var game_player_id in games[game_id].player_ids) {
    current_game.this_monster = players[game_player_id].monster_id;
    var player_object = players[game_player_id];
    var target_socket = io.sockets.socket(player_object.socket_id);
    target_socket.emit("update_game", current_game);
  }
}


/**
 * Assigns a monster to a player
 *
 * @param player Object The player selecting a monster.
 * @param monster_id Integer The id of the monster being selected
 *
 */
var selectMonster = function (current, monster_id) {
  // TODO: Make sure the monster isn't selected already
  console.log("selectMonster");
  var player = current.player;
  if (games[player.game_id].game_state == "select_monsters") {
    // Check that the player hasn't already selected a monster.
    if (player.monster_id == 0) {
      player.monster_id = monster_id;
      
      setMonsterToPlayer(player.game_id, monster_id, player.id);
      
      // If this was the last player to select a monster, advance the game state.
      var game_player_ids = games[player.game_id].player_ids;
      var ready = 1;
      for (var game_player_id in game_player_ids) {
        if (players[game_player_id].monster_id == 0) {
          ready = 0;
        }
      }
      
      if (ready) {
        // Start the game
        beginGame(current, getPlayerBySocketId(current.socket.id).game_id);
        games[player.game_id].snapState();
      }
      
      updateGame(current);
      games[player.game_id].sendStateChanges();
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


var setMonsterToPlayer = function(game_id, monster_id, player_id) {
  for (var i = 0; i < games[game_id].monsters.length; i++) {
    if (games[game_id].monsters[i].id == monster_id) {
      games[game_id].monsters[i].player_id = player_id;
    }
  }
}


/**
 * Player rolling dice.
 * TODO:
 *       - take cards into account
 *         - bg dweller
 *     - Number of rerolls defaults to two, but:
 *       - Check if there are cards that give (optional) rerolls
 *       - Not all rerolls affect all dice (reroll any "3"s for example)
 *
 * @param keep_dice_ids array The ids of the dice that are not to be
 * re-rolled.
 */
var rollDice = function (current, keep_dice_ids) {
  console.log('rollDice');

  var player = current.player;
  var game = getCurrentGame(current);
  var monster = getMonster(current, player.monster_id);
      
  // TODO only roll the not-kept dice.
  if (game.game_state == 'play') {
    console.log('  state play');
    if (game.turn_phase == 'roll') {
      console.log('    phase roll');
      if (game.turn_monster == player.monster_id) {
        console.log("It's this monster's turn");
        if (game.roll_number <= monster.number_of_rolls) {
          console.log('      monster has rolls');
          // TODO: take into account possible extra dice
          for (var i = 0; i < 6; i++) {
            console.log('Rolling');
            var roll = dieRoll();
            game.updateState("dice__" + i + "__value", roll, "Die " + i + " was rolled to " + roll);
            game.dice[i].value = roll;
            // If there are no more re-rolls, set dice states to f.
            if (game.roll_number == monster.number_of_rolls) {
              game.updateState("dice__" + i + "__state", 'f');
              game.dice[i].state = 'f';
            }
            else {
              // If there are more rerolls, set dice to "r", except for kept
              // dice, which should be kept as "k".
              if (game.dice[i].state != 'k') {
                game.updateState("dice__" + i + "__state", "r");
                game.dice[i].state = 'r';
              }
            }
          }
          if (game.roll_number < monster.number_of_rolls) {
            // TODO testing if the direct edits are needed anymore
            //game.roll_number++;
            var new_roll_number = game.roll_number + 1;
            console.log('new: ' + new_roll_number);
            game.updateState("roll_number", new_roll_number);
            console.log('      incremented roll number to ' + game.roll_number);
          }
          else {
            // Advance to next turn phase: resolve
            console.log('      calling resolveDice');
            updateGame(current);
            game.sendStateChanges();
            resolveDice(current);
          }

        }
        else {
          console.log('      monster out of rolls');
        }
      }
      else {
        console.log("Not this monster's turn");
        current.socket.emit("game_message", "It's not your turn to roll");
      }
    }
    else {
      console.log('    not roll phase');
      current.socket.emit('game_message', "Not roll phase.");
    }
  }
  else {
    current.socket.emit('game_message', "Game not being played.");
  }
  
  updateGame(current);
  
  console.log('sending changes end of func');
  game.sendStateChanges();
}


/**
 * Resolves the results of the dice rolls after all the rerolls are done.
 *
 */
var resolveDice = function(current) {
  console.log('resolveDice');
  var game = getCurrentGame(current);
  
  // TODO testing if needed
  //game.turn_phase = 'resolve';
  //game.roll_number = 1;
  game.updateState("turn_phase", 'resolve');
  game.updateState("roll_number", 1);
  
  // TODO resolve money dice
  //     - increment money
  //       - and take cards into account
  //         - "Friend of children"
  
  // Resolve attack dice.
  var damage = 0;
  // TODO take into account extra dice ("Extra head" card)
  for (var i = 0; i < 6; i++) {
    // TODO check dice attr format
    if (game.dice[i] == "P") {
      damage++;
    }
  }
  
  var target_monsters = [];
  if (true) {
    // If the attacking monster is in Kyoto, target all monsters outside Kyoto.
  }
  else {
    // If the attacking monster is not in Kyoto, target all monsters in Kyoto.  
  }
  // TODO targets defined in an array, loop through and:
  for (var i = 0; i < target_monsters.length; i++) {
    //     - decrement target health
    //       - not forgetting cards
    //         - extra damage cards
    //         - cards with damage reactions "lightning armor"
    //     - check if anyone died
    //       - check win
    //       - check any cards that react to deaths
    //     - damaged monster in Kyoto?
    //       - Yield input
    //         - Increment VP
    //       - Figure out card "Jets" - decrement health and then restore, or don't decrement
    //         - Must do the latter, otherwise death might be triggered  
  }

  
  // TODO: Resolve VP dice
  //     - Add rolled numbers to VPs
  //       - Take number roll modifier cards into account
  //     - TODO: players should be allowed to resolve dice in any order
  
  // Reset dice states
  for (var i = 0; i < 6; i++) {
    game.updateState("dice__" + i + "__state", 'i');
    game.dice[i].state = "i";
  }
  
  updateGame(current);
  game.sendStateChanges();
  
  // TODO probably can't call this directly
  buyCards(current);
}


/**
 * Moves the game to the turn phase where the user can buy cards.
 *
 * TODO:
 *     - Optionally buy cards if there's money
 *       - "Alien metabolism"
 *     - Resolve any discard cards
 *       - check win
 */
var buyCards = function(current) {
  var game = getCurrentGame(current);
  game.turn_phase = 'buy';
  game.updateState("turn_phase", 'buy');
  updateGame(current);
  game.sendStateChanges();
}


/**
 * User has chosen not to buy any cards or has no money to buy anything.
 */
var doneBuying = function(current) {
  // Check that it's this player's turn
  var game = getCurrentGame(current);
  if (game.turn_phase == 'buy') {
    if (game.turn_monster == current.player.monster_id) {
      endTurn(current);
      updateGame(current);
      game.sendStateChanges();
    }
    else {
      console.log('Not this user\'s turn');
      current.socket.emit('game_message', "It's not your turn."); 
    }  
  }
  else {
    console.log('Not buying phase');
    current.socket.emit('game_message', "It's not the buying phase.");
  }
}


/**
 * Move to the final phase of a user's turn.
 */
var endTurn = function(current) {
  console.log('endTurn');
  var game = getCurrentGame(current);
  game.turn_phase = 'end';
  game.updateState("turn_phase", 'end');
    
  // TODO Do all the turn-end related processing.
  /**
   *     - Resolve poison counters
   *       - TODO: Check if this is done on the poisoned monster's turn or the poisoning monster's turn
   */
  
  // Advance to the next player's turn.
  game.turn_phase = 'start';
  game.updateState("turn_phase", 'start');
  
  var current_monster_index = game.monster_order.indexOf(game.turn_monster);
  var next_monster_index = current_monster_index + 1;
  if (typeof game.monster_order[next_monster_index] == 'undefined') {
    next_monster_index = 0;
  }
  
  game.turn_monster = game.monster_order[next_monster_index];
  game.next_input_from_monster = game.monster_order[next_monster_index];
  game.updateState("turn_monster", game.monster_order[next_monster_index]);
  game.updateState("next_input_from_monster", game.monster_order[next_monster_index]);
    
  // TODO resolve all start-of-turn things
  /**
   *     - Beginning of a player's turn
   *     - If in Kyoto, increment VP
   *     - Resolve card effects
   *       - Urbavore
   */
  updateGame(current);
  game.sendStateChanges();
  
  // Note that we want to separately send turn start changes, then advance to
  // "roll" phase, and send changes again.
  
  game.turn_phase = 'roll';
  game.updateState("turn_phase", 'roll');
  updateGame(current);
  game.sendStateChanges();
}

/**
 * Returns the currently played game object
 */
var getCurrentGame = function(current) {
  //console.log('getCurrentGame with socket ' + current.socket.id);
  var player = getPlayerBySocketId(current.socket.id);
  return games[player.game_id];
}

/**
 * @param monster_id int The id of the monster needed.
 *
 * @return Object A monster object
 *
 */
var getMonster = function(current, monster_id) {
  console.log('getMonster ' + monster_id);
  var p = getPlayerBySocketId(current.socket.id);
  for(var m in games[p.game_id].monsters) {
    if (games[p.game_id].monsters[m].id == monster_id) {
      return games[p.game_id].monsters[m];
    }
  }
}

/**
 * @return String A randome die face.
 */
var dieRoll = function () {
  var faces = [
    1,
    2,
    3,
    'P',
    'H',
    'E'
  ];
  var r = ROKUtils.getRandomInt(0, 5);
  return faces[r];
}

