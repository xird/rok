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
  socket.on('server_has_gone_away', function () {
    $('body').html('<p>The server has gone away. Try reloading the page.</p>');
  });
  
  // Welcomes a new player.
  socket.on('welcome', function (data) {
    $('#welcome').html("Welcome to the ROK, <strong>" + data.name + "</strong>");
  });


  // Lobby message
  socket.on('lobby_message', function (data) {
    console.log('dev2 lobby message received');

    $('#messages').html(data).show().delay(1500).fadeOut(1000);
  });
  
  
  /**
   * Lobby state update
   */
  socket.on('update_lobby', function (data) {
    console.log("dev2 updating lobby");
    
    lobby.players = data.players;
    lobby.player_ids = data.player_ids;
    
    $('#lobby').show();
    $('#game').hide();
    
    var transform = [
      {tag: 'tr', children: [
    	{tag: 'td', html: "${name}"},
      {tag: 'td', html: "${mode}"},
      {tag: 'td', html: "${game_id}"},
      {tag: 'td', children: [
    	  {tag: 'input', type: "button", class: "player_invite_button", value: "Invite", 'data-player_id': "${id}"}
	      ]},
      ]}
    ];
    
    $('#players').html('<table><thead><tr><th>Name</th><th>Mode</th><th>Game</th></tr></thead><tbody></tbody></table>');
    $('#players table tbody').json2html(data.players, transform);
  });
  
  // Start game
  socket.on('start_game', function (data) {
    console.log('dev2 start_game');
    $('#dev2 .lobby').hide();
    $('#dev2 .game').show();
  });
  
  // UI event handlers.
  
  // Creates a new game, making the player the host for this game.
  $('#new_game').on("click", function(){
    console.log('dev2 new_game clicked');
    socket.emit("new_game");
  });
  
  // Invite.
  $('#players').on("click", ".player_invite_button", function(){
    console.log('dev2 invite');
    socket.emit("invite", $(this).data("player_id"));
  });
  
  // Confirm invited players and start a new game.
  $('#confirm_game').on("click", function(){
    console.log('dev2 confirm_game');
    socket.emit("confirm_game");
  });

}