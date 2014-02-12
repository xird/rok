/**
 * Client side functions for the game class.
 */


/**
 * Main game data update handler.
 *
 * @param Array updates
 *   This array contains a number of "update" objects.
 *
 *   Each "update" object contains four fields:
 *   - element: The id of the DOM element that should receive the new value.
 *   - value: The new value of the element.
 *   - handler: If a function by this name exists, that should be called instead
 *     of updating the DOM directly.
 *   - id: In case there are multiple elements of the same type (monsters, 
 *     dice), this id defines which one we're updating.
 *   - log: A log message to be shown to users.
 *     
 */
ROKGame.prototype.handleUpdates = function(updates) {
  for (var i = 0; i < updates.length; i++) {
    var update = updates[i];
    
    if (update.log) {
      this.addToLog(update.log);    
    }

    if (typeof this[update.handler] == "function") {
      this[update.handler].call(update.value, update.id);
    }
    else if (update.element) {
      $("#" + update.element).html(update.value);
    }
  }
}

ROKGame.prototype.addToLog = function(str) {
  // TODO
}