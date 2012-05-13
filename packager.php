<?php
require_once 'packager/Packager.php';

$jsSuccess = Packager::js(array(
	'jcsdl/lib/crypto.md5.min.js',
	'jcsdl/lib/jquery.ui.custom.min.js',
	'jcsdl/lib/jquery.touchpunch.js',
	'jcsdl/lib/jquery.tipsy.js',
	'jcsdl/lib/jquery.simulate.js',
	'jcsdl/jcsdl.definition.js',
	'jcsdl/jcsdl.parser.js',
	'jcsdl/jcsdl.gui.templates.js',
	'jcsdl/jcsdl.gui.plugins.js',
	'jcsdl/jcsdl.gui.js'
), 'production/jcsdl/jcsdl.min.js');

$cssSuccess = Packager::css(array(
	'jcsdl/lib/jquery.ui.custom.min.css',
	'jcsdl/lib/jquery.tipsy.css',
	'jcsdl/jcsdl.css'
), 'production/jcsdl/jcsdl.min.css');

$imgSuccess = Packager::copyImg(array(
	'jcsdl/img/elements.png',
	'jcsdl/img/icons-sprite-fields.png',
	'jcsdl/img/icons-sprite-operators.png',
	'jcsdl/img/icons-sprite-other.png',
	'jcsdl/img/icons-sprite-targets.png',
	'jcsdl/img/jquery.tipsy.small.gif',
	'jcsdl/img/maps-marker.png',
	'jcsdl/img/select.png',
	'jcsdl/img/step_background.png'
), 'production/jcsdl/img/');
