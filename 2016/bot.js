/**
 * ROKBot
 *
 */

var io = require('socket.io-client');
var socket = io.connect('http://127.0.0.1:8080', {reconnect: true});

socket.on('connect', function() {
  console.log('Socket connected');
  console.log(this.id);
});

// Keep pinging the server so we don't get cleaned up.
setInterval(function (){socket.emit('keep_alive');}, 2000);

var game = {};
var this_monster = 0;

// TODO: Always accept invites.
socket.on('update_lobby', function(data) {
  //console.log(data);
});


socket.on('snap_state', function(data) {
  console.log("Snap state, " + this.id);
  game = data;
  this_monster = data.this_monster;
  console.log(game);
  if (game.turn_monster == game.this_monster) {
    console.log("  Doing stuff...");

    // A small timeout makes it easier to follow what the bot is doing.
    setTimeout(doStuff, 2000);
  }
  else {
    console.log("  It's not my turn.");
  }
});

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
    socket.emit("leave_game");
    return;
  }

  if (game.next_input_from_monster == this_monster) {
    console.log("  Doing stuff...");

    setTimeout(doStuff, 2000);
  }
  else {
    console.log("  It's not my turn.");
  }
});

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
    if (game.monster_in_kyoto_city_id == this_monster) {
      var part = "city";
    }
    else if (game.monster_in_kyoto_city_id == this_monster) {
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