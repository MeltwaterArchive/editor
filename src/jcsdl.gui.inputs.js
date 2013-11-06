JCSDL.Loader.addComponent(function($, undefined) {

	/**
	 * Class that holds methods for various input types.
	 * 
	 * @param {JCSDL.GUI} gui GUI instance to which this filter editor belongs.
	 */
	this.GUIInputs = function(gui) {
		this.gui = gui;
		this.definition = gui.definition;
		this.getTemplate = gui.getTemplate;
	};

	this.GUIInputs.prototype = {

		/**
		 * Execute the given method for value input type in the context of JCSDL.GUIInputs object.
		 * 
		 * @param  {String} t Value input type.
		 * @param  {Method} m Method to be called.
		 * @param  {Array} a Array of arguments.
		 * @return {mixed}
		 */
		exec : function(t, m, a) {
			return this[t][m].apply(this, a);
		},

		/*
		 * TEXT FIELD
		 */
		text : {
			init : function(info) {
				var $view = this.getTemplate('valueInput_text'),
					$input = $view.find('input.orig');

				$input.jcsdlListEditor();
				$input.jcsdlRegExTester();

				$view.find('input.dist').jcsdlNumberMask();

				return $view;
			},

			setValue : function($view, info, val, operator) {
				if (operator == 'contains_near') {
					val = val.split(':');

					var dist = parseInt(val.pop());
					$view.find('input.dist').val(dist);

					val = val.join(':').replace(/\\:/g, ':');
				}

				$view.find('input.orig').val(val);
			},

			getValue : function($view, info, operator) {
				var val = $view.find('input.orig').val();

				if (operator == 'contains_near') {
					val = val.replace(/:/g, '\\:') + ':' + parseInt($view.find('input.dist').val());
				}

				return val;
			},

			displayValue : function(info, val, filter) {
				if (filter.operator == 'contains_near') {
					val = val.split(':');
					var dist = parseInt(val.pop());
					val = val.join(':').truncate(50, '...', true).escapeHtml();

					return val + ' : ' + dist;
				}

				return val.truncate(50, '...', true).escapeHtml();
			}
		},

		/*
		 * NUMBER FIELD
		 */
		number : {
			init : function(info) {
				var $view = this.getTemplate('valueInput_number'),
					fl = (info.type == 'float'),
					arr = ($.inArray('in', info.operators) >= 0),
					$input = $view.find('input[type=text]');

				$input.jcsdlNumberMask(fl);

				if (arr) {
					$input.jcsdlTagInput({
						numbers : true,
						floats : fl
					});
				}

				return $view;
			},

			setValue : function($view, info, val, operator) {
				$view.find('input[type=text]:first').val(val);
			},

			getValue : function($view, info, operator) {
				return $view.find('input[type=text]:first').val();
			},

			displayValue : function(info, val, filter) {
				if (filter.operator !== 'in') return val;

				var fl = (info.type == 'float');
				val = val.split(',');

				var show = val.slice(0, 3);
				$.each(show, function(i, v) {
					show[i] = (fl) ? parseFloat(v).format(2) : v;
				});

				var more = (show.length < val.length) ? ' and ' + (val.length - show.length) + ' more...' : '';
				return show.join(', ') + more;
			}
		},

		/*
		 * SELECT FIELD
		 */
		select : {
			init : function(info) {
				var self = this,
					$view = this.getTemplate('valueInput_select'),
					// decide from where to get the options
					opts = this.exec('select', 'getOptionsSet', [info]);

				// render the options
				$.each(opts, function(val, lbl) {
					self.exec('select', 'createOptionView', [val, lbl])
						.appendTo($view);
				});

				/**
				 * Turn on/off the clicked option.
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-input-select-option').bind('click touchstart', function(ev) {
					ev.preventDefault();
					ev.target.blur();

					if (info.single) {
						$view.find('.jcsdl-input-select-option').removeClass('selected');
					}
					$(this).toggleClass('selected');
				});

				return $view;
			},

			setValue : function($view, info, val, operator) {
				var vals = val.split(',');
				$.each(vals, function(i, v) {
					$view.find('.jcsdl-input-select-option.option-' + v).addClass('selected');
				});
			},

			getValue : function($view, info, operator) {
				var vals = [];
				$view.find('.jcsdl-input-select-option.selected').each(function(i, o) {
					vals.push($(o).data('value'));
				});

				return vals.join(',');
			},

			displayValue : function(info, val, filter) {
				var self = this,
					vals = val.split(','),
					$view = this.getTemplate('valueInput_select');

				// return nothing if empty
				if (vals.length == 0) return $view;

				var opts = this.exec('select', 'getOptionsSet', [info]);

				// only show maximum of 5 selected options
				var show = vals.slice(0, 5);
				$.each(show, function(i, v) {
					if (opts[v] === undefined) return true;

					self.exec('select', 'createOptionView', [v, opts[v]])
						.addClass('selected')
						.appendTo($view);
				});

				// show more indicator if there are more left
				if (vals.length > show.length) {
					var $ind = this.getTemplate('valueInput_select_more');
					$ind.find('.count').html(vals.length - show.length);
					$ind.appendTo($view);
				}

				/**
				 * Turn off clicking of the options.
				 * 
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-input-select-option').bind('click touchstart', function(ev) {
					ev.preventDefault();
					ev.target.blur();
				});

				return $view;
			},

			getOptionsSet : function(info) {
				var opts = {};
				if (info.options !== undefined) {
					opts = info.options;
				} else if ((info.optionsSet !== undefined) && (this.definition.inputs.select.sets[info.optionsSet] !== undefined)) {
					opts = this.definition.inputs.select.sets[info.optionsSet];
				}
				return opts;
			},

			createOptionView : function(val, lbl) {
				var $v = this.getTemplate('valueInput_select_option')
					.data('value', val)
					.addClass('option-' + val)
					.attr('title', lbl);
				$v.find('span').html(lbl);

				return $v;
			}
		},

		/*
		 * SLIDER
		 */
		slider : {
			init : function(info) {
				var self = this,
					$view = this.getTemplate('valueInput_slider'),
					opts = this.exec('slider', 'getOptions', [info]),

					// init slider
					$slider = $view.find('.jcsdl-slider').slider({
						animate : true,
						min : opts.min,
						max : opts.max,
						step : opts.step,
						value : opts['default'],
						slide : function(ev, ui) {
							$view.find('.jcsdl-slider-input').val(self.exec('slider', 'parseValue', [info, ui.value]));
						}
					});

				// set the default value
				this.exec('slider', 'setValue', [$view, info, opts['default']]);

				// display the min and max labels
				$view.find('.jcsdl-slider-label.min').html(this.exec('slider', 'displayValue', [info, opts.min]));
				$view.find('.jcsdl-slider-label.max').html(this.exec('slider', 'displayValue', [info, opts.max]));

				/**
				 * Mask the input as a number field and update the slider when the value was changed in the input.
				 * 
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-slider-input').jcsdlNumberMask((info.type == 'float')).keyup(function(ev) {
					// don't do anything if a dot has been entered
					if (ev.which == 110 || ev.which == 190) return;

					var v = $(this).val();
					self.exec('slider', 'setValue', [$view, info, parseFloat((v) ? v : 0)]);
				});

				/**
				 * Changes the value of the slider by incrementing or decrementing.
				 * 
				 * @param  {jQuery} $view     Full slider input view.
				 * @param  {Object} info
				 * @param  {Number} step      
				 * @param  {Boolean} minus 
				 */
				var changeValue = function($view, info, step, minus) {
					var val = parseFloat($view.find('.jcsdl-slider-input').val());
					val = (minus) ? val - step : val + step;
					self.exec('slider', 'setValue', [$view, info, val]);
				}

				// helper var for the listener below
				var interval = null;

				/**
				 * Make the plus and minus signs clickable. They should change the slider value.
				 * Using mousedown and mouseup events so the mouse button can be hold to change the value.
				 * 
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-slider-minus, .jcsdl-slider-plus').bind('mousedown touchstart', function(ev) {
					var min = $(this).is('.jcsdl-slider-minus');
					interval = setInterval(function() {
						changeValue($view, info, opts.step, min);
					}, 50);

				// mouse up will remove the interval (also mouseout)
				}).bind('mouseup mouseout touchend', function(ev) {
					clearInterval(interval);

				// and prevent default behavior on click()
				}).click(function(ev) {
					ev.preventDefault();
					ev.target.blur();
				});

				return $view;
			},

			setValue : function($view, info, val, operator) {
				var opts = this.exec('slider', 'getOptions', [info]);

				val = (val > opts.max)
					? opts.max
					: ((val < opts.min) 
						? opts.min
						: val);

				$view.find('.jcsdl-slider').slider('value', val);
				$view.find('.jcsdl-slider-input').val(val);
			},

			getValue : function($view, info, operator) {
				return this.exec('slider', 'parseValue', [info, $view.find('.jcsdl-slider-input').val()]);
			},

			displayValue : function(info, val, filter) {
				var opts = this.exec('slider', 'getOptions', [info]);
				return opts.displayFormat.apply(opts, [val.toString()]);
			},

			parseValue : function(info, val) {
				return val;
			},

			getOptions : function(info) {
				return $.extend({}, this.definition.inputs.slider, {
					min : info.min,
					max : info.max,
					step : info.step,
					'default' : info['default'],
					displayFormat : info.displayFormat
				});
			}
		},

		/*
		 * GEO HELPERS
		 */
		_geo : {
			mapOptions : {},

			initSearch : function($view) {
				var map = $view.data('map'),
					$ac = $view.find('.jcsdl-map-search'),
					ac = new google.maps.places.Autocomplete($ac[0], {});

				/**
				 * Move the map viewport to the found location.
				 * @listener
				 */
				google.maps.event.addListener(ac, 'place_changed', function() {
					var place = ac.getPlace();

					if (place.geometry === undefined) {
						// choose the first visible suggestion (if any)
						if ($('.pac-container .pac-item').length > 0) {
							$ac.trigger('focus');
							$ac.simulate('keydown', {keyCode:40}); // down arrow
							$ac.simulate('keydown', {keyCode:13}); // enter
						}
						return;
					}

					if (place.geometry.viewport) {
						map.fitBounds(place.geometry.viewport);
					} else {
						map.setCenter(place.geometry.location);
						map.setZoom(17);
					}
				});
			},

			isNorth : function(c1, c2) {
				return (c1.lat() >= c2.lat());
			},

			isEast : function(c1, c2) {
				return (c1.lng() >= c2.lng());
			}
		},

		/*
		 * GEO BOX
		 */
		geo_box : {
			init : function(info) {
				var $view = this.getTemplate('valueInput_geobox');
				$view.append(this.getTemplate('valueInput_geo_map'));

				$view.find('.jcsdl-map-coordinates').html(this.getTemplate('valueInput_geobox_coordinates'));
				$view.find('.jcsdl-map-instructions').html(this.definition.inputs.geo_box.instructions[0]);

				loadGoogleMapsApi(this.gui, this.exec, ['geo_box', 'load', [info, $view]]);

				return $view;
			},

			load : function(info, $view) {
				var self = this,
					// initialize the map
					map = new google.maps.Map($view.find('.jcsdl-map-canvas')[0], jcsdlMapsOptions);
				
				$view.data('map', map);

				// initialize the rectangle that we're gonna draw
				var rect = new google.maps.Rectangle($.extend({}, this.gui.config.mapsOverlay, {}));
				$view.data('rect', rect);

				// store rectangle coordinates in an array
				var coords = [];

				// create corresponding markers
				var mOpt = {
					position : new google.maps.LatLng(0, 0),
					draggable : true,
					icon : this.gui.config.mapsMarker
				};

				var markers = [
					new google.maps.Marker(mOpt),
					new google.maps.Marker(mOpt)
				];
				$view.data('markers', markers);

				// initialize places autocomplete search
				this._geo.initSearch($view);

				/**
				 * Listen for clicks on the map and adjust the rectangle to it.
				 * 
				 * @param  {Event} ev Google Maps Event.
				 * @listener
				 */
				google.maps.event.addListener(map, 'click', function(ev) {
					if (coords.length >= 2) coords.pop();

					coords.push(ev.latLng);

					// drop a corresponding marker
					var m = coords.length - 1;
					markers[m].setPosition(ev.latLng);
					if (!$view.data('bothMarkersVisible')) markers[m].setAnimation(google.maps.Animation.DROP);
					markers[m].setMap(map);

					if (coords.length == 2) {
						self.exec('geo_box', 'drawRectangle', [map, rect, coords]);
						$view.data('bothMarkersVisible', true);
					}

					$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_box.instructions[coords.length]);
					$view.find('.jcsdl-clear-map').fadeIn();
				});

				/**
				 * When a marker is dragged to a different position then redraw the rectangle.
				 * 
				 * @listener
				 */
				google.maps.event.addListener(markers[0], 'position_changed', function() {
					coords[0] = this.getPosition();
					self.exec('geo_box', 'drawRectangle', [map, rect, coords]);
					
					// calculate the area size
					if (coords.length == 2) {
						self.exec('geo_box', 'updateInfo', [$view, rect]);
					}
				});

				/**
				 * When a marker is dragged to a different position then redraw the rectangle.
				 * 
				 * @listener
				 */
				google.maps.event.addListener(markers[1], 'position_changed', function() {
					coords[1] = this.getPosition();
					self.exec('geo_box', 'drawRectangle', [map, rect, coords]);

					// calculate the area size
					self.exec('geo_box', 'updateInfo', [$view, rect]);
				});

				/**
				 * Remove the rectangle and all values from the map.
				 * 
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-clear-map').bind('click touchstart', function(ev) {
					ev.preventDefault();
					ev.target.blur();

					// clear the coords
					coords = [];

					// hide the rectangle and marker
					rect.setMap(null);
					markers[0].setMap(null);
					markers[1].setMap(null);
					$view.data('bothMarkersVisible', false);

					$view.find('.jcsdl-map-area span').html('0 km<sup>2</sup>');

					$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_box.instructions[0]);
					$(this).hide();
				});
			},

			setValue : function($view, info, val, operator) {
				var self = this,
					$geoView = $view.find('.jcsdl-input-geo');

				val = val.split(':');
				var nw = val[0].split(',');
				var se = val[1].split(',');

				setTimeout(function() {
					var map = $geoView.data('map'),
						rect = $geoView.data('rect'),
						tips = self.exec('geo_box', 'getAllTipsFromNWSE', [nw, se]),
						bounds = new google.maps.LatLngBounds(tips.sw, tips.ne);

					self.exec('geo_box', 'drawRectangleFromBounds', [map, rect, bounds]);

					var markers = $geoView.data('markers');
					markers[0].setMap(map);
					markers[0].setPosition(tips.ne);
					markers[1].setMap(map);
					markers[1].setPosition(tips.sw);

					map.fitBounds(rect.getBounds());

					// calculate the area size
					self.exec('geo_box', 'updateInfo', [$geoView, rect]);

					$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_box.instructions[2]);
					$view.find('.jcsdl-clear-map').fadeIn();
					
				}, this.gui.config.animate + 200); // make sure everything is properly loaded
			},

			getValue : function($view, info, operator) {
				var rect = $view.find('.jcsdl-input-geo').data('rect');

				// if no map then rect is not visible, so has no values
				if (!rect.getMap()) return '';

				var tips = this.exec('geo_box', 'getAllTipsFromBounds', [rect.getBounds()]);
				return tips.nw.lat() + ',' + tips.nw.lng() + ':' + tips.se.lat() + ',' + tips.se.lng();
			},

			displayValue : function(info, val, filter) {
				val = val.split(':');
				var v1 = val[0].split(',');
				var v2 = val[1].split(',');

				return parseFloat(v1[0]).format(2) + ', ' + parseFloat(v1[1]).format(2) + ' : ' + parseFloat(v2[0]).format(2) + ', ' + parseFloat(v2[1]).format(2);
			},

			/**
			 * Draws the rectangle using the given coords.
			 * 
			 * @return {Boolean} Success or not.
			 */
			drawRectangle : function(map, rect, coords) {
				if (coords.length != 2) return false;

				var tips = this.exec('geo_box', 'getAllTipsFromUnspecified', [coords[0], coords[1]]),
					bounds = new google.maps.LatLngBounds(tips.sw, tips.ne);

				this.exec('geo_box', 'drawRectangleFromBounds', [map, rect, bounds]);
				return true;
			},

			/**
			 * Draws rectangle using the given bounds.
			 * 
			 * @param  {google.maps.Map} map Map on which to draw the rectangle.
			 * @param  {google.maps.Rectangle} rect The rectangle to be drawn.
			 * @param  {google.maps.LatLngBounds} bounds Bounds to be drawn with.
			 */
			drawRectangleFromBounds : function(map, rect, bounds) {
				rect.setBounds(bounds);
				rect.setMap(map);
			},

			/**
			 * Gets coordinates for all four corners of the rectangle based on its bounds.
			 * 
			 * @param  {google.maps.LatLngBounds} bounds
			 * @return {Object}
			 */
			getAllTipsFromBounds : function(bounds) {
				var tips = {};
				tips.ne = bounds.getNorthEast();
				tips.sw = bounds.getSouthWest();
				tips.nw = new google.maps.LatLng(tips.ne.lat(), tips.sw.lng());
				tips.se = new google.maps.LatLng(tips.sw.lat(), tips.ne.lng());
				return tips;
			},

			/**
			 * Gets coordinates for all four corners of the rectangle based on it raw coordinates of NW and SE points.
			 * 
			 * @param  {Array} nw Array where at index 0 is latitude for NW corner, and at index 1 its longitude.
			 * @param  {Array} se Array where at index 0 is latitude for SE corner, and at index 1 its longitude.
			 * @return {Object}
			 */
			getAllTipsFromNWSE : function(nw, se) {
				var tips = {};
				tips.nw = new google.maps.LatLng(parseFloat(nw[0]), parseFloat(nw[1]));
				tips.se = new google.maps.LatLng(parseFloat(se[0]), parseFloat(se[1]));
				tips.ne = new google.maps.LatLng(tips.nw.lat(), tips.se.lng());
				tips.sw = new google.maps.LatLng(tips.se.lat(), tips.nw.lng());
				return tips;
			},

			getAllTipsFromUnspecified : function(c1, c2) {
				var tips = {}, n, s, w, e;

				if (this._geo.isNorth(c1, c2)) {
					n = c1;
					s = c2;
				} else {
					n = c2;
					s = c1;
				}

				if (this._geo.isEast(c1, c2)) {
					e = c1;
					w = c2;
				} else {
					e = c2;
					w = c1;
				}

				var tips = {
					nw : new google.maps.LatLng(n.lat(), w.lng()),
					ne : new google.maps.LatLng(n.lat(), e.lng()),
					se : new google.maps.LatLng(s.lat(), e.lng()),
					sw : new google.maps.LatLng(s.lat(), w.lng())
				};

				return tips;
			},

			/**
			 * Updates the marked area information (coordinates and size).
			 * 
			 * @param  {jQuery} $view The value input view.
			 * @param  {google.maps.Rectangle} rect Rectangle marking.
			 */
			updateInfo : function($view, rect) {
				var tips = this.exec('geo_box', 'getAllTipsFromBounds', [rect.getBounds()]),
					area = google.maps.geometry.spherical.computeArea([tips.nw, tips.ne, tips.se, tips.sw]);

				$view.find('.jcsdl-map-area span').html(Math.round(area / 1000000).format() + ' km<sup>2</sup>');

				// update the tips displayed coordinates
				$.each(tips, function(point, coords) {
					$view.find('.jcsdl-map-coordinates .' + point + ' span').html(coords.lat().format(2) + ', ' + coords.lng().format(2));
				});
			}
		},

		/*
		 * GEO RADIUS
		 */
		geo_radius : {
			init : function(info) {
				var $view = this.getTemplate('valueInput_georadius');
				$view.append(this.getTemplate('valueInput_geo_map'));

				$view.find('.jcsdl-map-coordinates').html(this.getTemplate('valueInput_georadius_coordinates'));
				$view.find('.jcsdl-map-instructions').html(this.definition.inputs.geo_radius.instructions[0]);

				loadGoogleMapsApi(this.gui, this.exec, ['geo_radius', 'load', [info, $view]]);
				
				return $view;
			},

			load : function(info, $view) {
				var self = this;

				// initialize the map
				var map = new google.maps.Map($view.find('.jcsdl-map-canvas')[0], jcsdlMapsOptions);
				$view.data('map', map);

				// initialize the circle that we're gonna draw
				var opt = $.extend({}, this.gui.config.mapsOverlay, {});
				var circle = new google.maps.Circle(opt);
				$view.data('circle', circle);

				// create center marker
				var markerOptions = {
					position : new google.maps.LatLng(0, 0),
					draggable : true,
					icon : this.gui.config.mapsMarker
				};

				var centerMarker = new google.maps.Marker(markerOptions);
				$view.data('centerMarker', centerMarker);
				var radiusMarker = new google.maps.Marker(markerOptions);
				$view.data('radiusMarker', radiusMarker);

				$view.data('center', false);

				// initialize places autocomplete search
				this._geo.initSearch($view);

				/**
				 * Listen for clicks on the map and adjust the circle to it.
				 * 
				 * @param  {Event} ev Google Maps Event.
				 * @listener
				 */
				google.maps.event.addListener(map, 'click', function(ev) {
					// the center has already been marked, so this is a click for the radius
					if ($view.data('center')) {
						var radius = google.maps.geometry.spherical.computeDistanceBetween(circle.getCenter(), ev.latLng);
						circle.setRadius(radius);
						circle.setMap(map);

						// drop the corresponding marker
						radiusMarker.setPosition(ev.latLng);
						radiusMarker.setMap(map);

						self.exec('geo_radius', 'updateInfo', [$view, circle]);

						$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_radius.instructions[2]);

					// the center hasn't been marked yet, so this is the click for it
					} else {
						circle.setCenter(ev.latLng);

						// drop the corresponding marker
						centerMarker.setPosition(ev.latLng);
						centerMarker.setMap(map);

						$view.data('center', true);

						$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_radius.instructions[1]);
					}

					$view.find('.jcsdl-clear-map').fadeIn();
				});

				/**
				 * When the center marker is dragged to a different position then redraw the circle.
				 * 
				 * @listener
				 */
				google.maps.event.addListener(centerMarker, 'position_changed', function() {
					var center = this.getPosition();
					var oldCenter = circle.getCenter();
					circle.setCenter(center);

					if (oldCenter !== undefined) {
						// move the radius marker as well, to fit new center
						// so first calculate the lat and lng differences
						var latDiff = center.lat() - oldCenter.lat();
						var lngDiff = center.lng() - oldCenter.lng();

						// and apply that to new position of the marker
						var oldPosition = radiusMarker.getPosition();
						var position = new google.maps.LatLng(oldPosition.lat() + latDiff, oldPosition.lng() + lngDiff);
						radiusMarker.setPosition(position);
					}
				});

				/**
				 * When the radius marker is dragged to a different position then redraw the circle.
				 * 
				 * @listener
				 */
				google.maps.event.addListener(radiusMarker, 'position_changed', function() {
					var center = circle.getCenter();
					if (center !== undefined) {
						circle.setRadius(google.maps.geometry.spherical.computeDistanceBetween(circle.getCenter(), this.getPosition()));
						self.exec('geo_radius', 'updateInfo', [$view, circle]);
					}
				});

				/**
				 * Remove the circle and all values from the map.
				 * 
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-clear-map').bind('click touchstart', function(ev) {
					ev.preventDefault();
					ev.target.blur();

					circle.setCenter(null);
					circle.setMap(null);
					centerMarker.setMap(null);
					radiusMarker.setMap(null);
					$view.data('center', false);
					$view.find('.jcsdl-map-area span').html('0 km<sup>2</sup>');

					$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_radius.instructions[0]);
					$(this).hide();
				});
			},

			setValue : function($view, info, val, operator) {
				var self = this;
				var $geoView = $view.find('.jcsdl-input-geo');

				val = val.split(':');
				var latlng = val[0].split(',');
				var radius = parseFloat(val[1]) * 1000;

				setTimeout(function() {
					var map = $geoView.data('map');
					var circle = $geoView.data('circle');
					var center = new google.maps.LatLng(latlng[0], latlng[1])

					// first, set markers because changing their positions causes changes in the circle
					var centerMarker = $geoView.data('centerMarker');
					centerMarker.setPosition(center);
					centerMarker.setMap(map);

					var radiusMarker = $geoView.data('radiusMarker');
					var radiusPosition = google.maps.geometry.spherical.computeOffset(center, radius, 90);
					radiusMarker.setPosition(radiusPosition);
					radiusMarker.setMap(map);

					circle.setCenter(center);
					circle.setRadius(radius);
					circle.setMap(map); 

					$geoView.data('center', true);

					map.fitBounds(circle.getBounds());

					// calculate the area size
					self.exec('geo_radius', 'updateInfo', [$geoView, circle]);

					$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_radius.instructions[2]);
					$view.find('.jcsdl-clear-map').fadeIn();
					
				}, this.gui.config.animate + 200); // make sure everything is properly loaded
			},

			getValue : function($view, info, operator) {
				var circle = $view.find('.jcsdl-input-geo').data('circle');

				// if no map then rect is not visible, so has no values
				if (!circle.getMap()) return '';

				var center = circle.getCenter();
				return center.lat() + ',' + center.lng() + ':' + (circle.getRadius() / 1000);
			},

			displayValue : function(info, val, filter) {
				val = val.split(':');
				var center = val[0].split(',');
				var radius = val[1];

				return 'Center: ' + parseFloat(center[0]).format(2) + ', ' + parseFloat(center[1]).format(2) + '; Radius: ' + parseFloat(radius).format(2) + ' km';
			},

			/**
			 * Updates the area information with calculated information on how big the marked area is.
			 * 
			 * @param  {jQuery} $view The value input view.
			 * @param  {google.maps.Circle} circle Circle marking.
			 */
			updateInfo : function($view, circle) {
				var r = circle.getRadius();
				var area = r * r * Math.PI;
				$view.find('.jcsdl-map-area span').html(Math.round(area / 1000000).format() + ' km<sup>2</sup>');

				var center = circle.getCenter();
				$view.find('.jcsdl-map-coordinates .center span').html(center.lat().format(2) + ', ' + center.lng().format(2));
				$view.find('.jcsdl-map-coordinates .radius span').html((circle.getRadius() / 1000).format(2) + ' km');
			}
		},

		/*
		 * GEO POLYGON
		 */
		geo_polygon : {
			init : function(info) {
				var $view = this.getTemplate('valueInput_geopolygon');
				$view.append(this.getTemplate('valueInput_geo_map'));
				$view.find('.jcsdl-map-coordinates').html(this.getTemplate('valueInput_geopolygon_coordinates'));
				$view.find('.jcsdl-map-instructions').html(this.definition.inputs.geo_polygon.instructions[0]);
				loadGoogleMapsApi(this.gui, this.exec, ['geo_polygon', 'load', [info, $view]]);
				return $view;
			},

			load : function(info, $view) {
				var self = this;

				// initialize the map
				var map = new google.maps.Map($view.find('.jcsdl-map-canvas')[0], jcsdlMapsOptions);
				$view.data('map', map);

				// initialize the polygon that we're gonna draw
				var opt = $.extend({}, this.gui.config.mapsOverlay, {
					paths : [[]],
					editable : true
				});
				var polygon = new google.maps.Polygon(opt);
				var path = polygon.getPath();
				$view.data('polygon', polygon);

				// storage markers
				var markers = new google.maps.MVCArray();
				$view.data('markers', markers);
				var mc = 1;

				// initialize places autocomplete search
				this._geo.initSearch($view);

				/**
				 * Listen for clicks on the map and create new polygon points.
				 * 
				 * @param  {Event} ev Google Maps Event.
				 * @listener
				 */
				google.maps.event.addListener(map, 'click', function(ev) {
					path.push(ev.latLng);
				});

				/**
				 * Listen for new items added in the polygon path and create corresponding markers.
				 * 
				 * @param  {Integer} i Index of the new point.
				 * @listener
				 */
				google.maps.event.addListener(path, 'insert_at', function(i) {
					var marker = new google.maps.Marker({
						map : map,
						position : path.getAt(i),
						draggable : true,
						icon : self.gui.config.mapsMarker,
						zIndex : mc++ // zindex serves as a hacky ID to find this marker later
					});

					// add to markers array
					markers.insertAt(i, marker);

					// show the polygon if already 3 tips
					if (path.getLength() >= 3) {
						polygon.setMap(map);
					}

					// update instructions
					var instr = (path.getLength() <= 3) ? path.getLength() : 3;
					$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_polygon.instructions[instr]);

					// update info
					self.exec('geo_polygon', 'updateInfo', [$view, polygon]);
					$view.find('.jcsdl-clear-map').fadeIn();

					// setup listeners for the marker
					// after marker has moved, move the polygon tip as well
					google.maps.event.addListener(marker, 'position_changed', function(ev) {
						var p = self.exec('geo_polygon', 'getMarkerIndex', [marker, markers]);
						if (p == -1) return;

						path.setAt(p, this.getPosition());

						self.exec('geo_polygon', 'updateInfo', [$view, polygon]);
					});

					// remove the marker and the polygon tip
					google.maps.event.addListener(marker, 'dblclick', function(ev) {
						var p = self.exec('geo_polygon', 'getMarkerIndex', [marker, markers]);
						if (p == -1) return;

						path.removeAt(p);
						markers.removeAt(p);
						this.setMap(null);

						self.exec('geo_polygon', 'updateInfo', [$view, polygon]);
					});
				});

				/**
				 * A tip of the polygon has moved, update corresponding marker.
				 * 
				 * @param  {[type]} i [description]
				 * @return {[type]}   [description]
				 */
				google.maps.event.addListener(path, 'set_at', function(i) {
					var mark = markers.getAt(i),
						pos = path.getAt(i);
					if (!mark.getPosition().equals(pos)) {
						mark.setPosition(pos);
					}
				});

				/**
				 * Remove the polygon and all values from the map.
				 * 
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-clear-map').bind('click touchstart', function(ev) {
					ev.preventDefault();
					ev.target.blur();

					markers.forEach(function(marker, i) {
						marker.setMap(null);
					});
					markers.clear();
					path.clear();

					self.exec('geo_polygon', 'updateInfo', [$view, polygon]);

					$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_polygon.instructions[0]);
					$(this).hide();
				});
			},

			setValue : function($view, info, val, operator) {
				var self = this;
				var $geoView = $view.find('.jcsdl-input-geo');

				val = val.split(':');

				setTimeout(function() {
					var polygon = $geoView.data('polygon');
					var map = $geoView.data('map');

					$.each(val, function(i, v) {
						v = v.split(',');
						var pos = new google.maps.LatLng(parseFloat(v[0]), parseFloat(v[1]));

						polygon.getPath().push(pos);
					});

					map.fitBounds(polygon.getBounds());

					// calculate the area size
					self.exec('geo_polygon', 'updateInfo', [$geoView, polygon]);

					$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_polygon.instructions[3]);
					$view.find('.jcsdl-clear-map').fadeIn();
					
				}, this.gui.config.animate + 200); // make sure everything is properly loaded
			},

			getValue : function($view, info, operator) {
				var pth = $view.find('.jcsdl-input-geo').data('polygon').getPath(),
					v = [];

				pth.forEach(function(p, i) {
					v.push(p.lat() + ',' + p.lng());
				});

				return v.join(':');
			},

			displayValue : function(info, val, filter) {
				val = val.split(':');
				var output = [];
				$.each(val, function(i, v) {
					v = v.split(',');
					output.push(parseFloat(v[0]).format(2) + ', ' + parseFloat(v[1]).format(2));
					if (i == 1) return false; // break at 2 points
				});

				output = output.join(' : ');
				if (val.length > 2) {
					output += ' and ' + (val.length - 2) + ' more...';
				}
				return output;
			},

			// get index of the marker (using zindex as an ID)
			getMarkerIndex : function(mrk, mrks) {
				var p = -1;
				mrks.forEach(function(m, k) {
					if (m.getZIndex() == mrk.getZIndex()) p = k;
				});
				return p;
			},

			/**
			 * Updates the area information with calculated information on how big the marked area is.
			 * 
			 * @param  {jQuery} $view The value input view.
			 * @param  {google.maps.Polygon} polygon Polygon marking.
			 */
			updateInfo : function($view, polygon) {
				var path = polygon.getPath();
				var $list = $view.find('.jcsdl-map-coordinates ul').html('');

				path.forEach(function(p, i) {
					$('<li />').html('(' + p.lat().format(4) + ', ' + p.lng().format(4) + ')').appendTo($list);
				});

				if (path.getLength() >= 3) {
					var area = google.maps.geometry.spherical.computeArea(path);
					$view.find('.jcsdl-map-area span').html(Math.round(area / 1000000).format() + ' km<sup>2</sup>');
				} else {
					$view.find('.jcsdl-map-area span').html('0 km<sup>2</sup>');
				}
			}

		}

	};

});