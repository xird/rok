/**
 * Server side functionality for the lobby.
 */
 
var util = require('util');

// Inheritance related code:
var ROKLobby = require('./public/ROKLobby.js');
var ROKServerLobby = function() {
  ROKLobby.apply(this, arguments);
}
util.inherits(ROKServerLobby, ROKLobby);


/**
 * New players connecting are automatically added to the lobby using this
 * function
 */
ROKServerLobby.prototype.init = function () {
  console.log('ROKServerLobby.prototype.init');
}


/**
 * New players connecting are automatically added to the lobby using this
 * function
 */
ROKServerLobby.prototype.addPlayer = function (player) {
  console.log('ROKServerLobby.prototype.addPlayer');
  this.players.push(player);
  this.player_ids.push(player.id);
}


/**
 *
 */
ROKServerLobby.prototype.snapState = function () {
  console.log('ROKServerLobby.prototype.snapState');

  arr = [];
  for(var i in this.players) {
    // TODO: Only push players that are not in a confirmed game.

    arr.push(this.players[i]);
  }
  
  io.sockets.emit("update_lobby", { players: arr });
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
ROKServerLobby.prototype.invitePlayer = function (inviter, invitee) {
  console.log("ROKServerLobby.prototype.invitePlayer");
  
  // Check that the inviter has created a new game.
  if (inviter.game_id) {
    // Add the player in the game object.
    inviter.getGame().addPlayer(invitee);
  }
  else {
    console.log('no game error');
    // Notify the player that he needs a game.
    var msg = "Please create a new game before inviting players.";
    io.sockets.socket(player.socket_id).emit("lobby_message", msg);
  }
}

module.exports = ROKServerLobby;
