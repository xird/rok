/**
 * The server side version of the Game class, which inherits the base Game
 * class.
 *
 */

// Inheritance related code:
var ROKGame = require('./public/rok_game.js');
var util = require('util');
var ROKServerGame = function() {
  ROKGame.apply(this, arguments);
}
util.inherits(ROKServerGame, ROKGame);


// Adding the server side methods:

/**
 * Updates attributes in the Game object. This is used instead of updating the
 * attributes directly in order to automatically keep the "updates" attribute
 * up-to-date.
 *
 * @param String field 
 *   The attribute of the Game object to be updated. This is a string
 *   representation in format ATTRIBUTE__ID__ATTRIBUTE, for multi-level
 *   attributes, so it needs to be sliced before the actual game object can be
 *   updated.
 *   
 * @param Mixed value 
 *   The new value of the attribute
 *
 * @param String log Optional 
 *   A log message to be shown to the players related to this update, if any.
 * 
 * TODO: Allow sending a log message without field or value.
 */
ROKServerGame.prototype.updateState = function(field, value, log) {
  console.log("ROKServerGame.prototype.updateState");
  
  // First, do the actual update;
  // The field needs to be given as a string, but the game object has a
  // hierarchical structure; The string needs to be sliced down to parts so
  // we can update the correct attribute.
  var parts = field.split("__");
  
  if (parts.length == 1) {
    this[parts[0]] = value;
  }
  else if (parts.length == 3) {
    this[parts[0]][parts[1]][parts[2]] = value;
  }
  else {
    console.log("WTF? Field:");
    console.log(field);
    exit();
  }
  
  // Then, we generate an update object so we can pass information about this
  // state change to the front end. This could be done in the above loop, but
  // that would just get too confusing.
  var handler_parts = [];
  var id = "";
  for (var i = 0; i < parts.length; i++) {
    if (isNaN(parts[i])) {
      // If the part is not numeric, we'll add it to the client side handler
      // function's name:
      handler_parts.push(parts[i]);
    }
    else {
      // If it's a number, it must be the id for an element.
      id = parts[i];
    }
  }
  
  if (handler_parts.length) {
    var handler = "handle__" + handler_parts.join("__");  
  }
  else {
    handler = "";
  }
  
  this.updates.push({
    element: field,
    value: value,
    handler: handler,
    id: id,
    log: (log ? log : ""),
  });
}


/**
 * Sends the whole game state to the client. The client should update all of the
 * UI without the handler functions, i.e. "snap" all the data on screen. This is
 * used at the very beginning of the game.
 */
ROKServerGame.prototype.snapState = function() {
  console.log("ROKServerGame.prototype.snapState");
  
  // TODO: Don't send "this", as that contains more data than we want on the
  // client side. Create a new object which does not contain the following
  // fields:
  /*
  updates
  players
  player_ids (probably not needed?)
  id
  host
  host_name
  
  monster.player (probably not needed?)
  monster.number_of_rolls (only used on the server side)
  
  */
  
  // Loop through all players in this game and send them the data.
  for (var game_player_id in this.players) {
    this.this_monster = this.players[game_player_id].monster_id;
    var player_object = this.players[game_player_id];
    var target_socket = io.sockets.socket(player_object.socket_id);
    target_socket.emit("snap_state", this);
  }
  
  // Clean up the change log, as all the changes have now been transmitted.
  this.updates = [];
}


/**
 * Sends game state changes to the clients. The changes should be animated by
 * the client. This is used when the game is in progress.
 */
ROKServerGame.prototype.sendStateChanges = function() {
  console.log("ROKServerGame.prototype.sendStateChanges");
  // Loop through all players in this game and send them the data.
  for (var game_player_id in this.players) {
    var this_monster = this.players[game_player_id].monster_id;
    var player_object = this.players[game_player_id];
    var target_socket = io.sockets.socket(player_object.socket_id);
    
    var send_object = {
      updates: this.updates,
      this_monster: this_monster
    };

    target_socket.emit("state_changes", send_object);
  }
  
  // Clean up the change log, as all the changes have now been transmitted.
  this.updates = [];
}


module.exports = ROKServerGame;
