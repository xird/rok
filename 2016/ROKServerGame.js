/**
 * The server side version of the Game class, which inherits the base Game
 * class.
 *
 */

var util = require('util');
var uuid = require('node-uuid');
var ROKUtils = require('./public/ROKUtils.js');

// Inheritance related code:
var ROKGame = require('./public/ROKGame.js');
var ROKServerGame = function() {
  ROKGame.apply(this, arguments);
}
util.inherits(ROKServerGame, ROKGame);

var utils = new ROKUtils();

// Adding the server side methods:

/**
 * This is called from the constructor function, after the constructor has
 * determined that the class is being instantiated on the server side. This
 * functions sets up the server side game object.
 *
 * @param Object player
 *   The player creating the game
 *
 */
ROKServerGame.prototype.init = function (player) {
  utils.log("ROKServerGame.prototype.init", "debug");

  // Make a reference to this object available in the child (Monster) class.
  var game = this;

  // Names of the monsters.
  var monster_names = [
    "Alien",
    "Dragon",
    "Kong",
    "Rabbot",
    "Rex",
    "Squid"
  ];

  var cards = require('./ROKCards.js');

  // Not all browsers support 'Object.freeze(...)'
  // No, but this is _server_side_ code, so it shouldn't matter. -E
  if (Object.freeze) {
    Object.freeze(monster_names);
    Object.freeze(cards);
  }

  var card_deck = [];      // Cards in the deck (yet to be played)
  var cards_available = []// The three cards that can be purchased.

  // Put all the cards in the deck
  for (var card in cards) {
    // ..but skip the properties attribute, which isn't actually a card
    if (cards[card] != cards.properties) {
      if (ROKConfig.deck.indexOf(card) != -1) {
        card_deck.push(card);
      }
    }
  }


  /**
   * Place specific cards onthe top of the deck (for debugging)
   **
   * Cards listed in the 'topCards' array will be left ontop of the deck in the order specified.
   * This means that the first three cards listed in here will be available for monsters to purchave from the begining of the came.
   **/
  var temp, topCards = ROKConfig.top_cards;
  for (var i = 0; i < topCards.length ; i++) {
    temp = card_deck[card_deck.length - 1 - i];
    card_deck[card_deck.length - 1 - i] = card_deck[topCards[i]-1];
    card_deck[topCards[i]-1] = temp;
  }

  // Shuffle the deck (Fisher–Yates shuffle)
  for (var i = card_deck.length - topCards - 1; i > 0 ; i--) {
    var rand = Math.floor(Math.random() * (i + 1));  // Random number (0,i)

    // Swap rand and i
    var temp = card_deck[rand];
    card_deck[rand] = card_deck[i];
    card_deck[i] = temp;
  }

  // Make three cards available
  cards_available.push(card_deck.pop());
  cards_available.push(card_deck.pop());
  cards_available.push(card_deck.pop());

  // Add references to the card arrays to the game object as we need to be able
  // to send the data to the players.
  this.cards = cards;
  this.card_deck = card_deck;
  this.cards_available = cards_available;


  var game_id = uuid.v4();
  this.id = game_id;
  player.game_id = game_id;
  this.host = player.id;
  player.mode = "host";
  this.host_name = player.name;

  this.players[player.id] = player;
  this.player_ids[player.id] = player.id;

  for (var i = 0; i < 8; i++) {
    this.dice[i].value = utils.dieRoll();
  }

  this.game_state = "lobby";
  this.roll_number = 1;

  var Monster = require('./ROKMonster.js');
//  Monster.setGame(this);

  this.monsters = [];
  // Generate monsters and save them in the game object.
  for (var i = 1; i <= monster_names.length; i++) {
    this.monsters[i] = (new Monster(i, monster_names[i-1], this));
  }

  utils.log("init done", "debug");
}

/**
 * Updates attributes in the Game object. This is used instead of updating the
 * attributes directly in order to automatically keep the "updates" attribute
 * up-to-date.
 *
 * You can also call the function with the two first parameters set to false if
 * you need to add a log message that's not directly related to any state change.
 *
 * @param String field
 *   The attribute of the Game object to be updated. This is a string
 *   representation in format ATTRIBUTE__ID__ATTRIBUTE, for multi-level
 *   attributes, so it needs to be sliced before the actual game object can be
 *   updated.
 *
 * @param Mixed value
 *   The new value of the attribute
 *
 * @param String log Optional
 *   A log message to be shown to the players related to this update, if any.
 *
 */
ROKServerGame.prototype.updateState = function(field, value, log) {
  utils.log("ROKServerGame.prototype.updateState of " + field + " to " + value);

  if (field == null || value == null) {
    console.log("*** FIX YOUR SHIT! ***");
    console.log("*** FIX YOUR SHIT! ***");
    console.log("*** FIX YOUR SHIT! ***");
  }

  var update = {
    element: "",
    value: false,
    handler: "",
    id: false,
    log: "",
  };

  if (field !== false && value !== false) {
    // First, do the actual update;
    // The field needs to be given as a string, but the game object has a
    // hierarchical structure; The string needs to be sliced down to parts so
    // we can update the correct attribute.
    var parts = field.split("__");

    if (parts.length == 1) {
      this[parts[0]] = value;
    }
    else if (parts.length == 3) {
      this[parts[0]][parts[1]][parts[2]] = value;
    }
    else {
      utils.log("WTF? Field:", "debug");
      utils.log(field);
      exit();
    }

    // Then, we generate an update object so we can pass information about this
    // state change to the front end. This could be done in the above loop, but
    // that would just get too confusing.
    var handler_parts = [];
    var id = "";
    for (var i = 0; i < parts.length; i++) {
      if (isNaN(parts[i])) {
        // If the part is not numeric, we'll add it to the client side handler
        // function's name:
        handler_parts.push(parts[i]);
      }
      else {
        // If it's a number, it must be the id for an element.
        id = parts[i];
      }
    }

    if (handler_parts.length) {
      var handler = "handle__" + handler_parts.join("__");
    }
    else {
      handler = "";
    }

    update.element = field;
    update.value = value;
    update.handler = handler;
    update.id = id;
  }

  if (log) {
    update.log = log;
  }

  this.updates.push(update);
}


