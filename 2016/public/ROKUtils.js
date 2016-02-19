/**
 * Utility functions.
 */

function ROKUtils () {

};

/**
 * Function : dump()
 * Arguments: The data - array,hash(associative array),object
 *    The level - OPTIONAL
 * Returns  : The textual representation of the array.
 * This function was inspired by the print_r function of PHP.
 * This will accept some data as the argument and return a
 * text that will be a more readable version of the
 * array/hash/object that is given.
 * Docs: http://www.openjs.com/scripts/others/dump_function_php_print_r.php
 */
ROKUtils.prototype.dump = function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 1;

	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";

	if(typeof(arr) == 'object') { //Array/Hashes/Objects
		for(var item in arr) {
			var value = arr[item];

      // The circular Game reference in Monster causes infinite recursion unless
      // we deal with it.
			if(typeof(value) == 'object' && item != "_game" && item != "iosockets") {
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			}
      else if (typeof(value) == 'function') {
        dumped_text += level_padding + "'" + item + "' FUNCTION" + "\"\n";
      }
      else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	}
	else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}


/**
 *
 */
ROKUtils.prototype.getRandomInt = function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
ROKUtils.prototype.shuffleArray = function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}


/**
 * @return String A random die face.
 */
ROKUtils.prototype.dieRoll = function () {
  var faces = [
    '1',
    '2',
    '3',
    'p',
    'h',
    's'
  ];
  var r = this.getRandomInt(0, 5);
  return faces[r];
}


/**
 *
 */
ROKUtils.prototype.log = function (msg, level) {
  var currentLevel = ROKConfig.log_level;

  if (typeof level == "undefined") {
    level = "debug";
  }

  var levels = ["debug", "notice", "warning", "error"];
  if (levels.indexOf(level) == -1) {
    level = "debug";
  }

  switch (currentLevel) {
    case "debug":
      if (level == "debug") {
        console.log(msg);
      }

    case "notice":
      if (level == "notice") {
        console.log(msg);
      }

    case "warning":
      if (level == "warning") {
        console.log(msg);
      }

    case "error":
      if (level == "error") {
        console.log(msg);
      }

    default:
      break;
  }
}


if (typeof module == "object" && typeof module.exports == "object") {
  module.exports = ROKUtils;
}
