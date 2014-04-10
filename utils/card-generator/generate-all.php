#! /usr/bin/php
<?php

for ($i = 1; $i <= 77; $i++) {
  exec(dirname(__FILE__) . '/generate.php ' . $i);
}