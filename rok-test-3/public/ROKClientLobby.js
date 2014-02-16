/**
 * Client side functions for the lobby class.
 *
 * Base class is in ROKLobby.js
 *
 * TODO only show confirm_game_button when there are enough players in the game.
 * TODO disable new game button once invitation is accepted
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
    
    lobby.players = data.players;
    lobby.this_player_id = data.this_player_id;
    lobby.this_player_game_id = data.this_player_game_id;
    
    $('#lobby').show();
    $('#game').hide();
    
    //console.log(utils.dump(data));
    
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
    $('#dev2 .lobby').hide();
    $('#dev2 .game').show();
  });
  
  
  // UI event handlers.
  
  // Creates a new game, making the player the host for this game.
  $('#new_game_button').on("click", function newGame(){
    console.log('newGame');
    $('#new_game_button').addClass('hidden');
    $('#confirm_game_button').removeClass('hidden');
    $('#cancel_game_button').removeClass('hidden');
    $('#cancel_game_button').removeAttr('disabled');
    socket.emit("new_game");
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
  });
  
  // Decline.
  $('#players').on("click", ".decline_invite_button", function declineInvite(){
    console.log('decline clicked');
    socket.emit("decline");
  });
  
  // Confirm invited players and start a new game.
  $('#confirm_game_button').on("click", function confirmGame(){
    console.log('confirmGame');
    socket.emit("confirm_game");
  });
  
  // Cancel a game instead of confirming it
  $('#cancel_game_button').on("click", function cancelGame(){
    console.log('cancelGame');
    socket.emit("cancel_game");

    $('#new_game_button').removeClass('hidden');
    $('#confirm_game_button').addClass('hidden');
    $('#cancel_game_button').addClass('hidden');
  });

}