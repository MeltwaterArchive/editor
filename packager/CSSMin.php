<?php

class CSSMin
{

	public static function minify($content) {
		// work with comments (most will be replaced but some will stay)
		$comments = array();
		while (($startIndex = stripos($content, '/*')) !== false) {
			$endIndex = stripos($content, '*/', $startIndex + 2) + 2;
			$comment = substr($content, $startIndex, $endIndex - $startIndex);
			$comment = trim($comment, '/* '. TAB . NL); // remove any unneccesary chars
			
			$content = substr($content, 0, $startIndex) .'__CSS_MINIFIER_PLACEHOLDER_'. count($comments) .'__'. substr($content, $endIndex);
			
			$comments[] = $comment;
		}
		
		// parse the found comments and determine should they stay or should they go ;)
		foreach($comments as $i => $comment) {
			$placeholder = '__CSS_MINIFIER_PLACEHOLDER_'. $i .'__';
			
			// starting with '!' means it probably should stay (according to YUICompressor that might be copyright statement etc)
			if (substr($comment, 0, 1) == '!') {
				$content = str_replace($placeholder, '/*'. $comment .'*/', $content);
				continue;
			}
			
			// mac/ie5/opera hack
			if (substr($comment, -1) == '\\') {
				$content = str_replace($placeholder, '/*\*/', $content);
				continue;
			}
			
			// empty comment after child selection (ie7 hack) (e.g. html >/**/ body)
			if (strlen($comment) === 0) {
				$startIndex = stripos($content, $placeholder);
				if ($startIndex !== false) {
					if (substr($content, $startIndex - 1, 1) == '>') {
						$content = str_replace($placeholder, '/**/', $content);
						continue;
					}
				}
			}
			
			// if not escaped before, remove the comment totally
			$content = str_replace($placeholder, '', $content);
		}
		// k, comments done, let's do some more stuff
		
		// all whitespace to single spaces
		$content = preg_replace('/\s\s+/', ' ', $content); // doesn't seem to work lol :D
		
		// remove tabs and new lines and multiple spaces
		$content = str_replace(NL, ' ', $content);
		$content = str_replace(TAB, ' ', $content);
		$content = str_replace('    ', ' ', $content);
		$content = str_replace('   ', ' ', $content);
		$content = str_replace('  ', ' ', $content);
		
		// remove spaces where they are unnecessary
		$content = str_replace(' {', '{', $content);
		$content = str_replace('{ ', '{', $content);
		$content = str_replace(' }', '}', $content);
		$content = str_replace('; ', ';', $content);
		$content = str_replace(': ', ':', $content);
		
		// remove other chars where they are unnecessary
		$content = str_replace(';}', '}', $content);
		
		// replace 0px/0em/0in/etc with just 0
		$content = preg_replace('/([\s:])(0)(px|em|%|in|cm|mm|pc|pt|ex)/i', '$1$2', $content);
		
		// replace '0 0 0 0' and '0 0 0' with just 0
		// leave out '0 0' for background-position and some others
		$content = str_replace(':0 0 0 0;', ':0;', $content);
		$content = str_replace(':0 0 0;', ':0;', $content);
		$content = str_replace(':0 0 0 0}', ':0}', $content);
		$content = str_replace(':0 0 0}', ':0}', $content);
		
		// 0.6 to .6, but only when preceded by : or a white-space
		$content = preg_replace('/(:|\s)0+\.(\d+)/', '$1.$2', $content);
    	
		// border: none -> border:0
		$content = preg_replace('/(border|border-top|border-right|border-bottom|border-right|outline|background):none/i', '$1:0', $content);
		
		// remove any spaces from the beginning or the end of the css file
		$content = trim($content);
		return $content;
	}

}