/**
 * Sends the whole game state to the client. The client should update all of the
 * UI without the handler functions, i.e. "snap" all the data on screen. This is
 * used at the very beginning of the game.
 *
 * @param Optional Integer player_id
 *   If given, the state is only snapped to the given player.
 *
 */
ROKServerGame.prototype.snapState = function(player_id) {
  utils.log("ROKServerGame.prototype.snapState", "debug");

  // Generate an object to be sent instead of "this", as the game object
  // contains data we don't want to send to the clients.
  var send_object = {};
  send_object.game_state = this.game_state;
  send_object.turn_phase = this.turn_phase;
  send_object.turn_monster_id = this.turn_monster_id;
  send_object.next_input_from_monster = this.next_input_from_monster;
  send_object.roll_number = this.roll_number;
  send_object.monster_order = this.monster_order;
  send_object.original_monster_order = this.original_monster_order;

  // Sending a circular reference over a socket crashes the server. Since the
  // game has a reference to the monsters, and each monster has a reference to
  // the game, we need to strip out the game reference from the monsters before
  // sending them over. And since we don't want to change the _actual_ monsters,
  // we need to do a deep copy.
  var monsters_data = {};
  for (var monster in this.monsters) {
    monsters_data[monster] = this.monsters[monster].getData();
  }
  send_object.monsters = monsters_data;

  send_object.dice = this.dice;
  send_object.winner = this.winner;
  send_object.monster_in_kyoto_city_id = this.monster_in_kyoto_city_id;
  send_object.monster_in_kyoto_bay_id = this.monster_in_kyoto_bay_id;
  send_object.monster_leaving_kyoto_city_id = this.monster_leaving_kyoto_city_id;
  send_object.monster_leaving_kyoto_bay_id = this.monster_leaving_kyoto_bay_id;
  send_object.cards_available = this.cards_available;

  // This is needed to map monsters' owned card ids to the names of the cards so
  // we can use the correct image file.
  var card_map = {};
  for(var name in this.cards) {
    var value = this.cards[name];
    if (name != "properties") {
      card_map[value] = name;
    }
  }
  send_object.card_map = card_map;

  // Loop through all players in this game and send them the data.
  for (var game_player_id in this.players) {
    // Send to this player if no player id was given, or if the currently looped
    // player is the given player.
    if (typeof player_id == "undefined" || game_player_id == player_id) {
      send_object.this_monster_id = this.players[game_player_id].monster_id;
      var player_object = this.players[game_player_id];
      var socket_id = player_object.socket_id;
      var target_socket = this.iosockets[socket_id];
      target_socket.emit("snap_state", send_object);
    }
  }

  // Clean up the change log, as all the changes have now been transmitted.
  this.updates = [];
}


/**
 * Sends game state changes to the clients. The changes should be animated by
 * the client. This is used when the game is in progress.
 */
ROKServerGame.prototype.sendStateChanges = function() {
  utils.log("ROKServerGame.prototype.sendStateChanges", "debug");

  // Loop through all players in this game and send them the data.
  for (var game_player_id in this.players) {
    var this_monster_id = this.players[game_player_id].monster_id;
    var player_object = this.players[game_player_id];

    var send_object = {
      updates: this.updates,
      this_monster_id: this_monster_id
    };

    var socket_id = player_object.socket_id;
    var target_socket = this.iosockets[socket_id];
    if (typeof target_socket != "undefined") {
      target_socket.emit("state_changes", send_object);
    }
    else {
      utils.log("ERROR: target socket not found. Socket id: " + socket_id);
      utils.log("Sockets:", "debug");
      utils.log(this.iosockets);
    }
  }

  // Clean up the change log, as all the changes have now been transmitted.
  this.updates = [];
}


/**
 * @param monster_id int The id of the monster needed.
 *
 * @return Object A monster object
 *
 */
ROKServerGame.prototype.getMonster = function(monster_id) {
  utils.log('ROKServerGame.prototype.getMonster ' + monster_id);
  return this.monsters[monster_id];
}


/**
 * Moves the game to the turn phase where the user can  *  * buy cards.
 *
 * CARDS:  * Buy cards if there's money - skip the buy phase if there isn't
 * CARDS: "Alien metabolism"
 * CARDS: Resolve any discard cards and do a win check
 */
ROKServerGame.prototype.buyCards = function() {
  utils.log("ROKServerGame.prototype.buyCards", "debug");
  var log_message = this.monsters[this.turn_monster_id].getName() + ' can buy cards.'
  this.updateState("turn_phase", 'buy', log_message);
  // Reset NIFP, in case yield resolution has changed it.
  this.updateState("next_input_from_monster", this.turn_monster_id);
  this.sendStateChanges();
}

/**
 * A player is trying to buy a card.
 *
 * @param player Object The player buying the card.
 * @param available_card_index Integer
 *   The index of the card to be bought in the cards_available array.
 *
 * NOTE: The function was moved here from the Monster class since the Monster
 * object doesn't have a Game reference, and thus can't access the card data.
 */
