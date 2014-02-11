/**
 * Client side functions for the game class.
 */
 
/**
 * Main game data update handler.
 *
 * @param attribute String 
 *   The game attribute to be updated. For example "turn_phase" or
 *   "monster__health". Note that the hierarchy in the data structure is
 *    represented by double underscores in the labels.
 * @param new_value Mixed
 *   The new value for the given attribute
 * @param Optional id Integer 
 *   If there are multiples of the given attribute, the id parameter defines
 *   which one to update.
 */
ROKGame.prototype.handleUpdate = function(attribute, new_value, id) {
  var handler_name = "handle_" + attribute;
  if (typeof ROKGame[handler_name] == "function") {
    ROKGame[handler_name].call(new_value, id);
  }
  else {
    if (id) {
      $("#" + attribute + "__" + id).html(new_value);
    }
    else {
      $("#" + attribute).html(new_value);
    }
  }
}