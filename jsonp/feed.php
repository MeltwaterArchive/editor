<?php

$file = isset($_GET['operator']) ? $_GET['operator'] : 'contains_near';
$file = file_exists($file .'.html') ? $file : 'contains_near';

header("Content-Type: application/javascript; charset=UTF-8");

echo 'jcsdlJSONP(' . json_encode(array(
	'html' => file_get_contents($file .'.html')
)) . ');';