/**
 * Client side functions for the game class.
 *
 * Base class is in ROKGame.js
 *
 * FIXME If another player snaps status, this player get duplicate rows in monster tables
 *
 */
ROKGame.prototype.initClient = function() {
  console.log("ROKGame.prototype.initClient");
  var game = this;

  /**
   * Ping the server every 2 seconds to let the server know we're still here. If
   * the server doesn't hear from us within 5 seconds, our session will be
   * cleaned up.
   */
  window.setInterval("socket.emit('keep_alive');", 2000);
  //console.log(Date.now());


  // Socket event handlers.

  /**
   * Game state snap
   */
  socket.on('snap_state', function socketSnapState(data) {
    console.log("snapping game state");
    
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
      // The player is still in the lobby.
      $('#lobby').show();
      $('#monster_selection').hide();
      $('#game').hide();
    }
    else if (data.game_state == "select_monsters") {
      // The players are selecting their monsters.
      $('#lobby').hide();
      $('#monster_selection').show();
      $('#game').hide();
      
      // Randomize the order of the monster select buttons.
      var monster_select_buttons = JSON.stringify(utils.shuffleArray([{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, ]));
      
      $('#monster_select_buttons').json2html(monster_select_buttons, transforms.monster_select_buttons);
    }
    else {
      // The game is already in progress
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

        monsters_placed++;

        // If we're placing the last monster, it must be the player's monster.
        if (monsters_placed != game.monster_order.length) {
          $("#enemy_monsters").json2html([{index: game.monster_order[index]}], transforms.monster_slots);
        }
        else {
          $("#own_monster").json2html([{index: game.monster_order[index]}], transforms.monster_slots);
        }
        index++;
        if (index == game.monster_order.length) {
          index = 0;
        }

      }
      
      // The slots have been generated, now add the actual data.
      var monster_ids = Object.keys(data.monsters);
      for (var i = 0; i < monster_ids.length; i++) {
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__health').html(data.monsters[monster_ids[i]].health);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__victory_points').html(data.monsters[monster_ids[i]].victory_points);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__snot').html(data.monsters[monster_ids[i]].snot);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__in_kyoto_city').html(data.monsters[monster_ids[i]].in_kyoto_city);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__in_kyoto_bay').html(data.monsters[monster_ids[i]].in_kyoto_bay);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__name').html(data.monsters[monster_ids[i]].name);
      }
      
      for (var i = 0; i < data.dice.length; i++) {
        $('#dice__' + i + '__value').html(data.dice[i].value);
        $('#dice__' + i + '__value').addClass(data.dice[i].state);
      }
      
      // Enable the roll button if this is the current monster.

      if (game.turn_monster == game.this_monster) {
        if (game.turn_phase == 'roll') {
          $('#roll_dice_button').removeAttr('disabled');
        }
        if (game.turn_phase == 'buy') {
          $('#done_buying_button').removeAttr('disabled');
        }
      }
      
      console.log('Setting focus to #game');
      // Set focus to the game to allow using the keyboard shortcuts
      // without pressing the lobby keys. Note that the div needs a tabindex
      // attribute for this to work.
      $('#game').focus();
      // And then remove the focus to get rid of the highlight.
      $('#game').blur();
    }
  });
  
  
  /**
   * Update game state changes to the UI.
   */
  socket.on('state_changes', function socketStateChanges(data) {
    console.log("received game state changes");

    game.handleUpdates(data.updates);
  });


  /**
   * Game message
   */
  socket.on('game_message', function socketGameMessage(data) {
    console.log('game message received');
    $('#messages').html(data).show().delay(1500).fadeOut(1000);
  });

  // The server emits the disconnect event after an idle player has been
  // deleted.
  socket.on('die', function socketDisconnect() {
    window.location = "disconnected";
  });

  // UI event handlers
  
  // Monster selection
  $("#monster_selection").on("click", ".monster_select_button", function clickMonsterSelect() {
    console.log('clickMonsterSelect ' + $(this).data('monster_id'));
    $(this).attr('disabled', true);
    socket.emit("select_monster", $(this).data('monster_id'));
  });


  // Roll dice.
  $('#game').on("click", "#roll_dice_button", function clickRollDice(){
    console.log('clickRollDice');
    $(this).attr('disabled', true);
    
    var keep_dice_ids = [];
    $('#dice td').each(function(){
      if ($(this).hasClass('k')) {
        keep_dice_ids.push($(this).data('die_id'));
      }
    });
    
    socket.emit("roll_dice", keep_dice_ids);
  });


  // Toggle dice keep states
  $('#dice').on("click", "td", function toggleDiceStatus(){
    console.log('toggleDiceStatus');
    if ($(this).hasClass("r")) {
      $(this).removeClass("r").addClass("k");
    }
    else if ($(this).hasClass("k")) {
      $(this).removeClass("k").addClass("r");    
    }
  });
  
  
  // Finish buying cards.
  $('#game').on("click", "#done_buying_button", function clickDoneBuying(){
    console.log('clickDoneBuying');
    $(this).attr('disabled', true);
    socket.emit("done_buying");
  });
  
  
  // Leave game.
  $('#game').on("click", "#leave_game_button", function clickLeaveGame(){
    console.log('clickLeaveGame');
    $(this).attr('disabled', true);
    socket.emit("leave_game");
  });
  
  // Yield Kyoto or not.
  $('#game').on("click", "#yield_kyoto_city_button", function clickYieldCity(){
    console.log('yielding city');
    $(this).attr('disabled', true);
    socket.emit("resolve_yield", {kyoto: "city", yield: true});
  });
  $('#game').on("click", "#yield_kyoto_bay_button", function clickYieldBay(){
    console.log('yielding bay');
    $(this).attr('disabled', true);
    socket.emit("resolve_yield", {kyoto: "bay", yield: true});
  });
  $('#game').on("click", "#stay_in_kyoto_city_button", function clickStayInCity(){
    console.log('staying in city');
    $(this).attr('disabled', true);
    socket.emit("resolve_yield", {kyoto: "city", yield: false});
  });
  $('#game').on("click", "#stay_in_kyoto_bay_button", function clickStayInBay(){
    console.log('staying in bay');
    $(this).attr('disabled', true);
    socket.emit("resolve_yield", {kyoto: "bay", yield: false});
  });
  
  /**
   * Keyboard shortcuts
   */
  $(document).keyup(function handleShortcuts(e){
    console.log("Key pressed: " + e.keyCode);
    if (e.keyCode >= 49 && e.keyCode <= 56) {
      // Dice status toggles, i.e. number keys 1-8
      if (game.turn_phase == 'roll') {
        var elid = '#dice__' + (e.keyCode - 49) + '__value';
      
        if ($(elid).hasClass("r")) {
          $(elid).removeClass("r").addClass("k");
        }
        else if ($(elid).hasClass("k")) {
          $(elid).removeClass("k").addClass("r");    
        }
      }
    }
    else if (e.keyCode == 13) {
      // Enter pressed, roll dice or finish buying, depending on turn_phase.
      if (game.turn_phase == 'roll') {
        $('#roll_dice_button').click();
      }
      else if (game.turn_phase == 'buy') {
        $('#done_buying_button').click();
      }
    }
    else if (e.keyCode == 89) {
      // [y]ield
      if (game.turn_phase == 'yield_kyoto_city') {
        $('#yield_kyoto_city_button').click();
      }
      else if (game.turn_phase == 'yield_kyoto_bay') {
        $('#yield_kyoto_bay_button').click();      
      }
    }
    else if (e.keyCode == 83) {
      // [s]tay
      if (game.turn_phase == 'yield_kyoto_city') {
        $('#stay_in_kyoto_city_button').click();
      }
      else if (game.turn_phase == 'yield_kyoto_bay') {
        $('#stay_in_kyoto_bay_button').click();      
      }
    }
  });
  
  var transforms = {
    'monster_select_buttons': [
      {tag: "input", type: "button", id: "monster_select_button_${id}", class: "monster_select_button", "data-monster_id": "${id}", value: "Select ${id}"}
    ],
    'monster_slots': [
      {tag: "tr", id: "monsters__${index}", class: "monster_data", children: [
        {tag: "th", id: "monsters__${index}__name"},
        {tag: "td", id: "monsters__${index}__health"},
        {tag: "td", id: "monsters__${index}__victory_points"},
        {tag: "td", id: "monsters__${index}__snot"},
        {tag: "td", id: "monsters__${index}__in_kyoto_city"},
        {tag: "td", id: "monsters__${index}__in_kyoto_bay"}
      ]}
    ]
  }
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
  if (updates.length == 0) {
    return false;
  }
  console.log("Handle updates");

  var update = updates[0];
  
  if (update.log) {
    this.addToLog(update.log);    
  }
  
  //console.log(utils.dump(update));
  console.log('Handler: ' + update.handler);
  
  if (typeof this[update.handler] == "function") {
    // Specific handler exists, call it
    this[update.handler](updates);
  }
  else if (update.element) {
    // No handler, just update matching DOM element
    game[update.element] = update.value;
    $("#" + update.element).html(update.value);
    updates.shift();
    this.handleUpdates(updates);
  }
  else {
    // It was just a log message
    updates.shift();
    this.handleUpdates(updates);
  }
}

