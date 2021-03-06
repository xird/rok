var ROKUtils = require("./public/ROKUtils.js");
var utils = new ROKUtils();

var theCards = {
  ACID_ATTACK:                   1,
  ALIEN_METABOLISM:              2,
  ALPHA_MONSTER:                 3,
  APARTMENT_BUILDING:            4,
  ARMOR_PLATING:                 5,
  BACKGROUND_DWELLER:            6,
  BURROWING:                     7,
  CAMOUFLAGE:                    8,
  COMMUTER_TRAIN:                9,
  COMPLETE_DESTRUCTION:         10,
  CORNER_STORE:                 11,
  DEDICATED_NEWS_TEAM:          12,
  DROP_FROM_HIGH_ALTITUDE:      13,
  EATER_OF_THE_DEAD:            14,
  ENERGIZE:                     15,
  ENERGY_HOARDER:               16,
  EVACUATION_ORDERS_X1:         17,
  EVACUATION_ORDERS_X2:         18,
  EVEN_BIGGER:                  19,
  EXTRA_HEAD_X1:                20,
  EXTRA_HEAD_X2:                21,
  FIRE_BLAST:                   22,
  FIRE_BREATHING:               23,
  FREEZE_TIME:                  24,
  FRENZY:                       25,
  FRIEND_OF_CHILDREN:           26,
  GAS_REFINERY:                 27,
  GIANT_BRAIN:                  28,
  GOURMET:                      29,
  HEAL:                         30,
  HEALING_RAY:                  31,
  HERBIVORE:                    32,
  HERD_CULLER:                  33,
  HIGH_ALTITUDE_BOMBING:        34,
  IT_HAS_A_CHILD:               35,
  JET_FIGHTERS:                 36,
  JETS:                         37,
  MADE_IN_A_LAB:                38,
  METAMORPH:                    39,
  MIMIC:                        40,
  MONSTER_BATTERIES:            41,
  NATIONAL_GUARD:               42,
  NOVA_BREATH:                  43,
  NUCLEAR_POWER_PLANT:          44,
  OMNIVORE:                     45,
  OPPORTUNIST:                  46,
  PARASITIC_TENTACLES:          47,
  PLOT_TWIST:                   48,
  POISON_QUILLS:                49,
  POISON_SPIT:                  50,
  PSYCHIC_PROBE:                51,
  RAPID_HEALING:                52,
  REGENERATION:                 53,
  ROOTING_FOR_THE_UNDERDOG:     54,
  SHRINK_RAY:                   55,
  SKYSCRAPER:                   56,
  SMOKE_CLOUD:                  57,
  SOLAR_POWERED:                58,
  SPIKED_TAIL:                  59,
  STRETCHY:                     60,
  TANKS:                        61,
  TELEPATH:                     62,
  URBAVORE:                     63,
  VAST_STORM:                   64,
  WERE_ONLY_MAKING_IT_STRONGER: 65,
  WINGS:                        66,

  AMUSEMENT_PARK:               67,
  ARMY:                         68,
  CANNIBALISTIC:                69,
  INTIMIDATING_ROAR:            70,
  MONSTER_SIDEKICK:             71,
  REFLECTIVE_HIDE:              72,
  SLEEP_WALKER:                 73,
  SUPER_JUMP:                   74,
  THROW_A_TANKER:               75,
  THUNDER_STOMP:                76,
  UNSTABLE_DNA:                 77,

  // This properties table has been adopted from Maltize's KingOfTokyo-CardList project on GitHub
  // https://github.com/maltize/KingOfTokyo-CardList

  properties: {
    1: {name: "Acid Attack", cost: 6, keep: true, set: "original", implemented: true, description: "Deal 1 extra damage each turn (even when you don't otherwise attack).",
        hooks: {
        "RESOLVE_ATTACK_DICE": function (game, owning_monster, attackage) {
            var rv = attackage;
            rv.damage++;

          game.updateState(false, false, owning_monster.getName() + " deals 1 extra damage due to 'Acid Attack'. Damage: " + attackage.damave + " -> " + rv.damage);
            utils.log("Damage: " + attackage.damage + " -> " + rv.damage);
            return attackage;
          }
        }
       },
    2: {name: "Alien Metabolism", cost: 3, keep: true, set: "original", implemented: true, description: "Buying cards costs you 1 less [Snot].",
        hooks: {
          "BUY_CARD": function (game, owning_monster, cardPrice) {
            var rv = cardPrice;
            rv--;

            game.updateState(false, false, "Card cost reduced by 1 by 'Alien Metabolism. Cost: " + cardPrice + " -> " + rv);
            utils.log("Card cost: " + cardPrice + " -> " + rv);
            return rv;
          }
        }
       },
    3: {
      name: "Alpha Monster", cost: 5, keep: true, set: "original", implemented: true, description: "Gain 1[VP] when you attack.",
        hooks: {
        "RESOLVE_ATTACK_DICE": function (game, owning_monster, attackage) {
          if (attackage.attack > 0)
            owning_monster.addVictoryPoints(1);

            game.updateState(false, false, "For 'Alpha Monster " + owning_monster.getName() + " gains 1 Victory Point for attacking. " + owning_monster.getName() + " now has " + owning_monster.getVictoryPoints() + " Victory Points");
            utils.log("VPs: " + owning_monster.getVictoryPoints());
            return attackage;
          }
        }
       },
    4: {name: "Apartment Building", cost: 5, keep: false, set: "original", implemented: true, description: "+ 3[VP]",
        hooks: {
          "CARD_BOUGHT": function (game, owning_monster) {
            owning_monster.addVictoryPoints()(3);

            game.updateState(false, false, owning_monster.getName() + " gains 3 Victory Points for 'Apartment Building'. " + owning_monster.getName() + " now has " + owning_monster.getVictoryPoints() + " Victory Points");
            utils.log("VPs: " + owning_monster.getVictoryPoints());
          }
        }
       },
    5: {name: "Armor Plating", cost: 4, keep: true, set: "original", implemented: true, priority: -1000, description: "Ignore damage of 1.",
        hooks: {
          "APPLY_DAMAGE": function (game, owning_monster, damage) {
            var rv = damage;

            if (damage == 1) {
              rv = 0;
              game.updateState(false, false, "Due to 'Armor Plating' monster receives no damage. Damage: " + damage + " -> " + rv);
            }

            utils.log("Damage: " + damage + " -> " + rv);
            return rv;
          }
        }
       },
    6: {name: "Background Dweller", cost: 4, keep: true, set: "original", implemented: true, description: "You can always reroll any [3] you have.",
        hooks: {
          "DICE_STATE": function (game, owning_monster, die) {
            if (die.value == '3') {
              die.state = die.state == 'r' ? 'rr' : "kr";  // 'rr' means 're-roll(able)'.  'kr' means 'keep-rerollale'.
            }

            utils.log("State: " + die.state);
            return die;
          }
        }
       },
    7: {name: "Burrowing", cost: 5, keep: true,  set: "original", implemented: true, description: "Deal 1 extra damage on Tokyo. Deal 1 damage when yielding Tokyo to the monster taking it.",
        hooks: {
          "RESOLVE_ATTACK_DICE": function (game, owning_monster, attackage) {
            rv = attackage;

            if (!game.inKyoto(owning_monster)) {
              rv.damage++
              game.updateState(false, false, "Due to 'Burrowing' monster deals 1 extra damage when attacking Kyoto. Damage: " + attackage.damage + " -> " + rv.damage);
            }

            utils.log("Damage: " + attackage.damage + " -> " + rv.damage);
            return rv;
          },
          "YIELD_KYOTO": function (game, owning_monster) {
            var rv = 0;

          if (!game.inKyoto(owning_monster)) {
            rv = 1;
              game.updateState(false, false, "Due to 'Burrowing' monster deals 1 damage to " + owning_monster.getName() + " while yielding Kyoto. Damage: " + rv);
            }

            utils.log("Damage: " + attackage.damage + " -> " + rv.damage);
            return rv;
          }
        }
    },
    8: {name: "Camouflage", cost: 3, keep: true,  set: "original", implemented: true, description: "If you take damage roll a die for each damage point. On a [Heart] you do not take that damage point.",
        hooks: {
          "APPLY_DAMAGE": function (game, owning_monster, damage) {
            var rv = damage;
            var log_message = "For 'Camouflage' monster rolls: ";

            for (var i = 0; i < damage ; i++) {
              var roll = utils.dieRoll()
              log_message += roll + (i == damage-1 ? '.' : ", ")

              if (roll === 'h') {
                rv--;
              }
            }
            log_message += "\nDamage: " + damage + " -> " + rv;

            utils.log(log_message);
            game.updateState(false, false, log_message);
            return rv;
          }
        }
       },
    9: {name: "Commuter Train", cost: 4, keep: false, set: "original", implemented: true, description: "+ 2[VP]",
        hooks: {
          "CARD_BOUGHT": function (game, owning_monster) {
            owning_monster.addVictoryPoints(2);

            game.updateState(false, false, owning_monster.getName() + " gains 2 Victory Points for 'Commuter Train'. " + owning_monster.getName() + " now has " + owning_monster.getVictoryPoints() + " Victory Points");
            utils.log("VPs: " + owning_monster.getVictoryPoints());
          }
        }
       },
    10: {name: "Complete Destruction", cost: 3, keep: true,  set: "original", implemented: true, description: "If you roll [1][2][3][Heart][Attack][Snot] gain 9[VP] in addition to the regular results.",
         hooks: {
          "RESOLVE_DICE": function (game, owning_monster) {
            var values = [];
            for (var i = 0; i < owning_monster.numberOfDice() ; i++) {
              values.push(game.dice[i].value);
            }

            if (    values.indexOf('1') != -1
                 && values.indexOf('2') != -1
                 && values.indexOf('3') != -1
                 && values.indexOf('h') != -1
                 && values.indexOf('p') != -1
                 && values.indexOf('s') != -1) {
              owning_monster.addVictoryPoints(9);
              game.updateState(false, false, owning_monster.getName() + " gains 9 Victory Points for 'Complete Distruction'. " + owning_monster.getName() + " now has " + owning_monster.getVictoryPoints() + " Victory Points");
            }

            utils.log("VPs: " + owning_monster.getVictoryPoints());
          }
        }
       },
    11: {name: "Corner Store", cost: 3, keep: false, set: "original", implemented: true, description: "+ 1[VP]",
         hooks: {
           "CARD_BOUGHT": function (game, owning_monster) {
             owning_monster.addVictoryPoints(1);

             game.updateState(false, false, owning_monster.getName() + " gains 1 Victory Points for 'Corner Store'. " + owning_monster.getName() + " now has " + owning_monster.getVictoryPoints() + " Victory Points");
             utils.log("VPs: " + owning_monster.getVictoryPoints());
           }
         }
        },
    12: {name: "Dedicated News Team", cost: 3, keep: true,  set: "original", implemented: true, description: "Gain 1[VP] whenever you buy a card.",
         hooks: {
           "CARD_BOUGHT": function (game, owning_monster, current_card_id) {

              // Card affect not to be applied when buying itself.
             if (current_card_id != 12) {
               owning_monster.addVictoryPoints(1);

               game.updateState(false, false, owning_monster.getName() + " gains 1 Victory Points for 'Dedicated News Team'. " + owning_monster.getName() + " now has " + owning_monster.getVictoryPoints() + " Victory Points");
               utils.log("VPs: " + owning_monster.getVictoryPoints());
             }
           }
         }
        },
    13: {name: "Drop from High Altitude", cost: 5, keep: false, set: "original", implemented: true, description: "+ 2[VP] and take control of Tokyo if you don't already control it.",
         hooks: {
           // This card is also knon as "Death from Above".
           // For a 5 or 6 player game it is unclear wether "take control of Kyoto"
           // means both monsters leave or not and if not who should.
           // In this implementation both monsters leave.
           "CARD_BOUGHT": function (game, owning_monster) {
              owning_monster.addVictoryPoints(2);
              var log_message = owning_monster.getName() + " gains 2 Victory Points for 'Drop from High Altitude'"
              if (!game.inKyoto(owning_monster)) {
                if (game.monster_in_kyoto_city_id != null) {
                  game.monsters[game.monster_in_kyoto_city_id].yieldKyoto();
                }
                if (game.monster_in_kyoto_bay_id != null) {
                  game.monsters[game.monster_in_kyoto_bay_id].yieldKyoto();
                }

                game.checkEnterKyoto(owning_monster);
                log_message += " and enters Kyoto"
              }

              log_message += ". " + owning_monster.getName() + " now has " + owning_monster.getVictoryPoints() + " Victory Points";
              game.updateState(false, false, log_message);

              utils.log("VPs: " + owning_monster.getVictoryPoints());
            }
         }
        },
    14: {name: "Eater of the Dead", cost: 4, keep: true,  set: "original", implemented: true, description: "Gain 3[VP] every time a monster's [Heart] goes to 0.",
         hooks: {
           "MONSTER_DIES": function (game, owning_monster) {
             owning_monster.addVictoryPoints(3);

             game.updateState(false, false, owning_monster.getName() + " gains 3 Victory Points for 'Eater of the Dead'. " + owning_monster.getName() + " now has " + owning_monster.getVictoryPoints() + " Victory Points");
             utils.log("VPs: " + owning_monster.getVictoryPoints());
           }
         }
        },
    15: {name: "Energize", cost: 8, keep: false, set: "original", implemented: true, description: "+ 9[Snot]",
         hooks: {
           "CARD_BOUGHT": function (game, owning_monster) {
             owning_monster.addSnot(9);

             game.updateState(false, false, owning_monster.getName() + " gains 9 Snot for 'Energize'. " + owning_monster.getName() + " now has " + owning_monster.getSnot() + " Snot");
             utils.log("VPs: " + owning_monster.getVictoryPoints());
           }
         }
        },
    16: {name: "Energy Hoarder", cost: 3, keep: true,  set: "original", implemented: true, description: "You gain 1[VP] for every 6[Snot] you have at the end of your turn.",
         hooks: {
           "TURN_END": function (game, owning_monster) {
             var vips = Math.floor(owning_monster.getSnot() / 6);
             if (vips > 0) {
                owning_monster.addVictoryPoints(vips);
                game.updateState(false, false, owning_monster.getName() + " gains " + vips + " Victory Point" + (vips == 1 ? "s" : "") + " for 'Energy Hoarder'. " + owning_monster.getName() + " now has " + owning_monster.getVictoryPoints() + " Victory Points");
                utils.log("VPs: " + owning_monster.getVictoryPoints());
             }
           }
         }
        },
    17: {name: "Evacuation Orders", cost: 7, keep: false, set: "original", implemented: true, description: "All other monsters lose 5[VP].",
         hooks: {
           "CARD_BOUGHT": function (game, owning_monster) {
             for (var monster_id in game.monsters) {
               var monster = game.monsters[monster_id];
               if (monster != owning_monster) {
                 game.monsters[monster_id].addVictoryPoints(-5);
                 game.updateState(false, false, "" + monster.getName() + " loses 5 Victory Points for 'Evacuation Orders'");
               }
             }
           }
         }
        },
    18: {name: "Evacuation Orders", cost: 7, keep: false, set: "original", implemented: true, description: "All other monsters lose 5[VP].",
         hooks: {
           "CARD_BOUGHT": function (game, owning_monster) {
             game.cards.properties[17].hooks.CARD_BOUGHT(game, owning_monster);
           }
         }
        },
    19: {name: "Even Bigger", cost: 4, keep: true,  set: "original", implemented: true, description: "Your maximum [Heart] is increased by 2. Gain 2[Heart] when you get this card.",
         hooks: {
           "MAX_HEALTH": function (game, owning_monster, max_health) {
             var rv = max_health;
             rv += 2;

             return rv;
           },
           "CARD_BOUGHT": function (game, owning_monster, current_card_id) {
             // Check if this card was just bought.
             if (current_card_id == 19) {
               owning_monster.addHealth(2);

               game.updateState(false, false, owning_monster.getName() + " gains 2 Health for 'Even Bigger'. " + owning_monster.getName() + " now has " + owning_monster.getHealth() + " Health");
               utils.log("Health: " + owning_monster.getHealth());
             }
           }
         }
        },
    20: {name: "Extra Head", cost: 7, keep: true, set: "original", implemented: true, description: "You get 1 extra die.",
         hooks: {
           "NUMBER_OF_DICE": function (game, owning_monster, dice) {
             var rv = dice;
             rv++;

             return rv;
           }
         }
        },
    21: {name: "Extra Head", cost: 7, keep: true,  set: "original", implemented: true,  description: "You get 1 extra die.",
         hooks: {
           "NUMBER_OF_DICE": function (game, owning_monster, dice) {
             return game.cards.properties[20].hooks.NUMBER_OF_DICE(game, owning_monster, dice);
           }
         }
        },
    22: {name: "Fire Blast",                    cost: 3, keep: false, set: "original", implemented: false, description: "Deal 2 damage to all other monsters.",
         hooks: {
           "CARD_BOUGHT": function (game, owning_monster) {
             for (var monster_id in game.monsters) {
               var monster = game.monsters[monster_id];
               if (monster != owning_monster) {
                 game.monsters[monster_id].applyDamage(2);
                 game.updateState(false, false, "" + monster.getName() + " sustains 2 damage from 'Fire Blast'");
               }
             }
           }
         }
        },
    23: {name: "Fire Breathing", cost: 4, keep: true,  set: "original", implemented: false, description: "Your neighbors take 1 extra damage when you deal damage",
        hooks: {
        "RESOLVE_ATTACK_DICE": function (game, owning_monster, attackage) {
            if (attackage.attack > 0) {
              var neighbour;

              var current_monster_index = game.monster_order.indexOf(game.turn_monster_id);
              var number_of_monsters = game.monster_order.length;
              neighbour = game.monsters[game.monster_order[(current_monster_index + number_of_monsters - 1) % number_of_monsters]];
              game.updateState(false, false, neighbour.getName() + " is dealt 1 extra damage due to 'Fire Breath'");
              neighbour.applyDamage(1);

              if (number_of_monsters > 2) {
                neighbour = game.monsters[game.monster_order[(current_monster_index + 1) % number_of_monsters]];
                game.updateState(false, false, neighbour.getName() + " is dealt 1 extra damage due to 'Fire Breath'");
                neighbour.applyDamage(1);
              }
            }

            return attackage;
          }
        }
       },
    24: {name: "Freeze Time",                   cost: 5, keep: true,  set: "original", implemented: false, description: "On a turn where you score [1][1][1], you can take another turn with one less die.", hooks: {}},
    25: {name: "Frenzy",                        cost: 7, keep: false, set: "original", implemented: false, description: "When you purchase this card Take another turn immediately after this one.", hooks: {}},
    26: {name: "Friend of Children",            cost: 3, keep: true,  set: "original", implemented: false, description: "When you gain any [Snot] gain 1 extra [Snot].", hooks: {}},
    27: {name: "Gas Refinery",                  cost: 6, keep: false, set: "original", implemented: false, description: "+ 2[VP] and deal 3 damage to all other monsters.", hooks: {}},
    28: {name: "Giant Brain",                   cost: 5, keep: true,  set: "original", implemented: true,  description: "You have one extra reroll each turn.", hooks: {}},
    29: {name: "Gourmet",                       cost: 4, keep: true,  set: "original", implemented: false, description: "When scoring [1][1][1] gain 2 extra [VP].", hooks: {}},
    30: {name: "Heal",                          cost: 3, keep: false, set: "original", implemented: false, description: "Heal 2 damage.", hooks: {}},
    31: {name: "Healing Ray",                   cost: 4, keep: true,  set: "original", implemented: false, description: "You can heal other monsters with your [Heart] results. They must pay you 2[Snot] for each damage you heal (or their remaining [Snot] if they haven't got enough.", hooks: {}},
    32: {name: "Herbivore",                     cost: 5, keep: true,  set: "original", implemented: false, description: "Gain 1[VP] on your turn if you don't damage anyone.", hooks: {}},
    33: {name: "Herd Culler",                   cost: 3, keep: true,  set: "original", implemented: false, description: "You can change one of your dice to a [1] each turn.", hooks: {}},
    34: {name: "High Altitude Bombing",         cost: 4, keep: false, set: "original", implemented: false, description: "All monsters (including you) take 3 damage.", hooks: {}},
    35: {name: "It Has a Child",                cost: 7, keep: true,  set: "original", implemented: false, description: "If you are eliminated discard all your cards and lose all your [VP], Heal to 10[Heart] and start again.", hooks: {}},
    36: {name: "Jet Fighters",                  cost: 5, keep: false, set: "original", implemented: false, description: "+ 5[VP] and take 4 damage", hooks: {}},
    37: {name: "Jets",                          cost: 5, keep: true,  set: "original", implemented: false, description: "You suffer no damage when yielding Tokyo.", hooks: {}},
    38: {name: "Made in a Lab",                 cost: 2, keep: true,  set: "original", implemented: false, description: "When purchasing cards you can peek at and purchase the top card of the deck.", hooks: {}},
    39: {name: "Metamorph",                     cost: 3, keep: true,  set: "original", implemented: false, description: "At the end of your turn you can discard any keep cards you have to receive the [Snot] they were purchased for.", hooks: {}},
    40: {name: "Mimic",                         cost: 8, keep: true,  set: "original", implemented: false, description: "Choose a card any monster has in play and put a mimic counter on it. This card counts as a duplicate of that card as if it just had been bought. Spend 1[Snot] at the start of your turn to change the power you are mimicking.", hooks: {}},
    41: {name: "Monster Batteries",             cost: 2, keep: true,  set: "original", implemented: false, description: "When you purchase this put as many [Snot] as you want on it from your reserve. Match this from the bank. At the start of each turn take 2[Snot] off and add them to your reserve. When there are no [Snot] left discard this card.", hooks: {}},
    42: {name: "National Guard",                cost: 3, keep: false, set: "original", implemented: false, description: "+ 2[VP] and take 2 damage.", hooks: {}},
    43: {name: "Nova Breath",                   cost: 7, keep: true,  set: "original", implemented: false, description: "Your attacks damage all other monsters.", hooks: {}},
    44: {name: "Nuclear Power Plant",           cost: 6, keep: false, set: "original", implemented: false, description: "+ 2[VP] and heal 3 damage.", hooks: {}},
    45: { name: "Omnivore", cost: 4, keep: true, set: "original", implemented: false, description: "Once each turn you can score [1][2][3] for 2[VP]. You can use these dice in other combinations.", hooks: {} },
    46: {name: "Opportunist",                   cost: 3, keep: true,  set: "original", implemented: false, description: "Whenever a new card is revealed you have the option of purchasing it as soon as it is revealed.", hooks: {}},
    47: {name: "Parasitic Tentacles",           cost: 4, keep: true,  set: "original", implemented: false, description: "You can purchase cards from other monsters. Pay them the [Snot] cost.", hooks: {}},
    48: {name: "Plot Twist",                    cost: 3, keep: true,  set: "original", implemented: false, description: "Change one die to any result. Discard when used.", hooks: {}},
    49: {name: "Poison Quills",                 cost: 3, keep: true,  set: "original", implemented: false, description: "When you score [2][2][2] also deal 2 damage.", hooks: {}},
    50: {name: "Poison Spit",                   cost: 4, keep: true,  set: "original", implemented: false, description: "When you deal damage to monsters give them a poison counter. Monsters take 1 damage for each poison counter they have at the end of their turn. You can get rid of a poison counter with a [Heart] (that [Heart] doesn't heal a damage also).", hooks: {}},
    51: {name: "Psychic Probe",                 cost: 3, keep: true,  set: "original", implemented: false, description: "You can reroll a die of each other monster once each turn. If the reroll is [Heart] discard this card.", hooks: {}},
    52: {name: "Rapid Healing",                 cost: 3, keep: true,  set: "original", implemented: false, description: "Spend 2[Snot] at any time to heal 1 damage.", hooks: {}},
    53: {name: "Regeneration",                  cost: 4, keep: true,  set: "original", implemented: false, description: "When you heal, heal 1 extra damage.", hooks: {}},
    54: {name: "Rooting for the Underdog",      cost: 3, keep: true,  set: "original", implemented: false, description: "At the end of a turn when you have the fewest [VP] gain 1 [VP].", hooks: {}},
    55: {name: "Shrink Ray",                    cost: 6, keep: true,  set: "original", implemented: false, description: "When you deal damage to monsters give them a shrink counter. A monster rolls one less die for each shrink counter. You can get rid of a shrink counter with a [Heart] (that [Heart] doesn't heal a damage also).", hooks: {}},
    56: {name: "Skyscraper",                    cost: 6, keep: false, set: "original", implemented: false, description: "+ 4[VP]", hooks: {}},
    57: {name: "Smoke Cloud",                   cost: 4, keep: true,  set: "original", implemented: false, description: "This card starts with 3 charges. Spend a charge for an extra reroll. Discard this card when all charges are spent.", hooks: {}},
    58: {name: "Solar Powered",                 cost: 2, keep: true,  set: "original", implemented: false, description: "At the end of your turn gain 1[Snot] if you have no [Snot].", hooks: {}},
    59: {name: "Spiked Tail",                   cost: 5, keep: true,  set: "original", implemented: false, description: "When you attack deal 1 extra damage.", hooks: {}},
    60: {name: "Stretchy",                      cost: 3, keep: true,  set: "original", implemented: false, description: "You can spend 2[Snot] to change one of your dice to any result.", hooks: {}},
    61: {name: "Tanks",                         cost: 4, keep: false, set: "original", implemented: false, description: "+ 4[VP] and take 3 damage.", hooks: {}},
    62: {name: "Telepath",                      cost: 4, keep: true,  set: "original", implemented: false, description: "Spend 1[Snot] to get 1 extra reroll.", hooks: {}},
    63: {name: "Urbavore",                      cost: 4, keep: true,  set: "original", implemented: false, description: "Gain 1 extra [VP] when beginning the turn in Tokyo. Deal 1 extra damage when dealing any damage from Tokyo.", hooks: {}},
    64: {name: "Vast Storm",                    cost: 6, keep: false, set: "original", implemented: false, description: "+ 2[VP]. All other monsters lose 1[Snot] for every 2[Snot] they have.", hooks: {}},
    65: {
      name: "We're Only Making It Stronger",
      cost: 3,
      keep: true,
      set: "original",
      implemented: true,
      description: "When you lose 2[Heart] or more gain 1[Snot].",
      hooks: {
        'APPLY_DAMAGE': function (game, owning_monster, damage) {
          if (damage >= 2) {
            owning_monster.addSnot(1, "Damage is only making " + owning_monster.getName() + " stronger; +1 snot.");
            game.updateState("monsters__" + owning_monster.getId() + "__snot", owning_monster.getSnot());
            game.sendStateChanges();
          }
          return damage;
        }
      }
    },
    66: {
      name: "Wings",
      cost: 6,
      keep: true,
      set: "original",
      implemented: 'maybe',
      description: "Spend 2[Snot] to negate damage to you for a turn.",
      hooks: {
        'TURN_END_ALL': function (game, turn_monster) {
          // Deactivate Wings
          for (var m in game.monsters) {
            game.monsters[m].wings_active = false;
          }
        },
        'APPLY_DAMAGE': function (game, owning_monster, damage) {
          if (owning_monster.wings_active) {
            game.updateState(false, false, owning_monster.getName() + " uses Wings to avoid all damage.");
            return 0;
          }
          else {
            return damage;
          }
        }
      },
      activate: function(game, activating_monster_id) {
        // Activate Wings
        if (game.monsters[activating_monster_id].getSnot() >= 2) {
          game.monsters[activating_monster_id].addSnot(-2);
          game.updateState('monsters__' + activating_monster_id + "__snot", game.monsters[activating_monster_id].getSnot());
          game.monsters[activating_monster_id].wings_active = true;
          game.updateState(false, false, game.monsters[activating_monster_id].getName() + " deploys Wings.");
          game.updateState("game__monster", false);
          game.sendStateChanges();
        }
      }
    },

    67: {name: "Amusement Park",                cost: 6, keep: false, set: "promo",    implemented: false, description: "+ 4[VP]", hooks: {}},
    68: {name: "Army",                          cost: 2, keep: false, set: "promo",    implemented: false, description: "(+ 1[VP] and suffer one damage) for each card you have.", hooks: {}},
    69: {name: "Cannibalistic",                 cost: 5, keep: true,  set: "promo",    implemented: false, description: "When you do damage gain 1[Heart].", hooks: {}},
    70: {name: "Intimidating Roar",             cost: 3, keep: true,  set: "promo",    implemented: false, description: "The monsters in Tokyo must yield if you damage them.", hooks: {}},
    71: {name: "Monster Sidekick",              cost: 4, keep: true,  set: "promo",    implemented: false, description: "If someone kills you, Go back to 10[Heart] and lose all your [VP]. If either of you or your killer win, or all other players are eliminated then you both win. If your killer is eliminated then you are also. If you are eliminated a second time this card has no effect.", hooks: {}},
    72: {name: "Reflective Hide",               cost: 6, keep: true,  set: "promo",    implemented: false, description: "If you suffer damage the monster that inflicted the damage suffers 1 as well.", hooks: {}},
    73: {name: "Sleep Walker",                  cost: 3, keep: true,  set: "promo",    implemented: false, description: "Spend 3[Snot] to gain 1[VP].", hooks: {}},
    74: {name: "Super Jump",                    cost: 4, keep: true,  set: "promo",    implemented: false, description: "Once each turn you may spend 1[Snot] to negate 1 damage you are receiving.", hooks: {}},
    75: {name: "Throw a Tanker",                cost: 4, keep: true,  set: "promo",    implemented: false, description: "On a turn you deal 3 or more damage gain 2[VP].", hooks: {}},
    76: {name: "Thunder Stomp",                 cost: 3, keep: true,  set: "promo",    implemented: false, description: "If you score 4[VP] in a turn, all players roll one less die until your next turn.", hooks: {}},
    77: {name: "Unstable DNA",                  cost: 3, keep: true,  set: "promo",    implemented: false, description: "If you yield Tokyo you can take any card the recipient has and give him this card.",
         hooks: {}
        }
    }
  };

module.exports = theCards;