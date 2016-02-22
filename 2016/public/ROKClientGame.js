/**
 * Client side functions for the game class.
 *
 * Base class is in ROKGame.js
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
    //console.log(utils.dump(data));

    game.game_state = data.game_state;
    game.turn_phase = data.turn_phase;
    game.turn_monster_id = data.turn_monster_id;
    game.next_input_from_monster = data.next_input_from_monster;
    game.roll_number = data.roll_number;
    game.monster_order = data.monster_order;
    game.original_monster_order = data.original_monster_order;
    game.monsters = data.monsters;
    game.monster_in_kyoto_city_id = data.monster_in_kyoto_city_id;
    game.monster_in_kyoto_bay_id  = data.monster_in_kyoto_bay_id;
    game.dice = data.dice;
    game.this_monster_id = data.this_monster_id;
    game.winner = data.winner;
    game.cards_available = data.cards_available;
    game.card_map = data.card_map;

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
      // the current player's monster.
      var own_monster_index = game.original_monster_order.indexOf(game.this_monster_id);
      var first_monster_index = own_monster_index + 1;
      if (first_monster_index == game.original_monster_order.length) {
        first_monster_index = 0;
      }
      var monsters_placed = 0;
      var index = first_monster_index;
      while (monsters_placed < game.original_monster_order.length) {
        monsters_placed++;
        // If we're placing the last monster, it must be the player's monster.
        if (monsters_placed != game.original_monster_order.length) {
          $("#enemy_monsters").json2html([{index: game.original_monster_order[index]}], transforms.monster_slots);
        }
        else {
          $("#own_monster").json2html([{index: game.original_monster_order[index]}], transforms.monster_slots);
        }
        index++;
        if (index == game.original_monster_order.length) {
          index = 0;
        }
      }

      if (game.original_monster_order.length >= 5) {
        $('#game').addClass("fivetosix");
      }
      else {
        $('#game').removeClass("fivetosix");
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
      var index = first_monster_index;
      $('.monster_home:visible').each(function(){
        var msel = $(this);
        var monster_id = game.original_monster_order[index];
        var mel = $('#m' + monster_id);
        if (data.monsters[monster_id].health > 0) {
          mel.removeClass('dead');
        }
        else {
          mel.addClass('dead');
        }
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
        if (index == game.original_monster_order.length) {
          index = 0;
        }
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

        // Cards owned by the monsters
        // First clear the elements to clean up any previous game
        for (var j = 0; j < 6; j++) {
          $("#monsters__" + monster_ids[i] + "__cards_owned__" + j).html('');
        }
        for (var j = 0; j < data.monsters[monster_ids[i]].cards_owned.length; j++) {
          console.log("Monster " + monster_ids[i] + " cards:");
          console.log(data.monsters[monster_ids[i]].cards_owned[j]);
          var card_name = game.card_map[data.monsters[monster_ids[i]].cards_owned[j]];
          var html = '<img src="' + static_ + '/images/cards/' + card_name + '.jpg" alt="' + card_name + '" width="50" height="39" />';
          $("#monsters__" + monster_ids[i] + "__cards_owned__" + j).html(html);
        }
      }

      $('#board_monster_in_kyoto_city_id').html(data.monster_in_kyoto_city_id);
      $('#board_monster_in_kyoto_bay_id').html(data.monster_in_kyoto_bay_id);

      // Highlight the active monster
      $('.monster').removeClass("active");
      $('#m' + game.next_input_from_monster).addClass('active');

      // Clear the game log
      $('#log').html('');

      // Dice.
      for (var i = 0; i < data.dice.length; i++) {
        game.updates.push({value: data.dice[i].state, id: i});
        game.handle__dice__state();
        game.updates.push({value: data.dice[i].value, id: i});
        game.handle__dice__value();
      }

      // Cards
      game.updates.push({value: data.cards_available});
      game.handle__cards_available();

      // Enable appropriate buttons for the current state.
      if (game.game_state == 'over') {
        console.log('over');
        $('#leave_game_button').show();
      }
      else {
        $('#leave_game_button').hide();
        if (game.next_input_from_monster == game.this_monster_id) {
          if (game.turn_phase == 'roll') {
            var ordinals = ['0th', '1st', '2nd', '3rd', '4th', '5th', '6th'];
            $('#roll_dice_button').html("Roll dice (" + ordinals[game.roll_number] + ")");
            $('#roll_dice_button').show();
            $('#roll_dice_button').attr('disabled', false);
            // Don't show the "done" button before first roll.
            if (game.roll_number != 1) {
              $('#done_rolling_button').show();
            }
            else {
              $('#done_rolling_button').hide();
            }
          }
          else {
            $('#roll_dice_button').hide();
            $('#done_rolling_button').hide();
          }

          if (game.turn_phase == 'buy') {
            $('#done_buying_button').show();
            if (game.monsters[game.this_monster_id].snot >= 2) {
              $('#sweep_cards_button').show();
            }
          }
          else {
            $('#done_buying_button').hide();
            $('#sweep_cards_button').hide();
          }

          if (game.turn_phase == 'yield_kyoto') {
            if (game.monster_in_kyoto_city_id == game.this_monster_id) {
              $('#yield_kyoto_city_button').show();
              $('#stay_in_kyoto_city_button').show();
            }
            else if (game.monster_in_kyoto_bay_id == game.this_monster_id) {
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
    console.log("Received game state changes:");
    game.updates = game.updates.concat(data.updates);
    game.handleUpdates();
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
    if ($(this).attr('disabled')) {
      return false;
    }
    $(this).attr('disabled', true);

    var keep_dice_ids = [];
    $('#dice div').each(function(){
      if ($(this).hasClass('k')) {
        keep_dice_ids.push($(this).data('die_id'));
      }
      else if ($(this).hasClass('kr')) {
        keep_dice_ids.push($(this).data('die_id'));
      }
    });

    socket.emit("roll_dice", keep_dice_ids);
    return false;
  });


  // Done rolling dice.
  $('#game').on("click", "#done_rolling_button", function clickDoneRolling() {
    console.log('clickDoneRolling');
    $(this).attr('disabled', true);

    socket.emit("done_rolling_dice");
    return false;
  });


  // Toggle dice keep states
  $('#dice').on("click", "div", function toggleDiceStatus(){
    console.log('toggleDiceStatus');
    if ($(this).hasClass('r')) {
      $(this).removeClass('r').addClass('k');
    }
    else if ($(this).hasClass('k')) {
      $(this).removeClass('k').addClass('r');
    }
    else if ($(this).hasClass('rr')) {
      $(this).removeClass('rr').addClass('kr');
    }
    else if ($(this).hasClass('kr')) {
      $(this).removeClass('kr').addClass('rr');
    }
  });

  // Buy cards
  $('#game').on("click", ".card", function clickBuyCard() {
    console.log("clickBuyCard " + $(this).data("available_card_index"));
    if ($(this).attr('disabled')) {
      return false;
    }
    $(this).attr('disabled', true);
    $(this).mouseout();
    $(this).data('empty', true);
    socket.emit("buy_card", $(this).data("available_card_index"));
  });

  // Sweep cards
  $('#game').on("click", "#sweep_cards_button", function sweepCards() {
    console.log("clickSweepCards");
    if ($(this).attr('disabled')) {
      return false;
    }
    $(this).attr('disabled', true);
    socket.emit("sweep_cards");
    return false;
  });

  // Finish buying cards.
  $('#game').on("click", "#done_buying_button", function clickDoneBuying(){
    console.log('clickDoneBuying');
    socket.emit("done_buying");
    return false;
  });

  // Show bigger cards when hovering on them.
  $('#game').on({
    mouseover: function () {
      // Only do the mouseover if there is currently a card that can be bought.
      // This keeps the empty card slot from expanding on hover after a card is
      // bought.
      if (!$(this).attr('disabled')) {
        var div = $(this);
        var big_w = 200;
        var big_h = 156;
        div.data('width', div.css('width'));
        div.data('height', div.css('height'));

        div.css("width", big_w + "px");
        div.css("height", big_h + "px");

        var img = div.find('img');
        img.attr('width', big_w);
        img.attr('height', big_h);

        $(this).css('z-index', 99);
      }
    },
    mouseout: function () {
      var div = $(this);
      var small_w = $(this).data('width');
      var small_h = $(this).data('height');

      div.css("width", small_w + "px");
      div.css("height", small_h + "px");

      var img = $(this).find('img');
      img.attr('width', small_w);
      img.attr('height', small_h);

      $(this).css('z-index', 0);
    }
  }, ".card, .monster_cards_owned");


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

        if ($(elid).hasClass('r')) {
          $(elid).removeClass('r').addClass('k');
        }
        else if ($(elid).hasClass('k')) {
          $(elid).removeClass('k').addClass('r');
        }
        else if ($(elid).hasClass('rr')) {
          $(this).removeClass('rr').addClass('kr');
        }
        else if ($(elid).hasClass('kr')) {
          $(this).removeClass('kr').addClass('rr');
        }
      }
    }
    else if (e.keyCode == 13) {
      // Enter pressed, roll dice or finish buying, depending on turn_phase.
      if (game.turn_phase == 'roll') {
        // If the target is the button, that means that focus was on the button,
        // and pressing enter will press the button, so there's no need to
        // separately click the bottom from code.
        if (e.target.id != "roll_dice_button") {
          $('#roll_dice_button').click();
        }
      }
      else if (game.turn_phase == 'buy') {
        if (e.target.id != "done_buying_button") {
          $('#done_buying_button').click();
        }
      }
    }
    else if (e.keyCode == 89) {
      // [y]ield
      if (game.turn_phase == "yield_kyoto") {
        if (game.monster_in_kyoto_city_id == game.this_monster_id && game.next_input_from_monster == game.this_monster_id) {
          $('#yield_kyoto_city_button').click();
        }
        else if (game.monster_in_kyoto_bay_id == game.this_monster_id && game.next_input_from_monster == game.this_monster_id) {
          $('#yield_kyoto_bay_button').click();
        }
      }
    }
    else if (e.keyCode == 83) {
      // [s]tay
      if (game.turn_phase == "yield_kyoto") {
        if (game.monster_in_kyoto_city_id == game.this_monster_id && game.next_input_from_monster == game.this_monster_id) {
          $('#stay_in_kyoto_city_button').click();
        }
        else if (game.monster_in_kyoto_bay_id == game.this_monster_id && game.next_input_from_monster == game.this_monster_id) {
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
 * The updates are saved in game.updates in socket.on('state_changes').
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
ROKGame.prototype.handleUpdates = function() {
  var updates = this.updates;
  if (updates.length == 0) {
    console.log("Handle updates - nothing to handle");
    return false;
  }
  console.log("Handle updates (" + updates.length + ")");

  var update = updates[0];

  if (update.log) {
    this.addToLog(update.log);
  }

  console.log('Handler: ' + update.handler);

  if (typeof this[update.handler] == "function") {
    // Specific handler exists, call it
    this[update.handler]();
  }
  else if (update.element) {
    // No handler, just update matching DOM element
    game[update.element] = update.value;
    $("#" + update.element).html(update.value);
    game.updates.shift();
    this.handleUpdates();
  }
  else {
    // It was just a log message
    game.updates.shift();
    this.handleUpdates();
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
ROKGame.prototype.handle__game_state = function() {
  var update = game.updates.shift();
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
  this.handleUpdates();
}


ROKGame.prototype.handle__next_input_from_monster = function() {
  var update = game.updates.shift();
  console.log("ROKGame.prototype.handle__next_input_from_monster to " + update.value);
  this.next_input_from_monster = update.value;

  $('.monster').removeClass('active');
  $('#m' + update.value).addClass('active');

  this.handleUpdates();
}


ROKGame.prototype.handle__roll_number = function() {
  var update = game.updates.shift();
  console.log("ROKGame.prototype.handle__roll_number to " + update.value);
  game.roll_number = update.value;
  var ordinals = ['0th', '1st', '2nd', '3rd', '4th', '5th', '6th'];
  $('#roll_dice_button').html("Roll dice (" + ordinals[update.value] + ")");
  $("#roll_dice_button").attr('disabled', false);

  // Don't show the "done" button before first roll.
  if (game.roll_number != 1 && game.turn_monster_id == game.this_monster_id) {
    $('#done_rolling_button').show();
  }
  else {
    $('#done_rolling_button').hide();
  }

  this.handleUpdates();
}

ROKGame.prototype.handle__turn_phase = function() {
  var update = game.updates.shift();
  console.log("ROKGame.prototype.handle__turn_phase to " + update.value);
  game.turn_phase = update.value;
  var elid = "#turn_phase";
  $(elid).html(update.value);

  // Note: "this_monster_id" needs to always be updated before turn_phase, or this
  // will never remove the disabled-attribute.
  if (update.value == 'roll' && game.turn_monster_id == game.this_monster_id) {
    $('#roll_dice_button').show();
    $('#roll_dice_button').attr('disabled', false);
    // Don't show the "done" button before first roll.
    if (game.roll_number != 1) {
      $('#done_rolling_button').show();
    }
    else {
      $('#done_rolling_button').hide();
    }
  }
  else {
    $('#roll_dice_button').hide();
    $('#done_rolling_button').hide();
  }

  if (update.value == 'buy' && game.turn_monster_id == game.this_monster_id) {
    $('#done_buying_button').show();
    if (game.monsters[game.this_monster_id].snot >= 2) {
      $('#sweep_cards_button').show();
    }
  }
  else {
    $('#done_buying_button').hide();
    $('#sweep_cards_button').hide();
  }

  if (update.value == 'yield_kyoto' && game.next_input_from_monster == game.this_monster_id) {
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

  game.handleUpdates();
}

ROKGame.prototype.handle__dice__state = function () {
  console.log("ROKGame.prototype.handle__dice__state");
  //console.log(game.updates);
  var update = game.updates.shift();
  game.dice[update.id].state = update.value;
  $("#dice__" + update.id + "__value").removeClass("r i f n k rr kr");
  $("#dice__" + update.id + "__value").addClass(update.value);

  if (game.updates.length > 0) {
    this.handleUpdates();
  }

}

ROKGame.prototype.handle__dice__value = function() {
  var update = game.updates.shift();

  game.dice[update.id].value = update.value;
  var elid = "#dice__" + update.id + "__value";

  switch (update.value) {
    case "p":
      $(elid).css('opacity', 0).html("").removeClass('heal snot').addClass('punch').animate({opacity: 1}, 300, function() {
        game.handleUpdates();
      });
      break;

    case "h":
      $(elid).css('opacity', 0).html("").removeClass('punch snot').addClass('heal').animate({opacity: 1}, 300, function() {
        game.handleUpdates();
      });
      break;

    case "s":
      $(elid).css('opacity', 0).html("").removeClass('punch heal').addClass('snot').animate({opacity: 1}, 300, function() {
        game.handleUpdates();
      });
      break;

    default:
      $(elid).removeClass('punch heal snot').css('opacity', 0).html(update.value).animate({opacity: 1}, 300, function() {
        game.handleUpdates();
      });
      break;
  }
}

ROKGame.prototype.handle__monsters__victory_points = function() {
  var update = game.updates.shift();
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
    game.handleUpdates();
  });
}

ROKGame.prototype.handle__monsters__snot = function() {
  var update = game.updates.shift();
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
    game.handleUpdates();
  });
}

ROKGame.prototype.handle__monsters__player_id = function() {
  console.log("ROKGame.prototype.handle__monsters__player_id");
  var update = game.updates.shift();

  // Ugly fix to suppress error when updating state before first snap_state
  if (typeof game.monsters[update.id] != "undefined") {
    game.monsters[update.id].player_id = update.value;
  }

  var elid = "#monster_select_button_" + update.id;

  $(elid).addClass('selected');
  game.handleUpdates();
}

ROKGame.prototype.handle__monsters__health = function() {
  var update = game.updates.shift();
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
    game.handleUpdates();
  });
}

ROKGame.prototype.handle__monster_in_kyoto_city_id = function() {
  console.log("handle__monster_in_kyoto_city_id");

  var update = game.updates.shift();

  if (update.value != null) {
    this.moveMonster(update.value, "city");
  }
  game.monster_in_kyoto_city_id = update.value;
  game.handleUpdates();
}

ROKGame.prototype.handle__monster_in_kyoto_bay_id = function() {
  console.log("handle__monster_in_kyoto_bay_id");

  var update = game.updates.shift();

  if (update.value != null) {
    this.moveMonster(update.value, "bay");
  }
  game.monster_in_kyoto_bay_id = update.value;
  game.handleUpdates();
}

ROKGame.prototype.handle__monster_leaving_kyoto_city_id = function() {
  console.log("handle__monster_leaving_kyoto_city_id");

  var update = game.updates.shift();

  if (update.value != null) {
    this.moveMonster(update.value, "home");
  }

  game.handleUpdates();
}

ROKGame.prototype.handle__monster_leaving_kyoto_bay_id = function() {
  console.log("handle__monster_leaving_kyoto_bay_id");

  var update = game.updates.shift();

  if (update.value != null) {
    this.moveMonster(update.value, "home");
  }

  game.handleUpdates();
}

/**
 * Show the cards currently available for purchase.
 */
