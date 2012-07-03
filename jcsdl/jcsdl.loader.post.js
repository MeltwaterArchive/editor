(function() {
	if (!window.jQuery) {
		var h = document.getElementsByTagName('head'),
			s = document.createElement('script');
		s.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js';
		s.type = 'text/javascript';
		h[0].appendChild(s);
		JCSDL.Loader.timeout(true);
	} else {
		JCSDL.Loader.load();
	}
})();