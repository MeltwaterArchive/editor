DataSift Visual Query Editor - Targets Only version
======

DataSift Visual Query Editor is a visual editor for the CSDL.

The __Targets Only__ version is a marketing version that only displays target selector.

More details here: http://dev.datasift.com/editor

Installation
======

This version of the editor is not available on Bower.

You have you download contents of the ```minified/``` folder and embed them on your page.

Usage
======

#### index.html
    <html>
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	    <link rel="stylesheet" type="text/css" href="../minified/jcsdl.min.css" />
	    <script type="text/javascript" src="../minified/jcsdl.definition.js"></script>
	    <script type="text/javascript" src="../minified/jcsdl.min.js"></script>
	    <script type="text/javascript" src="index.js"></script>
	</html>

    <body>
        <div id="editor"></div>
    </body>
    </html>

#### index.js

	// returns editor instance
    var editor = new JCSDLTargets.GUI('#editor', {
    	// options
    });

Or as jQuery plugin:

	// returns jQuery object (for chaining)
    $("#editor").jcsdlTargetsGui({
    	// options
    });

Options
======

You can pass an object literal as the 2nd argument of the constructor (or 1st argument when using the editor as jQuery-plugin).

    {
    	hideTargets : ['facebook'], // array of targets to hide
        showTargets : ['twitter'], // array of targets to show - only those will be shown, overrides hideTargets option

    	// event hooks - functions called on various events happening in the editor
    	// 'this' always refers to the editor instance
        targetSelect : function(target) {},

    }

