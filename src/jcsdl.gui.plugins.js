/**
 * JCSDL Filter carousel as a separate jQuery plugin for easy use.
 */
JCSDLTargets.Loader.addComponent(function($, undefined) {

	var JCSDLCarousel = function($el, options) {
		var self = this;
		this.select = options.select;

		/*
		 * links to various elements that are used by the carousel
		 */
		this.$carousel = $el.find('.jcsdl-carousel');
		this.$carouselWrap = this.$carousel.closest('.jcsdl-carousel-wrap');
		this.$carouselItems = this.$carousel.find('.jcsdl-carousel-item');
		this.$scrollLeft = this.$carouselWrap.siblings('.jcsdl-carousel-scroll.left');
		this.$scrollRight = this.$carouselWrap.siblings('.jcsdl-carousel-scroll.right');

		// count how many visible items are there
		this.itemsCount = this.$carouselItems.filter(':visible').length;

		/*
		 * Assign all required dimensions based on an example item
		 * make sure it's visible and when all is calculated hide it if it was hidden
		 */
		var $exampleItem = this.$carouselItems.eq(0),
			hideExample = ($exampleItem.is(':visible')) ? false : true;

		$exampleItem.show();

		this.itemWidth = $exampleItem.outerWidth(true);
		this.itemMargin = parseInt($exampleItem.css('marginRight'));

		// set the wrap's dimensions
		this.$carouselWrap.css({
			maxWidth : this.calculateWrapWidth(),
			height : $exampleItem.outerHeight(true)
		});

		// set the carousel's dimensions
		this.$carousel.css({
			position : 'relative',
			width : this.itemWidth * this.itemsCount,
			height : $exampleItem.outerHeight(true)
		});

		this.margin = this.calculateCenterMargin();

		// if example item was hidden, then hide it again, no longer needed
		if (hideExample) $exampleItem.hide();
		
		/*
		 * select the item that is suppose to be selected (middle if there isn't any)
		 */
		var $selected = this.$carouselItems.filter('.selected');
		this.selectedIndex = ($selected.length == 1) ? $selected.prevAll(':visible').length : Math.floor(this.itemsCount / 2);

		// if even number of items then move by a half
		if (this.itemsCount % 2 == 0) {
			this.selectedIndex = this.selectedIndex - 0.5;
		}

		// update the carousel's position
		this.changePosition(0, !options.expand);

		/*
		 * REGISTER LISTENERS
		 */
		// activate the scroll left and right buttons
		this.$carouselWrap.siblings('.jcsdl-carousel-scroll').bind('click touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var $scroll = $(this);
			if ($scroll.hasClass('inactive')) return;

			var changeIndex = $scroll.is('.left') ? -1 : 1;

			// fix the selected index
			if (self.selectedIndex - Math.floor(self.selectedIndex) == 0.5) {
				self.selectedIndex = (changeIndex < 0) ? self.selectedIndex : self.selectedIndex - 1;
			}

			self.selectedIndex = Math.round(self.selectedIndex) + changeIndex;
			self.changePosition(options.speed);
		});

		// click and move the mouse / finger to drag the carousel around and snap to selection on finger/mouse up
		this.$carouselItems.bind('mousedown.jcsdlcarousel touchstart.jcsdlcarousel', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var $el = $(this);
			var moving = false;
			var pageX = (ev.type == 'touchmove') ? ev.originalEvent.targetTouches[0].pageX : ev.pageX;

			$('body').bind('mousemove.jcsdlcarousel touchmove.jcsdlcarousel', function(ev) {
				moving = true;

				var evPageX = (ev.type == 'touchmove') ? ev.originalEvent.targetTouches[0].pageX : ev.pageX;
				var curLeft = parseInt(self.$carousel.css('left'));
				self.$carousel.css('left', curLeft - (pageX - evPageX));

				pageX = evPageX;
			});

			$('body').bind('mouseup.jcsdlcarousel touchend.jcsdlcarousel', function(ev) {
				if (moving) {
					self.snapToSelection();
				} else {
					self.selectedIndex = $el.prevAll(':visible').length;
					self.changePosition(options.speed);
					moving = false;
				}

				$('body').unbind('mousemove.jcsdlcarousel touchmove.jcsdlcarousel');
				$('body').unbind('mouseup.jcsdlcarousel touchend.jcsdlcarousel');
			});
		});

		// special click handler for loading an existing filter and calling all proper actions
		this.$carouselItems.bind('jcsdlclick', function(ev) {
			$(this).show(); // this target may have been hidden before
			// update carousel's item count and the carousel width
			self.itemsCount = self.$carouselItems.filter(':visible').length;
			self.$carousel.css('width', self.itemWidth * self.itemsCount);

			// click
			$(this).trigger('mousedown').trigger('mouseup');
		});

		// prevent action on standard click
		this.$carouselItems.click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			// but not for ie
			if ($('html').is('.msie')) {
				self.selectedIndex = $(this).prevAll(':visible').length;
				self.changePosition(options.speed);
			}
		});

		// adjust the carousel's width when window resizing
		$(window).resize(function(ev) {
			self.adjust();
		});

		// when there's only one option visible then already select it
		if (this.$carouselItems.filter(':visible').length == 1) {
			// this is causing an infinite loop for some reason, therefore disabling it for the moment
			//this.$carouselItems.filter(':not(.jcsdl-option-hidden):visible').trigger('jcsdlclick');
		}
	}

	// carousel's prototype methods and vars
	JCSDLCarousel.prototype = {
		// calculates the current width of the wrap
		calculateWrapWidth : function() {
			return this.$carouselWrap.closest('.jcsdl-step').width() - this.$scrollLeft.outerWidth(true) - this.$scrollRight.outerWidth(true);
		},
		// calculate margin that needs to be removed from the position so it's centered
		calculateCenterMargin : function() {
			this.margin = (this.$carouselWrap.width() - this.itemWidth + this.itemMargin) / 2;
			return this.margin;	
		},
		// calculate the carousel's relative position
		calculateCurrentPosition : function() {
			return -1 * this.itemWidth * this.selectedIndex + this.margin;
		},
		// activate/deactive the scroll buttons based on carousel position
		toggleScrollButtons : function() {
			this.$scrollLeft.removeClass('inactive');
			this.$scrollRight.removeClass('inactive');

			// deactivate scroll buttons if reached start/end
			if (this.selectedIndex == 0) this.$scrollLeft.addClass('inactive');
			if (this.selectedIndex + 1 >= this.itemsCount) this.$scrollRight.addClass('inactive');
		},
		// get the currently selected item
		getSelectedItem : function() {
			return this.$carouselItems.filter(':visible').eq(this.selectedIndex);
		},

		snapToSelection : function() {
			var position = parseInt(this.$carousel.css('left'));
			this.selectedIndex = Math.round((position - this.margin) / (-1 * this.itemWidth));
			this.selectedIndex = (this.selectedIndex < 0) ? 0 : this.selectedIndex;
			this.selectedIndex = (this.selectedIndex + 1 > this.itemsCount) ? this.itemsCount - 1 : this.selectedIndex;
			this.changePosition(100);
		},

		// animate the carousel to its proper position
		changePosition : function(speed, dontExpand) {
			var self = this;
			dontExpand = dontExpand || false;

			this.$carousel.animate({
				left : this.calculateCurrentPosition()
			}, speed, function() {
				self.adjust();
			});

			// because position is changing, we may activate both buttons
			this.toggleScrollButtons();

			// and finally call the selectCallback method if any
			if (!dontExpand && typeof(this.select) == 'function' && this.itemsCount > 0) {
				this.select.apply(this.getSelectedItem());
			}
		},

		// reposition the carousel (most pobably on window resize) to match its parent elements
		adjust : function() {
			this.$carouselWrap.css({
				maxWidth : this.calculateWrapWidth()
			});
			this.calculateCenterMargin();
			this.$carousel.css({
				left : this.calculateCurrentPosition()
			});
		}
	};

	// the proper plugin
	$.fn.jcsdlCarousel = function(options) {
		function get($el) {
			var carousel = $el.data('jcsdlCarousel');
			if (!carousel) {
				carousel = new JCSDLCarousel($el, options);
				$el.data('jcsdlCarousel', carousel);
			}
			return carousel;
		}

		if (typeof(options) == 'string') {
			// call a public method
			if ($.inArray(options, ['adjust']) >= 0) {
				this.each(function() {
					var carousel = get($(this));
					carousel[options].apply(carousel, []);
				});
			}
			return this;
		}

		options = $.extend({}, {
			select : function() {},
			expand : false,
			speed : 200
		}, options);

		this.each(function() {get($(this));});
		return this;
	};
});


