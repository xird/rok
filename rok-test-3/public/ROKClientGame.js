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
    
    if (data.game_state == "lobby") {
      $('#lobby').show();
      $('#monster_selection').hide();    
      $('#game').hide();
    }
    else if (data.game_state == "select_monsters") {
      $('#lobby').hide();
      $('#monster_selection').show();
      $('#game').hide();
      
      // Randomize the order of the monster select buttons.
      var monster_select_buttons = JSON.stringify(utils.shuffleArray([{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, ]));
      
      var transforms = {
        'monster_select_buttons': [
          {tag: "input", type: "button", id: "monster_select_button_${id}", class: "monster_select_button", "data-monster_id": "${id}", value: "Select ${id}"}
        ],
      }
     
      $('#monster_select_buttons').json2html(monster_select_buttons, transforms.monster_select_buttons);
    }
    else {
      $('#lobby').hide();
      $('#monster_selection').hide();
      $('#game').show();
    
      // Write initial values to all UI elements.
      $('#this_monster').html(data.this_monster);
      $('#game_state').html(data.game_state);
      $('#turn_phase').html(data.turn_phase);
      $('#turn_monster').html(data.turn_monster);
      $('#next_input_from_monster').html(data.next_input_from_monster);
      $('#roll_number').html(data.roll_number);
      $('#monster_order').html(utils.dump(data.monster_order));
      
      // Place monsters starting from the monsters that's next in sequence from
      // the current player's monster. That one is shown on the top slot.
      var own_monster_index = game.monster_order.indexOf(game.this_monster);
      var first_monster_index = own_monster_index + 1;
      if (first_monster_index == game.monster_order.length) {
        first_monster_index = 0;
      }
      
      var monsters_placed = 0;
      var index = first_monster_index;
      while (monsters_placed < game.monster_order.length) {
        console.log('Placing monster index ' + index + ", id " + game.monster_order[index]);
        // TODO clean up to use transforms
        var html = '      <tr>\
        <th>Monster ' + game.monster_order[index] + '</th>\
        <td id="monsters__' + game.monster_order[index] + '__health"></td>\
        <td id="monsters__' + game.monster_order[index] + '__victory_points"></td>\
        <td id="monsters__' + game.monster_order[index] + '__energy"></td>\
        <td id="monsters__' + game.monster_order[index] + '__in_tokyo_city"></td>\
        <td id="monsters__' + game.monster_order[index] + '__in_tokyo_bay"></td>\
        <td id="monsters__' + game.monster_order[index] + '__name"></td></tr>';
                
        index++;
        monsters_placed++;
        if (index == game.monster_order.length) {
          index = 0;
        }
        
        // If we're placing the last monster, it must be the player's monster.
        if (monsters_placed != game.monster_order.length) {
          $("#enemy_monsters").append(html);
        }
        else {
          $("#own_monster").append(html);        
        }

      }
      
      // The slots have been generated, now add the actual data.
      var monster_ids = Object.keys(data.monsters);
      for (var i = 0; i < monster_ids.length; i++) {
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__health').html(data.monsters[monster_ids[i]].health);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__victory_points').html(data.monsters[monster_ids[i]].victory_points);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__energy').html(data.monsters[monster_ids[i]].energy);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__in_tokyo_city').html(data.monsters[monster_ids[i]].in_tokyo_city);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__in_tokyo_bay').html(data.monsters[monster_ids[i]].in_tokyo_bay);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__name').html(data.monsters[monster_ids[i]].name);
      }
      
      for (var i = 0; i < data.dice.length; i++) {
        $('#dice__' + i + '__value').html(data.dice[i].value);
        $('#dice__' + i + '__value').addClass(data.dice[i].state);
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
    $('#messages').html(data).show().delay(1500).fadeOut(1000);
  });


  // UI event handlers
  
  // Monster selection
  $("#monster_selection").on("click", ".monster_select_button", function() {
    console.log('dev2 select monster ' + $(this).data('monster_id'));
    socket.emit("select_monster", $(this).data('monster_id'));
  });


  // Roll dice.
  $('#game').on("click", ".roll_dice_button", function(){
    console.log('dev2 roll_dice');
    
    var keep_dice_ids = [];
    
    $('#dice td').each(function(){
      if ($(this).hasClass('k')) {
        keep_dice_ids.push($(this).data('die_id'));
      }
    });
    
    console.log(keep_dice_ids);
    
    socket.emit("roll_dice", keep_dice_ids);
  });


  // Toggle dice keep states
  $('#dice').on("click", "td", function(){
    console.log('die keep status toggle');
    if ($(this).hasClass("r")) {
      $(this).removeClass("r").addClass("k");
    }
    else if ($(this).hasClass("k")) {
      $(this).removeClass("k").addClass("r");    
    }
  });
  
  
  // Finish buying cards.
  $('#game').on("click", ".done_buying_button", function(){
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
    //console.log(utils.dump(update));
    console.log('Handler: ' + update.handler);
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
      $("#lobby").hide();
      $("#monster_selection").show();
      break;
    case "play":
      $("#monster_selection").hide();
      $("#game").show();
      break;
  }
}

ROKGame.prototype.handle__dice__state = function(new_state, id) {
  game.dice[id].state = new_state;
  $("#dice__" + id + "__value").removeClass();
  $("#dice__" + id + "__value").addClass(new_state);
}

ROKGame.prototype.handle__dice__value = function(new_value, id) {
  game.dice[id].value = new_value;
  $("#dice__" + id + "__value").html(new_value);
}

ROKGame.prototype.handle__monsters__player_id = function(new_player_id, id) {
  console.log("ROKGame.prototype.handle__monsters__player_id");
  game.monsters[id].player_id = new_player_id;
  $("#monster_select_button_" + id).addClass('selected');
}
