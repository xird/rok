/**
 * Client side functions for the game class.
 *
 * Base class is in ROKGame.js
 *
 * TODO rename game.this_monster to game.this_monster_id
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

  // Socket event handlers.

  /**
   * Game state snap
   */
  socket.on('snap_state', function socketSnapState(data) {
    console.log("snapping game state");
    console.log(utils.dump(data));
    
    game.game_state = data.game_state;
    game.turn_phase = data.turn_phase;
    game.turn_monster = data.turn_monster;
    game.next_input_from_monster = data.next_input_from_monster;
    game.roll_number = data.roll_number;
    game.monster_order = data.monster_order;
    game.monsters = data.monsters;
    game.monster_in_kyoto_city_id = data.monster_in_kyoto_city_id;
    game.monster_in_kyoto_bay_id  = data.monster_in_kyoto_bay_id;
    game.dice = data.dice;
    game.this_monster = data.this_monster;
    game.winner = data.winner;
    game.cards_available = data.cards_available;
    console.log(data);
    if (data.game_state == "lobby") {
      console.log('Lobby');
      // The player is still in the lobby.
      $('#lobby').show();
      $('#monster_selection').hide();
      $('#game').hide();
    }
    else if (data.game_state == "select_monsters") {
      console.log('select_monsters');
      // The players are selecting their monsters.
      $('#lobby').hide();
      $('#monster_selection').show();
      $('#game').hide();
      
      // Randomize the order of the monster select buttons.
      var monster_select_buttons = JSON.stringify(utils.shuffleArray([{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, ]));
      
      $('#monster_select_buttons').json2html(monster_select_buttons, transforms.monster_select_buttons);
    }
    else {
      // The game is already in progress or over
      $('#lobby').hide();
      $('#monster_selection').hide();
      $('#game').show();
    
      // Write initial values to all UI elements.
      
      // Place monsters starting from the monsters that's next in sequence from
      // the current player's monster. That one is shown on the top slot.
      // Note that this generates the debugger monster table.
      var own_monster_index = game.monster_order.indexOf(game.this_monster);
      var first_monster_index = own_monster_index + 1;
      if (first_monster_index == game.monster_order.length) {
        first_monster_index = 0;
      }
      var monsters_placed = 0;
      var index = first_monster_index;
      while (monsters_placed < game.monster_order.length) {
        //console.log('Placing monster index ' + index + ", id " + game.monster_order[index]);
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
      
      
      // Show the appropriate monster slots for the number of players in game.
      // The bottom left slot is always shown, as that's this player's slot.
      $('#ms6').show();
      switch (Object.keys(game.monsters).length) {
        case 2:
        $('#ms1').show();
          break;
         
        case 3:
          $('#ms2').show();
          $('#ms4').show();
          break;
         
        case 4:
          $('#ms1').show();
          $('#ms3').show();
          $('#ms4').show();
          break;
         
        case 5:
          $('#ms1').show();
          $('#ms2').show();
          $('#ms3').show();
          $('#ms4').show();
          $('#mskb').show();
          break;
         
        case 6:
          $('.monster_slot').show();
          break;
      }
      
      // Place the playing monsters in the visible monster slots.
      //
      // FIXME ticket #16: This is now using monster_order, which won't work correctly if
      // the page is reloaded after one of the monsters is killed. Since we want
      // to be able to order the monsters the same way even after one of them
      // has died, we need to keep a separate variable named 
      // "original_monster_order". Or use a separate variable for 
      // "playing_monsters". 
      //console.log(game.monsters);
      var index = first_monster_index;
      $('.monster_home:visible').each(function(){
        var msel = $(this);
        //console.log('slot id: ' + $(this).attr('id'));
        //console.log('index: ' + index);
        var monster_id = game.monster_order[index];
        //console.log('monster id: ' + monster_id);

        var mel = $('#m' + monster_id);
        mel.removeClass('dead');
        mel.show();

        // Mark this slot as the home for this monster.
        $('.monster_home').removeClass('m' + monster_id + 'home');
        msel.addClass('m' + monster_id + 'home');
        
        // Move the monster to its home, or to Kyoto if that's where it's at.
        if (game.monster_in_kyoto_city_id == monster_id) {
          //console.log(monster_id + ' init city');
          game.moveMonster(monster_id, "city", "immediate");
        }
        else if (game.monster_in_kyoto_bay_id == monster_id) {
          //console.log(monster_id + ' init bay');
          game.moveMonster(monster_id, "bay", "immediate");
        }
        else {
          //console.log(monster_id + ' init home');
          game.moveMonster(monster_id, "home", "immediate");
        }

        index++;
        if (index == game.monster_order.length) {
          index = 0;
        }
        //console.log('---');
      });
      
      
      // The slots have been generated, now add the actual data.
      var monster_ids = Object.keys(data.monsters);
      for (var i = 0; i < monster_ids.length; i++) {
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__health').html(data.monsters[monster_ids[i]].health);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__victory_points').html(data.monsters[monster_ids[i]].victory_points);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__snot').html(data.monsters[monster_ids[i]].snot);
//        $('#monsters__' + data.monsters[monster_ids[i]].id + '__in_kyoto_city').html(data.monsters[monster_ids[i]].in_kyoto_city);
//        $('#monsters__' + data.monsters[monster_ids[i]].id + '__in_kyoto_bay').html(data.monsters[monster_ids[i]].in_kyoto_bay);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__name').html(data.monsters[monster_ids[i]].name);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__poison_counters').html(data.monsters[monster_ids[i]].poison_counters);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__shrink_ray_counters').html(data.monsters[monster_ids[i]].shrink_ray_counters);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__smoke_counters').html(data.monsters[monster_ids[i]].smoke_counters);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__alien_counters').html(data.monsters[monster_ids[i]].alien_counters);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__UFO_counters').html(data.monsters[monster_ids[i]].UFO_counters);
        $('#monsters__' + data.monsters[monster_ids[i]].id + '__mimic').html(data.monsters[monster_ids[i]].mimic);
      }

      $('#board_monster_in_kyoto_city_id').html(data.monster_in_kyoto_city_id);
      $('#board_monster_in_kyoto_bay_id').html(data.monster_in_kyoto_bay_id);



      
      // Highlight the active monster
      $('#m' + game.next_input_from_monster).addClass('active'); 
      
      // Dice.
      for (var i = 0; i < data.dice.length; i++) {
        game.handle__dice__state([{value: data.dice[i].state, id: i}]);
        game.handle__dice__value([{value: data.dice[i].value, id: i}]);
      }
      
      // Cards
      game.handle__cards_available([{value: data.cards_available}]);
      
      // Enable appropriate buttons for the current state.
      if (game.game_state == 'over') {
        console.log('over');
        $('#leave_game_button').show();
      }
      else {
        $('#leave_game_button').hide();      
        if (game.next_input_from_monster == game.this_monster) {
          if (game.turn_phase == 'roll') {
            $('#roll_dice_button').show();
          }
          else {
            $('#roll_dice_button').hide();          
          }
          
          if (game.turn_phase == 'buy') {
            $('#done_buying_button').show();
          }
          else {
            $('#done_buying_button').hide();          
          }

          if (game.turn_phase == 'yield_kyoto') {
            if (game.monster_in_kyoto_city_id == game.this_monster) {
              $('#yield_kyoto_city_button').show();
              $('#stay_in_kyoto_city_button').show();
            }
            else if (game.monster_in_kyoto_bay_id == game.this_monster) {
              $('#yield_kyoto_bay_button').show();
              $('#stay_in_kyoto_bay_button').show();
            }
          }
          else {
            $('#stay_in_kyoto_bay_button').hide();
            $('#yield_kyoto_bay_button').hide();
            $('#yield_kyoto_city_button').hide();
            $('#stay_in_kyoto_city_button').hide();
          }
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
  
  // The server emits the "die" event after an idle player has been
  // deleted. Resetting the browser's URL is the easiest way to force a 
  // disconnect and to stop the keep_alive messages.
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
    $('#dice div').each(function(){
      if ($(this).hasClass('k')) {
        keep_dice_ids.push($(this).data('die_id'));
      }
    });
    
    socket.emit("roll_dice", keep_dice_ids);
    return false;
  });


  // Toggle dice keep states
  $('#dice').on("click", "div", function toggleDiceStatus(){
    console.log('toggleDiceStatus');
    if ($(this).hasClass("r")) {
      $(this).removeClass("r").addClass("k");
    }
    else if ($(this).hasClass("k")) {
      $(this).removeClass("k").addClass("r");    
    }
  });
  
  // Buy cards
  $('#game').on("click", ".card", function clickBuyCard() {
    console.log("clickBuyCard " + $(this).data("available_card_index"));
    socket.emit("buy_card", $(this).data("available_card_index"));
  });
  
  // Finish buying cards.
  $('#game').on("click", "#done_buying_button", function clickDoneBuying(){
    console.log('clickDoneBuying');
    socket.emit("done_buying");
    return false;
  });
  
  
  // Leave game.
  $('#game').on("click", "#leave_game_button", function clickLeaveGame(){
    console.log('clickLeaveGame');
    socket.emit("leave_game");
    return false;
  });
  
  // Yield Kyoto or not.
  $('#game').on("click", "#yield_kyoto_city_button", function clickYieldCity(){
    console.log('yielding city');
    $(this).attr('disabled', true);
    socket.emit("resolve_yield", {kyoto: "city", yield: true});
    return false;
  });
  $('#game').on("click", "#yield_kyoto_bay_button", function clickYieldBay(){
    console.log('yielding bay');
    $(this).attr('disabled', true);
    socket.emit("resolve_yield", {kyoto: "bay", yield: true});
    return false;
  });
  $('#game').on("click", "#stay_in_kyoto_city_button", function clickStayInCity(){
    console.log('staying in city');
    $(this).attr('disabled', true);
    socket.emit("resolve_yield", {kyoto: "city", yield: false});
    return false;
  });
  $('#game').on("click", "#stay_in_kyoto_bay_button", function clickStayInBay(){
    console.log('staying in bay');
    $(this).attr('disabled', true);
    socket.emit("resolve_yield", {kyoto: "bay", yield: false});
    return false;
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
      if (game.turn_phase == "yield_kyoto") {
        if (game.monster_in_kyoto_city_id == game.this_monster && game.next_input_from_monster == game.this_monster) {
          $('#yield_kyoto_city_button').click();        
        }
        else if (game.monster_in_kyoto_bay_id == game.this_monster && game.next_input_from_monster == game.this_monster) {
          $('#yield_kyoto_bay_button').click();        
        }
      }
    }
    else if (e.keyCode == 83) {
      // [s]tay
      if (game.turn_phase == "yield_kyoto") {
        if (game.monster_in_kyoto_city_id == game.this_monster && game.next_input_from_monster == game.this_monster) {
          $('#stay_in_kyoto_city_button').click();        
        }
        else if (game.monster_in_kyoto_bay_id == game.this_monster && game.next_input_from_monster == game.this_monster) {
          $('#stay_in_kyoto_bay_button').click();        
        }
      }
    }
    else if (e.keyCode == 76) {
      // [l]eave
      if (game.game_state == 'over') {
        $('#leave_game_button').click();
      }
    }
  });
  
  var transforms = {
    'monster_select_buttons': [
      {tag: "div", id: "monster_select_button_${id}", class: "monster_select_button", "data-monster_id": "${id}", value: "Select ${id}"}
    ],
    'monster_slots': [
      {tag: "tr", id: "monsters__${index}", class: "monster_data", children: [
        {tag: "th", id: "monsters__${index}__name"},
      ]}
    ]
  }
}


/**
 * Function for moving the monster icon to another place on the board.
 */
ROKGame.prototype.moveMonster = function(monster_id, target, immediate) {
  var mel = $('#m' + monster_id);
  switch(target) {
    case "home":
      // Get this monsters home slot element:
      var msel = $(".m" + monster_id + "home");
      break;
      
    case "city":
      var msel = $("#mskc");
      break;
      
    case "bay":
      var msel = $("#mskb");
      break;
  }
  // Match the selected monster elements position attributes to that of 
  // the selected monster slot.
  //
  if (!immediate) {
    mel.animate({top: msel.css('top'), left: msel.css('left')}, 500);
  }
  else {
    mel.css('top', msel.css('top')).css('left', msel.css('left'));  
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
  console.log("adding log message to game log");
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
  //$('#game_state').html(update.value);
  if (update.value == "select_monsters") {
    $("#lobby").hide();
    $("#monster_selection").show();
  }
  else if (update.value == "over") {
    console.log('Game over man, game over!');
    $('#leave_game_button').show();
  }
  this.handleUpdates(updates);
}


ROKGame.prototype.handle__next_input_from_monster = function(updates) {
  var update = updates.shift();
  console.log("ROKGame.prototype.handle__next_input_from_monster to " + update.value);
  this.next_input_from_monster = update.value;

  $('.monster').removeClass('active');
  $('#m' + update.value).addClass('active');
  
  this.handleUpdates(updates);
}

ROKGame.prototype.handle__roll_number = function(updates) {
  var update = updates.shift();
  console.log("ROKGame.prototype.handle__roll_number to " + update.value);
  game.roll_number = update.value;
  var ordinals = ['0th', '1st', '2nd', '3rd', '4th', '5th', '6th'];
  $('#roll_dice_button').html("Roll dice (" + ordinals[update.value] + ")");

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
    $('#roll_dice_button').show();
  }
  else {
    $('#roll_dice_button').hide();
  }
  
  if (update.value == 'buy' && game.turn_monster == game.this_monster) {
    $('#done_buying_button').show();
  }
  else {
    $('#done_buying_button').hide();
  }
  
  if (update.value == 'yield_kyoto' && game.next_input_from_monster == game.this_monster) {
    console.log('enable yield');

    if (game.monster_in_kyoto_city_id == game.next_input_from_monster) {
      $('#yield_kyoto_city_button').show();
      $('#stay_in_kyoto_city_button').show();
    }
    else {
      $('#yield_kyoto_bay_button').show();
      $('#stay_in_kyoto_bay_button').show();
    }
  }
  else {
    console.log('disable yield');
    $('#yield_kyoto_city_button').hide();
    $('#stay_in_kyoto_city_button').hide();
    $('#yield_kyoto_bay_button').hide();
    $('#stay_in_kyoto_bay_button').hide();
  }
  
  game.handleUpdates(updates); 
}

ROKGame.prototype.handle__dice__state = function(updates) {
  var update = updates.shift();
  game.dice[update.id].state = update.value;
  $("#dice__" + update.id + "__value").removeClass("r i f n k");
  $("#dice__" + update.id + "__value").addClass(update.value);
  this.handleUpdates(updates);
}

ROKGame.prototype.handle__dice__value = function(updates) {
  var update = updates.shift();

  game.dice[update.id].value = update.value;
  var elid = "#dice__" + update.id + "__value";

  switch (update.value) {
    case "p":
      $(elid).css('opacity', 0).html("").removeClass('heal snot').addClass('punch').animate({opacity: 1}, 300, function() {
        game.handleUpdates(updates);
      });    
      break;
      
    case "h":
      $(elid).css('opacity', 0).html("").removeClass('punch snot').addClass('heal').animate({opacity: 1}, 300, function() {
        game.handleUpdates(updates);
      });    
      break;
      
    case "s":
      $(elid).css('opacity', 0).html("").removeClass('punch heal').addClass('snot').animate({opacity: 1}, 300, function() {
        game.handleUpdates(updates);
      });    
      break;
      
    default:
      $(elid).removeClass('punch heal snot').css('opacity', 0).html(update.value).animate({opacity: 1}, 300, function() {
        game.handleUpdates(updates);
      });    
      break;
  }
}

ROKGame.prototype.handle__monsters__victory_points = function(updates) {
  var update = updates.shift();
  game.monsters[update.id].victory_points = update.value;
  var elid = "#monsters__" + update.id + "__victory_points";

  // Make sure the highlight stays centered on the numbers regardless of the 
  // number of numbers.
  if (update.value.toString().length == 1) {
    $(elid).parent().find('.monster_stats_bg').css('background-position', '95px 0');
  }
  else {
    $(elid).parent().find('.monster_stats_bg').css('background-position', '100px 0');
  }
  
  $(elid).html(update.value).parent().find('.monster_stats_bg').css('opacity', 1).animate({opacity: 0}, 1000, function() {
    game.handleUpdates(updates);
  });
}

ROKGame.prototype.handle__monsters__snot = function(updates) {
  var update = updates.shift();
  game.monsters[update.id].snot = update.value;
  var elid = "#monsters__" + update.id + "__snot";
  
  // Make sure the highlight stays centered on the numbers regardless of the 
  // number of numbers.
  if (update.value.toString().length == 1) {
    $(elid).parent().find('.monster_stats_bg').css('background-position', '-5px 0');
  }
  else {
    $(elid).parent().find('.monster_stats_bg').css('background-position', '0 0');
  }
    
  $(elid).html(update.value).parent().find('.monster_stats_bg').css('opacity', 1).animate({opacity: 0}, 1000, function() {
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
    // Red.
    // Make sure the highlight stays centered on the numbers regardless of the 
    // number of numbers.
    if (update.value.toString().length == 1) {
      $(elid).parent().find('.monster_stats_bg').css('background-position', '145px 0');
    }
    else {
      $(elid).parent().find('.monster_stats_bg').css('background-position', '150px 0');
    }
  }
  else {
    // Blue.
    // Make sure the highlight stays centered on the numbers regardless of the 
    // number of numbers.
    if (update.value.toString().length == 1) {
      $(elid).parent().find('.monster_stats_bg').css('background-position', '45px 0');
    }
    else {
      $(elid).parent().find('.monster_stats_bg').css('background-position', '50px 0');
    }

  }
  
  $(elid).html(update.value).parent().find('.monster_stats_bg').css('opacity', 1).animate({opacity: 0}, 1000, function() {
    console.log('checking death: ' + update.value);
    if (update.value < 1) {
      console.log('mark monster dead');
      $('#m' + update.id).addClass("dead");
    }
    game.handleUpdates(updates);
  });
}

ROKGame.prototype.handle__monster_in_kyoto_city_id = function(updates) {
  console.log("handle__monster_in_kyoto_city_id");
  
  var update = updates.shift();
  
  if (update.value != null) {
    this.moveMonster(update.value, "city");
  }
  game.monster_in_kyoto_city_id = update.value;
  game.handleUpdates(updates);
}

ROKGame.prototype.handle__monster_in_kyoto_bay_id = function(updates) {
  console.log("handle__monster_in_kyoto_bay_id");
  
  var update = updates.shift();
  
  if (update.value != null) {
    this.moveMonster(update.value, "bay");
  }
  game.monster_in_kyoto_bay_id = update.value;
  game.handleUpdates(updates);
}

ROKGame.prototype.handle__monster_leaving_kyoto_city_id = function(updates) {
  console.log("handle__monster_leaving_kyoto_city_id");
  
  var update = updates.shift();
  
  if (update.value != null) {
    this.moveMonster(update.value, "home");
  }

  game.handleUpdates(updates);
}

ROKGame.prototype.handle__monster_leaving_kyoto_bay_id = function(updates) {
  console.log("handle__monster_leaving_kyoto_bay_id");
  
  var update = updates.shift();
  
  if (update.value != null) {
    this.moveMonster(update.value, "home");
  }

  game.handleUpdates(updates);
}

/**
 * Show the cards currently available for purchase.
 */
ROKGame.prototype.handle__cards_available = function(updates) {
  console.log("ROKGame.prototype.handle__cards_available");
  var update = updates.shift();

  for (var i = 0; i < update.value.length; i++) {
    $('#card__' + i).html('<img src="' + static_ + '/images/cards/' + update.value[i] + '.jpg" alt="' + update.value[i] + '" width="117" height="91" />');
  }

  game.handleUpdates(updates);
}