ROKServerGame.prototype.buyCard = function(player, available_card_index) {
  utils.log("ROKServerGame.prototype.buyCard", "debug");
  utils.log("player:", "debug");
  utils.log(player);
  utils.log("available_card_index:", "debug");
  utils.log(available_card_index);

  if (this.turn_phase != "buy" && !ROKConfig.always_allow_buying_cards) {
    utils.log("This is no time to be buying cards.", "debug");
    return;
  }
  if (this.turn_monster_id != player.monster_id && !ROKConfig.always_allow_buying_cards) {
    utils.log("It's not your turn, I'm not selling you anything.", "debug");
    return;
  }

  var card = this.cards[this.cards_available[available_card_index]];
  utils.log("card:", "debug");
  utils.log(card)
  var monster = this.monsters[player.monster_id];
  var price = this.cards.properties[card].cost;
  var cost = this.card_hook("BUY_CARD", { "monster_id": monster.getId(), "value_to_alter": price });

  // A monster can attempt to buy cards they can't afford but the purchace
  // will be denied.
  if (cost > monster.getSnot()) {
    utils.log("Does this look like a charity.  Come back when you have more snot!", "debug");

    // Send a status update to reset the UI on the client side.
    this.updateState("cards_available", this.cards_available);
    this.sendStateChanges();

    return;
  }

  // Deduct the money from the monster.
  monster.addSnot(-cost);
  this.updateState("monsters__" + monster.getId() + "__snot", monster.getSnot());

// This may be a situation where 'player_monster' is different to 'turn_monster_id' if a player buys cards when it is not there turn.  I think there is a card called 'The Opertunist' which allows this.

  // Add the card to the monster/
  monster.addCard(card);

  this.card_hook("CARD_BOUGHT", { "monster_id": monster.getId(), "value_to_alter": card });
  if (!this.cards.properties[card].keep) {
    monster.removeCard(); // Pop's last card.
  }
  this.updateState("monsters__" + monster.getId() + "__cards_owned", monster.getCardsOwned());

  // Move a card from the deck to the available cards:
  var cards_available = this.cards_available;
  cards_available[available_card_index] = this.card_deck.pop();
  this.updateState("cards_available", cards_available , monster.getName() + " bought " + this.cards.properties[card].name + ".");

  this.sendStateChanges();
}


/**
 * User has chosen not to buy any cards or has no money to buy anything.
 */
ROKServerGame.prototype.doneBuying = function (player) {
  utils.log("ROKServerGame.prototype.doneBuying", "debug");
  // Check that it's this player's turn
  if (this.turn_phase == 'buy') {
    if (this.turn_monster_id == player.monster_id) {
      this.endTurn();
      this.sendStateChanges();
    }
    else {
      utils.log("ERROR: Not this user\'s turn", "debug");
      player.getSocket().emit('game_message', "It's not your turn.");
    }
  }
  else {
    utils.log("ERROR: Not buying phase", "debug");
    player.getSocket().emit('game_message', "It's not the buying phase.");
  }
}

/**
 * User sweeps the available cards, i.e. discards all available cards and
 * replaces them with new cards from the deck.
 */
ROKServerGame.prototype.sweepCards = function (player) {
  utils.log("ROKServerGame.prototype.sweepCards", "debug");

  if (this.monsters[player.monster_id].getSnot() < 2) {
    console.log("Not enough money to sweep cards");

    // This is here to trigger the handle__cards_available handler on client
    // side so that the button gets re-enabled.
    this.updateState('cards_available', this.cards_available);
    this.sendStateChanges();

    player.getSocket().emit("game_message", "You don't have enough snot to sweep.");

    return false;
  }

  this.monsters[player.monster_id].addSnot(-2);
  this.updateState("monsters__" + player.monster_id + "__snot", this.monsters[player.monster_id].getSnot());

  var cards_available = [];
  cards_available[0] = this.card_deck.pop();
  cards_available[1] = this.card_deck.pop();
  cards_available[2] = this.card_deck.pop();
  this.updateState('cards_available', cards_available, this.monsters[player.monster_id].getName() + " sweeps cards.");
  this.sendStateChanges();
}

/**
 *
 */
ROKServerGame.prototype.activateCard = function (player, owned_card_index) {
  utils.log("ROKServerGame.prototype.activateCard " + owned_card_index);
  var card_id = this.monsters[player.monster_id].cards_owned[owned_card_index];
  utils.log(card_id);
  if (typeof this.cards.properties[card_id].activate == "function") {
    this.cards.properties[card_id].activate(this, player.monster_id);
  }
}

/**
 * Move to the final phase of a user's turn.
 */
ROKServerGame.prototype.endTurn = function() {
  utils.log("ROKServerGame.prototype.endTurn", "debug");

  for (var i = 0; i < this.monster_order.length; i++) {
    this.card_hook("TURN_END_ALL", {"monster_id": this.monster_order[i]});
  }

  this.card_hook("TURN_END");
  var _this_turn_monster = this.monsters[this.turn_monster_id];

  // Turn end.
  var log_message = _this_turn_monster.getName() + " ends their turn.";
  this.updateState("turn_phase", 'end', log_message);
  // CARDS: Resolve poison counters. Check if this is done on the poisoned monster's turn or the poisoning monster's turn


  // Advance to the next player's turn.
  this.updateState("turn_phase", 'start');
  this.updateState("roll_number", 1);

  var current_monster_index = this.monster_order.indexOf(this.turn_monster_id);
  var next_monster_index = current_monster_index + 1;  // does this account for monster deaths?  Note 'next_monster_index' was used for setting active dice above.  Perhaps 'next_monster_index' should be a method rather than a varable.
  if (typeof this.monster_order[next_monster_index] == 'undefined') {
    next_monster_index = 0;
  }

  log_message = this.monsters[this.monster_order[next_monster_index]].getName() + "'s turn.";
  this.updateState("turn_monster_id", this.monster_order[next_monster_index], log_message);
  this.updateState("next_input_from_monster", this.monster_order[next_monster_index]);
  _this_turn_monster = this.monsters[this.turn_monster_id];

  // Beginning of new player's turn.
  // Reset dice
  for (var i = 0; i < 8; i++) {
    if (i < _this_turn_monster.numberOfDice()) {
      this.updateState("dice__" + i + "__state", 'i');
    }
    else {
      this.updateState("dice__" + i + "__state", 'n');
    }
  }

  // If in Kyoto, increment VP.
  if (this.inKyoto(_this_turn_monster)) {
    _this_turn_monster.kyotoHeld();
  }

  if (this.checkWin()) {
    this.finishGame();
  }
  else {
    this.updateState("turn_phase", 'roll');
    this.sendStateChanges();
  }
}


