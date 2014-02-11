/**
 * Class definition for the game object. Used both on client and server side.
 *
 * The empty attributes defined in the object aren't strictly necessary, but
 * they help document the class.
 *
 */
function ROKGame() {
  this.id = 0;
  this.host = "";
  this.host_name = "";
  this.game_state = "";
  this.turn_phase = "";
  this.turn_player = "";
  this.next_input_from_player = "";
  this.roll_number = 0;
  this.players = {};
  this.player_order = [];
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
