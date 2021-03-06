/**
 * Server side functionality for the lobby.
 *
 */

var util = require('util');

// Inheritance related code:
var ROKLobby = require('./public/ROKLobby.js');
var ROKServerLobby = function() {
  ROKLobby.apply(this, arguments);
}
util.inherits(ROKServerLobby, ROKLobby);

var ROKUtils = require("./public/ROKUtils.js");
var utils = new ROKUtils();


/**
 * New players connecting are automatically added to the lobby using this
 * function
 */
ROKServerLobby.prototype.init = function () {
  utils.log('ROKServerLobby.prototype.init');
}


/**
 * New players connecting are automatically added to the lobby using this
 * function
 */
ROKServerLobby.prototype.addPlayer = function (player) {
  utils.log('ROKServerLobby.prototype.addPlayer');
  this.players[player.id] = player;
  this.player_ids.push(player.id);
}


/**
 * Remove player from lobby, either because they started a game or because they
 * haven't been seen for a while and were cleaned up because of that.
 *
 * @param Integer player_id The id of the player being removed.
 *
 */
ROKServerLobby.prototype.removePlayer = function (player_id) {
  utils.log('ROKServerLobby.prototype.removePlayer');

  // Remove from player_ids
  var index = this.player_ids.indexOf(player_id);
  if (index > -1) {
    this.player_ids.splice(index, 1);
  }

  // Remove from players
  delete this.players[player_id];
}


/**
 *
 */
ROKServerLobby.prototype.snapState = function () {
  utils.log('ROKServerLobby.prototype.snapState');

  send_object = {
    this_player_id: "",
    players: []
  };
  for(var pid in this.players) {
    var send_player = {};
    send_player.id = this.players[pid].id;
    send_player.name = this.players[pid].name;
    send_player.game_id = this.players[pid].game_id;
    send_player.invited_to_game_id = this.players[pid].invited_to_game_id;
    send_player.status = this.players[pid].status;
    send_object.players.push(send_player);
  }

  // Loop through all players in the lobby and send them the data.
  for (var pid in this.players) {
    send_object.this_player_id = pid;
    send_object.this_player_name = this.players[pid].name;
    send_object.this_player_game_id = this.players[pid].game_id;
    send_object.this_player_mode = this.players[pid].mode;
    // The current number of players in the current player's game:
    if (typeof this.players[pid].getGame() == 'object') {
      send_object.this_game_players = Object.keys(this.players[pid].getGame().players).length;
    }
    else {
      send_object.this_game_players = 0;
    }

    var player_object = this.players[pid];
    var socket_id = player_object.socket_id;
    var target_socket = this.iosockets[socket_id];
    if (typeof target_socket != "undefined") {
      target_socket.emit("update_lobby", send_object);
    }
    else {
      utils.log("ERROR: target socket not found. Socket id: " + socket_id);
      utils.log("Sockets:");
      utils.log(this.iosockets);
    }
  }
}


/**
 * Invites a player to join a game.
 *
 * @param Object inviter The player inviting the other one
 * @param Object invitee The player being invited
 */
ROKServerLobby.prototype.invitePlayer = function (inviter, invitee) {
  utils.log("ROKServerLobby.prototype.invitePlayer");

  // Check that the inviter has created a new game.
  if (inviter.game_id) {
    // Check that the invitee isn't in a game already.
    if (!invitee.game_id) {
      // Check that the invitee doesn't have an outstanding invitation.
      if (!invitee.invited_to_game_id) {
        invitee.invited_to_game_id = inviter.getGame().id;
        invitee.inviter_player_id = inviter.id;
        utils.log('invitation success. invitee:');
        utils.log(invitee);
      }
      else {
        // Can't invite a player that's already invited
        utils.log('ERROR: player already invited');
        var msg = "That player has an outstanding invitation.";
        this.iosockets[inviter.socket_id].emit("lobby_message", msg);
      }
    }
    else {
      // Can't invite a player that's already in a game
      utils.log('ERROR: player already in a game');
      var msg = "That player is already in a game.";
      this.iosockets[inviter.socket_id].emit("lobby_message", msg);
    }
  }
  else {
    // Notify the player that he needs a game.
    utils.log('ERROR: no game created');
    var msg = "Please create a new game before inviting players.";
    this.iosockets[inviter.socket_id].emit("lobby_message", msg);
  }
}

module.exports = ROKServerLobby;
