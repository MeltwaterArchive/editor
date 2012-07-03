JCSDL = {}; // register namespace

(function() {

	JCSDL.Loader = {
		// array list of functions to be called when loading
		compnts : [],
		// array list of functions to be called when finished loadign
		loaded : [],

		isLoaded : false,

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

			JCSDL.Loader.isLoaded = true;
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
		if (typeof(f) !== 'function') return false;

		// if editor already loaded then call immediately
		if (JCSDL.Loader.isLoaded) {
			f.apply(JCSDL, []);

		// but normally add to queue
		} else {
			JCSDL.Loader.addLoaded(f);
		}
	};

})();