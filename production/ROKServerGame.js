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
  
  // Names of the monsters.
  var monster_names = [
    "Alien",
    "Dragon",
    "Kong",
    "Rabbot",
    "Rex",
    "Squid"
  ];
  
  var cards = {
    ACID_ATTACK:                   1,
    ALIEN_METABOLISM:              2,
    ALPHA_MONSTER:                 3,
    APARTMENT_BUILDING:            4,
    ARMOR_PLATING:                 5,
    BACKGROUND_DWELLER:            6,
    BURROWING:                     7,
    CAMOUFLAGE:                    8,
    COMMUTER_TRAIN:                9,
    COMPLETE_DESTRUCTION:         10,
    CORNER_STORE:                 11,
    DEDICATED_NEWS_TEAM:          12,
    DROP_FROM_HIGH_ALTITUDE:      13,
    EATER_OF_THE_DEAD:            14,
    ENERGIZE:                     15,
    ENERGY_HOARDER:               16,
    EVACUATION_ORDERS_X1:         17,
    EVACUATION_ORDERS_X2:         18,
    EVEN_BIGGER:                  19,
    EXTRA_HEAD_X1:                20,
    EXTRA_HEAD_X2:                21,
    FIRE_BLAST:                   22,
    FIRE_BREATHING:               23,
    FREEZE_TIME:                  24,
    FRENZY:                       25,
    FRIEND_OF_CHILDREN:           26,
    GAS_REFINERY:                 27,
    GIANT_BRAIN:                  28,
    GOURMET:                      29,
    HEAL:                         30,
    HEALING_RAY:                  31,
    HERBIVORE:                    32,
    HERD_CULLER:                  33,
    HIGH_ALTITUDE_BOMBING:        34,
    IT_HAS_A_CHILD:               35,
    JET_FIGHTERS:                 36,
    JETS:                         37,
    MADE_IN_A_LAB:                38,
    METAMORPH:                    39,
    MIMIC:                        40,
    MONSTER_BATTERIES:            41,
    NATIONAL_GUARD:               42,
    NOVA_BREATH:                  43,
    NUCLEAR_POWER_PLANT:          44,
    OMNIVORE:                     45,
    OPPORTUNIST:                  46,
    PARASITIC_TENTACLES:          47,
    PLOT_TWIST:                   48,
    POISON_QUILLS:                49,
    POISON_SPIT:                  50,
    PSYCHIC_PROBE:                51,
    RAPID_HEALING:                52,
    REGENERATION:                 53,
    ROOTING_FOR_THE_UNDERDOG:     54,
    SHRINK_RAY:                   55,
    SKYSCRAPER:                   56,
    SMOKE_CLOUD:                  57,
    SOLAR_POWERED:                58,
    SPIKED_TAIL:                  59,
    STRETCHY:                     60,
    TANKS:                        61,
    TELEPATH:                     62,
    URBAVORE:                     63,
    VAST_STORM:                   64,
    WERE_ONLY_MAKING_IT_STRONGER: 65,
    WINGS:                        66,
    AMUSEMENT_PARK:               67,
    ARMY:                         68,
    CANNIBALISTIC:                69,
    INTIMIDATING_ROAR:            70,
    MONSTER_SIDEKICK:             71,
    REFLECTIVE_HIDE:              72,
    SLEEP_WALKER:                 73,
    SUPER_JUMP:                   74,
    THROW_A_TANKER:               75,
    THUNDER_STOMP:                76,
    UNSTABLE_DNA:                 77,
  
    // This properties table has been adopted from Maltize's KingOfTokyo-CardList project on GitHub
    // https://github.com/maltize/KingOfTokyo-CardList
    properties: {
       1: {name: "Acid Attack",                   cost: 6, keep: true,  set: "original", implemented: true,  description: "Deal 1 extra damage each turn (even when you don't otherwise attack)."},
       2: {name: "Alien Metabolism",              cost: 3, keep: true,  set: "original", implemented: "needs_testing", description: "Buying cards costs you 1 less [Snot]."},
       3: {name: "Alpha Monster",                 cost: 5, keep: true,  set: "original", implemented: false, description: "Gain 1[Star] when you attack."},
       4: {name: "Apartment Building",            cost: 5, keep: false, set: "original", implemented: false, description: "+ 3[Star]"},
       5: {name: "Armor Plating",                 cost: 4, keep: true,  set: "original", implemented: true,  description: "Ignore damage of 1."},
       6: {name: "Background Dweller",            cost: 4, keep: true,  set: "original", implemented: false, description: "You can always reroll any [3] you have."},
       7: {name: "Burrowing",                     cost: 5, keep: true,  set: "original", implemented: false, description: "Deal 1 extra damage on Tokyo. Deal 1 damage when yielding Tokyo to the monster taking it."},
       8: {name: "Camouflage",                    cost: 3, keep: true,  set: "original", implemented: false, description: "If you take damage roll a die for each damage point. On a [Heart] you do not take that damage point."},
       9: {name: "Commuter Train",                cost: 4, keep: false, set: "original", implemented: false, description: "+ 2[Star]"},
      10: {name: "Complete Destruction",          cost: 3, keep: true,  set: "original", implemented: false, description: "If you roll [1][2][3][Heart][Attack][Snot] gain 9[Star] in addition to the regular results."},
      11: {name: "Corner Store",                  cost: 3, keep: false, set: "original", implemented: false, description: "+ 1[Star]"},
      12: {name: "Dedicated News Team",           cost: 3, keep: true,  set: "original", implemented: "needs_testing", description: "Gain 1[Star] whenever you buy a card."},
      13: {name: "Drop from High Altitude",       cost: 5, keep: false, set: "original", implemented: false, description: "+ 2[Star] and take control of Tokyo if you don't already control it."},
      14: {name: "Eater of the Dead",             cost: 4, keep: true,  set: "original", implemented: false, description: "Gain 3[Star] every time a monster's [Heart] goes to 0."},
      15: {name: "Energize",                      cost: 8, keep: false, set: "original", implemented: false, description: "+ 9[Snot]"},
      16: {name: "Energy Hoarder",                cost: 3, keep: true,  set: "original", implemented: false, description: "You gain 1[Star] for every 6[Snot] you have at the end of your turn."},
      17: {name: "Evacuation Orders",             cost: 7, keep: false, set: "original", implemented: false, description: "All other monsters lose 5[Star]."},
      18: {name: "Evacuation Orders",             cost: 7, keep: false, set: "original", implemented: false, description: "All other monsters lose 5[Star]."},
      19: {name: "Even Bigger",                   cost: 4, keep: true,  set: "original", implemented: false, description: "Your maximum [Heart] is increased by 2. Gain 2[Heart] when you get this card."},
      20: {name: "Extra Head",                    cost: 7, keep: true,  set: "original", implemented: true,  description: "You get 1 extra die."},
      21: {name: "Extra Head",                    cost: 7, keep: true,  set: "original", implemented: true,  description: "You get 1 extra die."},
      22: {name: "Fire Blast",                    cost: 3, keep: false, set: "original", implemented: false, description: "Deal 2 damage to all other monsters."},
      23: {name: "Fire Breathing",                cost: 4, keep: true,  set: "original", implemented: false, description: "Your neighbors take 1 extra damage when you deal damage"},
      24: {name: "Freeze Time",                   cost: 5, keep: true,  set: "original", implemented: false, description: "On a turn where you score [1][1][1], you can take another turn with one less die."},
      25: {name: "Frenzy",                        cost: 7, keep: false, set: "original", implemented: false, description: "When you purchase this card Take another turn immediately after this one."},
      26: {name: "Friend of Children",            cost: 3, keep: true,  set: "original", implemented: false, description: "When you gain any [Snot] gain 1 extra [Snot]."},
      27: {name: "Gas Refinery",                  cost: 6, keep: false, set: "original", implemented: false, description: "+ 2[Star] and deal 3 damage to all other monsters."},
      28: {name: "Giant Brain",                   cost: 5, keep: true,  set: "original", implemented: true,  description: "You have one extra reroll each turn."},
      29: {name: "Gourmet",                       cost: 4, keep: true,  set: "original", implemented: false, description: "When scoring [1][1][1] gain 2 extra [Star]."},
      30: {name: "Heal",                          cost: 3, keep: false, set: "original", implemented: false, description: "Heal 2 damage."},
      31: {name: "Healing Ray",                   cost: 4, keep: true,  set: "original", implemented: false, description: "You can heal other monsters with your [Heart] results. They must pay you 2[Snot] for each damage you heal (or their remaining [Snot] if they haven't got enough."},
      32: {name: "Herbivore",                     cost: 5, keep: true,  set: "original", implemented: false, description: "Gain 1[Star] on your turn if you don't damage anyone."},
      33: {name: "Herd Culler",                   cost: 3, keep: true,  set: "original", implemented: false, description: "You can change one of your dice to a [1] each turn."},
      34: {name: "High Altitude Bombing",         cost: 4, keep: false, set: "original", implemented: false, description: "All monsters (including you) take 3 damage."},
      35: {name: "It Has a Child",                cost: 7, keep: true,  set: "original", implemented: false, description: "If you are eliminated discard all your cards and lose all your [Star], Heal to 10[Heart] and start again."},
      36: {name: "Jet Fighters",                  cost: 5, keep: false, set: "original", implemented: false, description: "+ 5[Star] and take 4 damage"},
      37: {name: "Jets",                          cost: 5, keep: true,  set: "original", implemented: false, description: "You suffer no damage when yielding Tokyo."},
      38: {name: "Made in a Lab",                 cost: 2, keep: true,  set: "original", implemented: false, description: "When purchasing cards you can peek at and purchase the top card of the deck."},
      39: {name: "Metamorph",                     cost: 3, keep: true,  set: "original", implemented: false, description: "At the end of your turn you can discard any keep cards you have to receive the [Snot] they were purchased for."},
      40: {name: "Mimic",                         cost: 8, keep: true,  set: "original", implemented: false, description: "Choose a card any monster has in play and put a mimic counter on it. This card counts as a duplicate of that card as if it just had been bought. Spend 1[Snot] at the start of your turn to change the power you are mimicking."},
      41: {name: "Monster Batteries",             cost: 2, keep: true,  set: "original", implemented: false, description: "When you purchase this put as many [Snot] as you want on it from your reserve. Match this from the bank. At the start of each turn take 2[Snot] off and add them to your reserve. When there are no [Snot] left discard this card."},
      42: {name: "National Guard",                cost: 3, keep: false, set: "original", implemented: false, description: "+ 2[Star] and take 2 damage."},
      43: {name: "Nova Breath",                   cost: 7, keep: true,  set: "original", implemented: false, description: "Your attacks damage all other monsters."},
      44: {name: "Nuclear Power Plant",           cost: 6, keep: false, set: "original", implemented: false, description: "+ 2[Star] and heal 3 damage."},
      45: {name: "Omnivore",                      cost: 4, keep: true,  set: "original", implemented: false, description: "Once each turn you can score [1][2][3] for 2[Star]. You can use these dice in other combinations."},
      46: {name: "Opportunist",                   cost: 3, keep: true,  set: "original", implemented: false, description: "Whenever a new card is revealed you have the option of purchasing it as soon as it is revealed."},
      47: {name: "Parasitic Tentacles",           cost: 4, keep: true,  set: "original", implemented: false, description: "You can purchase cards from other monsters. Pay them the [Snot] cost."},
      48: {name: "Plot Twist",                    cost: 3, keep: true,  set: "original", implemented: false, description: "Change one die to any result. Discard when used."},
      49: {name: "Poison Quills",                 cost: 3, keep: true,  set: "original", implemented: false, description: "When you score [2][2][2] also deal 2 damage."},
      50: {name: "Poison Spit",                   cost: 4, keep: true,  set: "original", implemented: false, description: "When you deal damage to monsters give them a poison counter. Monsters take 1 damage for each poison counter they have at the end of their turn. You can get rid of a poison counter with a [Heart] (that [Heart] doesn't heal a damage also)."},
      51: {name: "Psychic Probe",                 cost: 3, keep: true,  set: "original", implemented: false, description: "You can reroll a die of each other monster once each turn. If the reroll is [Heart] discard this card."},
      52: {name: "Rapid Healing",                 cost: 3, keep: true,  set: "original", implemented: false, description: "Spend 2[Snot] at any time to heal 1 damage."},
      53: {name: "Regeneration",                  cost: 4, keep: true,  set: "original", implemented: false, description: "When you heal, heal 1 extra damage."},
      54: {name: "Rooting for the Underdog",      cost: 3, keep: true,  set: "original", implemented: false, description: "At the end of a turn when you have the fewest [Star] gain 1 [Star]."},
      55: {name: "Shrink Ray",                    cost: 6, keep: true,  set: "original", implemented: false, description: "When you deal damage to monsters give them a shrink counter. A monster rolls one less die for each shrink counter. You can get rid of a shrink counter with a [Heart] (that [Heart] doesn't heal a damage also)."},
      56: {name: "Skyscraper",                    cost: 6, keep: false, set: "original", implemented: false, description: "+ 4[Star]"},
      57: {name: "Smoke Cloud",                   cost: 4, keep: true,  set: "original", implemented: false, description: "This card starts with 3 charges. Spend a charge for an extra reroll. Discard this card when all charges are spent."},
      58: {name: "Solar Powered",                 cost: 2, keep: true,  set: "original", implemented: false, description: "At the end of your turn gain 1[Snot] if you have no [Snot]."},
      59: {name: "Spiked Tail",                   cost: 5, keep: true,  set: "original", implemented: false, description: "When you attack deal 1 extra damage."},
      60: {name: "Stretchy",                      cost: 3, keep: true,  set: "original", implemented: false, description: "You can spend 2[Snot] to change one of your dice to any result."},
      61: {name: "Tanks",                         cost: 4, keep: false, set: "original", implemented: false, description: "+ 4[Star] and take 3 damage."},
      62: {name: "Telepath",                      cost: 4, keep: true,  set: "original", implemented: false, description: "Spend 1[Snot] to get 1 extra reroll."},
      63: {name: "Urbavore",                      cost: 4, keep: true,  set: "original", implemented: false, description: "Gain 1 extra [Star] when beginning the turn in Tokyo. Deal 1 extra damage when dealing any damage from Tokyo."},
      64: {name: "Vast Storm",                    cost: 6, keep: false, set: "original", implemented: false, description: "+ 2[Star]. All other monsters lose 1[Snot] for every 2[Snot] they have."},
      65: {name: "We're Only Making It Stronger", cost: 3, keep: true,  set: "original", implemented: false, description: "When you lose 2[Heart] or more gain 1[Snot]."},
      66: {name: "Wings",                         cost: 6, keep: true,  set: "original", implemented: false, description: "Spend 2[Snot] to negate damage to you for a turn."},

      67: {name: "Amusement Park",                cost: 6, keep: false, set: "promo",    implemented: false, description: "+ 4[Star]"},
      68: {name: "Army",                          cost: 2, keep: false, set: "promo",    implemented: false, description: "(+ 1[Star] and suffer one damage) for each card you have."},
      69: {name: "Cannibalistic",                 cost: 5, keep: true,  set: "promo",    implemented: false, description: "When you do damage gain 1[Heart]."},
      70: {name: "Intimidating Roar",             cost: 3, keep: true,  set: "promo",    implemented: false, description: "The monsters in Tokyo must yield if you damage them."},
      71: {name: "Monster Sidekick",              cost: 4, keep: true,  set: "promo",    implemented: false, description: "If someone kills you, Go back to 10[Heart] and lose all your [Star]. If either of you or your killer win, or all other players are eliminated then you both win. If your killer is eliminated then you are also. If you are eliminated a second time this card has no effect."},
      72: {name: "Reflective Hide",               cost: 6, keep: true,  set: "promo",    implemented: false, description: "If you suffer damage the monster that inflicted the damage suffers 1 as well."},
      73: {name: "Sleep Walker",                  cost: 3, keep: true,  set: "promo",    implemented: false, description: "Spend 3[Snot] to gain 1[Star]."},
      74: {name: "Super Jump",                    cost: 4, keep: true,  set: "promo",    implemented: false, description: "Once each turn you may spend 1[Snot] to negate 1 damage you are receiving."},
      75: {name: "Throw a Tanker",                cost: 4, keep: true,  set: "promo",    implemented: false, description: "On a turn you deal 3 or more damage gain 2[Star]."},
      76: {name: "Thunder Stomp",                 cost: 3, keep: true,  set: "promo",    implemented: false, description: "If you score 4[Star] in a turn, all players roll one less die until your next turn."},
      77: {name: "Unstable DNA",                  cost: 3, keep: true,  set: "promo",    implemented: false, description: "If you yield Tokyo you can take any card the recipient has and give him this card."},
    }
  };
  
  if (Object.freeze)  // Not all browsers support 'Object.freeze(...)'
  {
    Object.freeze(monster_names);
    Object.freeze(cards);
  }

  var card_deck = [];      // Cards in the deck (yet to be played)
  var cards_available = [] // The three cards that can be purchaced.

  // Put all the cards in the deck
  for (var card in cards) {
    if (cards[card] != cards.properties) {
      card_deck.push(card);
    }
  }

  // Shuffel the deck (Fisher–Yates shuffle)
  for (var i=card_deck.length-1 ; i>0 ; i--) {
    var rand = Math.floor(Math.random()*(i+1));  // Random number (0,i)
    
    // Swap rand and i
    var temp = card_deck[rand];
    card_deck[rand] = card_deck[i];
    card_deck[i] = temp;
  }

  //for (var i=0 ; i<card_deck.length ; i++) {
  //  var card = card_deck[i];
  //  console.log(cards[card] + ": " + card + ": \"" + cards.properties[cards[card]].name + "\"");
  //}

  // Make three cards available
  cards_available.push(card_deck.pop());
  cards_available.push(card_deck.pop());
  cards_available.push(card_deck.pop());


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
    
    // Card effects:
    this.poision_counters = 0;
    this.shrink_ray_counters = 0;
    this.smoke_counters = 0;
    this.alian_counters = 0; // Not sure what these are for but there in the box.
    this.UFO_counters = 0;   // Not sure what these are for but there in the box.
    this.mimic = null;       // Probably what the 'target' token if for.

    this.id = id;
    this.name = monster_names[id-1];

    this.cards_owned = []   	// Cards owned by this monser

    /*****************************************************
     * Giving a couple of the monsters cards for testing *
     *****************************************************
    if (this.name == "Alien") {
      this.cards_owned.push(cards.ARMOR_PLATING);
    }

    if(this.name == "Rabbot") {
      this.cards_owned.push(cards.ACID_ATTACK);
    }
    */
  }

  /**
   * Modifyer method for adjustifying health
   **
   * @param amount int The amount to adjust the health by (+ inclease, - decrease)
   * 
   * @return int The amount the health was set to.
   * 
   **/
  Monster.prototype.modify_health = function (amount) {
    console.log("Monster.prototype.modify_health(" + amount + ")");

  if (amount != 0) {
    var old_health = this.health;
    this.health += amount;
    this.health = Math.min(this.health, this.max_health());

    if (this.health != old_health) {
      // TODO: Save new health
      // TODO: Check for death
    }
  }

  // Return new/current health
  return this.health;
};
   
  /**
   * Modifyer method for adjustifying VPs
   **
   * @param amount int The amount to adjust the VPs by (+ inclease, - decrease)
   * 
   * @return int The amount the PVs was set to.
   * 
   **/
   Monster.prototype.modify_victory_points = function (amount) {
    if (amount != 0) {
      var old_VPs = this.VPs;
      this.VPs += amount

      if (this.VPs != old_VPs) {
        // TODO: Save new VPs
        // TODO: Check for win
      }
    }

    // Return new/current VPs
    return this.victory_points;
   };
   
  /**
   * Modifyer method for adjustifying snot
   **
   * @param amount int The amount to adjust the snot by (+ inclease, - decrease)
   * 
   * @return int The amount the snot was set to.
   **/
   Monster.prototype.modify_snot = function (amount) {
    if (amount != 0) {
      var old_snot = this.snot;
      this.snot += amount
      this.snot = Math.max(this.snot, 0);

      if (this.snot != old_snot) {
        // TODO: Save new snot level
      }
    }

    // Return new/current amount of snot
    return this.snot;
  };
   
   /**
    * Fetcher method for retrieving the maximum amount of health this monster can attain
    **
    * @return int The amount of health the monster can attain
    **/
   Monster.prototype.max_health = function () {
    var rv = 10;
    // There is a card for this but I can't remember it off hand.
    return rv;
  };

  /**
   * Fetcher method for retrieving the number of dice rolls the monster is allowed
   **
   * @return int The number of rolls the monster is allowed
   **/
  Monster.prototype.number_of_rolls = function () {
    var rv = 3;

    // Can be increased by "Giant Brain".
    if (this.cards_owned.indexOf(cards.GIANT_BRAIN) != -1) rv++;
 
    return rv;
  };
  
  /**
   * Fetcher method for retrieving the number of dice this monster rolls with
   **
   * @return int The number of dice the monster rolls with.
   **/
   Monster.prototype.number_of_dice = function () {
    var rv = 6;

    // Can be increased by "Extra Head" and decreased by "Shrink Ray".
    // Note: There are 2 extra heads (X1 and X2).
    if (this.cards_owned.indexOf(cards.EXTRA_HEAD_X1) != -1) rv++;
    if (this.cards_owned.indexOf(cards.EXTRA_HEAD_X2) != -1) rv++;

    // Number of dice is reduced by "Shrink Ray" counters
    rv -= this.shrink_ray_counters;

    return Math.max(rv, 0); // Just incase ;)
  };

  /**
   * Modifyer method for adjustifying applying damage
   **
   * @param amount int The amount to adjust the snot by (+ inclease, - decrease)
   * 
   * @return int The amount the snot was set to.
   **
   * This method does not modify the health directly, rather it delagets the taks to "modify_health(...)
   * this is to provent this method needing to check for deaths and save the hew health level
   **/
   Monster.prototype.apply_damage = function (amount) {

    // "Armor Plating" allows monsters to ignore inflictions of 1 damage
    if (    this.cards_owned.indexOf(cards.ARMOR_PLATING) != -1
         && amount == 1) {
      return;
    }
    
    this.modify_health(-amount);
  };
  
  /**
   * Fetcher method for retrieving any additional damage this monster inflicts
   *
   * @param amount int The amount of attack the monster is doing
   **
   * @return int The amount of damage the monster will inflict
   **
   * As per the rules cards can be used to implement additinal damage however cards do not instigate an attack
   * The subtle difference between attacks and damage is that while monsters in Kyoto can be dammaged bu 'dammage' they can only yeald Kyoto if they are attacked
   **/
   Monster.prototype.total_damage = function (attack) {
    rv = attack;
    
    // "Acid Attak" causes additonal damage even if no claws were rolled (ie. there is no attack)
    if (this.cards_owned.indexOf(cards.ACID_ATTACK) != -1) rv ++;

    return rv;
  };
  
  /**
   * Method for purchacing cards
   *
   * @param card Card The card the monster wishes to purchace
   **
   * @return bool Indicates wether the card was baught sucsfully or not
   **
   * A monster can attempt to buy cards they can't affors but the purchace will be denyed
   **/
   Monster.prototype.buy_card = function (card) {
    var rv = false;
    var cost = cards.properties[cards[card]].cost;

    // "Alian Matabolism" reduces the cost of cards by 1 snot cube
    if (this.cards_owned.indexOf(cards.ALIEN_METABOLISM) != -1) cost--;

    if (cost < this.snot) {
      console.log("Does this look like a charity.  Come back when you have more snot!");
      return rv;
    }

    this.snot -= cost;
    cards_owned.push(card)
    rv = true;

    // "Dedicated News Team" gives the monster a Vip each time they purchace a card
    if (this.cards_owned.indexOf(cards.DEDICATED_NEWS_TEAM) != -1) {
      this.modify_victory_points(+1);
    }

    // return wether the purchace was sucsful
    return rv;
  };

  Monster.prototype.can_heal_in_kyoto = function () {
    var rv = false;
    // There is a card for this but I can't remember it off hand.
    return rv;
  };
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

  // Turn end.
  var log_message = this.monsters[this.turn_monster].name + " ends their turn.";
  this.updateState("turn_phase", 'end', log_message);
  // CARDS: Resolve poison counters. Check if this is done on the poisoned monster's turn or the poisoning monster's turn

  
  // Advance to the next player's turn.
  this.updateState("turn_phase", 'start');
  this.updateState("roll_number", 1);
  
  var current_monster_index = this.monster_order.indexOf(this.turn_monster);
  var next_monster_index = current_monster_index + 1;  // does this account for monster deaths?  Note 'next_monster_index' was used for setting active dice above.  Perhaps 'next_monster_index' should be a method rather than a varable.
  if (typeof this.monster_order[next_monster_index] == 'undefined') {
    next_monster_index = 0;
  }
  
  log_message = this.monsters[this.monster_order[next_monster_index]].name + "'s turn.";
  this.updateState("turn_monster", this.monster_order[next_monster_index], log_message);
  this.updateState("next_input_from_monster", this.monster_order[next_monster_index]);
    
    
  // Beginning of new player's turn.
  // Reset dice
  for (var i = 0; i < 8; i++) {
    if (i < this.monsters[this.turn_monster].number_of_dice()) {
      this.updateState("dice__" + i + "__state", 'i');
    }
    else {
      this.updateState("dice__" + i + "__state", 'n');
    }
  }
  
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
        if (this.roll_number <= monster.number_of_rolls()) {
          console.log('        monster has rolls');
          // CARDS: take into account possible extra dice
          log_message = this.monsters[player.monster_id].name + " gets ";
          
          // Flag variable for detecting situation where the monster keeps all
          // the dice
          var keep_all = true;
          for (var i = 0; i < monster.number_of_dice(); i++) {
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
            
            log_message += this.dice[i].value + (i < monster.number_of_dice()-1 ? ", " : "");

            if (this.roll_number < monster.number_of_rolls()) {
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
          if (this.roll_number < monster.number_of_rolls() && keep_all != true) {
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
  // Calculate attack.
  var attack = 0; // Note: Cards can cause damage without an attack

  for (var i = 0; i < 8; i++) {
    if (this.dice[i].state == 'f' && this.dice[i].value == "p") {
      attack++;
    }
  }
  
  // Add additional damage (usually from cards).
  var damage = this.monsters[player.monster_id].total_damage(attack)
 
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
      this.monsters[target_monsters[i]].apply_damage(damage)
      var new_health = this.monsters[target_monsters[i]].health;
      
      if (old_health != new_health) {
        log_message = this.monsters[target_monsters[i]].name + " takes " + (old_health-new_health) + " damage.";
        this.updateState("monsters__" + target_monsters[i] + '__health', new_health, log_message);
      }

      // Attacking Kyoto? -> Make note to get yield input once we've
      // looped through all monsters.
      // Note mossters don't need to be damaged to yeild, they just need to be attacked.
      if (attack>0 && !attacker_in_kyoto) {
        if (this.monsters[target_monsters[i]].in_kyoto_city) {
          this.monster_to_yield_kyoto_city = target_monsters[i];
          console.log("    This monster was attacked in Kyoto city");
        }
        else if (this.monsters[target_monsters[i]].in_kyoto_city) {
          this.monster_to_yield_kyoto_bay = target_monsters[i];
          console.log("    This monster was attacked in Kyoto bay");
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
    if (attack>0) {
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

  var thisMonster = this.monsters[player.monster_id];
  var additional_health = 0;
  for (var i = 0; i < this.dice.length; i++) {
    if (this.dice[i].state == 'f' && this.dice[i].value == 'h') {
      additional_health++;
    }
  }
  console.log('additional_health: ' + additional_health);
  var old_health = thisMonster.health;
  var new_health = old_health + additional_health;
  var max_health = thisMonster.max_health()
  if (new_health > max_health) {
    // CARDS: If max health is over 10, allow going over 10.
    new_health = max_health;
  }
  if (new_health != old_health) {
    // Can't heal in Kyoto.
    if (thisMonster.can_heal_in_kyoto() || !thisMonster.in_kyoto_city && !thisMonster.in_kyoto_bay) {
      var log_message = thisMonster.name + " gains " + (new_health - old_health) + " health.";  // Use new-old health instead of additional incase limited by max health.
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
