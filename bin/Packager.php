<?php
define('NL', "\n");
define('TAB', "\t");

class Packager
{

	const CONCAT_ONLY = 'concat';
	const CONCAT_MINIFY = 'minify';

	public static function js($files = array(), $destinationFile = null, $level = null) {
		$level = ($level == self::CONCAT_ONLY) ? self::CONCAT_ONLY : self::CONCAT_MINIFY;

		echo 'Packaging JavaScript files...'. NL;

		$content = '';
		$fullSizeOriginal = 0;
		foreach($files as $file) {
			echo TAB . $file . TAB;

			$fileContent = self::readFile($file);
			
			// if only concatenation then add it and proceed to the next file
			if ($level == self::CONCAT_ONLY) {
				$content .= ';'. $fileContent .";\n";
				echo NL;
				continue;
			}
			
			// minify this file
			try {
				$stats = array();
				$minContent = self::compileJs($fileContent, $stats);
			} catch (Exception $e) {
				echo NL .'CLOSURE COMPILER ERROR: '. $e->getMessage() . NL;
				return false;
			}

			$content .= ';'. $minContent . ";\n";

			echo '(min: '. self::bytesToString($stats['compressedSize']) .', gzip: '. self::bytesToString($stats['compressedGzipSize']) .', orig: '. self::bytesToString($stats['originalSize']) .', '. round($stats['compressedSize'] / $stats['originalSize'] * 100) .'%)';
			echo NL;

			$fullSizeOriginal = $fullSizeOriginal + $stats['originalSize'];
		}

		echo 'Writing to '. $destinationFile .' ... ';
		$result = (self::writeToFile($content, $destinationFile)) ? 'success' : 'error!';
		echo $result . NL;

		// if we were only concatenating then stop now
		if ($level == self::CONCAT_ONLY) {
			echo NL;
			return true;
		}

		$fullSizeMinified = strlen($content);
		$contentGzip = gzencode($content);
		$fullSizeGzipped = strlen($contentGzip);
		echo 'Minified size: '. self::bytesToString($fullSizeMinified) .' (gzip: '. self::bytesToString($fullSizeGzipped) .'), Original size: '. self::bytesToString($fullSizeOriginal) .'. ('. round($fullSizeMinified / $fullSizeOriginal * 100) .'%)'. NL;
		echo NL;

		return true;
	}

	public static function css($files = array(), $destinationFile = null) {
		echo 'Packaging CSS files...'. NL;

		$content = '';
		$fullSizeOriginal = 0;
		foreach($files as $file) {
			echo TAB . $file . TAB;

			$fileContent = self::readFile($file);

			$sizeOriginal = strlen($fileContent);
			$fullSizeOriginal = $fullSizeOriginal + $sizeOriginal;

			$fileContent = CSSMin::minify($fileContent);
			$sizeMinified = strlen($fileContent);

			$content .= $fileContent . "\n";

			echo '(min: '. self::bytesToString($sizeMinified) .', full: '. self::bytesToString($sizeOriginal) .', '. round($sizeMinified / $sizeOriginal * 100) .'%)';
			echo NL;
		}

		echo 'Writing to '. $destinationFile .' ... ';
		$result = (self::writeToFile($content, $destinationFile)) ? 'success' : 'error!';
		echo $result . NL;

		$fullSizeMinified = strlen($content);
		$contentGzip = gzencode($content);
		$fullSizeGzipped = strlen($contentGzip);
		echo 'Minified size: '. self::bytesToString($fullSizeMinified) .' (gzip: '. self::bytesToString($fullSizeGzipped) .'), Original size: '. self::bytesToString($fullSizeOriginal) .'. ('. round($fullSizeMinified / $fullSizeOriginal * 100) .'%)'. NL;
		echo NL;

		return true;
	}

	public static function copyImg($files = array(), $destinationDir = null) {
		echo 'Copying image files...'. NL;

		$destinationDir = rtrim($destinationDir, '/'). '/';
		if (!file_exists($destinationDir)) {
			echo 'FAIL! Cannot find destination directory: '. $destinationDir . NL;
			return false;
		}

		foreach($files as $file) {
			echo TAB . $file;
			if (!file_exists($file)) {
				echo ' ... does not exist!' . NL;
				continue;
			}

			$destinationPath = $destinationDir . self::getFileName($file);
			copy($file, $destinationPath);
			echo ' -> '. $destinationPath . NL;
		}

		echo NL;

		return true;
	}

	public static function copy($file, $destination) {
		echo 'Copying '. $file .' ... ';

		$destinationDir = rtrim(dirname($destination), '/'). '/';
		if (!file_exists($destinationDir)) {
			echo 'FAIL! Cannot find destination directory: '. $destinationDir . NL;
			return false;
		}

		if (!file_exists($file)) {
			echo ' but it does not exist!' . NL;
			return false;
		}

		copy($file, $destination);
		echo ' -> '. $destination . NL;

		echo NL;

		return true;
	}

	/*
	 * HELPERS
	 */
	public static function compileJs($js, &$stats = array()) {
		// call Closure Compiler using cURL
		$ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'http://closure-compiler.appspot.com/compile');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		    'Content-type: application/x-www-form-urlencoded'
		));
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, implode('&', array(
			'js_code='. urlencode($js),
			'compilation_level=SIMPLE_OPTIMIZATIONS',
			'output_format=json',
			'output_info=compiled_code',
			'output_info=warnings',
			'output_info=errors',
			'output_info=statistics',
			'warning_level=default'
		)));

		$response = curl_exec($ch);
        $info = curl_getinfo($ch);
        curl_close($ch);

        $json = json_decode($response, true);

        if (is_null($json)) {
        	throw new Exception($response);
        }

        if (isset($json['serverErrors'])) {
        	throw new Exception('('. $json['serverErrors'][0]['code'] .') '. $json['serverErrors'][0]['error']);
        }

        // assign stats to stats variable (sent by reference)
        $stats = $json['statistics'];

        return $json['compiledCode'];
	}

	/**
	 * Reads the given file and returns it's contents.
	 * @return string
	 * @param string $filePath Path to the file you want to read.
	 */
	private static function readFile($filePath) {
		$content = '';
		if (file_exists($filePath)) {
			$content = file_get_contents($filePath);
		}
		return $content;
	}

	/**
	 * Writes the given content to the given file. Attempts to recursively create directories.
	 * @param string $content Content to be written in the file.
	 * @param string $filePath Path to the file to be written.
	 */
	private static function writeToFile($content, $filePath) {
		$dirPath = dirname($filePath);
		if (!is_dir($dirPath)) {
			mkdir($dirPath, 0777, true);
		}
		
		if (file_put_contents($filePath, $content) === false) {
			return false;
		}

		return true;
	}

	private static function getFileName($filePath) {
		$filePath = explode('/', $filePath);
		return $filePath[count($filePath) - 1];
	}

	/**
	 * Changes the givne bytes to a user friendly string.
	 * @return string
	 * @param int $bytes
	 */
	private static function bytesToString($bytes, $decimal = 2) {
		$bytes = intval($bytes);
		if ($bytes < 1024) {
			return $bytes .' b';
		}

		$kb = $bytes / 1024;
		if ($kb <= 1024) return number_format($kb, $decimal) .' kb';

		$mb = $kb / 1024;
		if ($mb <= 1024) return number_format($mb, $decimal) .' MB';

		$gb = $mb / 1024;
		return number_format($gb, $decimal) .' GB';
	}

}








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