/**
 * Class definition for the game object. Used both on client and server side.
 *
 * The empty attributes defined in the object aren't strictly necessary, but
 * they help document the class.
 *
 * Game attributes are as follows:
 *   - id
 *   - host
 *   - host_name
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
 *     see all the things that changed.
 *       "updates" is an array containing N objects, each of which has two 
 *     attributes: "change" and "log". "change" defines a state
 *     change that needs to be shown in the UI, such as "monster 2 health
 *     decreased by 2 points". These are formatted in a way that refers to the 
 *     structure of the game object, and a similar structure should be found in
 *     DOM tree on the client side. The "log" attribute contains an optional
 *     human-readable log entry related to the change.
 *
 */
function ROKGame() {
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
  this.monsters = [];
    
  this.dice = [];
  for (var i = 0; i < 8; i++) {
    this.dice.push({
      value: 0,
      state: "i"
    });
  }

  this.updates = [];
}

// Only export to the node.js exports object if we're serverside.
if(typeof exports === 'object'){
  module.exports = ROKGame;
}
