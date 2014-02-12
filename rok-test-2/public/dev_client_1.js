var dev_client_1_init = function(socket) { 
  // Make sure the client doesn't try to keep playing with a server that's been
  // reset.
  socket.on('server_has_gone_away', function () {
    $('body').html('<p>The server has gone away. Try reloading the page.</p>');
  });
  
  /**
   * Lobby functionality.
   */
  
  // Welcomes a new player.
  socket.on('welcome', function (data) {
    $('#dev1 .welcome').html("Welcome to the ROK, <strong>" + data.name + "</strong>");
  });
  
  // Lobby message
  socket.on('lobby_message', function (data) {
    console.log('dev1 lobby message received');
    console.log(data);
    $('#dev1 .lobby_messages').html(data).show().delay(1500).fadeOut(1000);
  });
  
  // Lobby state update
  socket.on('update_lobby', function (data) {
    console.log("dev1 updating lobby");
    console.log(data);
    
    $('#dev1 .lobby').show();
    $('#dev1 .game').hide();
    
    var transform = [
      {tag: 'tr', children: [
    	{tag: 'td', html: "${name}"},
      {tag: 'td', html: "${mode}"},
      {tag: 'td', html: "${game_id}"},
      {tag: 'td', children: [
    	  {tag: 'input', type: "button", class: "player_invite_button", value: "Invite", 'data-player_id': "${id}"}
	      ]},
      ]}
    ];
    
    $('#dev1 .player_ids').html('<table><thead><tr><th>Name</th><th>Mode</th><th>Game</th></tr></thead><tbody></tbody></table>');
    $('#dev1 .player_ids table tbody').json2html(data.player_ids, transform);
  });
  
  // Start game
  socket.on('start_game', function (data) {
    console.log('dev1 start_game');
    $('#dev1 .lobby').hide();
    $('#dev1 .game').show();
  });
  
  // Creates a new game, making the player the host for this game.
  $('#dev1 .new_game').on("click", function(){
    console.log('dev1 new_game');
    socket.emit("new_game");
  });
  
  // Invite.
  $('#dev1 .player_ids').on("click", ".player_invite_button", function(){
    console.log('dev1 invite');
    socket.emit("invite", {player_id: $(this).data("player_id")});
  });
  
  // Confirm invited players and start a new game.
  $('#dev1 .confirm_game').on("click", function(){
    console.log('dev1 confirm_game');
    socket.emit("confirm_game");
  });

  
  /**
   * Game functionality.
   */

  // Game state update
  socket.on('update_game', function gameUpdate(data) {
    console.log("dev1 updating game");
    
    $('#dev1 .lobby').hide();
    $('#dev1 .game').show();
    
    var transforms = {
      'main': [
        {tag: 'tr', children: [
          {tag: "th", html: "This monster / Host / Game id"},
          {tag: "td", colspan: 5, html: "${this_monster} / ${host_name} / ${id} "}
        ]},
        {tag: 'tr', children: [
          {tag: "th", html: "Game state"},
          {tag: "td", html: "${game_state}"},
          {tag: "th", html: "Turn phase"},
          {tag: "td", html: "${turn_phase}"},
          {tag: "th", html: "Roll number"},
          {tag: "td", html: "${roll_number}"}
        ]},
        {tag: 'tr', children: [

        ]},
        {tag: 'tr', children: [
          {tag: "th", html: "Turn monster / NIFM"},
          {tag: "td", colspan: 5,  html: "${turn_monster} / ${next_input_from_monster}"}
        ]},
        {tag: 'tr', class: "dice", children: [
          {tag: "th", html: "Dice"},
          {tag: "td", colspan: 2,  children: [
            {tag: "table", children: [
              {tag: "tr", children: function(){
                return(json2html.transform(this.dice, transforms.dice));
              }}
            ]},
            {tag: 'input', type: "button", id: "roll_dice_button", value: "Roll"}
          ]},
          {tag: "th", html: "Misc actions"},
          {tag: "td", colspan: 2, html: '<input type="button" value="Done buying" id="done_buying" />'},
        ]},
        {tag: 'tr', children: [
          {tag: "th", html: "Monsters"},
          {tag: "td", colspan: 5,  children: [
            {tag: "table", children: [
              {tag: "tr", children: function(){
                return(json2html.transform(this.monsters,transforms.monsters));
              }}
            ]}
          ]}
        ]},
      ],
      'player_ids': [
        {tag: "tr", children: [
          {tag: "td", html: "${socket}"}
        ]}
      ],
      'dice': [
          {tag: "td", class: "die die_status_${state}", html: "${value}"},
      ],
      'monsters': [
        
          {tag: "td", children: [
            {tag: "table", class: "monster", children: [
              {tag: "tr", children: [
                {tag: "th", html: "Name"},
                {tag: "td", html: "${name} (${id})"}
              ]},
              {tag: "tr", children: [
                {tag: "th", html: "Player"},
                {tag: "td", html: "${player}"}
              ]},
              {tag: "tr", children: [
                {tag: "th", html: "Health"},
                {tag: "td", html: "${health}"}
              ]},
              {tag: "tr", children: [
                {tag: "th", html: "Victory points"},
                {tag: "td", html: "${victory_points}"}
              ]},
              {tag: "tr", children: [
                {tag: "th", html: "Energy"},
                {tag: "td", html: "${energy}"}
              ]},
              {tag: "tr", children: [
                {tag: "th", html: "ITC"},
                {tag: "td", html: "${in_tokyo_city}"}
              ]},
              {tag: "tr", children: [
                {tag: "th", html: "ITB"},
                {tag: "td", html: "${in_tokyo_bay}"}
              ]},
              {tag: "tr", children: [
                {tag: "th", html: "Select"},
                {tag: "td", children: [
                  {tag: 'input', type: "button", class: "monster_select_button", value: "Select", 'data-monster_id': "${id}"}
                ]}
              ]},
            ]}
          ]}
        
      ],
    };
    
    $('#dev1 .game .data').html('<table class="grid"><tbody></tbody></table>');
    $('#dev1 .game .data table tbody').json2html(data, transforms.main);
    // end update_game socket event handler
  });
  
  // Select a monster to play with
  $('#dev1 .game .data').on("click", ".monster_select_button", function(){
    console.log('dev1 select monster '+$(this).data('monster_id'));
    socket.emit("select_monster", {monster_id: $(this).data('monster_id')});
  });
  
  // Game message
  socket.on('game_message', function (data) {
    console.log('dev1 game message received');
    //console.log(data);
    $('#dev1 .game_messages').html(data).show().delay(1500).fadeOut(1000);
  });
  
  // Roll dice.
  $('#dev1 .game .data').on("click", "#roll_dice_button", function(){
    console.log('dev1 roll_dice');
    // TODO: Define dice to keep
    socket.emit("roll_dice", {keep_dice_ids: []});
  });
  
  // Finish buying cards.
  $('#dev1 .game .data').on("click", "#done_buying", function(){
    console.log('dev1 done buying');
    socket.emit("done_buying");
  });
}