/**
 * Player rolling dice.
 *
 * CARDS: Background dweller
 * CARDS: Additional full reroll cards
 *
 * @param keep_dice_ids array The ids of the dice that are not to be
 * re-rolled.
 */
ROKServerGame.prototype.rollDiceClicked = function (player, keep_dice_ids) {
  utils.log("ROKServerGame.prototype.rollClicked", "debug");

  if (this.checkRollState(player)) {
    var monster = this.monsters[player.monster_id];
    var log_message = "";
  }
  else {
    // If checkRollState() returns false, it's not the time for rolling, so we
    // return early. This happens for example when a client sends a roll event
    // at the wrong time for any reason.
    utils.log("checkRollState() returned false, bailing out.", "debug");
    return;
  }

  var reroll = false;
  for (var i = 0; i < monster.numberOfDice(); i++) {
    var die = this.dice[i];

    if (die.state == 'i') {   // Always roll all dice initially.
      die.state = 'r';
    }
    else {
      die.state = (keep_dice_ids.indexOf(i) == -1) ? 'r' : 'k';
      die = this.card_hook("DICE_STATE", { "value_to_alter": die });

      if (die.state == 'rr') {
        reroll = true;
      }
    }
  }

  if (reroll) {
    this.rollDice(monster, 'rr');
  }
  else if (this.roll_number <= monster.numberOfRolls()) {
    this.rollDice(monster, 'r');
    this.updateState("roll_number", this.roll_number + 1, log_message);
  }

  // Check if client could possably reroll.
  reroll = false;
  for (var i = 0; i < monster.numberOfDice(); i++) {
    if (this.dice[i].state == 'rr' || this.dice[i].state == 'kr') {
      reroll = true;
      break;
    }
  }

  // Check for end of rolling condition
  if (keep_dice_ids.length == monster.numberOfDice() || (this.roll_number > monster.numberOfRolls() && !reroll)) {
    utils.log("      monster ends rolls", "debug");

    // Set the state of all dice to 'f' (final)
    for (var i = 0; i < this.dice.length; i++) {
      if (this.dice[i].state != 'n') {
        this.updateState("dice__" + i + "__state", 'f');
      }
    }

    // Advance to next turn phase: resolve
    // Note that we're not sending state changes here, since there will
    // be more changes after the rolls are resolved.  We will send the state upon returning
    this.resolveDice(player);
    // Calling 'resolveDice(...)' means the next call to 'sendStateChanges()' at the end of the method will display a prompt that will ultimatly lead us away from this method.
  }
  // else the player will prompted to roll again

  this.sendStateChanges();  // Get another click.
                            // The click will either bring us back here (roll again)
                            // or lead us to the nest phase (buy cards).
}


/**
 *
 */
ROKServerGame.prototype.rollDice = function (player_monster, state_to_roll) {
  utils.log("ROKServerGame.prototype.rollDice", "debug");

  roll_log = player_monster.getName() + " rolls ";
  //gets_log = player_monster.getName() + "  gets: ";

  // Flag variable for detecting situation where the monster keeps all
  // the dice
  for (var i = 0; i < player_monster.numberOfDice(); i++) {
    utils.log("        Rolling?", "debug");
    // Roll only dice that are not kept
    if (this.dice[i].state == 'i' || this.dice[i].state == state_to_roll) {
      utils.log("          Rolling.", "debug");
      var die = { state: 'r', value: utils.dieRoll() };
      die = this.card_hook("DICE_STATE", { "value_to_alter": die });

      this.updateState("dice__" + i + "__value", die.value);
      this.updateState("dice__" + i + "__state", die.state);


      roll_log += '<span class="log_dice_rolled">' + this.dice[i].value + "</span>";
    }
    else {
      // Update the state of kept dice so we can animate the kept dice for other
      // players.
      this.updateState("dice__" + i + "__state", this.dice[i].state);
      roll_log += '<span class="log_dice_kept">' + this.dice[i].value + "</span>";
    }

    //gets_log += this.dice[i].value + (i < player_monster.numberOfDice() - 1 ? ", " : "");
  }

  this.updateState(false, false, roll_log);
  //this.updateState(false, false, gets_log);
}


/**
 *
 */
ROKServerGame.prototype.doneRollingClicked = function (player) {
  if (this.turn_monster_id != player.monster_id) {
    utils.log("It's not your turn so you can't be done rolling.", "debug");
    return;
  }
  if (this.turn_phase != "roll") {
    utils.log("You can only be done rolling when it's the rolling phase.", "debug");
    return;
  }
  if (this.turn_phase == "roll" && this.roll_number == 1) {
    utils.log("You have to roll at least once.", "debug");
    return;
  }

  // Set the state of all dice to 'f' (final)
  for (var i = 0; i < this.dice.length; i++) {
    if (this.dice[i].state != 'n') {
      this.updateState("dice__" + i + "__state", 'f');
    }
  }

  this.resolveDice(player);
  this.sendStateChanges();
}


/**
 *
 */
ROKServerGame.prototype.checkRollState = function(player) {
  var rv = false;

  if (this.game_state == 'play') {
    utils.log("  state play", "debug");
    if (this.turn_phase == 'roll') {
      utils.log("    phase roll", "debug");
      if (this.turn_monster_id == player.monster_id) {
        utils.log("      It's this monster's turn", "debug");

        rv = true;
      }
      else {
        utils.log("ERROR: Not this monster's turn", "debug");
        player.getSocket().emit("game_message", "It's not your turn to roll");
      }
    }
    else {
      utils.log("    ERROR: not roll phase", "debug");
      player.getSocket().emit('game_message', "Not roll phase.");
    }
  }
  else {
    utils.log("ERROR: game not being played", "debug");
    player.getSocket().emit('game_message', "Game not being played.");
  }

  return rv;
}


