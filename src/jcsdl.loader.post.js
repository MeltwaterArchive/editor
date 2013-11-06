/*global JCSDL*/
(function(JCSDL, window, document, undefined) {
    "use strict";

	if (!window.jQuery) {
		var h = document.getElementsByTagName('head'),
			s = document.createElement('script');
		s.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js';
		s.type = 'text/javascript';
		h[0].appendChild(s);
		JCSDL.Loader.timeout(true);
	} else {
		JCSDL.Loader.load();
	}
})(JCSDL, window, document);