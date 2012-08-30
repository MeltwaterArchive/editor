<?php
require_once 'bin/Packager/Packager.php';

$jsSuccess = Packager::js(array(
	'src/jcsdl.loader.js',
	'src/lib/crypto.md5.min.js',
	'src/lib/jquery.ui.custom.min.js',
	'src/lib/jquery.touchpunch.js',
	'src/lib/jquery.tipsy.js',
	'src/lib/jquery.simulate.js',
	'src/jcsdl.parser.js',
	'src/jcsdl.gui.templates.js',
	'src/jcsdl.gui.inputs.js',
	'src/jcsdl.gui.plugins.js',
	'src/jcsdl.gui.js',
	'src/jcsdl.loader.post.js'
), 'minified/jcsdl.min.js');

$copySuccess = Packager::copy('src/jcsdl.definition.js', 'minified/jcsdl.definition.js');

$cssSuccess = Packager::css(array(
	'src/lib/jquery.ui.custom.min.css',
	'src/lib/jquery.tipsy.css',
	'src/jcsdl.css'
), 'minified/jcsdl.min.css');

$imgSuccess = Packager::copyImg(array(
	'src/img/elements.png',
	'src/img/icons-sprite-fields.png',
	'src/img/icons-sprite-operators.png',
	'src/img/icons-sprite-other.png',
	'src/img/icons-sprite-targets.png',
	'src/img/jquery.tipsy.small.gif',
	'src/img/loader.gif',
	'src/img/maps-marker.png',
	'src/img/select.png',
	'src/img/step_background.png'
), 'minified/img/');