/**
 * Resolves the results of the dice rolls after all the rerolls are done.
 *
 * STRICT: players should be allowed to resolve dice in any order
 */
ROKServerGame.prototype.resolveDice = function(player) {
  utils.log("ROKServerGame.prototype.resolveDice", "debug");
  this.updateState("turn_phase", 'resolve');
  this.card_hook("RESOLVE_DICE");

  this.resolveSnotDice(player);
  this.resolveHealthDice(player);
  this.resolveVictoryPointDice(player);
  this.resolveAttackDice(player);
  this.checkWin();
}


/**
 * Resolve attack dice
 */
ROKServerGame.prototype.resolveAttackDice = function(player) {
  utils.log("ROKServerGame.prototype.resolveAttackDice", "debug");

  var _this_turn_monster = this.monsters[this.turn_monster_id];
  var log_message = "";
  // Calculate attack.
  var attack = 0; // Note: Cards can cause damage without an attack

  for (var i = 0; i < 8; i++) {
    if (this.dice[i].state == 'f' && this.dice[i].value == "p") {
      attack++;
    }
  }

  var attackage = {
    "attack": attack,
    "damage": attack
  };

  // If the attacking monster is in Kyoto, target all monsters outside Kyoto.
  // If the attacking monster is not in Kyoto, target all monsters in Kyoto.
  var target_monsters = [];

  // Fill target monster array
  for (var mid in this.monsters) {
    if (this.inKyoto(this.monsters[mid]) != this.inKyoto(_this_turn_monster)) {
      // Only attack monsters that are alive.
      if (this.monsters[mid].getHealth() > 0) {
        target_monsters.push(mid);
      }
    }
  }

  utils.log("Target monsters: " + utils.dump(target_monsters));

  if (target_monsters.length > 0) {
    /**
     * Fetcher method for retrieving any additional damage this monster inflicts
     *
     * @param attackage object: The amount of attack and damage the monster initiates
     **
     * @return int The amount of attack and damage the monster will inflict
     **
     * As per the rules cards can be used to implement additional damage, however
     * cards do not instigate an attack. The subtle difference between attacks and
     * damage is that while monsters in Kyoto can be damaged by 'damage' they can
     * only yield Kyoto if they are 'attacked'.
     **/
    attackage = this.card_hook("RESOLVE_ATTACK_DICE", { "value_to_alter": attackage });

    // Targets monsters are now defined in an array, loop through and apply damage:
    for (var i = 0; i < target_monsters.length; i++) {
      var target_monster = this.monsters[target_monsters[i]];
      target_monster.applyDamage(attackage.damage);
    }
  }

  // Check deaths
  this.checkDeaths(); // If a monster in Kyoto died, it vacaites its post.

  // If the attacking monster isn't in Kyoto, and an attachas been executed,
  // ask for yield.
  if (!this.inKyoto(_this_turn_monster) && attack > 0) {
    // askBayYield() will delegate the question to askCityYield, if there's
    // no-one in the bay.
    utils.log("  resolveAttackDice calling askBayYield", "debug");
    this.askBayYield();
  }
  else {
    utils.log("    No-one to yield", "debug");
    // Progress to the next phase
    this.buyCards();
  }
}


/**
 * Ask for yield from Kyoto Bay
 **
 * If Kyoto Bay is empty we will advance to asking about Kyoto City
 * If Kyoto Bay is occupied the 'resolveYield(...)' will advance to asking about Kyoto City
 **/
ROKServerGame.prototype.askBayYield = function () {
  utils.log("ROKServerGame.prototype.askBayYield", "debug");

  if (this.monster_in_kyoto_bay_id != null) {
    // Dead monsters yield automatically.
    if (this.monsters[this.monster_in_kyoto_bay_id].getHealth() <= 0) {
      this.checkEnterKyoto();
    }
    else {
      this.updateState('next_input_from_monster', this.monster_in_kyoto_bay_id);
      var log_message = this.monsters[this.monster_in_kyoto_bay_id].getName() + " can yield Kyoto Bay.";
      this.updateState('turn_phase', 'yield_kyoto', log_message);
      this.sendStateChanges();
    }
  }
  else {
    utils.log("  no-one in the bay, calling askCityYield", "debug");
    this.askCityYield();
  }
}


/**
 * Ask for yield from Kyoto City
 **
 * If Kyoto City is empty we will advance to attempting to enter Kyoto
 * If Kyoto City is occupied the 'resolveYield(...)' will advance to attempting to enter Kyoto
 **/
ROKServerGame.prototype.askCityYield = function() {
  utils.log("ROKServerGame.prototype.askCityYield", "debug");

  if (this.monster_in_kyoto_city_id != null) {
    if (this.monsters[this.monster_in_kyoto_city_id].getHealth() <= 0) {
      utils.log(" The monster in the city is dead", "debug");
      this.checkEnterKyoto();
    }
    else {
      this.updateState('next_input_from_monster', this.monster_in_kyoto_city_id);
      var log_message = this.monsters[this.monster_in_kyoto_city_id].getName() + " can yield Kyoto City.";
      this.updateState('turn_phase', 'yield_kyoto', log_message);
      this.sendStateChanges();
    }
  }
  else {
    this.checkEnterKyoto();
  }
}

/**
 * Handle responce to monsters reply to yield question.
 *
 * CARDS: "Jets" - Don't decrement health when yielding
 */