ROKGame.prototype.handle__cards_available = function() {
  console.log("ROKGame.prototype.handle__cards_available");
  var update = game.updates.shift();

  $("#sweep_cards_button").attr('disabled', false);
  for (var i = 0; i < update.value.length; i++) {
    $('#card__' + i).attr('disabled', false);
    $('#card__' + i).data('empty', false);

    var previously_available = $('#card__' + i + ' img').data('card_id');
    if (previously_available != update.value[i] && previously_available != null) {
      // This card is newly available, so animate the changing of the img. We
      // need to use setTimeout() because .html() doesn't play nice with
      // animations, and because the variables needed would change before any
      // callbacks would be called.
      var html = '<img src="' + static_ + '/images/cards/' + update.value[i] + '.jpg" alt="' + update.value[i] + '" width="117" height="91" data-card_id="' + update.value[i] + '" />';
      window.setTimeout('$("#card__" + ' + i + ').html(\'' + html + '\')', 300);
      $('#card__' + i).animate({opacity: 0}, 300).animate({opacity: 1}, 300);
    }
    else {
      // This card didn't change on this update, so immediately set the correct
      // value in the img.
      $('#card__' + i).html('<img src="' + static_ + '/images/cards/' + update.value[i] + '.jpg" alt="' + update.value[i] + '" width="117" height="91" data-card_id="' + update.value[i] + '" />');
    }
  }

  game.handleUpdates();
}

/**
 *
 */
ROKGame.prototype.handle__monsters__cards_owned = function() {
  console.log("ROKGame.prototype.handle__monsters__cards_owned");
  var update = game.updates.shift();

  for (var i = 0; i < update.value.length; i++) {
    var card_name = game.card_map[update.value[i]];
    var html = '<img src="' + static_ + '/images/cards/' + card_name + '.jpg" alt="' + card_name + '" width="50" height="39" />';
    $('#' + update.element + "__" + i).html(html);
  }

  game.handleUpdates();
}
