/**
 * Class definition for a Monster object
 * 
 * @param id int The id of the Monster being generated, 1-6.
 * @param game ROKServerGame Reference to the 'this' object reating the monster.
 *        this is used to call 'updateState(...)' after health/VPs/
 *        snot are modified.
 * 
 * @return null
 * 
 */

module.exports = Monster;

function Monster(myId, myName, theGame) {
  
  this.game = theGame;

  console.log("Game: " + this.game);

  this.id = myId;
  this.name = myName;
  
  // The id of the player controlling this monster.
  this.player_id = 0;
  this.health = 10;
  this.victory_points = 0;
  // FIXME adding some initial snot to test buying cards.
  this.snot = 50;
  
  // Card effects:
  this.poison_counters = 0;
  this.shrink_ray_counters = 0;
  this.smoke_counters = 0;
  this.alien_counters = 0; // Not sure what these are for but they're in the box.
  this.UFO_counters = 0;   // Not sure what these are for but they're in the box.
  this.mimic = null;       // Probably what the 'target' token is for.
  
  this.cards_owned = []   	// Cards owned by this monser

  Monster.prototype.getPlayerId = function () {
    return this.player_id;
  };

  /**
   * Modifier method for adjusting health
   **
   * @param amount int The amount to adjust the health by (+ increase, - decrease)
   * @param log_message string Optional message to be sent to the 'updateState(...)' method.
   *        If no log message is supplyed a default message will be sent
   * 
   * @return int The amount the health was set to.
   **
   * Note:
   * This method does not check wether the monster is in Kyoto or not.  It is the
   * calling methods responcibilty to ensure healing is allowed.  This has been
   * done as there are healing card that allow some healing in Kyoto and is not
   * this methods to decers which heals are caused by such cards and which are from dice.
   * This method does however insure the monster dose not exceede it's maximum health.
   **/
  Monster.prototype.addHealth = function (amount, log_message) {
    if (amount != 0) {
      var old_health = this.health;
      this.health += amount;
      this.health = Math.min(this.health, this.maxHealth());
      
      if (this.health != old_health) {
        if (!log_message) {
          /**
           * This should head as either:
           *   "Monster gains xxx health."
           * Or:
           *   "Monster takes xxx damage."
           *
           * Note: We use new-old health instead of 'amount' incase monsters health gets
           * limited by max_health
           **/
          log_message = this.name 
                        + ((this.health - old_health) > 0 ? " gains " : " takes ") 
                        + Math.abs(this.health - old_health) 
                        + ((this.health - old_health) > 0 ? " health." : " damage.");
        }
        
        game.updateState("monsters__" + this.id + "__health", this.health, log_message);
      }
    }
    
    // Return new/current health
    return this.health;
  };
  
  
  /**
   * Modifier method for adjusting VPs
   **
   * @param amount int The amount to adjust the VPs by (+ increase, - decrease)
   * @param log_message string Optional message to be sent to the 'updateState(...)' method.
   *        If no log message is supplyed a default message will be sent
   * 
   * @return int The amount the PVs was set to.
   **/
  Monster.prototype.addVictoryPoints = function (amount, log_message) {
    if (amount != 0) {
      this.victory_points += amount;
      
      if (!log_message) {
        log_message = this.name 
          + (amount > 0 ? " gains " : " looses ") 
          + Math.abs(amount) + " victory point" 
          + (Math.abs(amount) == 1 ? "." : "s.");
      }
      
      game.updateState("monsters__" + this.id + "__victory_points", this.victory_points, log_message);

      // TODO ticket #18, "Finish monster attribute modifier functions":: Check for win
    }
    
    // Return new/current VPs
    return this.victory_points;
  };
  
  
  /**
   * Modifier method for adjusting snot
   **
   * @param amount int The amount to adjust the snot by (+ increase, - decrease)
   * @param log_message string Optional message to be sent to the 'updateState(...)' method.
   *        If no log message is supplyed a default message will be sent
   * 
   * @return int The amount the snot was set to.
   **/
  Monster.prototype.addSnot = function (amount, log_message) {
    if (amount != 0) {
      var old_snot = this.snot;
      this.snot += amount
      this.snot = Math.max(this.snot, 0);
      
      if (this.snot != old_snot) {
        if (!log_message) {
          /**
           * This should head as either:
           *   "Monster gains xxx snot cube(s)."
           * Or:
           *   "Monster spends xxx snot cube(s)."
           *
           * If the monstrer looses snot cubes without spending them (such as effects
           * from other players cards) a cosmome message will need to be suplied
           **/
          log_message = this.name 
                        + (amount > 0 ? " gains " : " spends ") 
                        + Math.abs(amount) + " snot cube" 
                        + (Math.abs(amount) == 1 ? "." : "s.");
        }
        
        game.updateState("monsters__" + this.id + "__snot", this.snot, log_message);
      }
    }
    
    // Return new/current amount of snot
    return this.snot;
  };
  
  
  /**
   * Method called upon entering Kyoto
   **/
  Monster.prototype.enterKyoto = function () {
    console.log("Monster.prototype.entrKyoto");
    
    var entry_vips = 1;  // May be more depending on cards
    var city_or_bay = (game.monster_in_kyoto_city_id == this.id ? "City" : "Bay");
    var log_message = this.name 
                      + " takes Kyoto " + city_or_bay + " for " + entry_vips 
                      + " victory point" + (Math.abs(entry_vips) == 1 ? "." : "s.");
    
    game.updateState("monster_in_kyoto_" + city_or_bay.toLowerCase() + "_id", this.id);
    return this.addVictoryPoints(entry_vips, log_message);
  };
  
  
  /**
   * Method called upon yielding Kyoto
   **/
  Monster.prototype.yieldKyoto = function () {
    console.log("Monster.prototype.yieldKyoto");
    
    var city_or_bay = (game.monster_in_kyoto_city_id == this.id ? "City" : "Bay");
    
    if (game.monster_in_kyoto_city_id == this.id) {
      game.monster_in_kyoto_city_id = null;
    }
    else if (game.monster_in_kyoto_bay_id == this.id) {
      game.monster_in_kyoto_bay_id = null;
    }
    else {
      console.log('ERROR: This monster is teither in Kyoto City or Kyoto Bay.');
      player.getSocket().emit('game_message', "Can't leave Kyoto if you're not there.");
    }
    
    log_message = this.name + " yields Kyoto " + city_or_bay + ".";
    game.updateState("monster_in_kyoto_" + city_or_bay.toLowerCase() + "_id", null, log_message);
    game.updateState("monster_leaving_kyoto_" + city_or_bay.toLowerCase() + "_id", this.id);
  };
  
  /**
   * Method run when monster holds Kyoto
   **
   * By default this method normaly just adds 2 VPs to the player starting there turn in Kyoto
   * but there are cards that do other things
   **/
  Monster.prototype.kyotoHeld = function () {
    var hold_VPs = 2;
    // CARDS: Resolve card effects: Urbavore
    
    var log_message = this.name + " gets " + hold_VPs + " VP for starting the turn in Kyoto.";
    this.addVictoryPoints(hold_VPs, log_message);
  }
  
  
  /**
   * Fetcher method for retrieving the maximum amount of health this monster can attain
   **
   * @return int The amount of health the monster can attain
   **/
  Monster.prototype.maxHealth = function () {
    var rv = 10;
    // There is a card for this but I can't remember it off hand.
    return rv;
  };
  
  /**
   * Fetcher method for retrieving the number of dice rolls the monster is allowed
   **
   * @return int The number of rolls the monster is allowed
   **/
  Monster.prototype.numberOfRolls = function () {
    var rv = 3;
    
    // Can be increased by "Giant Brain".
    //if (this.cards_owned.indexOf(cards.GIANT_BRAIN) != -1) rv++;
    
    return rv;
  };
  
  /**
   * Fetcher method for retrieving the number of dice this monster rolls with
   **
   * @return int The number of dice the monster rolls with.
   **/
  Monster.prototype.numberOfDice = function () {
    var rv = 6;
    
    // Can be increased by "Extra Head" and decreased by "Shrink Ray".
    // Note: There are 2 extra heads (X1 and X2).
    if (this.cards_owned.indexOf(this.game.cards.EXTRA_HEAD_X1) != -1) rv++;
    if (this.cards_owned.indexOf(this.game.cards.EXTRA_HEAD_X2) != -1) rv++;
    
    // Number of dice is reduced by "Shrink Ray" counters
    rv -= this.shrink_ray_counters;
    
    return Math.max(rv, 0); // Just incase ;)
  };
  
  /**
   * Modifier method for applying damage
   **
   * @param amount int The amount of damage inflicted upon our poor monster (+ inclease, - decrease)
   * 
   * @return int The amount the health was set to.
   **
   * This method does not modify the health directly, rather it delegates the
   * task to "addHealth(...). This is to prevent this method needing to
   * check for deaths and save the new health level.
   **/
  Monster.prototype.applyDamage = function (damage) {
    return this.addHealth(-damage);
  };
}
