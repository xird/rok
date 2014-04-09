#!/usr/bin/php
<?php
/**
 * The first parameter on the command line should be the card id, referring to
 * the id in cards.json.
 */

if (!isset($argv[1])) {
  die("Usage: generate.php CARD_ID\n");
}

if (!file_exists("cards.json")) {
  die("Data file 'cards.json' is missing. Run 'node extract_cards.js > cards.json' to generate the file.\n");
}

$data = json_decode(file_get_contents("cards.json"));

print_r($data);

die();
// TODO: Get data for requested from JSON
// TODO: Name the files with the ids instead of titles
// TODO: Design keep/use label on the cards, add the generation
// TODO: Fix the line height of the description text the hard way

// Generate texts
$title = strtoupper($argv[1]);
$description = strtoupper($argv[2]);
$filename = strtolower(preg_replace('/[^A-Z0-9]/', '', $title));
$cost = $argv[3];


// Make the image from the source image
$cmd = "convert -resize 345x395 source_images/" . $filename . ".png image.png";

exec($cmd);

// Wrap texts.
$large_font_title_max_len = 9;
$large_title_font_size = 150;
$small_title_font_size = 76;
$description_font_size = 50;
$cost_font_size = 96;

$title_font_size = $large_title_font_size;
if (strlen($title) > $large_font_title_max_len) {
  //$title = wordwrap($title, $small_font_title_max_len);
  $title_font_size = $small_title_font_size;
}

//$description = wordwrap($description, $description_max_len);



$fist = "\u270a";
function replace_unicode_escape_sequence($match) {
    return mb_convert_encoding(pack('H*', $match[1]), 'UTF-8', 'UCS-2BE');
}
$fist = preg_replace_callback('/\\\\u([0-9a-f]{4})/i', 'replace_unicode_escape_sequence', $fist);

$energy = "\u26A1";
$energy = preg_replace_callback('/\\\\u([0-9a-f]{4})/i', 'replace_unicode_escape_sequence', $energy);

$health = "\u2764";
$health = preg_replace_callback('/\\\\u([0-9a-f]{4})/i', 'replace_unicode_escape_sequence', $health);

$star = "\u2605";
$star = preg_replace_callback('/\\\\u([0-9a-f]{4})/i', 'replace_unicode_escape_sequence', $star);

$description = str_replace("[STAR]", ' ' . $star, $description);
$description = str_replace("[SNOT]", ' ' . $energy, $description);
$description = str_replace("[HEART]", ' ' . $health, $description);


$description_parameter = '<span font_desc="Crackhouse ' . $description_font_size . '">' . $description . " " . date('H:i:s') . "</span>";
$description_parameter = $description . " " . date('H:i:s');

$cmd = 
  // Base image
  "convert materials/card-bg.png " . 
  // Description text
  ' -interline-spacing 20 ' . 
  //' -density 180 ' . 
  ' -pointsize ' . $description_font_size . ' ' .
  //' -define pango:single-paragraph=false ' .
  ' -font crackhouse ' .
  ' -size 302x342 ' .
  ' -background none pango:' .
  // The description text itself
  escapeshellarg($description_parameter) .
  ' -geometry +433+212 -composite '.
  // Title text
  "-font crackhouse.ttf -pointsize " . $title_font_size . " -size 567x144 -background none caption:" . escapeshellarg($title) . " -geometry +45+40 -composite ".
  // Cost text
  "-font crackhouse.ttf -pointsize " . $cost_font_size . " -size 66x75 -background none caption:" . escapeshellarg($cost) . " -geometry +640+47 -composite ".
  // The image
  " image.png -geometry +40+300 -composite " .
  // The final output file:
  'ready_images/' . $filename . '.jpg';

//print "\n\n".$cmd . "\n\n";
//print escapeshellarg($description);
exec($cmd);

unlink("image.png");

echo "\n\n" . $fist . "\n" . $energy . "\n" . $health . "\n";