var JCSDLGuiInputs = function(gui) {
	this.gui = gui;
	this.definition = gui.definition;
};

JCSDLGuiInputs.prototype = {

	exec : function(type, method, args) {
		return this[type][method].apply(this, args);
	},

	getTemplate : function(name) {
		return this.gui.getTemplate(name);
	},

	/*
	 * TEXT FIELD
	 */
	text : {
		init : function(fieldInfo) {
			var $view = this.getTemplate('valueInput_text');
			var $input = $view.find('input');
			$input.jcsdlTagInput();
			$input.jcsdlRegExTester();
			return $view;
		},

		setValue : function($view, fieldInfo, value) {
			$view.find('input[type=text]:first').val(value);
		},

		getValue : function($view, fieldInfo) {
			return $view.find('input[type=text]:first').val();
		}
	},

	/*
	 * NUMBER FIELD
	 */
	number : {
		init : function(fieldInfo) {
			var $view = this.getTemplate('valueInput_number');
			$view.find('input[type=text]').jcsdlNumberMask();
			return $view;
		},

		setValue : function($view, fieldInfo, value) {
			$view.find('input[type=text]').val(value);
		},

		getValue : function($view, fieldInfo) {
			return $view.find('input[type=text]').val();
		}
	},

	/*
	 * SELECT FIELD
	 */
	select : {
		init : function(fieldInfo) {
			var self = this;
			var $view = this.getTemplate('valueInput_select');

			// decide from where to get the options
			var options = this.exec('select', 'getOptionsSet', [fieldInfo]);

			// render the options
			$.each(options, function(value, label) {
				var $optionView = self.exec('select', 'createOptionView', [value, label]);
				$optionView.appendTo($view);
			});

			/**
			 * Turn on/off the clicked option.
			 * @param  {Event} ev
			 * @listener
			 */
			$view.find('.jcsdl-input-select-option').bind('click touchstart', function(ev) {
				ev.preventDefault();
				ev.target.blur();
				$(this).toggleClass('selected');
			});

			return $view;
		},

		setValue : function($view, fieldInfo, value) {
			var values = value.split(',');
			$.each(values, function(i, val) {
				$view.find('.jcsdl-input-select-option[data-value="' + val + '"]').addClass('selected');
			});
		},

		getValue : function($view, fieldInfo) {
			var values = [];
			$view.find('.jcsdl-input-select-option.selected').each(function(i, option) {
				values.push($(option).data('value'));
			});

			return values.join(',');
		},

		displayValue : function(fieldInfo, value, filter) {
			var self = this;
			var values = value.split(',');
			var $view = this.getTemplate('valueInput_select');

			// return nothing if empty
			if (values.length == 0) return $view;

			var options = this.exec('select', 'getOptionsSet', [fieldInfo]);

			// only show maximum of 5 selected options
			var showValues = values.slice(0, 5);
			$.each(showValues, function(i, val) {
				if (typeof(options[val]) == 'undefined') return true;

				var $optionView = self.exec('select', 'createOptionView', [val, options[val]]);
				$optionView.addClass('selected');
				$optionView.appendTo($view);
			});

			// show more indicator if there are more left
			if (values.length > showValues.length) {
				var $indicator = this.getTemplate('valueInput_select_more');
				$indicator.find('.count').html(values.length - showValues.length);
				$indicator.appendTo($view);
			}

			/**
			 * Turn off clicking of the options.
			 * @param  {Event} ev
			 * @listener
			 */
			$view.find('.jcsdl-input-select-option').bind('click touchstart', function(ev) {
				ev.preventDefault();
				ev.target.blur();
			});

			return $view;
		},

		getOptionsSet : function(fieldInfo) {
			var options = {};
			if (typeof(fieldInfo.options) !== 'undefined') {
				options = fieldInfo.options;
			} else if ((typeof(fieldInfo.optionsSet) !== 'undefined') && (typeof(this.definition.inputs.select.sets[fieldInfo.optionsSet]) !== 'undefined')) {
				options = this.definition.inputs.select.sets[fieldInfo.optionsSet];
			}
			return options;
		},

		createOptionView : function(value, label) {
			var $optionView = this.getTemplate('valueInput_select_option');
			$optionView.attr('data-value', value);
			$optionView.addClass('option-' + value);
			$optionView.attr('title', label);
			$optionView.find('span').html(label);
			return $optionView;
		}
	},

	/*
	 * SLIDER
	 */
	slider : {
		init : function(fieldInfo) {
			var self = this;
			var $view = this.getTemplate('valueInput_slider');
			var options = this.exec('slider', 'getOptions', [fieldInfo]);

			// init slider
			var $slider = $view.find('.jcsdl-slider').slider({
				animate : true,
				min : options.min,
				max : options.max,
				step : options.step,
				value : options['default'],
				slide : function(ev, ui) {
					var value = self.exec('slider', 'parseValue', [fieldInfo, ui.value]);
					$view.find('.jcsdl-slider-input').val(value);
				}
			});

			// set the default value
			this.exec('slider', 'setValue', [$view, fieldInfo, options['default']]);

			// display the min and max labels
			$view.find('.jcsdl-slider-label.min').html(this.exec('slider', 'displayValue', [fieldInfo, options.min]));
			$view.find('.jcsdl-slider-label.max').html(this.exec('slider', 'displayValue', [fieldInfo, options.max]));

			var allowFloat = (fieldInfo.type == 'float') ? true : false;
			/**
			 * Mask the input as a number field and update the slider when the value was changed in the input.
			 * @param  {Event} ev
			 * @listener
			 */
			$view.find('.jcsdl-slider-input').jcsdlNumberMask(allowFloat).keyup(function(ev) {
				// don't do anything if a dot has been entered
				if (ev.which == 110 || ev.which == 190) return;

				var value = $(this).val();
				value = (value) ? value : 0;
				self.exec('slider', 'setValue', [$view, fieldInfo, parseFloat(value)]);
			});

			/**
			 * Changes the value of the slider by incrementing or decrementing.
			 * @param  {jQuery} $view     Full slider input view.
			 * @param  {Object} fieldInfo
			 * @param  {Number} step      
			 * @param  {Boolean} minus 
			 */
			var changeValue = function($view, fieldInfo, step, minus) {
				var value = parseFloat($view.find('.jcsdl-slider-input').val());
				value = (minus) ? value - step : value + step;
				self.exec('slider', 'setValue', [$view, fieldInfo, value]);
			}

			// helper var for the listener below
			var changeValueInterval = null;

			/**
			 * Make the plus and minus signs clickable. They should change the slider value.
			 * Using mousedown and mouseup events so the mouse button can be hold to change the value.
			 * @param  {Event} ev
			 * @listener
			 */
			$view.find('.jcsdl-slider-minus, .jcsdl-slider-plus').bind('mousedown touchstart', function(ev) {
				var minus = $(this).is('.jcsdl-slider-minus');
				changeValueInterval = setInterval(function() {
					changeValue($view, fieldInfo, options.step, minus);
				}, 50);
			// mouse up will remove the interval (also mouseout)
			}).bind('mouseup mouseout touchend', function(ev) {
				clearInterval(changeValueInterval);
			// and prevent default behavior on click()
			}).click(function(ev) {
				ev.preventDefault();
				ev.target.blur();
			});

			return $view;
		},

		setValue : function($view, fieldInfo, value) {
			var options = this.exec('slider', 'getOptions', [fieldInfo]);

			value = (value > options.max)
				? options.max
				: ((value < options.min) 
					? options.min
					: value);

			$view.find('.jcsdl-slider').slider('value', value);
			$view.find('.jcsdl-slider-input').val(value);
		},

		getValue : function($view, fieldInfo) {
			var value = $view.find('.jcsdl-slider-input').val();
			return this.exec('slider', 'parseValue', [fieldInfo, value]);
		},

		displayValue : function(fieldInfo, value, filter) {
			var options = this.exec('slider', 'getOptions', [fieldInfo]);
			return options.displayFormat.apply(options, [value.toString()]);
		},

		parseValue : function(fieldInfo, value) {
			return value;
		},

		getOptions : function(fieldInfo) {
			var options = $.extend({}, this.definition.inputs.slider, {
				min : fieldInfo.min,
				max : fieldInfo.max,
				step : fieldInfo.step,
				'default' : fieldInfo['default'],
				displayFormat : fieldInfo.displayFormat
			});
			return options;
		}
	},

	/*
	 * GEO HELPERS
	 */
	_geo : {
		mapOptions : {},

		initSearch : function($view) {
			var map = $view.data('map');
			var $ac = $view.find('.jcsdl-map-search');
			var autocomplete = new google.maps.places.Autocomplete($ac[0], {});

			/**
			 * Move the map viewport to the found location.
			 * @listener
			 */
			google.maps.event.addListener(autocomplete, 'place_changed', function() {
				var place = autocomplete.getPlace();
				if (typeof(place.geometry) == 'undefined') {
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

		isNorth : function(coords1, coords2) {
			return (coords1.lat() >= coords2.lat());
		},

		isEast : function(coords1, coords2) {
			return (coords1.lng() >= coords2.lng());
		}
	},

	/*
	 * GEO BOX
	 */
	geo_box : {
		init : function(fieldInfo) {
			var $view = this.getTemplate('valueInput_geobox');
			$view.append(this.getTemplate('valueInput_geo_map'));
			$view.find('.jcsdl-map-coordinates').html(this.getTemplate('valueInput_geobox_coordinates'));
			$view.find('.jcsdl-map-instructions').html(this.definition.inputs.geo_box.instructions[0]);
			loadGoogleMapsApi(this.gui, this.exec, ['geo_box', 'load', [fieldInfo, $view]]);
			return $view;
		},

		load : function(fieldInfo, $view) {
			var self = this;

			// initialize the map
			var map = new google.maps.Map($view.find('.jcsdl-map-canvas')[0], jcsdlMapsOptions);
			$view.data('map', map);

			// initialize the rectangle that we're gonna draw
			var opt = $.extend({}, this.gui.config.mapsOverlay, {});
			var rect = new google.maps.Rectangle(opt);
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
			});

			/**
			 * When a marker is dragged to a different position then redraw the rectangle.
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
			});
		},

		setValue : function($view, fieldInfo, value) {
			var self = this;
			var $geoView = $view.find('.jcsdl-input-geo');

			value = value.split(':');
			var nw = value[0].split(',');
			var se = value[1].split(',');

			setTimeout(function() {
				var map = $geoView.data('map');
				var rect = $geoView.data('rect');

				var tips = self.exec('geo_box', 'getAllTipsFromNWSE', [nw, se]);
				var bounds = new google.maps.LatLngBounds(tips.sw, tips.ne);

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
				
			}, this.gui.config.animate + 200); // make sure everything is properly loaded
		},

		getValue : function($view, fieldInfo) {
			var rect = $view.find('.jcsdl-input-geo').data('rect');

			// if no map then rect is not visible, so has no values
			if (!rect.getMap()) return '';

			var tips = this.exec('geo_box', 'getAllTipsFromBounds', [rect.getBounds()]);
			var value = tips.nw.lat() + ',' + tips.nw.lng() + ':' + tips.se.lat() + ',' + tips.se.lng();
			return value;
		},

		displayValue : function(fieldInfo, value, filter) {
			value = value.split(':');
			var v1 = value[0].split(',');
			var v2 = value[1].split(',');

			return parseFloat(v1[0]).format(2) + ', ' + parseFloat(v1[1]).format(2) + ' : ' + parseFloat(v2[0]).format(2) + ', ' + parseFloat(v2[1]).format(2);
		},

		/**
		 * Draws the rectangle using the given coords.
		 * @return {Boolean} Success or not.
		 */
		drawRectangle : function(map, rect, coords) {
			if (coords.length != 2) return false;

			var tips = this.exec('geo_box', 'getAllTipsFromUnspecified', [coords[0], coords[1]]);
			var bounds = new google.maps.LatLngBounds(tips.sw, tips.ne);
			this.exec('geo_box', 'drawRectangleFromBounds', [map, rect, bounds]);
			return true;
		},

		/**
		 * Draws rectangle using the given bounds.
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

		getAllTipsFromUnspecified : function(coords1, coords2) {
			var tips = {};

			var north, south;
			if (this._geo.isNorth(coords1, coords2)) {
				north = coords1;
				south = coords2;
			} else {
				north = coords2;
				south = coords1;
			}

			var west, east;
			if (this._geo.isEast(coords1, coords2)) {
				east = coords1;
				west = coords2;
			} else {
				east = coords2;
				west = coords1;
			}

			var tips = {
				nw : new google.maps.LatLng(north.lat(), west.lng()),
				ne : new google.maps.LatLng(north.lat(), east.lng()),
				se : new google.maps.LatLng(south.lat(), east.lng()),
				sw : new google.maps.LatLng(south.lat(), west.lng())
			};

			return tips;
		},

		/**
		 * Updates the marked area information (coordinates and size).
		 * @param  {jQuery} $view The value input view.
		 * @param  {google.maps.Rectangle} rect Rectangle marking.
		 */
		updateInfo : function($view, rect) {
			var tips = this.exec('geo_box', 'getAllTipsFromBounds', [rect.getBounds()]);
			var area = google.maps.geometry.spherical.computeArea([tips.nw, tips.ne, tips.se, tips.sw]);
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
		init : function(fieldInfo) {
			var $view = this.getTemplate('valueInput_georadius');
			$view.append(this.getTemplate('valueInput_geo_map'));
			$view.find('.jcsdl-map-coordinates').html(this.getTemplate('valueInput_georadius_coordinates'));
			$view.find('.jcsdl-map-instructions').html(this.definition.inputs.geo_radius.instructions[0]);
			loadGoogleMapsApi(this.gui, this.exec, ['geo_radius', 'load', [fieldInfo, $view]]);
			return $view;
		},

		load : function(fieldInfo, $view) {
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
			});

			/**
			 * When the center marker is dragged to a different position then redraw the circle.
			 * @listener
			 */
			google.maps.event.addListener(centerMarker, 'position_changed', function() {
				var center = this.getPosition();
				var oldCenter = circle.getCenter();
				circle.setCenter(center);

				if (typeof(oldCenter) !== 'undefined') {
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
			 * @listener
			 */
			google.maps.event.addListener(radiusMarker, 'position_changed', function() {
				var center = circle.getCenter();
				if (typeof(center) !== 'undefined') {
					circle.setRadius(google.maps.geometry.spherical.computeDistanceBetween(circle.getCenter(), this.getPosition()));
					self.exec('geo_radius', 'updateInfo', [$view, circle]);
				}
			});

			/**
			 * Remove the circle and all values from the map.
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
			});
		},

		setValue : function($view, fieldInfo, value) {
			var self = this;
			var $geoView = $view.find('.jcsdl-input-geo');

			value = value.split(':');
			var latlng = value[0].split(',');
			var radius = parseFloat(value[1]) * 1000;

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
				
			}, this.gui.config.animate + 200); // make sure everything is properly loaded
		},

		getValue : function($view, fieldInfo) {
			var circle = $view.find('.jcsdl-input-geo').data('circle');

			// if no map then rect is not visible, so has no values
			if (!circle.getMap()) return '';

			var center = circle.getCenter();
			return center.lat() + ',' + center.lng() + ':' + (circle.getRadius() / 1000);
		},

		displayValue : function(fieldInfo, value, filter) {
			value = value.split(':');
			var center = value[0].split(',');
			var radius = value[1];

			return 'Center: ' + parseFloat(center[0]).format(2) + ', ' + parseFloat(center[1]).format(2) + '; Radius: ' + parseFloat(radius).format(2) + ' km';
		},

		/**
		 * Updates the area information with calculated information on how big the marked area is.
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
		init : function(fieldInfo) {
			var $view = this.getTemplate('valueInput_geopolygon');
			$view.append(this.getTemplate('valueInput_geo_map'));
			$view.find('.jcsdl-map-coordinates').html(this.getTemplate('valueInput_geopolygon_coordinates'));
			$view.find('.jcsdl-map-instructions').html(this.definition.inputs.geo_polygon.instructions[0]);
			loadGoogleMapsApi(this.gui, this.exec, ['geo_polygon', 'load', [fieldInfo, $view]]);
			return $view;
		},

		load : function(fieldInfo, $view) {
			var self = this;

			// initialize the map
			var map = new google.maps.Map($view.find('.jcsdl-map-canvas')[0], jcsdlMapsOptions);
			$view.data('map', map);

			// initialize the polygon that we're gonna draw
			var opt = $.extend({}, this.gui.config.mapsOverlay, {
				paths : [[]]
			});
			var polygon = new google.maps.Polygon(opt);
			$view.data('polygon', polygon);

			// storage markers
			var markers = [];
			$view.data('markers', markers);

			// initialize places autocomplete search
			this._geo.initSearch($view);

			/**
			 * Listen for clicks on the map and create new polygon points.
			 * @param  {Event} ev Google Maps Event.
			 * @listener
			 */
			google.maps.event.addListener(map, 'click', function(ev) {
				var marker = self.exec('geo_polygon', 'addTip', [$view, ev.latLng.lat(), ev.latLng.lng()]);
				markers.push(marker);

				var instr = (markers.length <= 3) ? markers.length : 3;
				$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_polygon.instructions[instr]);
			});

			/**
			 * Remove the circle and all values from the map.
			 * @param  {Event} ev
			 * @listener
			 */
			$view.find('.jcsdl-clear-map').bind('click touchstart', function(ev) {
				ev.preventDefault();
				ev.target.blur();

				$.each($view.data('markers'), function(i, marker) {
					marker.setMap(null);
				});
				polygon.getPath().clear();

				markers = [];

				self.exec('geo_polygon', 'updateInfo', [$view, polygon]);

				$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_polygon.instructions[0]);
			});
		},

		setValue : function($view, fieldInfo, value) {
			var self = this;
			var $geoView = $view.find('.jcsdl-input-geo');

			value = value.split(':');

			setTimeout(function() {
				var markers = $geoView.data('markers');

				$.each(value, function(i, val) {
					val = val.split(',');
					var marker = self.exec('geo_polygon', 'addTip', [$geoView, val[0], val[1]]);
					markers.push(marker);
				});

				$geoView.data('markers', markers);

				var map = $geoView.data('map');
				var polygon = $geoView.data('polygon');

				map.fitBounds(polygon.getBounds());

				// calculate the area size
				self.exec('geo_polygon', 'updateInfo', [$geoView, polygon]);

				$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_polygon.instructions[3]);
				
			}, this.gui.config.animate + 200); // make sure everything is properly loaded
		},

		getValue : function($view, fieldInfo) {
			var polygon = $view.find('.jcsdl-input-geo').data('polygon');
			var path = polygon.getPath();
			var value = [];

			for(var i = 0; i < path.getLength(); i++) {
				var tip = path.getAt(i);
				value.push(tip.lat() + ',' + tip.lng());
			}

			return value.join(':');
		},

		displayValue : function(fieldInfo, value, filter) {
			value = value.split(':');
			var output = [];
			$.each(value, function(i, val) {
				val = val.split(',');
				output.push(parseFloat(val[0]).format(2) + ', ' + parseFloat(val[1]).format(2));
				if (i == 1) return false; // break at 2 points
			});

			output = output.join(' : ');
			if (value.length > 2) {
				output += ' and ' + (value.length - 2) + ' more...';
			}
			return output;
		},

		addTip : function($view, lat, lng) {
			var self = this;
			var map = $view.data('map');
			var polygon = $view.data('polygon');
			var tips = $view.data('tips');

			var position = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));

			// create a marker
			var marker = new google.maps.Marker({
				map : map,
				position : position,
				draggable : true,
				icon : this.gui.config.mapsMarker
			});

			// add the polygon point
			var polyPath = polygon.getPath();
			polyPath.push(position);

			// if there are at least 3 tips then we can show the polygon
			if (polyPath.getLength() >= 3) {
				polygon.setMap(map);
			}

			google.maps.event.addListener(marker, 'position_changed', function(ev) {
				var i = self.exec('geo_polygon', 'indexOfPosition', [position, polygon]);
				position = this.getPosition();
				if (i == -1) return;

				polyPath.setAt(i, position);

				self.exec('geo_polygon', 'updateInfo', [$view, polygon]);
			});

			// remove the marker and the polygon tip
			google.maps.event.addListener(marker, 'dblclick', function(ev) {
				var i = self.exec('geo_polygon', 'indexOfPosition', [position, polygon]);
				position = this.getPosition();
				if (i == -1) return;

				polyPath.removeAt(i);
				this.setMap(null);

				self.exec('geo_polygon', 'updateInfo', [$view, polygon]);
			});

			self.exec('geo_polygon', 'updateInfo', [$view, polygon]);

			return marker;
		},

		indexOfPosition : function(position, polygon) {
			var path = polygon.getPath();
			for (var i = 0; i < path.getLength(); i++) {
				var tip = path.getAt(i);
				if (tip.equals(position)) {
					return i;
				}
			}

			return -1;
		},

		/**
		 * Updates the area information with calculated information on how big the marked area is.
		 * @param  {jQuery} $view The value input view.
		 * @param  {google.maps.Polygon} polygon Polygon marking.
		 */
		updateInfo : function($view, polygon) {
			var path = polygon.getPath();

			var $list = $view.find('.jcsdl-map-coordinates ul').html('');
			for(var i = 0; i < path.getLength(); i++) {
				var tip = path.getAt(i);
				$('<li />').html('(' + tip.lat().format(4) + ', ' + tip.lng().format(4) + ')').appendTo($list);
			}

			if (path.getLength() >= 3) {
				var area = google.maps.geometry.spherical.computeArea(path);
				$view.find('.jcsdl-map-area span').html(Math.round(area / 1000000).format() + ' km<sup>2</sup>');
			} else {
				$view.find('.jcsdl-map-area span').html('0 km<sup>2</sup>');
			}
		}
	}

};