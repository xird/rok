/**
 * Client side functions for the game class.
 *
 * Base class is in ROKGame.js
 *
 */
ROKGame.prototype.initClient = function() {
  console.log("ROKGame.prototype.initClient");
  var game = this;

  // Socket event handlers.

  /**
   * Game state snap
   */
  socket.on('snap_state', function snapState(data) {
    console.log("dev2 snapping game state");
    
    game.game_state = data.game_state;
    game.turn_phase = data.turn_phase;
    game.turn_monster = data.turn_monster;
    game.next_input_from_monster = data.next_input_from_monster;
    game.roll_number = data.roll_number;
    game.monster_order = data.monster_order;
    game.monsters = data.monsters;
    game.dice = data.dice;
    game.this_monster = data.this_monster;
    
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
      $('#monster_order').html(utils.dump(data.monster_order));
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

    game.handleUpdates(data.updates);
  });


  /**
   * Game message
   */
  socket.on('game_message', function (data) {
    console.log('dev2 game message received');
    $('#dev2 .messages').html(data).show().delay(1500).fadeOut(1000);
  });


  // UI event handlers
  
  // Monster selection
  $("#dev2 .monster_select_button").on("click", function() {
    console.log('dev2 select monster ' + $(this).data('monster_id'));
    socket.emit("select_monster", $(this).data('monster_id'));
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

/**
 * Main game data update handler.
 *
 * @param Array updates
 *   This array contains a number of "update" objects.
 *
 *   Each "update" object contains four fields:
 *   - element: The id of the DOM element that should receive the new value.
 *   - value: The new value of the element.
 *   - handler: If a function by this name exists, that should be called instead
 *     of updating the DOM directly.
 *   - id: In case there are multiple elements of the same type (monsters, 
 *     dice), this id defines which one we're updating.
 *   - log: A log message to be shown to users.
 *
 */
ROKGame.prototype.handleUpdates = function(updates) {
  console.log("Handle updates");
  for (var i = 0; i < updates.length; i++) {
    var update = updates[i];
    
    if (update.log) {
      this.addToLog(update.log);    
    }
console.log(utils.dump(update));
    console.log(update.handler);
    if (typeof this[update.handler] == "function") {
      // TODO FIXME monsters!
      // If we get an update with a multipart element, that means we _must_ have
      // a handler function for it in order to update the game object.
      this[update.handler](update.value, update.id);
    }
    else if (update.element) {
      game[update.element] = update.value;
      $("#" + update.element).html(update.value);
    }
  }
}

ROKGame.prototype.addToLog = function(str) {
  // TODO
}

/**
 * TODO Monster selection HTML needs to be randomly generated on state change.
 */
ROKGame.prototype.handle__game_state = function(new_state) {
  console.log("ROKGame.prototype.handle__game_state to " + new_state);
  switch (new_state) {
    case "select_monsters":
      $("#dev2 .lobby").hide();
      $("#dev2 .monster_selection").show();
      break;
    case "play":
      $("#dev2 .monster_selection").hide();
      $("#dev2 .game").show();
      break;
  }
}

ROKGame.prototype.handle__dice__state = function(new_state, id) {
  game.dice[id].state = new_state;
  $("#dice__" + id + "__state").html(new_state);
}

ROKGame.prototype.handle__dice__value = function(new_value, id) {
  game.dice[id].value = new_value;
  $("#dice__" + id + "__value").html(new_value);
}