JCSDLTargets.Loader.addComponent(function($, undefined) {

    var $win = $(window);

    var JCSDLPopup = function(config) {
		var self = this;

		this.config = $.extend({}, this.config, config);

		this.$overlay = $('<div class="jcsdl-overlay" />').appendTo('body').hide();
		this.$popup = $([
			'<div class="jcsdl-popup">',
				'<div class="jcsdl-popup-header jcsdl-elements-sprite">',
					'<h4 />',
					'<a href="#" class="jcsdl-popup-close jcsdl-elements-sprite">Close</a>',
				'</div>',
				'<div class="jcsdl-popup-content" />',
			'</div>'
		].join('')).appendTo('body').hide();

		if (this.config.title) this.setTitle(this.config.title);
		if (this.config.content) this.setContent(this.config.content);

		this.$popup.css({
			minWidth : this.config.minWidth,
			maxWidth : this.config.maxWidth
		});

		this.setWidth(this.config.width);

		if (this.config.autoshow) this.show();

		/*
		 * REGISTER LISTENERS
		 */
		this.$popup.find('.jcsdl-popup-close').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();
			ev.stopPropagation();

			self.close();
		});

		$(window).resize(function(ev) {
			if (self.$popup.is(':visible')) {
				self.reposition();
			}
		});
	};

	JCSDLPopup.prototype = {
		$popup : $(),
		$overlay : $(),
		config : {
			width : 700,
			minWidth : 280,
			maxWidth : '70%',
			title : '',
			content : '<div class="jcsdl-popup-loading"></div>',
			autoshow : true,
			overlay : true
		},
		getTitle : function() {
			return this.$popup.find('.jcsdl-popup-header h4').html();
		},
		setTitle : function(title) {
			this.$popup.find('.jcsdl-popup-header h4').html(title);
			this.config.title = title;
		},
		getContent : function() {
			return this.$popup.find('.jcsdl-popup-content');
		},
		setContent : function(content) {
            // make sure it's an HTML string for jQuery 1.9
            content = $.trim(content);
            var $content = (typeof content === 'string' && content.charAt(0) !== '<') ? $('<p>' + content + '</p>') : $(content);
			var $popupContent = this.$popup.find('.jcsdl-popup-content');
			$popupContent.html('');

			$content.each(function(i, el) {
				$popupContent.append($(el));
			});

			this.config.content = content;
		},
		setWidth : function(width) {
			this.$popup.width(width);
		},
		reposition : function() {
			this.$popup.css('position', 'fixed');
			this.$popup.find('.jcsdl-popup-content').css('maxHeight', $win.height() * 0.7);

			var leftPos = Math.max(0, ($win.width() - this.$popup.outerWidth()) / 2),
			    topPos = Math.max(0, ($win.height() - this.$popup.outerHeight()) / 2);
	
			this.$popup.css({
				left: leftPos +'px',
				top: topPos +'px'
			});
		},
		show : function() {
			if (this.config.overlay) this.$overlay.show();
			this.$popup.show();
			this.reposition();
		},
		hide : function() {
			this.$overlay.hide();
			this.$popup.hide();
		},
		close : function() {
			this.$overlay.remove();
			this.$popup.remove();
		}
	};

	$.jcsdlPopup = function(config) {
		return new JCSDLPopup(config);
	};


});

