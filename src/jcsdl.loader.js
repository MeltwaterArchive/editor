window.JCSDLTargets = {}; // register namespace

(function(window, undefined) {

	JCSDLTargets.Loader = {
		// array list of functions to be called when loading
		compnts : [],
		// array list of functions to be called when finished loadign
		loaded : [],

		isLoaded : false,

		addComponent : function(f) {
			if (typeof f == 'function') {
				JCSDLTargets.Loader.compnts.push(f);
			}
		},
		addLoaded : function(f) {
			if (typeof f == 'function') {
				JCSDLTargets.Loader.loaded.push(f);
			}
		},

		load : function() {
			var $ = window.jQuery;

			$.each(JCSDLTargets.Loader.compnts, function() {
				this.apply(JCSDLTargets, [$]);
			});
			
			$.each(JCSDLTargets.Loader.loaded, function() {
				this.apply(JCSDLTargets, []);
			});

			JCSDLTargets.Loader.isLoaded = true;
		},

		timeout : function(nc) {
			setTimeout(function() {
				if (window.jQuery) {
					if (nc) window.jQuery.noConflict();

					JCSDLTargets.Loader.load();
				} else {
					JCSDLTargets.Loader.timeout();
				}
			}, 100);
		}
	};

	JCSDLTargets.onLoad = function(f) {
		if (typeof f !== 'function') return false;

		// if editor already loaded then call immediately
		if (JCSDLTargets.Loader.isLoaded) {
			f.apply(JCSDLTargets, []);

		// but normally add to queue
		} else {
			JCSDLTargets.Loader.addLoaded(f);
		}
	};

})(window);