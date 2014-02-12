var dev_client_2_game_init = function(socket) { 

  // Game state update
  socket.on('update_game', function gameUpdate(data) {
    console.log("dev2 updating game");
    console.log(data);
    console.log(dump(data.updates));
    
    $('#dev2 .lobby').hide();
    $('#dev2 .game').show();
  });
}