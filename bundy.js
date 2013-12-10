var bundy = require('bundy');

bundy.js([
    'src/jcsdl.loader.js',
    'src/lib/crypto.md5.min.js',
    'src/lib/jquery.appendix.js',
    'src/lib/jquery.csv.js',
    'src/lib/jquery.ui.custom.min.js',
    'src/lib/jquery.html5sortable.js',
    'src/lib/jquery.touchpunch.js',
    'src/lib/jquery.tipsy.js',
    'src/lib/jquery.simulate.js',
    'src/lib/ZeroClipboard.js',
    'src/jcsdl.parser.js',
    'src/jcsdl.gui.templates.js',
    'src/jcsdl.gui.inputs.js',
    'src/jcsdl.gui.plugins.js',
    'src/jcsdl.gui.listeditor.js',
    'src/jcsdl.gui.filtereditor.js',
    'src/jcsdl.gui.logic.js',
    'src/jcsdl.gui.js',
    'src/jcsdl.loader.post.js'
], 'minified/jcsdl.min.js');

bundy.copy('src/jcsdl.definition.js', 'minified/jcsdl.definition.js');

bundy.css([
    'src/lib/jquery.ui.custom.min.css',
    'src/lib/jquery.tipsy.css',
    'src/jcsdl.css'
], 'minified/jcsdl.min.css');

bundy.copy([
    'src/img/elements.png',
    'src/img/elements@2x.png',
    'src/img/icons-sprite-fields-dbw.png',
    'src/img/icons-sprite-fields-dbw@2x.png',
    'src/img/icons-sprite-fields-fbpages.png',
    'src/img/icons-sprite-fields-fbpages@2x.png',
    'src/img/icons-sprite-fields-googleplus.png',
    'src/img/icons-sprite-fields-googleplus@2x.png',
    'src/img/icons-sprite-fields-instagram.png',
    'src/img/icons-sprite-fields-instagram@2x.png',
    'src/img/icons-sprite-fields-intensedebate-wordpress.png',
    'src/img/icons-sprite-fields-intensedebate-wordpress@2x.png',
    'src/img/icons-sprite-fields-lon.png',
    'src/img/icons-sprite-fields-lon@2x.png',
    'src/img/icons-sprite-fields-tumblr.png',
    'src/img/icons-sprite-fields-tumblr@2x.png',
    'src/img/icons-sprite-fields-yammer.png',
    'src/img/icons-sprite-fields-yammer@2x.png',
    'src/img/icons-sprite-fields.png',
    'src/img/icons-sprite-fields@2x.png',
    'src/img/icons-sprite-operators.png',
    'src/img/icons-sprite-operators@2x.png',
    'src/img/icons-sprite-other.png',
    'src/img/icons-sprite-other@2x.png',
    'src/img/icons-sprite-targets.png',
    'src/img/icons-sprite-targets@2x.png',
    'src/img/jquery.tipsy.small.gif',
    'src/img/list-icons.png',
    'src/img/loader.gif',
    'src/img/maps-marker.png',
    'src/img/select.png',
    'src/img/select@2x.png',
    'src/img/step_background.png'
], 'minified/img/');

bundy.copy('src/swf/ZeroClipboard.swf', 'minified/swf/ZeroClipboard.swf');

bundy.build();
