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
ROKServerGame.prototype.init = function(player) {
  console.log("ROKServerGame.prototype.init");
  
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

  // Generate monsters and save them in the game object.
  for (var i = 1; i <= 6; i++) {
    var monster = new Monster(i);
    this.monsters[i] = monster;
  }
  
  //console.log(this);
  console.log("init done");
  
  /**
   * Class definition for a Monster object
   * 
   * @param id int The id of the Monster being generated, 1-6.
   * 
   * @return null
   * 
   */
  function Monster(id) {
    // The id of the player controlling this monster.
    this.player_id = 0;
    this.health = 10;
    this.victory_points = 0;
    this.snot = 0;
    this.in_kyoto_city = 0;
    this.in_kyoto_bay = 0;
    this.id = id;
    this.number_of_rolls = 3;
  
    // The name of the monster.
    var monster_names = [
      "Alien",
      "Dragon",
      "Kong",
      "Rabbot",
      "Rex",
      "Squid"
    ];
    this.name = monster_names[id - 1];

//    this.cards = []   	// Cards owned by this monser
  }
  
//  Monster.prototype.number_of_rolls = function () {
//    return 3;
//  };
}


/**
 * Updates attributes in the Game object. This is used instead of updating the
 * attributes directly in order to automatically keep the "updates" attribute
 * up-to-date.
 *
 * You can also call the function with the two first parameters empty, if you
 * need to add a log message that's not directly related to any state change.
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
  console.log("ROKServerGame.prototype.updateState of " + field + " to " + value);
  
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
      console.log("WTF? Field:");
      console.log(field);
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
  console.log("ROKServerGame.prototype.snapState");
  
  // Generate an object to be sent instead of "this", as the game object
  // contains data we don't want to send to the clients.
  var send_object = {};  
  send_object.game_state = this.game_state;
  send_object.turn_phase = this.turn_phase;
  send_object.turn_monster = this.turn_monster;
  send_object.next_input_from_monster = this.next_input_from_monster;
  send_object.roll_number = this.roll_number;
  send_object.monster_order = this.monster_order;
  send_object.monsters = this.monsters;
  send_object.dice = this.dice;
  send_object.winner = this.winner;
  
  // Loop through all players in this game and send them the data.
  for (var game_player_id in this.players) {
    // Send to this player if no player id was given, or if the currently looped
    // player is the given player.
    if (typeof player_id == "undefined" || game_player_id == player_id) {
      send_object.this_monster = this.players[game_player_id].monster_id;
      var player_object = this.players[game_player_id];
      var target_socket = io.sockets.socket(player_object.socket_id);
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
  console.log("ROKServerGame.prototype.sendStateChanges");

  // Loop through all players in this game and send them the data.
  for (var game_player_id in this.players) {
    var this_monster = this.players[game_player_id].monster_id;
    var player_object = this.players[game_player_id];
    var target_socket = io.sockets.socket(player_object.socket_id);
    
    var send_object = {
      updates: this.updates,
      this_monster: this_monster
    };

    target_socket.emit("state_changes", send_object);
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
  console.log('ROKServerGame.prototype.getMonster ' + monster_id);
  return this.monsters[monster_id];
}


/**
 * Moves the game to the turn phase where the user can buy cards.
 *
 * CARDS: Buy cards if there's money - skip the buy phase if there isn't
 * CARDS: "Alien metabolism"
 * CARDS: Resolve any discard cards and do a win check
 */
ROKServerGame.prototype.buyCards = function() {
  console.log("ROKServerGame.prototype.buyCards");
  var log_message = this.monsters[this.turn_monster].name + ' can buy cards.'
  this.updateState("turn_phase", 'buy', log_message);
  // Reset NIFP, in case yield resolution has changed it.
  this.updateState("next_input_from_monster", this.turn_monster);
  this.sendStateChanges();
}


/**
 * User has chosen not to buy any cards or has no money to buy anything.
 */
