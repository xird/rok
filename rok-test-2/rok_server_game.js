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
  // Generate a reference to a game object attribute by starting with a 
  // reference to the game...
  var field_reference = this;
  // .. and then looping our field parts, always adding one more level to the
  // reference:
  for (var i = 0; i < parts.length; i++) {
    field_reference =  field_reference[parts[i]];
  }
  // If "field" was "monsters__2__health", "field_reference" now contains a 
  // a reference to the game object's monsters array's second object's health
  // attribute.
  //
  // I'm not sure if this is neat or confusing or both.
  console.log(parts);
  console.log(field_reference);
  this[field_reference] = value;
  
  
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
  // Loop through all players in this game and send them the data.
  for (var game_player_id in this.players) {
    var this_monster = this.players[game_player_id].monster_id;
    var player_object = this.players[game_player_id];
    var target_socket = io.sockets.socket(player_object.socket_id);
    target_socket.emit("state_changes", {updates: this.updates, this_monster: this_monster});
  }
  
  // Clean up the change log, as all the changes have now been transmitted.
  this.updates = [];
}


module.exports = ROKServerGame;
