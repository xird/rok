/**
 * Dumps the card properties from ROKServerGame.js into JSON, while suppressing all other console.log()ging. 
 */
var ROKServerGame = require('../../production/ROKServerGame.js');
var backup = console.log;
console.log = function(){};
var game = new ROKServerGame({});
console.log = backup;
console.log(JSON.stringify(game.cards.properties));