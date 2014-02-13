/**
 * Main client side game code for dev client 2.
 */
var dev_client_2_game_init = function(socket) { 
  var game = new ROKGame();

  // Game state snap
  socket.on('snap_state', function snapState(data) {
    console.log("dev2 snapping game state");
    //console.log(dump(data));
    
    if (data.game_state == "select_monsters") {
      $('#dev2 .lobby').hide();
      $('#dev2 .game').hide();
      $('#dev2 .monster_selection').show();
      // TODO currently selected monsters should probably be highlighted.
    }
    else {
      $('#dev2 .lobby').hide();
      $('#dev2 .monster_selection').hide();
      $('#dev2 .game').show();
    
      // Write initial values to all UI elements.
      // TODO: monster_order should define the order the monster ids are laid out
      //       in the UI.
      $('#this_monster').html(data.this_monster);
      $('#game_state').html(data.game_state);
      $('#turn_phase').html(data.turn_phase);
      $('#turn_monster').html(data.turn_monster);
      $('#next_input_from_monster').html(data.next_input_from_monster);
      $('#roll_number').html(data.roll_number);
      $('#monster_order').html(dump(data.monster_order));
      for (var i = 0; i < data.monsters.length; i++) {
        $('#monster__' + data.monsters[i].id + '__health').html(data.monsters[i].health);
        $('#monster__' + data.monsters[i].id + '__victory_points').html(data.monsters[i].victory_points);
        $('#monster__' + data.monsters[i].id + '__energy').html(data.monsters[i].energy);
        $('#monster__' + data.monsters[i].id + '__in_tokyo_city').html(data.monsters[i].in_tokyo_city);
        $('#monster__' + data.monsters[i].id + '__in_tokyo_bay').html(data.monsters[i].in_tokyo_bay);
        $('#monster__' + data.monsters[i].id + '__name').html(data.monsters[i].name);
      }
      for (var i = 0; i < data.dice.length; i++) {
        $('#dice__' + i + '__value').html(data.dice[i].value);
        $('#dice__' + i + '__state').html(data.dice[i].state);
      }    
    }
  });
  
  
  /**
   * Update game state changes to the UI.
   */
  socket.on('state_changes', function stateChanges(data) {
    console.log("dev2 received game state changes");
    console.log(dump(data.updates));
    
    game.handleUpdates(data.updates);
  });
  
  // Game message
  socket.on('game_message', function (data) {
    console.log('dev2 game message received');
    $('#dev2 .messages').html(data).show().delay(1500).fadeOut(1000);
  });
  
  // UI event handlers
  
  $("#dev2 .monster_select_button").on("click", function() {
    console.log('dev2 select monster ' + $(this).data('monster_id'));
    socket.emit("select_monster", {monster_id: $(this).data('monster_id')});
  });
  
  // Roll dice.
  $('#dev2 .game').on("click", ".roll_dice_button", function(){
    console.log('dev2 roll_dice');
    // TODO: Define dice to keep
    socket.emit("roll_dice", {keep_dice_ids: []});
  });
  
  // Finish buying cards.
  $('#dev2 .game').on("click", ".done_buying_button", function(){
    console.log('dev2 done buying');
    socket.emit("done_buying");
  });
}