ROKServerGame.prototype.doneBuying = function(player) {
  console.log("ROKServerGame.prototype.doneBuying");
  // Check that it's this player's turn
  if (this.turn_phase == 'buy') {
    if (this.turn_monster == player.monster_id) {
      this.endTurn();
      this.sendStateChanges();
    }
    else {
      console.log('ERROR: Not this user\'s turn');
      player.getSocket().emit('game_message', "It's not your turn."); 
    }  
  }
  else {
    console.log('ERROR: Not buying phase');
    player.getSocket().emit('game_message', "It's not the buying phase.");
  }
}

/**
 * Move to the final phase of a user's turn.
 */
ROKServerGame.prototype.endTurn = function() {
  console.log('ROKServerGame.prototype.endTurn');

  // Reset dice
  for (var i = 0; i < 8; i++) {
    if (i < 6) {
      this.updateState("dice__" + i + "__state", 'i');
    }
    else {
      // CARDS if the next monster has extra dice, enable them
      if (false) {
        this.updateState("dice__" + i + "__state", 'i');
      }
      else {
        this.updateState("dice__" + i + "__state", 'n');
      }
    }
  }

  // Turn end.
  var log_message = this.monsters[this.turn_monster].name + " ends their turn.";
  this.updateState("turn_phase", 'end', log_message);
  // CARDS: Resolve poison counters. Check if this is done on the poisoned monster's turn or the poisoning monster's turn

  
  // Advance to the next player's turn.
  this.updateState("turn_phase", 'start');
  this.updateState("roll_number", 1);
  
  var current_monster_index = this.monster_order.indexOf(this.turn_monster);
  var next_monster_index = current_monster_index + 1;
  if (typeof this.monster_order[next_monster_index] == 'undefined') {
    next_monster_index = 0;
  }
  
  log_message = this.monsters[this.monster_order[next_monster_index]].name + "'s turn.";
  this.updateState("turn_monster", this.monster_order[next_monster_index], log_message);
  this.updateState("next_input_from_monster", this.monster_order[next_monster_index]);
    
    
  // Beginning of a player's turn.
  // If in Kyoto, increment VP.
  if (this.monsters[this.turn_monster].in_kyoto_city || this.monsters[this.turn_monster].in_kyoto_city) {
    // CARDS: Resolve card effects: Urbavore
    var additional_victory_points = 2;
    var old_victory_points = this.monsters[this.turn_monster].victory_points;
    var new_victory_points = old_victory_points + additional_victory_points;
    log_message = this.monsters[this.turn_monster].name + " gets 2 VP for starting the turn in Kyoto.";
    this.updateState('monsters__' + this.turn_monster + '__victory_points', new_victory_points, log_message);
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
ROKServerGame.prototype.rollDice = function (player, keep_dice_ids) {
  console.log('ROKServerGame.prototype.rollDice');
  
  var monster = this.monsters[player.monster_id];
  var log_message = "";

  if (this.game_state == 'play') {
    console.log('  state play');
    if (this.turn_phase == 'roll') {
      console.log('    phase roll');
      if (this.turn_monster == player.monster_id) {
        console.log("      It's this monster's turn");
        if (this.roll_number <= monster.number_of_rolls) {
          console.log('        monster has rolls');
          // CARDS: take into account possible extra dice
          log_message = this.monsters[player.monster_id].name + " gets ";
          
          // Flag variable for detecting situation where the monster keeps all
          // the dice
          var keep_all = true;
          for (var i = 0; i < 6; i++) {
            console.log('        Rolling?');
            // Roll only dice that are not kept
            if (keep_dice_ids.indexOf(i) == -1) {
              keep_all = false;
              console.log('          Rolling.');
              var roll = utils.dieRoll();
              this.updateState("dice__" + i + "__value", roll, this.monsters[player.monster_id].name + " rolls " + roll);
            }
            else {
              this.updateState("dice__" + i + "__state", 'k', this.monsters[player.monster_id].name + " keeps " + this.dice[i].value);
            }
            
            log_message += this.dice[i].value + (i < 5 ? ", " : "");

            if (this.roll_number < monster.number_of_rolls) {
              // If there are more rerolls, set dice to "r", except for kept
              // dice, which should be kept as "k".
              if (this.dice[i].state != 'k') {
                this.updateState("dice__" + i + "__state", "r");
              }
            }
          }
          this.updateState(false, false, log_message);
          
          // Go to the next roll if there are more rolls and the monster isn't
          // keeping all the dice.
          if (this.roll_number < monster.number_of_rolls && keep_all != true) {
            var new_roll_number = this.roll_number + 1;
            this.updateState("roll_number", new_roll_number);
          }
          else {
            // Advance to next turn phase: resolve
            // Note that we're not sending state changes here, since there will
            // be more changes after the rolls are resolved.
            // Mark dice to the final state.
            for (var i = 0; i < this.dice.length; i++) {
              if (this.dice[i].state != 'n') {
                this.updateState("dice__" + i + "__state", 'f');              
              }
            }
            this.resolveDice(player);
          }

        }
        else {
          console.log('      monster out of rolls');
        }
      }
      else {
        console.log("ERROR: Not this monster's turn");
        player.getSocket().emit("game_message", "It's not your turn to roll");
      }
    }
    else {
      console.log('    ERROR: not roll phase');
      player.getSocket().emit('game_message', "Not roll phase.");
    }
  }
  else {
    console.log('ERROR: game not being played');
    player.getSocket().emit('game_message', "Game not being played.");
  }
    
  this.sendStateChanges();
}


/**
 * Resolves the results of the dice rolls after all the rerolls are done.
 *
 * STRICT: players should be allowed to resolve dice in any order
 */
ROKServerGame.prototype.resolveDice = function(player) {
  console.log('ROKServerGame.prototype.resolveDice');
  this.updateState("turn_phase", 'resolve');
  
  this.resolveSnotDice(player);
  this.resolveHealthDice(player);
  this.resolveVictoryPointDice(player);
  this.resolveAttackDice(player);
}


/**
 * Resolve attack dice
 */
ROKServerGame.prototype.resolveAttackDice = function(player) {
  console.log("ROKServerGame.prototype.resolveAttackDice");
  var log_message = "";
  // Calculate damage.
  // CARDS: Take into account extra damage cards.
  var damage = 0;
  for (var i = 0; i < 8; i++) {
    if (this.dice[i].state == 'f' && this.dice[i].value == "p") {
      damage++;
    }
  }
  console.log('damage: ' + damage);
  
  // If the attacking monster is in Kyoto, target all monsters outside Kyoto.
  // If the attacking monster is not in Kyoto, target all monsters in Kyoto.
  var target_monsters = [];
  if (this.monsters[player.monster_id].in_kyoto_city ||
      this.monsters[player.monster_id].in_kyoto_bay) {
    var attacker_in_kyoto = true;
  }
  else {
    var attacker_in_kyoto = false;  
  }
  
  for (var mid in this.monsters) {
    if (attacker_in_kyoto) {
      console.log('  attacker in kyoto');
      if (this.monsters[mid].in_kyoto_city ||
          this.monsters[mid].in_kyoto_bay) {
        // Attacker in Kyoto, target in Kyoto
      }
      else {
        // Attacker in Kyoto, target NOT in Kyoto
        if (this.monsters[mid].health > 0) {
          target_monsters.push(mid);        
        }
      }
    }
    else {
      if (this.monsters[mid].in_kyoto_city ||
          this.monsters[mid].in_kyoto_bay) {
        // Attacker NOT in Kyoto, target in Kyoto
        if (this.monsters[mid].health > 0) {
          target_monsters.push(mid);
        }
      }
      else {
        // Attacker NOT in Kyoto, target NOT in Kyoto
      }    
    }
  }
  
  console.log("Target monsters: " + utils.dump(target_monsters));
  
  // Check if there are any target monsters. There's only one stage in the game
  // when that can be untrue; At the beginning of the game when no one has yet
  // entered Kyoto.
  // CARDS: That's not true; If a monster is eliminated by a card Kyoto can be
  // left empty.
  if (target_monsters.length) {
    console.log('  got target monsters');
    // Reset yield flags from previous round.
    this.monster_to_yield_kyoto_city = 0;
    this.monster_to_yield_kyoto_city = 0;
    
    // Targets monsters are now defined in an array, loop through and:
    for (var i = 0; i < target_monsters.length; i++) {
      var old_health = this.monsters[target_monsters[i]].health;

      // CARDS: 
      // - cards with damage reactions, like "lightning armor"
      // - cards that reduce damage, like "armor plating"
      var monster_specific_damage = damage;
      var new_health = old_health - monster_specific_damage;
      
      if (monster_specific_damage > 0) {
        log_message = this.monsters[target_monsters[i]].name + " takes " + damage + " damage.";
        this.updateState("monsters__" + target_monsters[i] + '__health', old_health - damage, log_message);
      }
      else {
        // CARDS: Add log message noting any negated damage
      }

      // Damaged monster in Kyoto? -> Make note to get yield input once we've
      // looped through all monsters.
      if (monster_specific_damage > 0 && !attacker_in_kyoto) {
        if (this.monsters[target_monsters[i]].in_kyoto_city) {
          this.monster_to_yield_kyoto_city = target_monsters[i];
          console.log("    This monster took damage in Kyoto city");
        }
        else if (this.monsters[target_monsters[i]].in_kyoto_city) {
          this.monster_to_yield_kyoto_bay = target_monsters[i];
          console.log("    This monster took damage in Kyoto bay");
        }
        else {
          // Should never end up in this branch
          console.log(this);
          console.log('FATAL ERROR: Attacker outside Kyoto damaged monsters not in Kyoto.');
          process.quit();
        }
      }
      
      // Check deaths
      this.checkDeaths();
      // CARDS: Death reaction cards
      
      // If a monster in Kyoto died, it "automatically yields".
      // Check if either the city or the bay is empty.
      var city_empty = true;
      var bay_empty = true;
      for (var mid in this.monsters) {
        console.log("Check if " + this.monsters[mid].name + " is in Kyoto: " + this.monsters[mid].in_kyoto_city + '/' + this.monsters[mid].in_kyoto_bay);
        if (this.monsters[mid].in_kyoto_city) {
          city_empty = false;
        }
        if (this.monsters[mid].in_kyoto_bay) {
          bay_empty = false;
        }
      }
      
      // If the attacker cleared (or if one was already empty) the city or the
      // bay, it automatically occupies one.
      var old_victory_points = this.monsters[this.turn_monster].victory_points;
      if (city_empty) {
        console.log("City empty");
        log_message = this.monsters[this.turn_monster].name + " takes Kyoto city for 1 VP.";
        this.updateState("monsters__" + this.turn_monster + "__in_kyoto_city", 1, log_message);
        this.updateState("monsters__" + this.turn_monster + "__victory_points", old_victory_points + 1);
      }
      else if (bay_empty && Object.keys(this.monsters).length > 4) {
        console.log("Bay empty");
        log_message = this.monsters[this.turn_monster].name + " takes Kyoto bay for 1 VP.";
        this.updateState("monsters__" + this.turn_monster + "__in_kyoto_bay", 1, log_message);
        this.updateState("monsters__" + this.turn_monster + "__victory_points", old_victory_points + 1);
      }
      else {
        console.log("No room in Kyoto");
      }
    }
    
    if (this.checkWin()) {
      this.finishGame();
    }
    else {
      // If monster(s) in Kyoto damaged, move game to "yield" state
      if (this.monster_to_yield_kyoto_city) {
        console.log('    Monster yielding city or bay?');
        this.yieldKyotoCity();
      }
      else if (this.monster_to_yield_kyoto_bay) {
        console.log('    Monster yielding bay?');
        this.yieldKyotoBay();
      }
      else {
        console.log('    No-one to yield');
        // Otherwise:
        // Note that buyCards() will send the state changes.
        this.buyCards();
      }    
    }
  }
  else {
    console.log('  no target monsters');
    // No target monsters, so no-one takes damage and the playing monster enters
    // Kyoto. At least one punch is still needed.
    if (damage) {
      this.updateState("monsters__" + player.monster_id + "__in_kyoto_city", 1);
      var old_victory_points = this.monsters[player.monster_id].victory_points;
      log_message = this.monsters[this.turn_monster].name + " takes Kyoto city for 1 VP.";
      this.updateState("monsters__" + player.monster_id + "__victory_points", old_victory_points + 1, log_message);
      // Check win, in case kyoto is empty because a card eliminated the
      // previous tennant.
    }

    if (this.checkWin()) {
      this.finishGame();
    }
    else {
      this.buyCards();    
    }
  }
}


/**
 * Check if any of the monsters are dead.
 */
ROKServerGame.prototype.checkDeaths = function() {
  console.log("ROKServerGame.prototype.checkDeaths");
  for (var mid in this.monsters) {
    mid = parseInt(mid);
    if (this.monsters[mid].health < 1) {
      console.log(this.monsters[mid].name + ' is dead');
      // Remove monster from monster_order so it doesn't get to play.
      var log_message = this.monsters[mid].name + " is killed.";
      var monster_order = this.monster_order;
      var index = monster_order.indexOf(mid)
      if (index != -1) {
        monster_order.splice(index, 1);
        this.updateState('monster_order', monster_order, log_message);
      }

      // Dead monsters don't need to yield.
      if(this.monster_to_yield_kyoto_city == mid) {
        this.updateState('monster_to_yield_kyoto_city', 0);
      }
      if(this.monster_to_yield_kyoto_bay == mid) {
        this.updateState('monster_to_yield_kyoto_bay', 0);
      }
      
      // Dead monsters aren't in Kyoto.
      this.updateState('monsters__' + mid + '__in_kyoto_city', 0);
      this.updateState('monsters__' + mid + '__in_kyoto_bay', 0);
    }
  }
}


/**
 * Check if anyone has won yet.
 */
ROKServerGame.prototype.checkWin = function() {
  console.log("ROKServerGame.prototype.checkWin");
  var log_message = "";
  // Check if there's only one monster left.
  if (this.monster_order.length == 1) {
    log_message = this.monsters[this.monster_order[0]].name + " is the last monster standing.";
    this.updateState(false, false, log_message);
    log_message = this.monsters[this.monster_order[0]].name + " wins!";
    this.updateState("game_state", "over", log_message);
    return true;
  }
  
  // Check if anyone got to 20 victory points
  for (var i = 0; i < this.monster_order.length; i++) {
    var victory_points = this.monsters[this.monster_order[i]].victory_points;
    if (victory_points >= 20) {
      log_message = this.monsters[this.monster_order[i]].name + " has taken a 'soft win' by getting to " + victory_points + " victory points.";
      this.updateState(false, false, log_message);
      log_message = this.monsters[this.monster_order[i]].name + " wins!";
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
 * Gets yield input from monster in Kyoto city
 */
ROKServerGame.prototype.yieldKyotoCity = function(player) {
  console.log("ROKServerGame.prototype.yieldKyotoCity");
  this.updateState('next_input_from_monster', this.monster_to_yield_kyoto_city);
  var log_message = this.monsters[this.monster_to_yield_kyoto_city].name + " can yield Kyoto city.";
  this.updateState('turn_phase', 'yield_kyoto_city', log_message);
  this.sendStateChanges();
}


/**
 * Gets yield input from monster in Kyoto bay
 */
ROKServerGame.prototype.yieldKyotoBay = function(player) {
  console.log("ROKServerGame.prototype.yieldKyotoBay");
  this.updateState('next_input_from_monster', this.monster_to_yield_kyoto_bay);
  var log_message = this.monsters[this.monster_to_yield_kyoto_bay].name + " can yield Kyoto bay.";
  this.updateState('turn_phase', 'yield_kyoto_bay', log_message);
  this.sendStateChanges();
}


/**
 * Handle reply to monsters reply to yield question.
 *
 * CARDS: "Jets" - Don't decrement health when yielding
 */
ROKServerGame.prototype.resolveYield = function(part_of_kyoto, yielding) {
  console.log("ROKServerGame.prototype.resolveYield");
  console.log("part: " + part_of_kyoto + ', yielding: ' + yielding);
  var log_message = "";
  if (part_of_kyoto == 'city' && this.turn_phase == 'yield_kyoto_city') {
    if (yielding) {
      // The monster yields Kyoto city.
      log_message = this.monsters[this.next_input_from_monster].name + " yields Kyoto city.";
      this.updateState('monsters__' + this.next_input_from_monster + '__in_kyoto_city', 0, log_message);
      log_message = this.monsters[this.turn_monster].name + " takes Kyoto city for 1 VP.";
      this.updateState('monsters__' + this.turn_monster + '__in_kyoto_city', 1, log_message);

      // Add victory points for taking Kyoto city
      var additional_victory_points = 1;
      var old_victory_points = this.monsters[this.turn_monster].victory_points;
      var new_victory_points = old_victory_points + additional_victory_points;
      this.updateState('monsters__' + this.turn_monster + '__victory_points', new_victory_points);
      if(this.checkWin()) {
        this.finishGame();
      }
      else {
        this.updateState('monster_to_yield_kyoto_city', 0);
        // Since the monster gets to go to city, there's no reason to resolve
        // yielding the bay.
        this.updateState('monster_to_yield_kyoto_bay', 0);
        this.buyCards();      
      }
    }
    else {
      // The monster in the city is not yielding, so nothing happens, unless
      // we're looking for an answer from a monster in the bay, as well.
      log_message = this.monsters[this.monster_to_yield_kyoto_city].name + " stays in Kyoto city.";
      this.updateState('monster_to_yield_kyoto_city', 0, log_message);
      
      if (this.monster_to_yield_kyoto_bay) {
        this.yieldKyotoBay();
      }
      else if (this.monster_order.length > 4) {
        // There's no monster yielding the bay, but there are 5-6 players.
        
        // Check that there isn't an _undamaged_ monster in the bay.
        var bay_empty = true;
        for (var mid in this.monsters) {
          console.log("Check if " + this.monsters[mid].name + " is in the bay: " + this.monsters[mid].in_kyoto_bay);
          if (this.monsters[mid].in_kyoto_bay) {
            bay_empty = false;
          }
        }
        
        // If there isn't, move the monster to the bay.
        if (bay_empty) {
          var old_victory_points = this.monsters[this.turn_monster].victory_points;
          var new_victory_points = old_victory_points + 1;
          this.updateState('monsters__' + this.turn_monster + '__victory_points', new_victory_points);
          log_message = this.monsters[this.turn_monster] + " takes Kyoto bay for 1 VP.";
          this.updateState('monsters__' + this.turn_monster + '__in_kyoto_bay', 1, log_message);        
        }
        
        this.buyCards();
      }
      else {
        // Yield resolved, move to next phase
        this.buyCards();
      }
    }
  }
  else if (part_of_kyoto == 'bay' && this.turn_phase == 'yield_kyoto_bay') {
    if (yielding) {
      // The monster yields Kyoto bay.
      log_message = this.monsters[this.next_input_from_monster].name + " yields Kyoto bay.";
      this.updateState('monsters__' + this.next_input_from_monster + '__in_kyoto_bay', 0, log_message);
      log_message = this.monsters[this.turn_monster].name + " takes Kyoto bay for 1 VP.";
      this.updateState('monsters__' + this.turn_monster + '__in_kyoto_bay', 1, log_message);

      // Add victory points for taking Kyoto bay
      var additional_victory_points = 1;
      var old_victory_points = this.monsters[this.turn_monster].victory_points;
      var new_victory_points = old_victory_points + additional_victory_points;
      this.updateState('monsters__' + this.turn_monster + '__victory_points', new_victory_points);
      if (this.checkWin()) {
        this.finishGame();
      }
      else {
        this.updateState('monster_to_yield_kyoto_bay', 0);      
      }
    }
    else {
      // The monster in the bay is not yielding, so nothing happens.
      log_message = this.monsters[this.monster_to_yield_kyoto_bay].name + " stays in Kyoto bay.";
      this.updateState('monster_to_yield_kyoto_bay', 0, log_message);
    }
    
    // Yield resolved, move to next phase.
    this.buyCards();
  }
  else {
    console.log('Trying to resolve bay yield on city yield phase or vice versa');
  }
  

}
 

/**
 * Resolve snot cubes.
 */
ROKServerGame.prototype.resolveSnotDice = function(player) {
  console.log("ROKServerGame.prototype.resolveSnotDice");
  // CARDS: take cards into account: "Friend of children", etc.
  var additional_snot = 0;
  for (var i = 0; i < this.dice.length; i++) {
    if (this.dice[i].state == 'f' && this.dice[i].value == 's') {
      additional_snot++;
    }
  }
  console.log('additional_snot: ' + additional_snot);
  var old_snot = this.monsters[player.monster_id].snot;
  var new_snot = old_snot + additional_snot;
  if (old_snot != new_snot) {
    var log_message = this.monsters[this.turn_monster].name + " gains " + additional_snot + " snot cube" + ((additional_snot > 1) ? "s." : ".");
    this.updateState("monsters__" + player.monster_id + "__snot", new_snot, log_message);
  }
}

/**
 * Resolve health dice.
 */
ROKServerGame.prototype.resolveHealthDice = function(player) {
  console.log("ROKServerGame.prototype.resolveHealthDice");

  var additional_health = 0;
  for (var i = 0; i < this.dice.length; i++) {
    if (this.dice[i].state == 'f' && this.dice[i].value == 'h') {
      additional_health++;
    }
  }
  console.log('additional_health: ' + additional_health);
  var old_health = this.monsters[player.monster_id].health;
  var new_health = old_health + additional_health;
  if (new_health > 10) {
    // CARDS: If max health is over 10, allow going over 10.
    new_health = 10;
  }
  if (new_health != old_health) {
    // Can't heal in Kyoto.
    if (!this.monsters[this.turn_monster].in_kyoto_city && !this.monsters[this.turn_monster].in_kyoto_city) {
      var log_message = this.monsters[this.turn_monster].name + " gains " + additional_health + " health.";
      this.updateState("monsters__" + player.monster_id + "__health", new_health, log_message);
    }
    else {
      var log_message = this.monsters[this.turn_monster].name + " can't heal in Kyoto.";
      this.updateState(false, false, log_message);
    }
  }
}


/**
 * Resolve VP dice.
 */
ROKServerGame.prototype.resolveVictoryPointDice = function(player) {
  console.log("ROKServerGame.prototype.resolveVPDice");
  
  var victory_points_dice = {
    1: 0,
    2: 0,
    3: 0,
  };
  for (var i = 0; i < this.dice.length; i++) {
    if (this.dice[i].state == 'f' && isNaN(this.dice[i].value) == false) {
      victory_points_dice[this.dice[i].value]++;
    }
  }
  
  var additional_victory_points = 0;
  for (var points in victory_points_dice) {
    if (victory_points_dice[points] > 2) {
      console.log("Add " + points + " from " + points + "s");
      additional_victory_points += parseInt(points);
      var extra_victory_points = 0;
      extra_victory_points = victory_points_dice[points] - 3;
      if (extra_victory_points > 0) {
        additional_victory_points += extra_victory_points;
        console.log("  Add " + extra_victory_points + " extra points from extra " + points + "s");
      }
    }
  }
  console.log("additional_victory_points: " + additional_victory_points);
  var log_message = this.monsters[this.turn_monster].name + " rolls " + additional_victory_points + " VP.";
  var old_victory_points = this.monsters[this.turn_monster].victory_points;
  var new_victory_points = old_victory_points + additional_victory_points;
  if (new_victory_points > old_victory_points) {
    this.updateState("monsters__" + this.turn_monster + '__victory_points', new_victory_points, log_message);  
  }

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
  console.log("ROKServerGame.prototype.selectMonster " + selected_monster_id);
  
  if (this.game_state == "select_monsters") {
    // Check that the monster hasn't been selected already
    if (this.monsters[selected_monster_id].player_id == 0) {
      // Check that the player hasn't already selected a monster.
      if (player.monster_id == 0) {
        // Set monster to player:
        player.monster_id = selected_monster_id;

        // Set player to monster
        this.updateState('monsters__' + selected_monster_id + '__player_id', player.id);

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
          this.updateState(false, false, this.monsters[this.turn_monster].name + "'s turn.");
          this.sendStateChanges();
        }
        else {
          // Send information about monsters that can't be selected
          this.sendStateChanges();
        }

      }
      else {
        console.log('ERROR: already selected error');
        var msg = "You have already selected a monster.";
        player.getSocket().emit("game_message", msg);
      }  
    }
    else {
      console.log('ERROR monster already selected');
      var msg = "That monster is already selected.";
      player.getSocket().emit("game_message", msg);       
    }
  }
  else {
    console.log('ERROR: not in monster_selection error');
    var msg = "This is not the time to select a monster.";
    player.getSocket().emit("game_message", msg);   
  }
}


/**
 * Starts the game.
 * 
 */ 
ROKServerGame.prototype.beginGame = function() {
  console.log('ROKServerGame.prototype.beginGame ' + this.id);

  this.updateState("game_state", "play");

  // Drop any monsters not in play.
  var played_monsters = [];
  for (var p in this.player_ids) {
    played_monsters.push(this.players[p].monster_id);
  }

  var new_monsters = {};
  var monster_ids = Object.keys(this.monsters);
  for (var i = 0; i < monster_ids.length; i++) {
    if (played_monsters.indexOf(this.monsters[monster_ids[i]].id) != -1) {
      new_monsters[monster_ids[i]] = this.monsters[monster_ids[i]];
    }
  }
  this.monsters = new_monsters;
  
  // Randomize monster order
  var monster_order = [];
  for (var player_id in this.player_ids) {
    monster_order.push(this.players[player_id].monster_id);
  }
  monster_order = utils.shuffleArray(monster_order);
  this.monster_order = monster_order;
  
  // Note: We skip the "start" phase of the turn, since there's nothing to do
  // in the beginning of the turn at the start of the game.
  this.updateState("turn_phase", "roll");
  this.updateState("turn_monster", this.monster_order[0]);
  this.updateState("next_input_from_monster", this.monster_order[0]);
  
  // Loop through all players in this game.
  for (var game_player_id in this.player_ids) {
    var target_socket = io.sockets.socket(this.players[game_player_id].socket_id);
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
  console.log("ROKServerGame.prototype.addPlayer");
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
    console.log('ERROR: The player is already invited.');
    var msg = "That player is already invited";
    player.getSocket().emit("lobby_message", msg);  
  }
}


/**
 * A player is leaving the game, hopefully once the game is over. This is also
 * used when idle players are cleaned up.
 */
ROKServerGame.prototype.leaveGame = function(player) {
  console.log("ROKServerGame.prototype.leaveGame " + player.name);

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
      console.log("mo:");
      console.log(monster_order);
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
    
    this.updateState("monsters__" + monster_id_used + "__player_id", 0);

    // If it was the player's turn, end the turn.
    if (this.turn_monster == monster_id_used) {
      this.endTurn();
    }

    // Kill monster
    var log_message = this.monsters[monster_id_used].name + "'s player has left the game.";
    this.updateState('monsters__' + monster_id_used + '__health', 0, log_message);
    // CARDS Make sure "it has a child" doesn't respawn the monster...
  
    // If the monster was yielding, advance the turn_phase
    console.log(this.turn_phase);
    if (this.turn_phase == 'yield_kyoto_city' || this.turn_phase == 'yield_kyoto_bay') {
      console.log("detected yielding quitter");
      this.updateState('turn_phase', 'buy');
      this.updateState('next_input_from_monster', this.turn_monster);  
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
  console.log("ROKServerGame.prototype.confirmGame");
  
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
      console.log('ERROR: not enough players');
      // Notify the player.
      var msg = "At least two players are needed to play.";
      player.getSocket().emit("lobby_message", msg);     
    }
  }
  else {
    console.log('ERROR: not a host');
    // Notify the player that he needs to be a host to confirm a game.
    var msg = "Only the host can confirm a game.";
    player.getSocket().emit("lobby_message", msg);
  }
}

module.exports = ROKServerGame;
