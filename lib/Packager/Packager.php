<?php
require_once 'JSMin.php';
require_once 'CSSMin.php';

define('NL', "\n");
define('TAB', "\t");

class Packager
{

	public static function js($files = array(), $destinationFile = null) {
		echo 'Packaging JavaScript files...'. NL;

		$content = '';
		$fullSizeOriginal = 0;
		foreach($files as $file) {
			echo TAB . $file . TAB;

			$fileContent = self::readFile($file);

			$sizeOriginal = strlen($fileContent);
			$fullSizeOriginal = $fullSizeOriginal + $sizeOriginal;

			$fileContent = JSMin::minify($fileContent);
			$sizeMinified = strlen($fileContent);

			$content .= $fileContent . "\n";

			echo '(min: '. $sizeMinified .' b, full: '. $sizeOriginal .' b, '. round($sizeMinified / $sizeOriginal * 100) .'%)';
			echo NL;
		}

		echo 'Writing to '. $destinationFile .' ... ';
		$result = (self::writeToFile($content, $destinationFile)) ? 'success' : 'error!';
		echo $result . NL;
		$minSizeOriginal = strlen($content);
		echo 'Minified size: '. $minSizeOriginal .' bytes, Original size: '. $fullSizeOriginal .' bytes. ('. round($minSizeOriginal / $fullSizeOriginal * 100) .'%)'. NL;
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

			echo '(min: '. $sizeMinified .' b, full: '. $sizeOriginal .' b, '. round($sizeMinified / $sizeOriginal * 100) .'%)';
			echo NL;
		}

		echo 'Writing to '. $destinationFile .' ... ';
		$result = (self::writeToFile($content, $destinationFile)) ? 'success' : 'error!';
		echo $result . NL;
		$minSizeOriginal = strlen($content);
		echo 'Minified size: '. $minSizeOriginal .' bytes, Original size: '. $fullSizeOriginal .' bytes. ('. round($minSizeOriginal / $fullSizeOriginal * 100) .'%)'. NL;
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

}