JCSDL.Loader.addComponent(function($, undefined) {

	this.GUILogic = function(gui, logic) {
		var self = this;

		// reference some useful or required elements of the GUI
		this.gui = gui;
		this.config = gui.config;
		this.parser = gui.parser;

		// reference some functions that we'd want to reuse
		this.getTemplate = gui.getTemplate; // note: it will lose scope, so if this function is using 'this' keyword, better create a proxy function

		/*
		 * SETUP
		 */
		this.$logicOptions = gui.$mainView.find('.jcsdl-filters-logic .jcsdl-filters-logic-option:not(.jcsdl-advanced-option)');
		this.$advancedOptions = gui.$mainView.find('.jcsdl-filters-logic .jcsdl-filters-logic-option.jcsdl-advanced-option');
		this.$insertBracketsButton = this.$advancedOptions.filter('.jcsdl-advanced-add-brackets');
		this.$editor = gui.$mainView.find('.jcsdl-advanced-container');

		this.$guiContainer = this.initGui(this.$editor.find('.jcsdl-advanced-gui-container'));
		this.$gui = this.$guiContainer.find('.jcsdl-advanced-gui');
		this.$manual = this.$editor.find('.jcsdl-advanced-manual');
		this.$manualInput = this.initManualInput(this.$manual.find('input'));

		/*
		 * REGISTER LISTENERS
		 */
		/**
		 * Set the logic upon selection.
		 * 
		 * @param  {Event} ev
		 */
		this.$logicOptions.click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var $el = $(this);

			// ignore when disabled or already active
			if ($el.is('.disabled') || $el.is('.active')) return false;

			self.$logicOptions.removeClass('active');
			$el.addClass('active');

			self.logic = $el.data('logic');
			self.trigger('logicChange', [self.logic]);

			if (self.logic == self.ADVANCED) {
				self.showEditor();

				// display short text on the other logic options
				self.$logicOptions.not('.jcsdl-advanced').each(function() {
					var $el = $(this);
					$el.html($el.data('textShort'));
				});

				// display advanced options
				self.$advancedOptions.fadeIn(self.config.animate);
			} else {
				self.clearErrors();
				self.hideEditor();

				// display long text on the other logic options
				self.$logicOptions.not('.jcsdl-advanced').each(function() {
					var $el = $(this);
					$el.html($el.data('textLong'));
				});

				// hide advanced options
				self.$advancedOptions.hide();
			}
		});

		/**
		 * Initiate Tipsy on the advanced logic help icon and trigger it on click.
		 */
		this.$logicOptions.filter('.jcsdl-advanced').find('.jcsdl-logic-help').tipsy({
			gravity : 's',
			trigger : 'manual',
			title : function() {
				if (self.$editor.is(':visible')) {
					return $(this).data(self.$manual.is(':visible') ? 'textManual' : 'textGui');
				} else {
					return $(this).data('textGeneral');
				}
			}
		}).click(function(ev) {
			ev.preventDefault();
			ev.target.blur();
			ev.stopPropagation();

			var $el = $(this);
			$el.tipsy('show');

			$('body').one('click', function(ev) {
				$el.tipsy('hide');
			});
		});

		/**
		 * Toggle switch between manual and graphical advanced edit.
		 * 
		 * @param  {Event} ev Click Event.
		 */
		this.$advancedOptions.filter('.jcsdl-advanced-manual-edit').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var $el = $(this);
			if ($el.is('.on')) {
				// cannot switch until given expression is valid
				try {
					self.validate(self.getManualString());
				} catch(e) {
					self.showError(e);
					return;
				}

				$el.removeClass('on');
				$el.html($el.data('textGui'));
				
				self.$manualInput.blur();
				self.$manual.hide();

				self.$guiContainer.fadeIn(self.config.animate);

				// activate brackets inserting button
				self.$insertBracketsButton.removeClass('disabled');

				// update the GUI
				self.setGuiString();

			} else {
				// cannot switch until given expression is valid
				try {
					self.validate(self.getGuiString());
				} catch(e) {
					self.showError(e);
					return;
				}

				$el.addClass('on');
				$el.html($el.data('textManual'));

				// update the manual input
				self.setManualString();
				
				self.$guiContainer.hide();

				self.$manual.fadeIn(self.config.animate);
				self.$manualInput.focus();

				// deactivate brackets inserting button
				self.$insertBracketsButton.addClass('disabled');

			}
		});

		// final setup
		try {
			this.setLogic(logic);
		} catch(e) {
			this.showError(e, true);
		}

		// TODO: potentially make the editor sticky on scrolling
	};

	this.GUILogic.prototype = {
		// constants
		ADVANCED : 'ADVANCED',
		AND : 'AND',
		OR : 'OR',

		/**
		 * Parses the logical string into an array of tokens.
		 * 
		 * @param  {String} logicString[optional] Logical string. If none set it will use the global logicalString.
		 * @return {Array}
		 */
		tokenize : function(logicString) {
			logicString = logicString || this.logicString;
			return this.parser.tokenizeLogicString(logicString);
		},

		/**
		 * Validates the given logical string if it's properly built.
		 * Throws {JCSDL.LogicValidationException} in cases of invalid elements.
		 * 
		 * @param  {mixed} logicString[optional] Logical string. If none set it will use the global logicalString. Can also be already tokenized string.
		 * @param  {Array} availableFilters[optional] Array of available filters in the editor. If provided, it will also validate that all filters are used. If not provided it will fetch them from the GUI itself.
		 * @return {Boolean}
		 */
		validate : function(logicString, availableFilters) {
			logicString = logicString || this.logicString;
			availableFilters = availableFilters || this.gui.filters;
			return this.parser.validateLogic(logicString, availableFilters);
		},

		/**
		 * Shows the advanced logic editor.
		 */
		showEditor : function() {
			this.$editor.show();
			this.adjustGui();
			this.$editor.hide().slideDown(this.config.animate);
		},

		/**
		 * Hides the advanced logic editor.
		 */
		hideEditor : function() {
			this.$editor.slideUp(this.config.animate);
		},

		/**
		 * Activates (or disables) the logic option buttons.
		 * @param  {Boolean} on[optional] True for activate, false for disable. Default: true.
		 */
		toggleButtons : function(on) {
			on = (on === undefined) ? true : on;
			
			// if disabling then also select 'AND' to hide the advanced logic editor (no longer needed and shouldnt stay visible)
			if (!on) {
				this.setLogic(this.AND);
			}

			this.$logicOptions[on ? 'removeClass' : 'addClass']('disabled');
		},

		/**
		 * Shows an error.
		 * 
		 * @param  {mixed} error Error message to be displayed. Can also be a JCSDL.LogicValidationException instance.
		 * @param  {Boolean} silent[optional] Don't print the error to the console? Default: false.
		 */
		showError : function(error, silent) {
			silent = silent || false;
			// clear all previous errors
			this.clearErrors();

			var message = (error instanceof JCSDL.LogicValidationException) ? error.message : error;

			var $error = this.getTemplate('error');
			$error.find('span').html(message);

			$error.insertAfter(this.$editor);
			$error.show();

			if (!silent && console !== undefined) {
				console.error(error, arguments);
			}

			// if validation exception then also highlight invalid token in the gui (if it's active)
			if (error instanceof JCSDL.LogicValidationException && this.$gui.is(':visible')) {
				if (error.index >= 0) {
					var $token = this.$gui.children().
						not('.jcsdl-token-ph')
							.eq(error.index)
								.find('.jcsdl-logic-token')
									.addClass('error');
					this.scrollGuiToToken($token);
				}
			}

			$error.animateIntoView(this.config.animate);
		},

		/**
		 * Trigger an event handler defined in the config.
		 * 
		 * @param  {String} name Name of the event handler.
		 * @param  {Array} data[optional] Arguments to pass to the handler.
		 * @return {mixed} Whatever the handler returns.
		 */
		trigger : function(name, data) {
			this.gui.trigger(name, data);
		},

		/**
		 * Clears all errors.
		 */
		clearErrors : function() {
			this.gui.clearErrors();
			this.$gui.find('.error').removeClass('error');
		},

		/* ##########################
		 * GUI EDITOR
		 * ########################## */
		/**
		 * Initializes the GUI editor of the logical expression.
		 * 
		 * @param  {jQuery} $view GUI editor element.
		 * @return {jQuery}
		 */
		initGui : function($view) {
			var self = this,
				$gui = $view.find('.jcsdl-advanced-gui'),
				// helper vars for scrolling
				scrollInterval = null,
				scrollSpeed = 50;

			// link up left and right arrows for scrolling
			this.$guiLeft = $view.find('.jcsdl-advanced-gui-arrow.left');
			this.$guiRight = $view.find('.jcsdl-advanced-gui-arrow.right');

			// make the tokens sortable
			$gui.sortable({
				cursor : 'move',
				placeholder : 'jcsdl-token-ph',
				containment : this.$editor,
				appendTo : this.$editor,
				helper : 'clone',
				tolerance : 'intersect',
				start : function(ev, ui) {
					if (ui.item.find('.jcsdl-logic-token').is('.bracket')) {
						$gui.find('.jcsdl-token-ph').addClass('bracket');
					}
				},
				stop : function(ev, ui) {
					// turn off highlighting of the related filter
					var $token = ui.item.find('.jcsdl-logic-token');
					if ($token.is('.filter')) {
						self.gui.highlightFilter($token.data('token'), false);
					}
				},

				// make scrolling possible based on absolute position of the helper (ie. if it's above one of the arrows then scroll the GUI)
				sort : function(ev, ui) {
					// turn off any previous scrolling for safety
					clearInterval(scrollInterval);

					// NOTE: the arrows need to be visible to allow scrolling
					// are we scrolling to the right?
					if (self.$guiRight.is(':visible') && (ui.offset.left + ui.helper.width() / 2) >= self.$guiRight.offset().left) {
						scrollInterval = setInterval(function() {
							self.scrollGui('right', scrollSpeed);
						}, scrollSpeed);
					}

					// are we scrolling to the left?
					if (self.$guiLeft.is(':visible') && ui.offset.left <= (self.$guiLeft.offset().left + ui.helper.width() / 2)) {
						scrollInterval = setInterval(function() {
							self.scrollGui('left', scrollSpeed);
						}, scrollSpeed);
					}

					// highlight the related filter that's being dragged
					var $token = ui.helper.find('.jcsdl-logic-token');
					if ($token.is('.filter')) {
						self.gui.highlightFilter($token.html()); // use .html() because .data() apparently isn't cloned properly
					}
				},

				// update (and validate first) the internal logic string upon done sorting
				update : function(ev, ui) {
					// make sure scrolling has stopped
					clearInterval(scrollInterval);

					setTimeout(function() {
						self.updateFromGui();
					}, 100);
				}
			});

			// hack to make horizontal sortable working smoothly
			$gui.data('sortable').floating = true;
			$gui.data('uiSortable').floating = true;

			/*
			 * REGISTER LISTENERS
			 */
			/**
			 * Insert brackets to the GUI editor
			 * 
			 * @param  {Event} ev Click event.
			 */
			this.$insertBracketsButton.click(function(ev) {
				ev.preventDefault();
				ev.target.blur();

				// ignore when disabled
				if ($(this).is('.disabled')) return false;

				self.addGuiToken(')', true, true);
				self.updateFromGui();
			});

			/**
			 * Start scrolling on mousedown or touchstart events.
			 */
			this.$guiRight.add(this.$guiLeft).bind('mousedown touchstart', function(ev) {
				var dir = $(this).is('.right') ? 'right' : 'left';
				scrollInterval = setInterval(function() {
					self.scrollGui(dir, scrollSpeed);
				}, scrollSpeed);

			// mouse up will remove the interval (mouseleave as well)
			}).bind('mouseup mouseleave touchend', function(ev) {
				clearInterval(scrollInterval);

			// and prevent default behavior on click()
			}).click(function(ev) {
				ev.preventDefault();
				ev.target.blur();
			});

			/**
			 * Adjust the GUI on window resizes.
			 */
			$(window).resize(function(ev) {
				self.adjustGui();
			});

			return $view;
		},

		/**
		 * Updates the internal logic string from the GUI editor.
		 */
		updateFromGui : function() {
			var tokens = this.getGuiTokens();

			try {
				if (this.validate(tokens)) {
					this.clearErrors();
					this.logicString = tokens.join('');
				}
			} catch(e) {
				this.showError(e, true);
			}
		},

		/**
		 * Sets the given string inside the GUI editor of the logical expression.
		 * 
		 * @param {mixed} logicString[optional] Logical string. If none set it will use the global logicalString. Can also be already tokenized string.
		 */
		setGuiString : function(logicString) {
			logicString = logicString || this.logicString;

			var self = this,
				// automatically tokenize the logic string if a string indeed supplied
				tokens = (typeof logicString === 'string' || typeof logicString === 'number') ? this.tokenize(logicString) : logicString;

			this.clearGui();

			$.each(tokens, function(i, token) {
				self.addGuiToken(token, false);
			});
		},

		/**
		 * Reads the logic string from the GUI editor.
		 * 
		 * @param  {jQuery} $gui[optional] GUI editor DOM element. If ommitted it will use the global one.
		 * @return {String}
		 */
		getGuiString : function($gui) {
			$gui = $gui || this.$gui;

			var str = '';

			$gui.find('.jcsdl-logic-token').each(function() {
				str += '' + $(this).data('token'); // ensure string
			});

			return str;
		},

		/**
		 * Reads the logic string in the form of tokens from the GUI editor.
		 * 
		 * @param  {jQuery} $gui[optional] GUI editor DOM element. If ommitted it will use the global one.
		 * @return {Array}
		 */
		getGuiTokens : function($gui) {
			$gui = $gui || this.$gui;

			var tokens = [];
			$gui.find('.jcsdl-logic-token').each(function() {
				tokens.push($(this).data('token'));
			});

			return tokens;
		},

		/**
		 * Clears all tokens from the GUI editor.
		 */
		clearGui : function() {
			this.$gui.width(0)
				.children().remove();
		},

		tokensMap : {
			'(' : 'bracketOpen',
			')' : 'bracketClose',
			'&' : 'operatorAnd',
			'|' : 'operatorOr',
			'filter' : 'filter'
		},

		/**
		 * Adds a GUI token to the GUI editor of logic.
		 * 
		 * @param {String} token Logic token.
		 * @param {Boolean} scroll[optional] Should the new token be scrolled into view? Default: true.
		 * @param {Boolean} manual[optional] Is it a manual trigger? For internal use. Default: false.
		 */
		addGuiToken : function(token, scroll, manual) {
			scroll = (scroll === undefined) ? true : scroll;
			manual = (manual === undefined) ? false : manual;

			var self = this,
				t = (typeof token == 'number') ? 'filter' : token;

			if (this.tokensMap[t] === undefined) {
				throw 'Invalid character "' + token + '" in the logic!';
			}

			var $token = this.getTemplate('logicToken_' + this.tokensMap[t])
					.data('token', token),
				$open = $();

			// if a filter then set content to filter ID
			if (t == 'filter') {
				$token.html(token);
			}

			var $li = $('<li class="jcsdl-logic-token-wrap" />').html($token).appendTo(this.$gui);
			this.$gui.width(this.$gui.width() + $li.outerWidth(true));

			// if adding a parenthesis (closing one) also add the opening one in appropriate place
			if (token == ')' && manual) {
				$open = this.getTemplate('logicToken_bracketOpen')
					.data('token', '(');

				// find position where to insert it
				var tokens = this.getGuiTokens().reverse(),
					pos = tokens.length,
					level = -1, // take into account that there is the new parenthesis at the end already
					logic = null; // lowest level logic (level 0 logic)
				$.each(tokens, function(i, token) {
					if (token == ')') level++;
						else if (token == '(') level--;

					if (level == 0 && $.inArray(token, ['&', '|']) >= 0) {
						if (logic !== null && token !== logic) {
							// if there is a change of logic at level 0 then this is where we insert the opening bracket!
							pos = i;
							return false; // break
						}

						logic = token;
					}
				});

				var $before = this.$gui.children().eq(tokens.length - pos),
					$openLi = $('<li class="jcsdl-logic-token-wrap" />').html($open).insertBefore($before);
				this.$gui.width(this.$gui.width() + $openLi.outerWidth(true));
			}

			this.updateFromGui();
			this.adjustGui();

			if (scroll) {
				this.scrollGuiToToken($token);
			}

			/**
			 * Prevent any clicks on the token.
			 * 
			 * @param  {Event} ev Click event.
			 */
			$token.click(function(ev) {
				ev.preventDefault();
				ev.target.blur();

				// toggle logical operator
				if ($token.data('token') == '&') {
					$token.data('token', '|').html('OR');
				} else if ($token.data('token') == '|') {
					$token.data('token', '&').html('AND');
				}

				self.updateFromGui();
			});

			// delete token
			$token.add($open).find('.jcsdl-delete-token').click(function(ev) {
				ev.preventDefault();
				ev.target.blur();
				ev.stopPropagation(true);

				self.deleteGuiToken($token);
			});

			/**
			 * Highlight related filter in the filter's list on hover over a filter tile.
			 */
			$token.filter('.filter').hover(function(ev) {
				self.gui.highlightFilter($(this).data('token'));
			}, function(ev) {
				self.gui.highlightFilter($(this).data('token'), false);
			});
		},

		/**
		 * Removes the given filter ID from the GUI editor as well as its' corresponding logical operator.
		 * @param  {Number} filterId ID of the filter to be removed.
		 */
		deleteGuiFilterToken : function(filterId) {
			filterId = parseInt(filterId); // ensure {Number}

			var $filter = $(),
				$operator = $();

			// find this filter's token
			this.$gui.children().each(function() {
				var $li = $(this);
				if (parseInt($li.find('.jcsdl-logic-token').data('token')) === filterId) {
					$filter = $li;
					return false; // break
				}
			});

			if (!$filter.length) return false; // for some reason couldnt find it

			// remove any brackets that this filter id could be wrapped in (e.g. ((((2)))) )
			while(
				$filter.prev().find('.jcsdl-logic-token').data('token') == '('
				&& $filter.next().find('.jcsdl-logic-token').data('token') == ')'
			) {
				$filter.prev().remove();
				$filter.next().remove();
			}

			// now remove the operator in front (if indeed an operator)
			if ($filter.prev().find('.jcsdl-logic-token.operator').length) {
				$operator = $filter.prev();
			} else if ($filter.next().find('.jcsdl-logic-token.operator').length) {
				$operator = $filter.next();
			}

			// remove the filter and the operator
			$filter.remove();
			$operator.remove();

			// update the logic string
			this.updateFromGui();
		},

		/**
		 * Deletes the given token from the GUI editor.
		 * 
		 * @param {jQuery} $token Can be either <li> element with the token or the token itself.
		 */
		deleteGuiToken : function($token) {
			var $li = ($token.is('.jcsdl-logic-token')) ? $token.closest('li.jcsdl-logic-token-wrap') : $token;
			if (!$li.is('li.jcsdl-logic-token-wrap')) return false;

			// make sure that $token is the token itself
			var $token = $li.find('.jcsdl-logic-token');

			// cannot delete operators
			if ($token.is('.operator')) return false;

			// if this is a filter then check if this filter exists and if so block deleting of it
			if ($token.is('.filter')) {
				var filterId = $token.data('token'),
					exists = false;

				$.each(this.gui.filters, function(i, filter) {
					if (parseInt(filter.id) == parseInt(filterId)) {
						exists = true;
						return false; // break
					}
				});

				// if the filter exists then don't allow to delete it
				if (exists) return false;

			} else if ($token.is('.bracket')) {
				// if deleting a parenthesis then find its pair and also delete it
				var tokens = this.getGuiTokens(),
					pos = this.$gui.children().index($li),
					found = null,
					level = 0, // current nesting level in the foreach below
					onLevel = 0, // on which level to search for pair
					searching = ')', // searching for the closing parenthesis
					lvlIncr = '(', // increase level on this token
					lvlDecr = ')'; // decrease level on this token

				if ($token.data('token') == ')') {
					// if closing parenthesis then search in reverse
					tokens = tokens.reverse();
					pos = tokens.length - 1 - pos; // adjust the position as well
					searching = '('; // searching for the opening parenthesis
					lvlIncr = ')'; // increase level on this token
					lvlDecr = '('; // decrease level on this token
				}

				$.each(tokens, function(i, t) {
					// if we reached the parenthesis that is being deleted then on this level we should search for a match as well
					if (i == pos) {
						onLevel = level;
						return true;
					}

					// if we passed past the token that is being deleted, then start proper search
					if (onLevel !== null && level == onLevel && i > pos && t == searching) {
						// if search is reversed then also reverse the result
						found = (searching == '(') ? tokens.length - 1 - i : i;
						return false; // break when found
					}

					if (t == lvlIncr) level++;
						else if (t == lvlDecr) level--;
				});

				if (found !== null) {
					// make sure to filter the children to exclude any possible sortable placeholder
					var $found = this.$gui.children().filter('.jcsdl-logic-token-wrap').eq(found);
					this.$gui.width(this.$gui.width() - $found.outerWidth(true));

					$found.remove();
				}
			}

			this.$gui.width(this.$gui.width() - $li.outerWidth(true));
			$li.remove();

			this.updateFromGui();
			this.adjustGui();
		},

		/**
		 * Helper variable to throttle adjusting the GUI.
		 * @type {mixed}
		 */
		_adjustGuiTimeout : null,

		/**
		 * Adjusts GUI arrows, positioning and sizing.
		 * Throttled by a timeout.
		 */
		adjustGui : function() {
			var self = this,
				width = 0;

			this.$gui.children().each(function() {
				width += parseInt($(this).outerWidth(true));
			});
			this.$gui.width(width);

			clearTimeout(this._adjustGuiTimeout);
			this._adjustGuiTimeout = setTimeout(function() {
				var width = self.$gui.width(),
					containerWidth = self.$guiContainer.width();

				if (width > containerWidth) {
					self.$guiRight.removeClass('off');
				} else {
					// if gui width is smaller than container width then there's no need for scrolling
					self.$guiLeft.add(self.$guiRight).addClass('off');
					// make sure it's scrolled to beginning tho
					self.scrollGuiToStart();
				}
			}, 50);
		},

		/**
		 * Scrolls the GUI left or right.
		 * 
		 * @param {mixed} dir Direction {String} left/right in which to scroll or position {Number} in pixels.
		 * @param {Number} speed[optional] Animation duration. Default: 50.
		 */
		scrollGui : function(dir, speed) {
			speed = (speed == undefined) ? 50 : speed;
			
			// if gui width is smaller than the container's then min offset is 0
			var boundary = -1 * Math.max(0, this.$gui.width() - this.$guiContainer.width()),
				pos = 0,
				self = this;

			if (typeof dir === 'number') {
				pos = dir;
			} else {
				// offset difference to apply to scroll
				var offset = (dir == 'right') ? -30 : 30;
				pos = parseInt(this.$gui.css('left')) + offset;
			}

			// make sure the new position is not outside scroll boundaries
			pos = Math.max(Math.min(0, pos), boundary);

			// scroll the GUI to the new position
			this.$gui.stop(true, true).animate({
				left : pos
			}, speed, function() {
				// adjust visibility of left and right arrows
				self.$guiLeft[pos == 0 ? 'addClass' : 'removeClass']('off');
				self.$guiRight[pos == boundary ? 'addClass' : 'removeClass']('off');
			});
		},

		/**
		 * Scrolls the GUI editor to the beginning.
		 */
		scrollGuiToStart : function() {
			this.scrollGui(0);
		},

		/**
		 * Scrolls the GUI editor to the end.
		 */
		scrollGuiToEnd : function() {
			this.scrollGuiToToken(this.$gui.children().last());
		},

		/**
		 * Scrolls the GUI editor to make the given token visible.
		 * 
		 * @param  {jQuery} $token Can be either <li> element with the token or the token itself.
		 */
		scrollGuiToToken : function($token) {
			$token = ($token.is('.jcsdl-logic-token')) ? $token.closest('li.jcsdl-logic-token-wrap') : $token;
			if (!$token.is('li.jcsdl-logic-token-wrap')) return false;

			var offset = -1 * $token.position().left,
				pos = (parseInt(this.$gui.css('left')) < offset) ? offset - 60 : offset + 60;

			this.scrollGui(offset + 140);
		},

		/* ##########################
		 * MANUAL EDITOR
		 * ########################## */
		/**
		 * Initializes the manual editor of the logic.
		 * 
		 * @param  {jQuery} $input Input on which to initialize the editor.
		 * @return {jQuery}
		 */
		initManualInput : function($input) {
			var self = this;

			/*
			 * REGISTER LISTENERS
			 */
			var updateTimeout = null;
			/**
			 * Update the internal logic string (and validate it) when user stopped typing.
			 * @param  {Event} ev Keyup event.
			 */
			$input.keyup(function(ev) {
				clearTimeout(updateTimeout);
				updateTimeout = setTimeout(function() {
					var str = $input.val();

					try {
						if (self.validate(str)) {
							self.clearErrors();
							self.logicString = str;
						}
					} catch(e) {
						self.showError(e, true);
					}
				}, 500);
			});
			
			/**
			 * Mask input so that only allowed chars are allowed to be entered.
			 * 
			 * @param  {Event} ev Keydown event.
			 */
			$input.keydown(function(ev) {
				var k = ev.which,
					s = ev.shiftKey;

				if (
					// allow BACKSPACE
					k == 8
					// allow arrows
					|| (k >= 37 && k <= 40)
					// allow DELETE
					|| k == 46
					// allow numbers (without SHIFT pressed)
					|| (k >= 48 && k <= 57 && !s)
					// allow numpad numbers
					|| (k >= 96 && k <= 105)
					// allow open bracket
					|| k == 219
					// allow open bracket from numbers
					|| (k == 57 && s)
					// allow close bracket
					|| k == 221
					// allow close bracket from numbers
					|| (k == 48 && s)
					// allow SPACE
					|| k == 32
					// allow &
					|| (k == 55 && s)
					// allow |
					|| (k == 220 && s)
				) {
					return;
				} else {
					// disallow anything else
					ev.preventDefault();
					return;
				}
			});

			/**
			 * Block ENTER.
			 * 
			 * @param  {Event} ev Keypress Event.
			 */
			$input.keypress(function(ev) {
				if (ev.which == 13) {
					ev.preventDefault();
				}
			});

			return $input;
		},

		/**
		 * Sets the given string inside the manual editor.
		 * 
		 * @param {mixed} logicString[optional] Logical string. If none set it will use the global logicalString. Can also be already tokenized string.
		 */
		setManualString : function(logicString) {
			logicString = logicString || this.logicString;

			// automatically tokenize the logic string if a string indeed supplied
			var tokens = (typeof logicString === 'string' || typeof logicString === 'number') ? this.tokenize(logicString) : logicString;

			// join all tokens with a space for readability
			this.$manualInput.val(tokens.join(' '));
		},

		/**
		 * Reads the logic string from the manual editor.
		 * 
		 * @return {String}
		 */
		getManualString : function() {
			return this.$manualInput.val();
		},

		/* ##########################
		 * SETTERS AND GETTERS
		 * ########################## */
		/**
		 * Sets the logic.
		 * 
		 * @param {String} logic
		 */
		setLogic : function(logic) {
			this.logic = ($.inArray(logic, [this.AND, this.OR]) > -1) ? logic : this.ADVANCED;

			// mark the logic
			this.$logicOptions.filter('[data-logic="' + this.logic + '"]').click();

			// set the logic string
			var logicString = '';

			if (this.logic == this.ADVANCED) {
				// if the logic is ADVANCED then it's enough to just copy the string
				logicString = logic;

			} else {
				// if "normal" logic then join all filter ID's with that logic operator
				var ids = [];

				$.each(this.gui.filters, function(i, filter) {
					ids.push(filter.id);
				});

				logicString = ids.join(this.logic == this.OR ? '|' : '&');
			}

			// finally set the logic string
			this.setLogicString(logicString);
		},

		/**
		 * Returns the current logic type (AND/OR/ADVANCED).
		 * 
		 * @return {String}
		 */
		getLogic : function() {
			return this.logic;
		},

		/**
		 * Set logic string.
		 * 
		 * @param {String} logicString Logic string to be set.
		 */
		setLogicString : function(logicString) {
			this.logicString = '' + logicString; // ensure string

			// load into views
			this.setGuiString(logicString);
			this.setManualString(logicString);
		},

		/**
		 * Appends filter ID to the logic string, optionally using the specified logic.
		 * 
		 * @param  {Number} filterId Filter ID.
		 * @param  {String} logic[optional] Logic name. If none given it will use OR if OR is marked 
		 */
		appendFilterToLogicString : function(filterId, logic) {
			logic = logic || this.logic;
			logic = (logic == this.OR) ? '|' : '&';

			// if there wasn't any previous string logic then only append add filter ID
			var logicString = (this.logicString.length) ? this.logicString + logic + filterId : filterId;

			this.setLogicString(logicString);
		},

		/**
		 * Returns the current logic string.
		 * 
		 * @return {String}
		 */
		getLogicString : function() {
			return (this.logic == this.ADVANCED) ? this.logicString : this.logic;
		}
	};

});