ROKGame.prototype.addToLog = function(str) {
  $('#log').append('<p>'+str+'<p>');
  $('#log').scrollTop($('#log')[0].scrollHeight);
}

/**
 * Moves the game from the lobby to monster selection and to the actual game.
 */
ROKGame.prototype.handle__game_state = function(updates) {
  var update = updates.shift();
  console.log("ROKGame.prototype.handle__game_state to " + update.value);
  this.game_state = update.value;
  $('#game_state').html(update.value);
  if (update.value == "select_monsters") {
    $("#lobby").hide();
    $("#monster_selection").show();
  }
  else if (update.value == "over") {
    console.log('Game over man, game over!');
    $('#leave_game_button').removeAttr('disabled');
  }
  this.handleUpdates(updates);
}

ROKGame.prototype.handle__roll_number = function(updates) {
  var update = updates.shift();
  console.log("ROKGame.prototype.handle__roll_number to " + update.value);
  game.roll_number = update.value;
  $('#roll_number').html(update.value);
  if (game.turn_monster == game.this_monster) {
    $('#roll_dice_button').removeAttr('disabled');  
  }

  this.handleUpdates(updates);
}

ROKGame.prototype.handle__turn_phase = function(updates) {
  var update = updates.shift();
  console.log("ROKGame.prototype.handle__turn_phase to " + update.value);
  game.turn_phase = update.value;
  var elid = "#turn_phase";
  $(elid).html(update.value);
  
  // Note: "this_monster" needs to always be updated before turn_phase, or this
  // will never remove the disabled-attribute.
  if (update.value == 'roll' && game.turn_monster == game.this_monster) {
    $('#roll_dice_button').removeAttr('disabled');
  }
  else {
    $('#roll_dice_button').attr('disabled', true);    
  }
  
  if (update.value == 'buy' && game.turn_monster == game.this_monster) {
    $('#done_buying_button').removeAttr('disabled');
  }
  else {
    $('#done_buying_button').attr('disabled', true);    
  }
  
  if (update.value == 'yield_kyoto_city' && game.next_input_from_monster == game.this_monster) {
    $('#yield_kyoto_city_button').removeAttr('disabled');
    $('#stay_in_kyoto_city_button').removeAttr('disabled');
  }
  else {
    $('#yield_kyoto_city_button').attr('disabled', true);
    $('#stay_in_kyoto_city_button').attr('disabled', true);  
  }
  
  if (update.value == 'yield_kyoto_bay' && game.next_input_from_monster == game.this_monster) {
    $('#yield_kyoto_bay_button').removeAttr('disabled');
    $('#stay_in_kyoto_bay_button').removeAttr('disabled');
  }
  else {
    $('#yield_kyoto_bay_button').attr('disabled', true);
    $('#stay_in_kyoto_bay_button').attr('disabled', true);  
  }
  
  game.handleUpdates(updates); 
}

