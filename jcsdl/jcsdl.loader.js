JCSDL = {}; // register namespace

(function() {

	JCSDL.Loader = {
		// array list of functions to be called when loading
		compnts : [],
		// array list of functions to be called when finished loadign
		loaded : [],

		addComponent : function(f) {
			if (typeof(f) == 'function') {
				JCSDL.Loader.compnts.push(f);
			}
		},
		addLoaded : function(f) {
			if (typeof(f) == 'function') {
				JCSDL.Loader.loaded.push(f);
			}
		},

		load : function() {
			for (var i in JCSDL.Loader.compnts) {
				JCSDL.Loader.compnts[i].apply(JCSDL, [window.jQuery]);
			}

			for (var i in JCSDL.Loader.loaded) {
				JCSDL.Loader.loaded[i].apply(JCSDL, []);
			}
		},

		timeout : function(nc) {
			setTimeout(function() {
				if (window.jQuery) {
					if (nc) window.jQuery.noConflict();

					JCSDL.Loader.load();
				} else {
					JCSDL.Loader.timeout();
				}
			}, 100);
		}
	};

	JCSDL.onLoad = function(f) {
		JCSDL.Loader.addLoaded(f);
	};

	if (!window.jQuery) {
		var h = document.getElementsByTagName('head'),
			s = document.createElement('script');
		s.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js';
		s.type = 'text/javascript';
		h[0].appendChild(s);
		JCSDL.Loader.timeout(true);
	} else {
		JCSDL.Loader.timeout();
	}

})();