ROKServerGame.prototype.resolveYield = function(part_of_kyoto, yielding) {
  utils.log("ROKServerGame.prototype.resolveYield", "debug");
  utils.log("part: " + part_of_kyoto + ', yielding: ' + yielding);

  var monster_name = this.monsters[this.next_input_from_monster].getData().name;

  if (yielding) {
    this.monsters[this.next_input_from_monster].yieldKyoto();
    this.updateState(false, false, monster_name + " yields Kyoto " + part_of_kyoto + " to " + this.monsters[this.turn_monster_id].getData().name + ".");

    var damage = this.card_hook("YIELD_KYOTO", { "monster_id": this.next_input_from_monster });
    this.monsters[this.turn_monster_id].applyDamage(damage);
  }
  else {
    this.updateState(false, false, monster_name + " stays in Kyoto " + part_of_kyoto);
  }

  if (part_of_kyoto == "bay") {
    this.askCityYield();
  }
  else if (part_of_kyoto == "city"){
    this.checkEnterKyoto();
  }
  else {
    // Should never end up in this branch
    utils.log(this);
    utils.log("FATAL ERROR: ResolveYield in neither City or the Bay\npart_of_kyoto: " + part_of_kyoto);
    process.quit();
  }
}


/**
 * Enter Kyoto (if available)
 **
 * This method ends by advancing us to the "Buy Cards" phase
 **/
ROKServerGame.prototype.checkEnterKyoto = function() {
  utils.log("ROKServerGame.prototype.checkEnterKyoto", "debug");
  utils.log("this.monster_in_kyoto_city_id : " + this.monster_in_kyoto_city_id);

  _this_turn_monster = this.monsters[this.turn_monster_id];

  if (this.monster_in_kyoto_city_id == null) {
    this.updateState("monster_in_kyoto_city_id", _this_turn_monster.getId());
    _this_turn_monster.enterKyoto();
  }
  else if (    Object.keys(this.monsters).length > 4
            && this.monster_in_kyoto_bay_id == null) {

    this.updateState("monster_in_kyoto_bay_id", _this_turn_monster.getId());
    _this_turn_monster.enterKyoto();
  }

  // Progress to the next phase
  this.buyCards();
}


/**
 * Check if any of the monsters are dead.
 */
ROKServerGame.prototype.checkDeaths = function() {
  utils.log("ROKServerGame.prototype.checkDeaths", "debug");
  for (var mid in this.monsters) {
    mid = parseInt(mid);
    if (this.monsters[mid].getHealth() < 1) {
      this.card_hook("MONSTER_DIES", { "monster_id": mid });

      utils.log(this.monsters[mid].getName() + ' is dead');
      // Remove monster from monster_order so it doesn't get to play.
      var log_message = this.monsters[mid].getName() + " is killed.";
      var monster_order = this.monster_order;
      var index = monster_order.indexOf(mid)
      if (index != -1) {
        monster_order.splice(index, 1);
        this.updateState('monster_order', monster_order, log_message);
      }

      // Dead monsters aren't in Kyoto.
      if (this.monster_in_kyoto_city_id == mid) {
        utils.log("  removing dead monster " + mid + " from the city", "debug");
        this.updateState("monster_in_kyoto_city_id", null);
        this.updateState("monster_leaving_kyoto_city_id", mid);
      }
      if (this.monster_in_kyoto_bay_id == mid) {
        utils.log("  removing dead monster " + mid + " from the bay", "debug");
        this.updateState("monster_in_kyoto_bay_id", null);
        this.updateState("monster_leaving_kyoto_bay_id", mid);
      }
    }
  }
}


/**
 * Check if anyone has won yet.
 */
ROKServerGame.prototype.checkWin = function() {
  utils.log("ROKServerGame.prototype.checkWin", "debug");
  var log_message = "";
  // Check if there's only one monster left.
  if (this.monster_order.length == 1) {
    log_message = this.monsters[this.monster_order[0]].getName() + " is the last monster standing.";
    this.updateState(false, false, log_message);
    log_message = this.monsters[this.monster_order[0]].getName() + " wins!";
    this.updateState("game_state", "over", log_message);
    return true;
  }

  // Check if anyone got to 20 victory points
  for (var i = 0; i < this.monster_order.length; i++) {
    var victory_points = this.monsters[this.monster_order[i]].getVictoryPoints();
    if (victory_points >= 20) {
      log_message = this.monsters[this.monster_order[i]].getName() + " has taken a 'soft win' by getting to " + victory_points + " victory points.";
      this.updateState(false, false, log_message);
      log_message = this.monsters[this.monster_order[i]].getName() + " wins!";
      this.updateState("game_state", "over", log_message);
      return true;
    }
  }
}


/**
 * The game has ended, do any final setup tasks.
 */
ROKServerGame.prototype.finishGame = function() {
  this.updateState('game_state', 'over');
  this.updateState('winner', this.monster_order[0]);
  this.sendStateChanges();
}


/**
 * Gets yield input from monster in Kyoto bay
 */
ROKServerGame.prototype.askYieldKyotoBay = function(player) {
  utils.log("ROKServerGame.prototype.andYieldKyotoBay", "debug");
  this.updateState('next_input_from_monster', this.monster_to_yield_kyoto_bay);
  var log_message = this.monsters[this.monster_to_yield_kyoto_bay].getName() + " can yield Kyoto bay.";
  this.updateState('turn_phase', 'yield_kyoto_bay', log_message);
  this.sendStateChanges();
}


/**
 * Resolve snot cubes.
 */
ROKServerGame.prototype.resolveSnotDice = function(player) {
  utils.log("ROKServerGame.prototype.resolveSnotDice", "debug");
  var _this_turn_monster = this.monsters[this.turn_monster_id];

  // CARDS: take cards into account: "Friend of children", etc.
  var additional_snot = 0;
  for (var i = 0; i < this.dice.length; i++) {
    if (this.dice[i].state == 'f' && this.dice[i].value == 's') {
      additional_snot++;
    }
  }
  utils.log('additional_snot: ' + additional_snot);

  _this_turn_monster.addSnot(additional_snot);
}


/**
 * Resolve health dice.
 */