ROKGame.prototype.handle__dice__state = function(updates) {
  var update = updates.shift();
  game.dice[update.id].state = update.value;
  $("#dice__" + update.id + "__value").removeClass();
  $("#dice__" + update.id + "__value").addClass(update.value);
  this.handleUpdates(updates);
}

ROKGame.prototype.handle__dice__value = function(updates) {
  var update = updates.shift();
  game.dice[update.id].value = update.value;
  var elid = "#dice__" + update.id + "__value";
  
  $(elid).css('opacity', 0).html(update.value).animate({opacity: 1}, 300, function() {
    game.handleUpdates(updates);
  });
}

ROKGame.prototype.handle__monsters__victory_points = function(updates) {
  var update = updates.shift();
  game.monsters[update.id].victory_points = update.value;
  var elid = "#monsters__" + update.id + "__victory_points";
  
  $(elid).css('backgroundColor', "yellow").html(update.value).animate({backgroundColor: "white"}, 500, function() {
    game.handleUpdates(updates);
  });
}

ROKGame.prototype.handle__monsters__snot = function(updates) {
  var update = updates.shift();
  game.monsters[update.id].snot = update.value;
  var elid = "#monsters__" + update.id + "__snot";
  
  $(elid).css('backgroundColor', "green").html(update.value).animate({backgroundColor: "white"}, 500, function() {
    game.handleUpdates(updates);
  });
}

ROKGame.prototype.handle__monsters__player_id = function(updates) {
  var update = updates.shift();
  game.monsters[update.id].player_id = update.value;
  var elid = "#monster_select_button_" + update.id;
  
  $(elid).addClass('selected');
  game.handleUpdates(updates);
}

ROKGame.prototype.handle__monsters__health = function(updates) {
  var update = updates.shift();
  var old_health = game.monsters[update.id].health;
  game.monsters[update.id].health = update.value;
  var elid = "#monsters__" + update.id + "__health";
  
  if (old_health > update.value) {
    var color = "red";
  }
  else {
    var color = "blue";
  }
  
  console.log('bgcolor: ' + $(elid).css('backgroundColor'));
  var original_background_color = $(elid).css('backgroundColor');
  $(elid).css('backgroundColor', color).html(update.value).animate({backgroundColor: original_background_color}, 700, function() {
    // Did the monster die?
    console.log('checking death: ' + update.value);
    if (update.value < 1) {
      console.log('mark monster dead');
      $('#monsters__' + update.id).addClass("dead");
    }

    game.handleUpdates(updates);
  });
}
