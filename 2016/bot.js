/**
 * ROKBot
 *
 */

var io = require('socket.io-client');
var socket = io.connect('http://127.0.0.1:8080', {reconnect: true});

var tried_monsters = 0;

var monster_ids = {
  "Alien": 1,
  "Dragon": 2,
  "Kong": 3,
  "Rabbot": 4,
  "Rex": 5,
  "Squid": 6
};

var monster_traits = {
  "1": {
    "health_limit_for_yield": 7,
  },
  "2": {
    "health_limit_for_yield": 5,
  },
  "3": {
    "health_limit_for_yield": 4,
  },
  "4": {
    "health_limit_for_yield": 9,
  },
  "5": {
    "health_limit_for_yield": 6,
  },
  "6": {
    "health_limit_for_yield": 8,
  },
};

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
      if (data.players[i].invited_to_game_id && !data.players[i].game_id) {
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
    tried_monsters = 0;
    console.log("select_monsters, increment tried_monsters from " + tried_monsters);
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
  console.log("select_monster(): Trying to select monster #" + tried_monsters);
  socket.emit("select_monster", tried_monsters);
}

/**
 * Basically just handles the error message telling the bot that the selected
 * monster isn't available, and makes the bot try the next one.
 */
socket.on("game_message", function(data) {
  console.log("game_message");
  tried_monsters++;
  if (tried_monsters <= 6) {
    console.log("  Trying to select monster #" + tried_monsters);
    socket.emit("select_monster", tried_monsters);
  }
});


/**
 * Handle updates to game state while game is underway.
 */
socket.on('state_changes', function(updates_wrapper) {
  var updates = updates_wrapper.updates;
  console.log("State changes, monster id " + game.this_monster_id);

  if (updates.length == 0) {
    return false;
  }

  for (var i = 0; i < updates.length; i++) {
    var update = updates[i];

    var parts = update.element.split("__");

    if (parts.length == 1) {
      game[parts[0]] = update.value;
    }
    else if (parts.length == 3) {
      game[parts[0]][parts[1]][parts[2]] = update.value;
    }
    else {
      console.log("WTF? Element:");
      console.log(update.element);
      exit();
    }

    //game[update.element] = update.value;
    console.log("Updating " + update.element + " to " + update.value);
  }

  if (game.game_state == "over") {
    console.log("  Leaving game...");
    socket.emit("leave_game");
    return;
  }
  else if (game.game_state == "select_monsters") {
    console.log("state_changes(): select_monsters");
    // Try selecting all the monsters in order; one of them should be available.
    //tried_monsters++;
    //setTimeout(select_monster, 1000);
  }
  else if (game.game_state == "play") {
    if (game.next_input_from_monster == this_monster_id) {
      console.log("  Doing stuff...");

      setTimeout(doStuff, 2000);
    }
    else {
      console.log("  It's not my turn.");
    }
  }
  else {
    console.log("    I don't know what to do in game state " + game.game_state)
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
    var yield = false;
    console.log("Health current: " + game.monsters[this_monster_id].health + ", limit " + monster_traits[this_monster_id].health_limit_for_yield);
    if (game.monsters[this_monster_id].health < monster_traits[this_monster_id].health_limit_for_yield) {
      yield = true;
    }

    console.log("    I'm " + (yield ? " yielding!" : " staying!") + socket.id);
    if (game.monster_in_kyoto_city_id == this_monster_id) {
      var part = "city";
    }
    else if (game.monster_in_kyoto_bay_id == this_monster_id) {
      var part = "bay";
    }
    else {
      console.log("ERROR! I'm not in the city nor the bay! I'm in " + part);
      die();
    }
    socket.emit("resolve_yield", {kyoto: part, yield: yield});
  }
  else {
    console.log("    I don't know what to do in phase " + game.turn_phase)
  }
}