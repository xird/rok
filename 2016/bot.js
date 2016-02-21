/**
 * ROKBot
 *
 */

var io = require('socket.io-client');
var socket = io.connect('http://127.0.0.1:8080', {reconnect: true});

var tried_monsters = 0;

socket.on('connect', function() {
  console.log('Socket connected');
  console.log(this.id);
});

// Keep pinging the server so we don't get cleaned up.
setInterval(function (){socket.emit('keep_alive');}, 2000);

var game = {};
var this_monster_id = 0;

/**
 * In the lobby, the bot always accepts invites.
 */
socket.on('update_lobby', function(data) {
  for (var i = 0; i < data.players.length; i++) {
    if (data.players[i].id == data.this_player_id) {
      // Currently looped player is this bot
      if (data.players[i].invited_to_game_id) {
        socket.emit("accept");
      }
    }
  }
});


/**
 * Handle state snap when the game starts.
 */
socket.on('snap_state', function(data) {
  console.log("Snap state, " + this.id);
  game = data;
  this_monster_id = data.this_monster_id;

  if (game.game_state == "play") {
    if (game.turn_monster == game.this_monster_id) {
      console.log("  Doing stuff...");

      // A small timeout makes it easier to follow what the bot is doing.
      setTimeout(doStuff, 2000);
    }
    else {
      console.log("  It's not my turn.");
    }
  }
  else if (game.game_state == "select_monsters") {
    // Try selecting all the monsters in order; one of them should be available.
    tried_monsters++;
    setTimeout(select_monster, 1000);
  }
  else {
    console.log("    I don't know what to do in game state " + game.game_state)
  }
});


/**
 *
 */
function select_monster() {
  socket.emit("select_monster", tried_monsters);
}

/**
 * Basically just handles the error message telling the bot that the selected
 * monster isn't available, and makes the bot try the next one.
 */
socket.on("game_message", function(data) {
  tried_monsters++;
  if (tried_monsters <= 6) {
    socket.emit("select_monster", tried_monsters);
  }
});


/**
 * Handle updates to game state while game is underway.
 */
socket.on('state_changes', function(updates_wrapper) {
  var updates = updates_wrapper.updates;
  console.log("State changes, " + this.id);

  if (updates.length == 0) {
    return false;
  }

  for (var i = 0; i < updates.length; i++) {
    var update = updates[i];
    game[update.element] = update.value;
    console.log("Updating " + update.element + " to " + update.value);
  }

  if (game.state == "over") {
    console.log("  Leaving game...");
    socket.emit("leave_game");
    return;
  }

  if (game.next_input_from_monster == this_monster_id) {
    console.log("  Doing stuff...");

    setTimeout(doStuff, 2000);
  }
  else {
    console.log("  It's not my turn.");
  }
});


/**
 * If onStateChanges() decides that it's our turn to do something, do something.
 */
function doStuff() {
  if (game.turn_phase == "roll") {
    console.log("    Let's roll some dice... " + socket.id);
    socket.emit("roll_dice", []);
  }
  else if (game.turn_phase == "buy") {
    console.log("    I'm done buying cards. " + socket.id);
    socket.emit("done_buying");
  }
  else if (game.turn_phase == "yield_kyoto") {
    console.log("    I'm yielding! " + socket.id);
    if (game.monster_in_kyoto_city_id == this_monster_id) {
      var part = "city";
    }
    else if (game.monster_in_kyoto_city_id == this_monster_id) {
      var part = "bay";
    }
    else {
      console.log("ERROR! I'm yielding but I'm not in the city nor the bay!");
      die();
    }
    socket.emit("resolve_yield", {kyoto: part, yield: true});
  }
  else {
    console.log("    I don't know what to do in phase " + game.turn_phase)
  }
}