ROKServerGame.prototype.resolveHealthDice = function(player) {
  utils.log("ROKServerGame.prototype.resolveHealthDice", "debug");

  var _this_turn_monster = this.monsters[this.turn_monster_id];
  var additional_health = 0;
  for (var i = 0; i < this.dice.length; i++) {
    if (this.dice[i].state == 'f' && this.dice[i].value == 'h') {
      additional_health++;
    }
  }
  utils.log('additional_health: ' + additional_health);
  if (additional_health > 0) {
    if (!this.inKyoto(_this_turn_monster)) {
      _this_turn_monster.addHealth(additional_health);
    }
    else {
      var log_message = this.monsters[this.turn_monster_id].getName() + " can't heal in Kyoto.";
      this.updateState(false, false, log_message);
    }
  }
  // else no health to heal...
}


/**
 * Resolve VP dice.
 */
ROKServerGame.prototype.resolveVictoryPointDice = function(player) {
  utils.log("ROKServerGame.prototype.resolveVPDice", "debug");

  var _this_turn_monster = this.monsters[this.turn_monster_id];
  var victory_points_dice = {
    1: 0,
    2: 0,
    3: 0,
  };
  for (var i = 0; i < this.monsters[this.turn_monster_id].numberOfDice(); i++) {
    switch (this.dice[i].value) {
      case '1': victory_points_dice[1]++; break;
      case '2': victory_points_dice[2]++; break;
      case '3': victory_points_dice[3]++; break;
    }
  }

  var additional_victory_points = 0;
  for (var points in victory_points_dice) {
    if (victory_points_dice[points] > 2) {
      utils.log("Add " + points + " from " + points + "s", "debug");
      additional_victory_points += parseInt(points);
      var extra_victory_points = 0;
      extra_victory_points = victory_points_dice[points] - 3;
      if (extra_victory_points > 0) {

        additional_victory_points += extra_victory_points;
        utils.log("  Add " + extra_victory_points + " extra points from extra " + points + "s", "debug");
      }
    }
  }

  utils.log("additional_victory_points: " + additional_victory_points);

  var log_message = _this_turn_monster.getName() + " rolls " + additional_victory_points + " VP.";
  _this_turn_monster.addVictoryPoints(additional_victory_points, log_message);

  // CARDS: Take number roll modifier cards into account ("111 counts as 333")
}


/**
 * Assigns a monster to a player
 *
 * @param player Object The player selecting a monster.
 * @param monster_id Integer The id of the monster being selected
 *
 */
ROKServerGame.prototype.selectMonster = function (player, selected_monster_id) {
  utils.log("ROKServerGame.prototype.selectMonster " + selected_monster_id);

  if (this.game_state == "select_monsters") {
    // Check that the monster hasn't been selected already
    if (this.monsters[selected_monster_id].getPlayerId() == 0) {
      // Check that the player hasn't already selected a monster.
      if (player.monster_id == 0) {
        // Set monster to player:
        player.monster_id = selected_monster_id;
        this.monsters[selected_monster_id].setPlayerId(player.id);

        // Set player to monster
        this.updateState('monsters__' + selected_monster_id + '__player_id', this.monsters[selected_monster_id].getPlayerId());

        // If this was the last player to select a monster, advance the game state.
        var ready = 1;
        for (var game_player_id in this.player_ids) {
          if (this.players[game_player_id].monster_id == 0) {
            ready = 0;
          }
        }

        if (ready) {
          // Start the game
          this.beginGame();
          // Send all the information...
          // Note: This needs to go to all players.
          this.snapState();
          // .. and then add messages about the beginning of the game.
          // Separately, because snapState() doesn't know what to do with log
          // messages.
          this.updateState(false, false, "The game begins.");
          this.updateState(false, false, this.monsters[this.turn_monster_id].getName() + "'s turn.");
          this.sendStateChanges();
        }
        else {
          // Send information about monsters that can't be selected
          this.sendStateChanges();
        }

      }
      else {
        utils.log("ERROR: already selected error", "debug");
        var msg = "You have already selected a monster.";
        player.getSocket().emit("game_message", msg);
      }
    }
    else {
      utils.log("ERROR monster already selected", "debug");
      var msg = "That monster is already selected.";
      player.getSocket().emit("game_message", msg);
    }
  }
  else {
    utils.log("ERROR: not in monster_selection error", "debug");
    var msg = "This is not the time to select a monster.";
    player.getSocket().emit("game_message", msg);
  }
}


/**
 * Starts the game.
 *
 */
ROKServerGame.prototype.beginGame = function() {
  utils.log('ROKServerGame.prototype.beginGame ' + this.id);

  this.updateState("game_state", "play");

  // Drop any monsters not in play.
  var played_monsters = [];
  for (var p in this.player_ids) {
    played_monsters.push(this.players[p].monster_id);
  }

  var new_monsters = {};
  var monster_ids = Object.keys(this.monsters);
  for (var i = 0; i < monster_ids.length; i++) {
    if (played_monsters.indexOf(this.monsters[monster_ids[i]].getId()) != -1) {
      new_monsters[monster_ids[i]] = this.monsters[monster_ids[i]];
    }
  }
  this.monsters = new_monsters;

  // Generate and randomize monster order
  var monster_order = [];
  for (var player_id in this.player_ids) {
    monster_order.push(this.players[player_id].monster_id);
  }
  if (ROKUtils.randomize_monster_order) {
    monster_order = utils.shuffleArray(monster_order);
  }
  this.monster_order = monster_order;

  // Original order is needed to keep ordering the monsters the same way after
  // one of them dies.
  this.original_monster_order = JSON.parse(JSON.stringify(this.monster_order));

  // Note: We skip the "start" phase of the turn, since there's nothing to do
  // in the beginning of the turn at the start of the game.
  this.updateState("turn_phase", "roll");
  this.updateState("turn_monster_id", this.monster_order[0]);
  this.updateState("next_input_from_monster", this.monster_order[0]);

  // Loop through all players in this game.
  for (var game_player_id in this.player_ids) {
    var socket_id = this.players[game_player_id].socket_id;
    var target_socket = this.iosockets[socket_id];

    target_socket.emit("start_game");
  }

  // In case other players dropped during monster selection, this ends the game
  // immediately.
  if (this.checkWin()) {
    this.finishGame();
  }
}


