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
  console.log("Handle updates");
  for (var i = 0; i < updates.length; i++) {
    var update = updates[i];
    
    if (update.log) {
      this.addToLog(update.log);    
    }

    if (typeof this[update.handler] == "function") {
      this[update.handler](update.value, update.id);
    }
    else if (update.element) {
      $("#" + update.element).html(update.value);
    }
  }
}

ROKGame.prototype.addToLog = function(str) {
  // TODO
}

/**
 * TODO Monster selection HTML needs to be randomly generated on state change.
 */
ROKGame.prototype.handle__game_state = function(new_state) {
  console.log("ROKGame.prototype.handle__game_state to " + new_state);
  switch (new_state) {
    case "select_monsters":
      $("#dev2 .lobby").hide();
      $("#dev2 .monster_selection").show();
      break;
    case "play":
      $("#dev2 .monster_selection").hide();
      $("#dev2 .game").show();
      break;
  }
}