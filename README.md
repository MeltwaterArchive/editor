DataSift Query Editor
======

DataSift Query Editor is a visual editor for the CSDL.

Usage
======

#### index.html
    ...
    <html>
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
	    <link rel="stylesheet" type="text/css" href="../minified/jcsdl.min.css" />
	    <script type="text/javascript" src="../minified/jcsdl.definition.js"></script>
	    <script type="text/javascript" src="../minified/jcsdl.min.js"></script>
	</html>

    <body>
        <div id="editor"></div>
    </body>
    </html>

#### index.js

    var editor = new JCSDL.GUI('#editor', {
    	// options
    });
    var code = ''; // read code from somewhere
    editor.loadJCSDL(code);

Or as jQuery plugin:

    $("#editor").jcsdlGui({
    	// options
    });
    var code = ''; // read code from somewhere
    $("#editor").jcsdlGui('loadJCSDL', code);

Development
======

To "build" (minify JS, CSS, copy appropriate files) just do the following in shell:

	$ php minify.php

This will minify all required JavaScripts and styles from `/src/` and put it into `/minified/`.