/**
 * Adds a player to the game. Note that this happens in such an early stage of
 * the game that using the updateState function isn't necessary yet.
 *
 */
ROKServerGame.prototype.addPlayer = function(player) {
  utils.log("ROKServerGame.prototype.addPlayer", "debug");

  // Check that the player isn't in the game already.
  if (this.player_ids.hasOwnProperty(player.id) == false) {
    // Update game id of invited player
    player.game_id = this.id;
    player.mode = "client";

    // Update the game itself
    this.players[player.id] = player;
    this.player_ids[player.id] = player.id;
  }
  else {
    utils.log("ERROR: The player is already invited.", "debug");
    var msg = "That player is already invited";
    player.getSocket().emit("lobby_message", msg);
  }
}


/**
 * A player is leaving the game, hopefully once the game is over. This is also
 * used when idle players are cleaned up.
 *
 */
ROKServerGame.prototype.leaveGame = function(player) {
  utils.log("ROKServerGame.prototype.leaveGame " + player.name);

  var monster_id_used = player.monster_id;

  // Remove this game from the player's data.
  player_mode = player.mode;
  player.mode = '';
  player.monster_id = 0;
  player.game_id = 0;

  if (this.game_state == 'over') {
    // Normal case, players leaving after game ends.
    var monster_order = this.monster_order;
    var index = monster_order.indexOf(monster_id_used);
    if (index != -1) {
      monster_order.splice(index, 1);
      utils.log("mo:", "debug");
      utils.log(monster_order);
      this.updateState('monster_order', monster_order);
    }

    // Note: The player is added to the lobby in index.js.
  }
  else if (this.game_state == 'lobby' || this.game_state == 'select_monsters') {
    // Game never got going.
    delete this.players[player.id];
    delete this.player_ids[player.id];
  }
  else {
    // Player leaving while game is still going on.

    var monster = this.monsters[monster_id_used];
    monster.setPlayerId(0);
    this.updateState("monsters__" + monster_id_used + "__player_id", monster.getPlayerId());

    // If it was the player's turn, end the turn.
    if (this.turn_monster_id == monster_id_used) {
      this.endTurn();
    }

    // Kill monster
    var log_message = monster.getName() + "'s player has left the game.";
    monster.addHealth(-monster.getHealth());
    this.updateState('monsters__' + monster_id_used + '__health', monster.getHealth(), log_message);
    // CARDS Make sure "it has a child" doesn't respawn the monster...

    // If the monster was yielding, advance the turn_phase
    utils.log(this.turn_phase);
    if (this.turn_phase == 'yield_kyoto_city' || this.turn_phase == 'yield_kyoto_bay') {
      utils.log("detected yielding quitter", "debug");
      this.updateState('turn_phase', 'buy');
      this.updateState('next_input_from_monster', this.turn_monster_id);
    }

    this.checkDeaths();
    this.checkWin();

    delete this.players[player.id];
    delete this.player_ids[player.id];

    this.sendStateChanges();
  }

  // Note: After the last player has left the game, the game will be cleaned up
  // in cleanUpIdlePlayers().
}


/**
 * Starts the game with the invited players
 *
 */
ROKServerGame.prototype.confirmGame = function(player) {
  utils.log("ROKServerGame.prototype.confirmGame", "debug");

  // Check that the player running this is a host.
  if (player.mode == 'host') {
    // Check that there are at least two players in the game
    if (Object.keys(this.players).length >= 2) {
      this.updateState("game_state", "select_monsters");

      // Send the game status change
      this.sendStateChanges();

      return true;
    }
    else {
      utils.log("ERROR: not enough players", "debug");
      // Notify the player.
      var msg = "At least two players are needed to play.";
      player.getSocket().emit("lobby_message", msg);
    }
  }
  else {
    utils.log("ERROR: not a host", "debug");
    // Notify the player that he needs to be a host to confirm a game.
    var msg = "Only the host can confirm a game.";
    player.getSocket().emit("lobby_message", msg);
  }
}

/**
 * This function is called whenever a card may have an effect on the game.
 *
 */
ROKServerGame.prototype.card_hook = function(hook_name, params) {
  utils.log("ROKServerGame.prototype.card_hook(" + hook_name + ")", "debug");

  if (typeof params == "undefined") {
    var params = {};
  }

  if (typeof params['value_to_alter'] == "undefined") {
    params['value_to_alter'] = false;
  }
  var value_to_alter = params['value_to_alter'];

  if (typeof params['monster_id'] == "undefined") {
    params['monster_id'] = this.turn_monster_id;
  }

  var cards_to_run = [];  // Note, we must save the cards rather than just the hooks as it's the cards that have the priority.
  // Cycle through cards the applicable monster owns.
  for (var i = 0; i < this.monsters[params['monster_id']].getCardsOwned().length; i++) {
    var card_id = this.monsters[params['monster_id']].getCardsOwned()[i];
    var card = this.cards.properties[card_id];
    if (typeof card.hooks[hook_name] == "function") {
      if (typeof card.priority == "undefined") {
        card.priority = 0;
      }
      cards_to_run.push(card);
    }
  }

  cards_to_run.sort(function (a, b) { return b.priority - a.priority; }); // Reverse numerical order (highest priority first).

  for (var i = 0; i < cards_to_run.length ; i++) {
    utils.log(hook_name + " hook implemented in " + cards_to_run[i].name + ".");
    value_to_alter = cards_to_run[i].hooks[hook_name](this, this.monsters[params['monster_id']], value_to_alter);
  }

  return value_to_alter;
}

module.exports = ROKServerGame;
