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

$card_id = (int)$argv[1];

$card = $data->$card_id;

// TODO: Design keep/use label on the cards, add the generation
// TODO: Fix the line height of the description text the hard way

// Generate texts
$title = strtoupper($card->name);
$description = strtoupper($card->description);
$cost = $card->cost;


// Make the image from the source image
$cmd = "convert -resize 345x395 source_images/" . $card_id . ".png temp_image.png";
//exec($cmd);

// "Corner store" wraps with a limit of 12.
$large_font_title_max_len = 11;
$large_title_font_size = 130;
$small_title_font_size = 76;
$cost_font_size = 96;

$title_font_size = $large_title_font_size;
if (strlen($title) > $large_font_title_max_len) {
  $title_font_size = $small_title_font_size;
}

$description_font_size = 80;
if (strlen($description) > 20) {
  $description_font_size = 70;
}
if (strlen($description) > 40) {
  $description_font_size = 60;
}
// "Acid attack"'s description (69 chars) fits in with "small"
if (strlen($description) > 70) {
  $description_font_size = 50;
}
// "Healing ray" has a description of 144 chars.
if (strlen($description) > 120) {
  $description_font_size = 40;
}
// Monster batteries has 211 chars. :|
if (strlen($description) > 150) {
  $description_font_size = 35;
}

function replace_unicode_escape_sequence($match) {
    return mb_convert_encoding(pack('H*', $match[1]), 'UTF-8', 'UCS-2BE');
}
$fist = "\u270a";
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
$description = str_replace("[ATTACK]", ' ' . $fist, $description);

$debug = 0;

$description_parameter = 
  '<span'.
  ' font_desc="Crackhouse ' . $description_font_size . '"'.
  ' rise="-' . (100 * $description_font_size) . '">' .
  $description; 
if ($debug) {
  $descriprion_parameter .=   date('H:i:s');  
}
$description_parameter .= "</span>";

$title_parameter = '<span font_desc="Crackhouse ' . $title_font_size . '" rise="-' . (100 * $title_font_size) . '">' . $title . '</span>';

$cost_parameter = 
  '<span font_desc="Crackhouse ' . $cost_font_size . '" rise="-' . (100 * $cost_font_size) . '">' .
  $cost .
  '</span>' .
  '<span font_desc="FreeSerif ' . $cost_font_size . '" rise="-' . (100 * $cost_font_size) . '">' .
  $energy .
  '</span>';

$keep_parameter = 
  '<span font_desc="Crackhouse ' . $cost_font_size . '" rise="-' . (100 * $cost_font_size) . '">' .
  ($card->keep ? "      KEEP" : "DISCARD") .
  '</span>';

$cmd = 
  // Base image
  "convert materials/card-bg.png " .
  
  // Title text
  " -font crackhouse.ttf -pointsize " . $title_font_size .
  " -size 696x170 " .
  ($debug ? " -background blue " : " -background none ") .
  " pango:" . escapeshellarg($title_parameter) .
  " -geometry +45+40 -composite ".
  
  // Description text
  // Interline spacing doesn't work with pango as of 2014-04-10:
  // http://www.imagemagick.org/discourse-server/viewtopic.php?f=1&t=25338
  // ' -interline-spacing 20 ' . 
  //' -density 180 ' . 
  //' -pointsize ' . $description_font_size . ' ' .
  //' -define pango:single-paragraph=false ' .
  ' -font crackhouse ' .
  // Description text box size when using an image
  //' -size 302x342 ' .
  // Description text box size when not using an image
  ' -size 696x270 ' .
  ($debug ? " -background red " : " -background none ") .
  // The description text itself
  ' pango:' . escapeshellarg($description_parameter) .
  // Geometry when using an image
  //' -geometry +433+212 '.
  // Geometry when not using an image
  ' -geometry +45+212 '.
  ' -composite '.
  
  // Cost text
  " -size 200x150 " .
  ($debug ? " -background green " : " -background none ") .
  " pango:" . escapeshellarg($cost_parameter) .
  " -geometry +45+440 -composite ".
  
  // Keep/Discard text
  " -size 320x120 " .
  ($debug ? " -background yellow " : " -background none ") .
  " pango:" . escapeshellarg($keep_parameter) .
  " -geometry +420+470 -composite " .
  " -quality 85 " .
  
  // The image, if used
  //" temp_image.png -geometry +40+300 -composite " .
  
  // The final output file:
  'ready_images/' . $card->machine_name . '.jpg';

//print "\n\n".$cmd . "\n\n";

exec($cmd);

//unlink("temp_image.png");
