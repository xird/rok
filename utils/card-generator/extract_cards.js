/**
 * Dumps the card properties from ROKServerGame.js into JSON, while suppressing all other console.log()ging. 
 */
var ROKServerGame = require('../../production/ROKServerGame.js');
var backup = console.log;
console.log = function(){};
var game = new ROKServerGame({});
for (prop in game.cards) {
  if (prop != "properties") {
    var id = game.cards[prop];
    game.cards.properties[id].machine_name = prop;
  }
}

console.log = backup;
console.log(JSON.stringify(game.cards.properties));