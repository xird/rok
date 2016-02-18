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
    $('#welcome').html("Welcome to the ROK, <strong>" + data.name + '</strong>');
    $('#new_name').val(data.name);
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

    $('#lobby #welcome strong').html(data.this_player_name);

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

      // If the current player is in a game that they're not the host of, they
      // can leave the game.
      if (lobby.this_player_mode != "host") {
        $('#leave_invited_game_button').removeClass("hidden");
        $('#leave_invited_game_button').removeAttr("disabled");
      }
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
        //{tag: 'td', html: "${mode}"},
        //{tag: 'td', html: "${invited_to_game_id}"},
        {tag: 'td', html: function(){
          if (this.invited_to_game_id) {
            var seed = this.invited_to_game_id.substring(0,8);
            seed = parseInt(seed, 16).toString(16);
            var myjrag = new JRAG({"hash": seed, "width": 16, "height": 4, "scale": 4});
            return '<script id="jrag_script_' + myjrag.id + '">document.getElementById("jrag_script_' + myjrag.id + '").parentNode.appendChild(window.jrags["' + myjrag.id + '"])</script>';
          }
        }},
        {tag: 'td', html: function(){
          if (this.game_id) {
            var seed = this.game_id.substring(0,8);
            seed = parseInt(seed, 16).toString(16);
            var myjrag = new JRAG({"hash": seed, "width": 16, "height": 4, "scale": 4});
            return '<script id="jrag_script_' + myjrag.id + '">document.getElementById("jrag_script_' + myjrag.id + '").parentNode.appendChild(window.jrags["' + myjrag.id + '"])</script>';
          }
        }},
        //{tag: 'td', html: "${game_id}"},
        {tag: 'td', 'class': 'button', children: [
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
        {tag: 'td', 'class': 'button', children: [
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
        {tag: 'td', 'class': 'button', children: [
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

  // Leave game that you've accepted an invitation on.
  $('#leave_invited_game_button').on("click", function leaveGame(){
    console.log('leave clicked');
    socket.emit("leave_invited_game");
    $(this).attr('disabled', true);
    $(this).addClass("hidden");
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

  // User wants to change their name
  $('#lobby').on("click", "#change_name", function changeName() {
    console.log("Changing name");
    $('#change_name_form').show();
    return false;
  });

  $('#save_new_name').on("click", function saveNewName() {
    var new_name = $(this).parent().find('#new_name').val();
    socket.emit("save_new_name", new_name);
    $(this).parent().hide();
    return false;
  });

}