JCSDLTargets.Loader.addComponent(function($, undefined) {

	/**
	 * Scrolls the body/document to match the top of the element.

	 * @param  {Number} s[optional] Speed of the animation. Default: 200.
	 * @param  {Number} m[optional] Margin from the top. Default: 0.
	 * @param  {Number} c[optional] Callback.
	 * @return {jQuery}
	 */
	$.fn.animateIntoView = function(s, m, c) {
		s = (s === undefined) ? 200 : s;
		m = parseInt(m) || 0;
		c = (typeof(c) == 'function') ? c : function() {};
		var $t = $(this[0]);

		// break if there's no such item!
		if (!$t.length) return this;

		// if visible then don't animate
		var $b = $('body'),
			$h = $('html'),
			t = $t.offset().top,
			vt = parseInt($b.scrollTop()),
			vb = vt + $(window).height();
		if (vt < t && t < vb) return this;

		$b.add($h).animate({
			scrollTop : t - m
		}, s, c);

		return this;
	};
});

/*
 * Extend some prototypes.
 */
JCSDLTargets.Loader.addComponent(function($, undefined) {

	$.extend(String.prototype, {
		truncate : function(l, a, h) {
			l = l || 72;
			a = a || '...';
			if (this.length <= l) return this.valueOf();

			s = this.substr(0, l);
			if (!h) {
				s = s.substr(0, s.lastIndexOf(' '));
			}

			return s + a;
		},
		isNumeric : function() {
			return (!isNaN(parseInt(this.valueOf())));
		},
		escapeHtml : function() {
			return this.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;');
		},
		unescapeHtml : function() {
			return this.replace(/&amp;/g, '&')
				.replace(/&lt;/g, '<')
				.replace(/&gt;/g, '>')
				.replace(/&quot;/g, '"');
		},
		escapeCsdl : function() {
			return this.replace(/\\(?![,:]+)/g, '\\\\').replace(/"/g, '\\"');
		},
		unescapeCsdl : function() {
			return this.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}
	});

	$.extend(Number.prototype, {
		format : function(decimals, dec_point, thousands_sep) {
		    // Strip all characters but numerical ones.
		    var number = this.toString().replace(/[^0-9+\-Ee.]/g, '');
		    var n = !isFinite(+number) ? 0 : +number,
		        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
		        sep = (thousands_sep === undefined) ? ',' : thousands_sep,
		        dec = (dec_point === undefined) ? '.' : dec_point,
		        s = '',
		        toFixedFix = function (n, prec) {
		            var k = Math.pow(10, prec);
		            return '' + Math.round(n * k) / k;
		        };
		    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
		    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
		    if (s[0].length > 3) {
		        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
		    }
		    if ((s[1] || '').length < prec) {
		        s[1] = s[1] || '';
		        s[1] += new Array(prec - s[1].length + 1).join('0');
		    }
		    return s.join(dec);
		}
	});

});