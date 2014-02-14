/**
 * Class definition for the lobby object. Used both on client and server side.
 *
 */
function ROKLobby() {
  this.players = [];
  this.player_ids = [];
  
  /**
   * Constructor.
   *
   * On the client side, calls another initializer to set browser event handlers
   * etc. See ROKClientLobby.prototype.init().
   */
  var __construct = function (that) {
    if (typeof that.init == "function") {
      that.init();
    }
    else {
      that.initClient();
    }
  }(this)
}

// Only export to the node.js exports object if we're serverside.
if(typeof exports === 'object'){
  module.exports = ROKLobby;
}
