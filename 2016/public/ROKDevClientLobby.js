/**
 * Client side functions for the lobby class.
 *
 * Base class is in ROKLobby.js
 *
 */
ROKLobby.prototype.initClient = function() {
  console.log("ROKLobby.prototype.initClient");
  var lobby = this;

  // Socket event handlers.

  // Make sure the client doesn't try to keep playing with a server that's been
  // reset.
  socket.on('server_has_gone_away', function serverByeBye() {
    $('body').html('<p>The server has gone away. Try reloading the page.</p>');
  });
  
  
  // Welcomes a new player.
  socket.on('welcome', function welcome(data) {
    $('#welcome').html("Welcome to the ROK, <strong>" + data.name + "</strong>");
  });


  // Lobby message
  socket.on('lobby_message', function lobbyMessage(data) {
    console.log('lobbyMessage');
    $('#messages').html(data).show().delay(1500).fadeOut(1000);
  });
  
  
  /**
   * Lobby state update
   */
  socket.on('update_lobby', function updateLobby(data) {
    console.log("updateLobby");
    //console.log(utils.dump(data));
    
    // Update the client side lobby object.
    lobby.players = data.players;
    lobby.this_player_id = data.this_player_id;
    lobby.this_player_mode = data.this_player_mode;
    lobby.this_player_game_id = data.this_player_game_id;
    lobby.this_game_players = data.this_game_players;
    console.log(utils.dump(lobby));
    
    // In case this is being called after a player has left a game:
    $('#lobby').show();
    $('#monster_selection').hide();
    $('#game').hide();


    // Handle lobby button states.
    
    // If a game host has enough players in the game, show confirm_game_button.
    if (lobby.this_player_mode == 'host' && lobby.this_game_players > 1) {
      $('#confirm_game_button').removeClass("hidden");
      $('#confirm_game_button').removeAttr("disabled");
    }
    else {
      $('#confirm_game_button').addClass("hidden");
    }
    
    // If the current player isn't in a game, allow them to create a new game.
    if (!lobby.this_player_game_id) {
      $('#new_game_button').removeClass("hidden");
      $('#new_game_button').removeAttr("disabled");
    }
    else {
      $('#new_game_button').addClass("hidden");
    }
    
    // If the current player is a host, they can cancel the game.
    if (lobby.this_player_mode == "host") {
      $('#cancel_game_button').removeClass("hidden");
      $('#cancel_game_button').removeAttr("disabled");
    }
    else {
      $('#cancel_game_button').addClass("hidden");  
    }    
    
    // Generate the players table.
    var transform = [
        {tag: 'tr', children: [
        {tag: 'td', html: "${name}"},
        {tag: 'td', html: "${mode}"},
        {tag: 'td', html: "${invited_to_game_id}"},
        {tag: 'td', html: "${game_id}"},
        {tag: 'td', children: [
          {
            tag: 'input', 
            type: "button", 
            class: function () {
              var css_class = "player_invite_button";
              // Don't allow inviting players that are already invited. Or 
              // the player himself. Or if the player doesn't have a game.
              if (this.game_id || this.invited_to_game_id || this.id == lobby.this_player_id || !lobby.this_player_game_id) {
                css_class += " hidden";
              }
              return css_class;
            }, 
            value: "Invite", 'data-player_id': "${id}"
          },
        ]},
        {tag: 'td', children: [
          {
            tag: 'input', 
            type: "button", 
            class: function () {
              var css_class = "accept_invite_button";
              // Don't allow accepting invites if there are none, or if the
              // player is in a game already. Or if it's not the player himself.
              if (!this.invited_to_game_id || this.game_id || this.id != lobby.this_player_id) {
                css_class += " hidden";
              }
              return css_class;
            }, 
            value: "Accept", 'data-player_id': "${id}",
          },
        ]},
        {tag: 'td', children: [
          {
            tag: 'input',
            type: "button",
            class: function () {
              var css_class = "decline_invite_button";
              // Don't allow declining invites if there are none, or if the
              // player is in a game already. Or if it's not the player himself.
              if (!this.invited_to_game_id || this.game_id || this.id != lobby.this_player_id) {
                css_class += " hidden";
              }
              return css_class;
            }, 
            value: "Decline", 'data-player_id': "${id}"
          }
        ]}
        ]},

    ];
    
    $('#players table tbody').html('');
    $('#players table tbody').json2html(data.players, transform);
  });
  
  // Start game
  socket.on('start_game', function startGame(data) {
    console.log('dev2 start_game');
    $('#lobby').hide();
    $('#game').show();
  });
  
  
  // UI event handlers.
  
  // Creates a new game, making the player the host for this game.
  $('#new_game_button').on("click", function newGame(){
    console.log('newGame');
    socket.emit("new_game");
    $(this).attr('disabled', true);
  });
  
  // Invite.
  $('#players').on("click", ".player_invite_button", function invitePlayer(){
    console.log('invite clicked');
    socket.emit("invite", $(this).data("player_id"));
  });
  
  // Accept.
  $('#players').on("click", ".accept_invite_button", function acceptInvite(){
    console.log('accept clicked');
    socket.emit("accept");
    $(this).attr('disabled', true);
  });
  
  // Decline.
  $('#players').on("click", ".decline_invite_button", function declineInvite(){
    console.log('decline clicked');
    socket.emit("decline");
    $(this).attr('disabled', true);
  });
  
  // Confirm invited players and start a new game.
  $('#confirm_game_button').on("click", function confirmGame(){
    console.log('confirmGame');
    socket.emit("confirm_game");
    $(this).attr('disabled', true);
  });
  
  // Cancel a game instead of confirming it
  $('#cancel_game_button').on("click", function cancelGame(){
    console.log('cancelGame');
    socket.emit("cancel_game");
    $(this).attr('disabled', true);
  });

}