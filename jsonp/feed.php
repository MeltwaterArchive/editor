<?php

$file = isset($_GET['operator']) ? $_GET['operator'] : 'contains_near';
$file = file_exists($file .'.html') ? $file : 'contains_near';

header("Content-Type: application/javascript; charset=UTF-8");
?>jcsdlJSONP({"html":"<H2>Contains Near<\/h2>\n\n<H3>Purpose:<\/H3>\n\n<p>To filter for two or more words that occur near to each other.<\/p>\n\n<h3>Type:<\/h3>\n\n<p>The <code class=\"inline\" style=\"font-family: monospace;\">contains_near<\/code> operator takes a comma-separated list of string arguments.&nbsp;Note that the strings cannot contains spaces.<\/p>\n\n<p>It also includes the span, an integer that specifies how far apart the strings can be. For instance, if span is set to 25, all the strings must appear within any 25 consecutive words in the input object.<\/p>\n\n<p>For&nbsp;<code class=\"inline\" style=\"font-family: monospace;\">contains_near<\/code>&nbsp;to succeed, it must find all of the strings within the input object. They can appear in any order.<\/p>\n\n<h3>Case Sensitivity:<\/h3>\n\n<p>Not case sensitive. Add the cs keyword to create a case-sensitive filter with contains_near.<\/p>\n\n<h3>Syntax:<\/h3>\n\n<p><code class=\"inline\" style=\"font-family: monospace;\">contains_near (string, string, .... string:span)<\/code><\/p>\n\n<h3>Synonyns:<\/h3>\n\nnear\n\n<h3>Examples:<\/h3>\n\n<p>1. Filter for posts that mention your product by implication, without actually naming it.<\/p>\n\n<script src=\"http:\/\/widget.datasift.com\/embed.js?stream=11086&amp;width=500\" type=\"text\/javascript\">\n\n<\/script>\n\n<p>The stream will match this target text:<\/p>\n\n<p>&nbsp; &nbsp; &quot;Microsoft makes my favorite spreadsheet.&quot;<\/p>\n\n<p>but not this one:<\/p>\n\n<p>&nbsp; &nbsp; &quot;Microsoft makes my favorite desktop spreadsheet.&quot;<\/p>\n\n<p>Note that we&#39;re using the synonym, <code class=\"inline\" style=\"font-family: monospace;\">near<\/code>.<\/p>\n\n<p>2. Filter for posts that mention a company and product. This is useful for names that are common.<\/p>\n\n<script src=\"http:\/\/widget.datasift.com\/embed.js?stream=11087&amp;width=500\" type=\"text\/javascript\">\n\n<\/script>\n\n<p>3. Filter for posts that mention a set of words.<\/p>\n\n<script src=\"http:\/\/widget.datasift.com\/embed.js?stream=11088&amp;width=500\" type=\"text\/javascript\">\n\n<\/script>\n\n<p>4. Filter for posts that refer to a major event even if they do not name it.<\/p>\n\n<script src=\"http:\/\/widget.datasift.com\/embed.js?stream=11089&amp;width=500\" type=\"text\/javascript\">\n\n<\/script>\n\n<p>This stream would find references to the 2010 World Series games between the Texas Rangers and the San Francisco Giants that a simpler stream might discard:<\/p>\n\n<p><code class=\"inline\" style=\"font-family: monospace;\">&nbsp;&nbsp;&nbsp;interaction.content contains &quot;2010 World Series&quot;<\/code><\/p>\n\n<h3>Notes:<\/h3>\n\n<p>The span includes the words you are looking for. It is not the gap between them.<\/p>"});<?php
/*
echo 'jcsdlJSONP(' . json_encode(array(
	'html' => file_get_contents($file .'.html')
)) . ');'; */