/**
 * JCSDL Filter carousel as a separate jQuery plugin for easy use.
 */
JCSDL.Loader.addComponent(function($, undefined) {

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
			if ($.browser.msie) {
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

/**
 * JCSDL Number Mask to prevent inputting other characters than digits into number inputs.
 */
JCSDL.Loader.addComponent(function($, undefined) {

	/**
	 * @param  {Boolean} fl  Allow floats?
	 * @param  {Boolean} arr Allow arrays? (commas)
	 * @return {jQuery}
	 */
	$.fn.jcsdlNumberMask = function(fl, arr) {
		this.each(function() {
			$(this).keydown(function(ev) {
				// dot can be entered only once (if float is allowed)
				if ((ev.which == 190 || ev.which == 110) && (($(this).val().indexOf('.') >= 0) || !fl)) {
					ev.preventDefault();
					return;
				}

				// Disallow: anything with shift or alt pressed
				if (ev.shiftKey || ev.altKey) {
					ev.preventDefault();
					return;

				} else if (
		        	// Allow: backspace, delete, tab and escape
		        	ev.which == 46 || ev.which == 8 || ev.which == 9 || ev.which == 27 ||
		        	// Allow: dot (and dot from numpad)
		        	ev.which == 190 || ev.which == 110 ||
		        	// Allow: comma (if array allowed)
		        	(ev.which == 188 && arr) ||
		            // Allow: Ctrl+A
		            (ev.which == 65 && ev.ctrlKey === true) || 
		            // Allow: home, end, left, right
		            (ev.which >= 35 && ev.which <= 39) ||
		            // Allow: enter
		            ev.which == 13
		        ) {
	                // let it happen, don't do anything
	                return;
		        } else {
		            // Ensure that it is a number and stop the keypress
		            if ((ev.which < 48 || ev.which > 57) && (ev.which < 96 || ev.which > 105 )) {
		                ev.preventDefault(); 
		            }   
		        }
			});
		});

		return this;
	};
});

/**
 * JCSDL Tag Input
 */
JCSDL.Loader.addComponent(function($, undefined) {

	$.fn.jcsdlOrigVal = $.fn.val;
	$.fn.val = function(value) {
		if (!this[0]) return undefined;

		var $self = $(this[0]);

		// override only for JCSDL Tag Input field
		if ($self.data('jcsdlTagInput')) {
			// setting a value
			if (value !== undefined) {
				$self.jcsdlOrigVal(value);
				$self.trigger('change');
				return $self;
			}
			/*

			// reading a value
			var values = $self.data('jcsdlTagValue');
			if (values !== undefined && values.length > 0) {
				return values.join(',') + $self.jcsdlOrigVal();
			} else {
				return $self.jcsdlOrigVal();
			}
			*/
		}

		if (value !== undefined) {
			return $self.jcsdlOrigVal(value);
		}

		return $self.jcsdlOrigVal();
	};

	var JCSDLTagInput = function($el, options) {
		var self = this;

		this.delimeter = options.delimeter;
		this.numbers = options.numbers;
		this.floats = options.floats;

		this.$original = $el;
		this.$original.data('jcsdlTagInputEnabled', true);
		this.$wrap = $(this.tpl);
		this.$inputWrap = this.$wrap.find('.jcsdl-tag-field');
		this.$input = this.$inputWrap.find('input');
		this.inputPh = this.$original.attr('placeholder');
		this.$input.attr('placeholder', this.inputPh);

		this.$original.hide().data('jcsdlTagValue', []);
		this.$wrap.insertAfter(this.$original);

		this.$inputSizeHelper = $('<div />').addClass('jcsdl-tag-field-helper').css({
			position: 'absolute',
			left: -9999,
			bottom: -9999,
			minWidth : 100,
			width : 'auto',
			textAlign: 'left'
		}).appendTo(this.$inputWrap);

		if (this.numbers) {
			this.$input.jcsdlNumberMask(this.floats, true);
		}

		this.update();

		/*
		 * REGISTER LISTENERS
		 */
		this.$wrap.bind('click touchstart', function(ev) {
			self.$input.focus();
		});

		this.$original.bind('change.jcsdltaginput', function(ev) {
			if (self.updating || !$(this).data('jcsdlTagInputEnabled')) return;
			self.update();
		});

		this.$input.blur(function(ev) {
			var val = self.$input.val();
			if (val.length == 0) return;

			self.addTag(val);
		});

		this.$input.bind('paste.jcsdltaginput', function(ev) {
			setTimeout(function() {
				var val = self.$input.val();
				if (val.length == 0) return;

				self.addTag(val);
			}, 10);
		});

		this.$input.bind('keypress.jcsdltaginput', function(ev) {
			var val = $(this).val();

			if (ev.which == 13) {
				ev.preventDefault();
				self.addTag($(this).val());
				return;
			}

			self.reposition();
		});

		this.$input.bind('keydown.jcsdltaginput', function(ev) {
			if (ev.which == 8 && $(this).val().length == 0) {
				ev.preventDefault();
				self.removeTag(self.$wrap.find('.jcsdl-tag:last'));
			}
		});

		this.$input.bind('keyup.jcsdltaginput', function(ev) {
			var val = $(this).val();
			if (val.charCodeAt(val.length - 1) == self.delimeter.charCodeAt(0)) {
				if (val.charAt(val.length - 2) == '\\') return; // escaped
				self.addTag(val.substr(0, val.length - 1));
			}
		});
	}

	JCSDLTagInput.prototype = {
		/* templates */
		tpl : [
			'<div class="jcsdl-tag-input">',
				'<div class="jcsdl-tag-field">',
					'<input type="text" />',
				'</div>',
			'</div>'
		].join(''),
		tagTpl : [
			'<span class="jcsdl-tag">',
				'<span />',
				'<a href="#" class="jcsdl-tag-remove jcsdl-elements-sprite" title="Remove"></a>',
			'</span>'
		].join(''),

		/* vars */
		updating : false,
		delimeter : ',',
		numbers : false,
		numbersArrVal : [],
		floats : false,

		/* functions */
		addTag : function(val) {
			this.$input.val('');

			if (val === undefined || val.length == 0) return;
			var self = this;

			var $tag = $(this.tagTpl);
			$tag.find('span').html(val.truncate());
			$tag.insertBefore(this.$inputWrap);

			var values = this.$original.data('jcsdlTagValue');
			values.push(val);
			this.$original.data('jcsdlTagValue', values);
			this.$original.val(values.join(this.delimeter));

			this.$input.attr('placeholder', ''); // clear placeholder when there's tag content

			// remove the tag
			$tag.find('a').bind('click touchstart', function(ev) {
				ev.preventDefault();
				ev.target.blur();
				self.removeTag($tag);
			});

			this.reposition();
		},

		removeTag : function($tag) {
			if ($tag.length == 0) return;

			var i = this.$wrap.find('.jcsdl-tag').index($tag);
			$tag.remove();

			var values = this.$original.data('jcsdlTagValue');
			values.splice(i, 1);
			this.$original.data('jcsdlTagValue', values);
			this.$original.val(values.join(this.delimeter));

			if (values.length == 0) {
				this.$input.attr('placeholder', this.inputPh);
			}

			this.reposition();
		},

		/* public functions */
		update : function(space) {
			var delimeter = (space) ? new RegExp(/[\s,]+/g) : this.delimeter;

			// load from the current original value
			var origVal = this.$original.val();
			if (origVal.length == 0) return;

			var self = this;

			// clear all current tags
			this.$original.data('jcsdlTagValue', []);
			this.$wrap.find('.jcsdl-tag').remove();

			this.updating = true;

			var values = origVal.split(delimeter);
			var fixedValues = [];
			// but look for escaped items as well
			$.each(values, function(i, val) {
				if (val === undefined) return true; // continue

				if (val.charAt(val.length - 1) == '\\') {
					val += self.delimeter + values[i + 1];
					values.splice(i + 1, 1);
				}
				
				fixedValues.push(val);
			});
			values = fixedValues;

			$.each(values, function(i, val) {
				self.addTag(val);
			});

			this.updating = false;

			this.reposition();
		},

		reposition : function() {
			var text = this.$input.val().escapeHtml();
			if (text.length == 0) text = this.$input.attr('placeholder');

			this.$inputSizeHelper.html(text);
			this.$input.css({
				width: this.$inputSizeHelper.width() + 32 + 'px',
				maxWidth : this.$wrap.width() - 30,
				'font-size' : this.$input.css('font-size'),
				'font-family' : this.$input.css('font-family'),
				'font-weight' : this.$input.css('font-weight'),
				'letter-spacing' : this.$input.css('letter-spacing'),
				whiteSpace : 'nowrap'
			});
		},

		enable : function() {
			if (this.numbers) {
				if (!this.$original.data('jcsdlTagInputEnabled')) {
					this.numbersArrVal[0] = this.$original.val();
				} else {
					this.numbersArrVal = this.$original.val().split(this.delimeter);
				}
			}

			this.$original.data('jcsdlTagInputEnabled', true);

			if (this.numbers) {
				this.$original.val(this.numbersArrVal.join(this.delimeter));
			}

			this.$original.hide();
			this.$wrap.show();
		},

		disable : function() {
			if (this.numbers) {
				var val = '';
				if (this.$original.data('jcsdlTagInputEnabled')) {
					this.numbersArrVal = this.$original.val().split(this.delimeter);
					val = this.numbersArrVal[0];
				} else {
					val = this.$original.val();
				}
			}

			this.$original.data('jcsdlTagInputEnabled', false);

			if (this.numbers) {
				this.$original.val(val);
			}

			this.$original.show();
			this.$wrap.hide();
		}
	};

	// the proper plugin
	$.fn.jcsdlTagInput = function(options) {
		function get($el) {
			var tagInput = $el.data('jcsdlTagInput');
			if (!tagInput) {
				tagInput = new JCSDLTagInput($el, options);
				$el.data('jcsdlTagInput', tagInput);
			}
			return tagInput;
		}

		if (typeof(options) == 'string') {
			// call a public method
			if ($.inArray(options, ['enable', 'disable', 'reposition', 'update', 'setDelimeter']) >= 0) {
				var argmns = [];
				$.each(arguments, function(i, arg) {
					if (i == 0) return true;
					argmns.push(arg);
				});

				this.each(function() {
					var tagInput = get($(this));
					tagInput[options].apply(tagInput, argmns);
				});
			}
			return this;
		}

		options = $.extend({}, {
			delimeter : ',',
			numbers : false,
			floats : false
		}, options);

		this.each(function() {get($(this));});
		return this;
	};

});

/*
 * REGEXP Tester for JCSDL
 */
JCSDL.Loader.addComponent(function($, undefined) {

	var JCSDLRegExTester = function($el, config) {
		var self = this;

		this.$el = $el;
		this.exp = new RegExp();

		this.$btn = $('<a href="#" class="jcsdl-regex-tester-button jcsdl-elements-sprite">Test</a>').insertAfter(this.$el);
		
		this.$wrap = $('<div class="jcsdl-regex-tester"><p>If you want to test whether your regular expression correctly matches the desired strings, click the "Test" button and input example content in the shown field.</p></div>').insertAfter(this.$el).hide();
		this.$fields = $();
		this.$fieldsWraps = $();

		for(var i = 1; i <= config.fields; i++) {
			var $field = this.$el.clone().removeClass('orig').show().attr('placeholder', 'Test your expression against this field...');
			var $fieldWrap = $('<div class="jcsdl-regex-tester-input-wrap" />').html($field).append('<div class="jcsdl-regex-result jcsdl-elements-sprite" />');

			$fieldWrap.prependTo(this.$wrap);

			this.$fields = this.$fields.add($field);
			this.$fieldsWraps = this.$fieldsWraps.add($fieldWrap);
		}

		this.$btn.bind('click touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			self.$fieldsWraps.fadeIn();
			$(this).addClass('active');
		});

		this.$el.bind('keyup change', function(ev) {
			self.val = self.$el.val();
			self.test();
		});

		this.$fields.bind('keyup', function(ev) {
			self.test($(this));
		});

		this.disable(); // disabled by default
	};

	JCSDLRegExTester.prototype = {
		mode : 'partial',
		val : '',
		test : function($fields) {
			var self = this;
			var $fields = ($fields !== undefined) ? $fields : this.$fields;

			var pattern = this.val.replace(/\//g, '\/');
			var exp = (this.mode == 'partial') ? '' + pattern + '' : '^' + pattern + '$';
			this.exp = new RegExp(exp, 'i');

			$fields.each(function(i, field) {
				if ($(field).val().length == 0 || self.val.length == 0) {
					$(field).siblings('.jcsdl-regex-result').hide();
					return true;
				}

				var result = (self.exp.test($(field).val())) ? 'ok' : 'err';
				$(field).siblings('.jcsdl-regex-result').removeClass('ok err').addClass(result).fadeIn();
			});
		},
		enable : function() {
			this.$el.data('jcsdlRegExTesterEnabled', true);
			this.$el.addClass('jcsdl-regex-active');
			this.$wrap.fadeIn();
			this.$btn.fadeIn();
		},
		disable : function() {
			this.$el.data('jcsdlRegExTesterEnabled', false);
			this.$el.removeClass('jcsdl-regex-active');
			this.$wrap.hide();
			this.$fieldsWraps.hide();
			this.$btn.hide();
		},
		setPartial : function() {
			this.mode = 'partial';
		},
		setExact : function() {
			this.mode = 'exact';
		}
	};

	$.fn.jcsdlRegExTester = function(options) {
		function get($el) {
			var tester = $el.data('jcsdlRegExTester');
			if (!tester) {
				tester = new JCSDLRegExTester($el, options);
				$el.data('jcsdlRegExTester', tester);
			}
			return tester;
		}

		if (typeof(options) == 'string') {
			// call a public method
			if ($.inArray(options, ['enable', 'disable', 'setPartial', 'setExact', 'test']) >= 0) {
				this.each(function() {
					var tester = get($(this));
					tester[options].apply(tester, []);
				});
			}
			return this;
		}

		options = $.extend({}, {
			fields : 1
		}, options);

		this.each(function() {get($(this));});
		return this;
	}

});

JCSDL.Loader.addComponent(function($, undefined) {

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
			var $content = $(content);
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
			this.$popup.css('position', 'absolute');
			this.$popup.find('.jcsdl-popup-content').css('maxHeight', $(window).height() * 0.7);

			var leftPos = ($(window).width() - this.$popup.outerWidth()) / 2 + $(window).scrollLeft();
			var topPos = ($(window).height() - this.$popup.outerHeight()) / 2 + $(window).scrollTop();
			
			if(topPos < 0) topPos = 0;
			if(leftPos < 0) leftPos = 0;
	
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

JCSDL.Loader.addComponent(function($, undefined) {

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
 * A hack to load the Google Maps API asynchronously and call the appropriate callback.
 * All needs to be in global namespace.
 */
var jcsdlMapsLoaded = false;
var jcsdlMapsCurrentGui = null;
var jcsdlMapsCurrentCallback = function() {};
var jcsdlMapsCurrentCallbackArgs = [];
var jcsdlMapsOptions = {};

var loadGoogleMapsApi = function(currentGui, callback, callbackArgs) {
	jcsdlMapsCurrentGui = currentGui;
	jcsdlMapsCurrentCallback = callback;
	jcsdlMapsCurrentCallbackArgs = callbackArgs;

	if (!jcsdlMapsLoaded) {
		var incKey = (jcsdlMapsCurrentGui.config.googleMapsApiKey.length > 0) ? 'key=' + jcsdlMapsCurrentGui.config.googleMapsApiKey + '&' : '';
		var incProtocol = (window.location.protocol == 'file:') ? 'http:' : ''; // if not loaded from file then allow for dynamic protocol
		jQuery('body').append('<script type="text/javascript" src="' + incProtocol + '//maps.googleapis.com/maps/api/js?' + incKey + 'libraries=places,geometry&sensor=false&callback=jcsdlMapsInit" />');
		jcsdlMapsLoaded = true;
	} else {
		jcsdlMapsInit();
	}
};

var jcsdlMapsInit = function() {
	jcsdlMapsOptions = {
		center: new google.maps.LatLng(40, 0),
		zoom: 1,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		mapTypeControl: true,
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
		},
		navigationControl: true,
		navigationControlOptions: {
			style: google.maps.NavigationControlStyle.SMALL
		}
	};

	// extend the Polygon of Google Maps API
	if (!google.maps.Polygon.prototype.getBounds) {
        google.maps.Polygon.prototype.getBounds = function(latLng) {
            var bounds = new google.maps.LatLngBounds();
            var paths = this.getPaths();
            var path;
            for (var p = 0; p < paths.getLength(); p++) {
                path = paths.getAt(p);
                for (var i = 0; i < path.getLength(); i++) {
                    bounds.extend(path.getAt(i));
                }
            }
            return bounds;
        };
    }

	if (jcsdlMapsCurrentGui && jcsdlMapsCurrentCallback) {
		setTimeout(function() {
			jcsdlMapsCurrentCallback.apply(jcsdlMapsCurrentGui.inputs, jcsdlMapsCurrentCallbackArgs);
		}, jcsdlMapsCurrentGui.config.animate + 10); // make sure the map canvas is fully visible before loading them
	}
};

/*
 * Extend some prototypes.
 */
JCSDL.Loader.addComponent(function($, undefined) {

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