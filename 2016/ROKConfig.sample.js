// Copy this to ROKConfig.js and make your local changes there.

ROKConfig = {
  'always_allow_buying_cards' : false,
  'clean_up_idle_players': false,
  'initial_snot': 0,
  'log_level': "error",
  'randomize_monster_order': true,
  'top_cards': [],  // Card's to have ontop of deck after shuffeling, the first three of which will be available for purchace right away.
                    // Values represent the id of the cards in the 'theCards' object ('ACID_ATTACK' haveing id 1)
}

module.exports = ROKConfig;
