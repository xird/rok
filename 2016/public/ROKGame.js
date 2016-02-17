/**
 * Class definition for the game object. Used both on client and server side.
 *
 * The empty attributes defined in the object aren't strictly necessary, but
 * they help document the class.
 *
 * Game attributes are as follows:
 *   - id
 *   - host: Only really needed in the lobby phase.
 *   - host_name: Only really needed in the lobby phase.
 *   - game_state: Tracks the progress of the preparation of the game.
 *   - turn_phase: Tracks the progress of a single turn taken by a player.
 *   - turn_monster: The monster whose turn it is at the moment.
 *   - next_input_from_monster: Sometimes a player needs to give input outside of
 *     the player's turn. For example, plr A is attacking plr B, and plr B wants
 *     to spend money on rapid healing.
 *   - updates: A data array describing the changes to the game state since the 
 *     previous update. This is used to update the game log in the client, and
 *     to allow animating the changes in the client instead of just snapping the
 *     new game state in place, which would make it difficult for the players to
 *     see all the things that changed. See ROKServerGame.prototype.updateState
 *     for more details.
 */
function ROKGame(player) {
  this.id = 0;
  this.host = "";
  this.host_name = "";
  this.game_state = "";
  this.turn_phase = "";
  this.turn_monster = "";
  this.next_input_from_monster = "";
  this.roll_number = 0;
  this.players = {};
  this.player_ids = {};
  this.monster_order = [];
  this.monsters = {};
  this.dice = [];
  this.updates = [];
  this.winner = 0;
  this.monster_in_kyoto_city_id = null;
  this.monster_in_kyoto_bay_id  = null;
  this.cards_available = [];

  for (var i = 0; i < 6; i++) {
    this.dice.push({
      value: 0,
      state: "i"
    });
  }  
  for (var i = 6; i < 8; i++) {
    this.dice.push({
      value: 0,
      state: "n"
    });
  }  
  
  /**
   * Constructor, calls a function to initialize game values when instantiated
   * on the server side. See ROKServerGame.prototype.init().
   *
   * On the client side, calls another initializer to set browser event handlers
   * etc. See ROKClientGame.prototype.init().
   */
  var __construct = function (that, player) {
    if (typeof that.init == "function") {
      that.init(player);
    }
    else {
      that.initClient();
    }
  }(this, player)
}

ROKGame.prototype.inKyoto = function(monster) {
  return (this.monster_in_kyoto_city_id == monster.getId() || this.monster_in_kyoto_bay_id == monster.getId());
}

// Only export to the node.js exports object if we're serverside.
if(typeof exports === 'object'){
  module.exports = ROKGame;
}
