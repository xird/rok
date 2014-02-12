var dev_client_2_lobby_init = function(socket) { 
  // Socket event handlers.

  // Make sure the client doesn't try to keep playing with a server that's been
  // reset.
  socket.on('server_has_gone_away', function () {
    $('body').html('<p>The server has gone away. Try reloading the page.</p>');
  });
  
  // Welcomes a new player.
  socket.on('welcome', function (data) {
    //console.log(data);
    $('#dev2 .welcome').html("Welcome to the ROK, <strong>" + data.name + "</strong>");
  });
  
  // Lobby message
  socket.on('lobby_message', function (data) {
    console.log('lobby message received');
    console.log(data);
    $('#dev2 .messages').html(data).show().delay(1500).fadeOut(1000);
  });
  
  // Lobby state update
  socket.on('update_lobby', function (data) {
    console.log("updating lobby");
    
    $('#dev2 .lobby').show();
    $('#dev2 .game').hide();
    
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
    
    $('#dev2 .players').html('<table><thead><tr><th>Name</th><th>Mode</th><th>Game</th></tr></thead><tbody></tbody></table>');
    $('#dev2 .players table tbody').json2html(data.players, transform);
  });
  
  // Start game
  socket.on('start_game', function (data) {
    console.log('start_game');
    $('#dev2 .lobby').hide();
    $('#dev2 .game').show();
  });
  
  // UI event handlers.
  
  // Creates a new game, making the player the host for this game.
  $('#dev2 .new_game').on("click", function(){
    console.log('new_game');
    socket.emit("new_game");
  });
  
  // Invite.
  $('#dev2 .players').on("click", ".player_invite_button", function(){
    console.log('invite');
    socket.emit("invite", {player_id: $(this).data("player_id")});
  });
  
  // Confirm invited players and start a new game.
  $('#dev2 .confirm_game').on("click", function(){
    console.log('confirm_game');
    socket.emit("confirm_game");
  });
}