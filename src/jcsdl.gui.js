/*global JCSDL, jQuery, ZeroClipboard*/
JCSDL.Loader.addComponent(function($, undefined) {

	/**
	 * DataSift Query Editor (JCSDL).
	 * This is the main class of JCSDL/Query Editor. It bootstraps everything together.
	 *
	 * @param {mixed} el Element on which the query editor should be initialized. Can be a jQuery selector, jQuery object or a DOM object.
	 * @param {Object} cfg[optional] Custom configuration of the editor.
	 */
	this.GUI = function(el, cfg) {
		var $el = $(el); // ensure that the container element is a jQuery object
		if ($el.length == 0) return false; // break if no such element in DOM
		this.$el = $el.eq(0); // use only on the first matched element

		var self = this;

		/** @var {jQuery} jQuery object that holds the whole editor. */
		this.$container = null;

		/** @var {Object} GUI config object. */
		this.config = $.extend(true, {
			animate : 200,
			cancelButton : true,
			saveButton : null,
            searchContainer : null,
            searchAutofocus : false,
			googleMapsApiKey : '',
			mapsOverlay : {
				strokeWeight : 0,
				fillColor : '#7585dd',
				fillOpacity : 0.5
			},
			mapsMarker : null,
            zeroClipboard : null,
			hideTargets : [],
            showTargets : [],
			definition : {},

			// event hooks
			change : function() {},
			save : function(code) {},
			saveError : function(error) {},
			cancel : function() {
				this.hide();
			},
			invalidJCSDL : function(code) {},
			viewModeChange : function(mode) {},
			filterNew : function() {},
			filterEdit : function(filter) {},
			filterDelete : function(filter) {},
			filterSave : function(filter) {},
			filterCancel : function(filter) {},
			targetSelect : function(target) {},
			operatorSelect : function(operator) {},
			caseSensitivityChange : function(on) {},

			// logic event hooks
			logicChange : function(logic) {},
			logicError : function(error) {},
			advancedLogicChange : function(expression) {},
			manualLogic : function() {},
			manualLogicChange : function(expression) {},
			graphicalLogic : function() {},
			graphicalLogicChange : function(expression) {},
			graphicalLogicTokenMove : function(expression) {},
			parenthesisAdd : function(expression) {},
			parenthesisDelete : function(expression) {},
			logicOperatorSwitch : function(expression) {},

			// grabbing target help url
			targetHelpUrl : function(target, fieldInfo) {
				if (fieldInfo.helpUrl) {
					return fieldInfo.helpUrl;
				}

				target = target.replace(/\./g, '-');
				return this.definition.targetHelpJsonpSource.replace(/\{target\}/g, target);
			}
		}, cfg);

		/** @var {Object} Definition of JCSDL, that can be altered via config. */
		this.definition = $.extend(true, JCSDLDefinition, this.config.definition);

		/** @var {JCSDL.Parser} The actual JCSDL "parser". */
		this.parser = new JCSDL.Parser(this);

		/** @var {JCSDL.GUILogic} Handlers responsible for advanced logic handling. */
		this.logic = null;

		/** @var {JCSDL.GUIInputs} Input types and their handlers. */
		this.inputs = new JCSDL.GUIInputs(this);

		// data
		this.filters = [];

		// current choice data
		this.currentFilterIndex = null;

		// DOM elements
		this.$mainView = null;
		this.$filtersList = null;

		this.init();
	};

	this.GUI.prototype = {
		/**
		 * List of events that also trigger change event.
		 * @type {Array}
		 */
		changeEvents : ['filterNew', 'filterDelete', 'filterSave', 'logicChange', 'advancedLogicChange'],

		/*
		 * INITIALIZE THE EDITOR
		 */
		/**
		 * Initializes (or reinitializes) the JCSDL GUI Editor.
		 */
		init : function() {
			var self = this;

			// reset everything in case this is a reinitialization
			this.filters = [];

			this.currentFilterIndex = null;

			// and insert the editor into the container
			this.$mainView = this.getTemplate('editor');
			this.$filtersList = this.$mainView.find('.jcsdl-filters-list');

			this.$container = this.getTemplate('container');
			this.$container.html(this.$mainView);
			this.$el.html(this.$container);

			this.$saveButton = this.$mainView.find('.jcsdl-editor-save');
            this.$previewButton = this.$mainView.find('.jcsdl-editor-preview');
			this.$cancelButton = this.$mainView.find('.jcsdl-editor-cancel');

			// is there a custom save button defined?
			if (this.config.saveButton === false) {
				this.$saveButton.remove(); // remove the standard save button
			} else if this.config.saveButton && (typeof(this.config.saveButton) == 'object' || typeof(this.config.saveButton) == 'string')) {
				this.$saveButton.remove(); // remove the standard save button
				this.$saveButton = $(this.config.saveButton); // replace it with the custom one (selector or jQuery object)
			}

			// is there a custom cancel button defined?
			if (this.config.cancelButton && (typeof(this.config.cancelButton) == 'object' || typeof(this.config.cancelButton) == 'string')) {
				this.$cancelButton.remove(); // remove the standard cancel button
				this.$cancelButton = $(this.config.cancelButton); // replace it with the custom one (selector or jQuery object)
			}

			// hide the cancel button if so desired
			if (!this.config.cancelButton) {
				this.$cancelButton.hide();
			}

			// add class for IE
            var match = /(msie) ([\w.]+)/.exec(navigator.userAgent.toLowerCase()) || [];
            if (match[1] !== undefined && match[1] === 'msie') {
                this.$container.addClass('msie');
                $('html').addClass('msie');
            }

			// initiate the advanced logic handler with default 'and' logic
			this.logic = new JCSDL.GUILogic(this, JCSDL.GUILogic.prototype.AND);

            /*
             * ASSETS URL
             */
            var elementsSpriteUrl = this.$mainView.find('.jcsdl-elements-sprite:first').css('background-image').replace(/url\((\'|\")?/, '').replace(/(\'|\")?\)$/, ''),
                elementsSpriteLink = document.createElement('a');
            elementsSpriteLink.href = elementsSpriteUrl;
            var assetsUrl = elementsSpriteLink.pathname.split('/');
            assetsUrl.pop(); // remove "elements.png"
            assetsUrl.pop(); // remove "img"
            this.assetsUrl = assetsUrl.join('/') + '/';

            // now apply the assets url to maps marker and zeroclipboard if necessary
            if (!this.config.mapsMarker) {
                this.config.mapsMarker = this.assetsUrl + 'img/maps-marker.png';
            }

            if (!this.config.zeroClipboard) {
                this.config.zeroClipboard = this.assetsUrl + 'swf/ZeroClipboard.swf';
            }

            // move it to global namespace as well
            JCSDL.zeroClipboard = this.config.zeroClipboard;

			/*
			 * REGISTER LISTENERS
			 */
			/**
			 * Switch between expanded and collapsed view mode of filters list.
			 *
			 * @param  {Event} ev
			 */
			this.$mainView.find('.jcsdl-mainview-mode .jcsdl-mainview-mode-option').bind('click touchstart', function(ev) {
				ev.preventDefault();
				ev.target.blur();

				var $item = $(this),
					mode = $item.attr('data-mode');

				self.$filtersList.removeClass('expanded collapsed');
				self.$filtersList.addClass(mode);

				self.$mainView.find('.jcsdl-mainview-mode .jcsdl-mainview-mode-option').removeClass('active');
				$item.addClass('active');

				self.trigger('viewModeChange', [mode]);
			});

			/**
			 * Show filter editor to create a new one from scratch upon clicking 'Add filter'.
			 *
			 * @param  {Event} ev Click Event.
			 */
			this.$mainView.find('.jcsdl-add-filter').bind('click touchstart', function(ev) {
				ev.preventDefault();
				ev.target.blur();

				self.showFilterEditor();
			});

			/**
			 * Handle output / returning of the resulting JCSDL upon clicking save.
			 * Unbind first so that init() can be called many times without registering the listener multiple times
			 *
			 * @param  {Event} ev Click Event.
			 */
			this.$saveButton.unbind('.jcsdl').bind('click.jcsdl touchstart.jcsdl', function(ev) {
				ev.preventDefault();
				ev.target.blur();

				try {
					var code = self.returnJCSDL();
					self.trigger('save', [code]);
				} catch(e) {
					self.showError(e);

					var message = (e instanceof JCSDL.LogicValidationException) ? e.message : e;
					self.trigger('saveError', [message]);
				}
			});

            /**
             * Show CSDL preview in a popup.
             *
             * @param  {Event} ev Click Event.
             */
            this.$previewButton.unbind('.jcsdl').bind('click.jcsdl touchstart.jcsdl', function(ev) {
                ev.preventDefault();
                ev.target.blur();

                try {
                    var codeLines = self.returnJCSDL().split("\n"),
                        clearLines = [];

                    // remove comment lines
                    $.each(codeLines, function(i, line) {
                        if (line.substr(0, 2) !== '//') {
                            clearLines.push(line);
                        }
                    });

                    var code = clearLines.join("\n"),
                        id = 'jcsdl-copy-to-clipboard-' + (Math.floor(Math.random() * 10000));

                    $.jcsdlPopup({
                        title : 'CSDL Preview',
                        content : [
                            '<p>' + self.highlightCSDL(code) + '</p>',
                            '<a href="#" id="' + id + '" class="jcsdl-btn jcsdl-copy-to-clipboard"><i class="jcsdl-picto jcsdl-elements-sprite"></i></a>'
                        ].join('')
                    });

                    var copyButtonTransitionTimeout,
                        $copyButton = $('#' + id).attr('data-clipboard-text', code),
                        copyClip = new ZeroClipboard($copyButton[0], {
                            moviePath: self.config.zeroClipboard
                        });

                    $copyButton.click(function() {
                        return false;
                    });

                    copyClip.on('complete', function() {
                        clearTimeout(copyButtonTransitionTimeout);
                        $copyButton.addClass('copied');
                        setTimeout(function() {
                            $copyButton.removeClass('copied');
                        }, 3000);
                    });
                } catch(e) {
                    self.showError(e);
                }

                return false;
            });

			/**
			 * Handle pressing the cancel button.
			 * Unbind first so that init() can be called many times without registering the listener multiple times.
			 *
			 * @param  {Event} ev Click Event.
			 */
			this.$cancelButton.unbind('.jcsdl').bind('click.jcsdl touchstart.jcsdl', function(ev) {
				ev.preventDefault();
				ev.target.blur();

				self.trigger('cancel');
			});
		},

		/**
		 * Resets the editor to clear state.
		 */
		reset : function() {
			this.init();
		},

		/**
		 * Loads the given JCSDL string and builds the whole editor based on it.
		 *
		 * @param  {String} code JCSDL string.
		 */
		loadJCSDL : function(code) {
			this.init(); // just in case we're loading JCSDL for a 2nd time

			var self = this;

			try {
				var parsed = this.parser.parseJCSDL(code);

				this.filters = parsed.filters;

				// activate logic buttons if there are at least two filters
				// need to do it before setting the logic
				if (this.filters.length >= 2) {
					this.logic.toggleButtons();
				}

				this.logic.setLogic(parsed.logic, true);

			} catch(e) {
				var errorCode = (e instanceof JCSDL.ValidationException) ? e.code : code;

				this.showError(e, errorCode);
				this.trigger('invalidJCSDL', [errorCode]);

				return false;
			}

			// display the filters
			// add each filter to the list
			$.each(this.filters, function(i, filter) {
				var $filterRow = self.createFilterRow(filter);
				$filterRow.appendTo(self.$filtersList);
			});

			// show footer if there are any filters
			if (this.filters.length) {
				this.$mainView.find('.jcsdl-footer').show();
			}

			// make the cancel button visible
			if (this.config.cancelButton) {
				this.$cancelButton.show();
			}
		},

		/**
		 * Returns the JCSDL for the built stream.
		 *
		 * @return {String}
		 */
		returnJCSDL : function() {
			return this.parser.getJCSDLForFilters(this.filters, this.logic.getLogicString());
		},

		/**
		 * Adjusts the editor size to the container (in case it's size has changed).
		 */
		adjust : function() {
			if (this.editor) {
				this.editor.adjust();
			}
		},

		/**
		 * Hides the editor.
		 */
		hide : function() {
			this.$container.hide();
		},

		/**
		 * Shows the editor.
		 */
		show : function() {
			this.$container.show();
		},

		/**
		 * Trigger an event handler defined in the config.
		 *
		 * @param  {String} name Name of the event handler.
		 * @param  {Array} data[optional] Arguments to pass to the handler.
		 * @return {mixed} Whatever the handler returns.
		 */
		trigger : function(name, data) {
			data = data || [];

			this.$el.trigger(name.toLowerCase(), data);

			if (typeof(this.config[name]) == 'function') {
				return this.config[name].apply(this, data);
			}

			if ($.inArray(name, this.changeEvents) > -1) {
				this.trigger('change');
			}

			return null;
		},

		/* ##########################
		 * FILTER MANAGEMENT (ADDING, EDITOR and DELETING)
		 * ########################## */
		/**
		 * Shows the filter editor.
		 */
		showFilterEditor : function(filter, filterIndex) {
			var self = this;

			this.$mainView.hide();

			this.editor = new JCSDL.GUIFilterEditor(this, this.$container, filter);

			// if specified filter then load it into the editor
			if (filter !== undefined && filter) {
				this.currentFilterIndex = filterIndex;
				self.trigger('filterEdit', [filter]);
			} else {
				self.trigger('filterNew');

				// if creating new one from scratch then look for previous filter and automatically select the same target (unless it's hidden) ;)
				var lastFilter = this.filters[this.filters.length - 1];
				if (lastFilter !== undefined) {
					this.editor.getView().find('.jcsdl-filter-target .target-' + lastFilter.target + ':visible').trigger('jcsdlclick');
				}
			}
		},

		/**
		 * Hides the filter editor and shows the main editor view.
		 * NOTICE: This does not save the filter!
		 *
		 * @param {Function} callback[optional] Callback to call when the filter editor has been hidden.
		 */
		hideFilterEditor : function(callback) {
			callback = (typeof callback == 'function') ? callback : $.noop;
			var self = this;

			// clear all the values
			this.currentFilterIndex = null;

			this.editor.getView().fadeOut(this.config.animate, function() {
				self.editor.destroy();
				self.$mainView.show();

				// destroy the editor instance
				self.editor = null;

				callback.apply(self, []);
			});
		},

		/**
		 * Handle submission of a filter.
		 *
		 * @param  {Object} filterInfo Filter info object returned from the editor.
		 */
		didSubmitFilter : function(filterInfo) {
			var self = this,
				callback = $.noop,

				// make sure this filter has an ID
				id = (this.currentFilterIndex !== null) ? this.filters[this.currentFilterIndex].id : this.createFilterId(),

				// create new filter object
				filter = this.parser.createFilter(filterInfo.target, filterInfo.path, filterInfo.operator, filterInfo.value, filterInfo.additional, id),

				// create new filter row
				$filterRow = this.createFilterRow(filter);

			// and now finally either add it to the end of the filters list
			// or replace if we were editing another filter
			if (this.currentFilterIndex !== null) {
				// we were editing, so let's replace it
				this.$filtersList.find('.jcsdl-filter.filter-' + filter.id).replaceWith($filterRow);
				this.filters[this.currentFilterIndex] = filter;

			} else {
				// we were adding a filter, so simply add it to the list
				$filterRow.appendTo(this.$filtersList);
				this.filters.push(filter);

				// define callback for this action
				callback = function() {
					// also add it to the logic
					self.logic.appendFilterToLogicString(filter.id);
				};
			}

			// show footer if there are any filters
			if (this.filters.length) {
				this.$mainView.find('.jcsdl-footer').fadeIn(this.config.animate);
			}

			// activate logic buttons if there are at least two filters
			if (this.filters.length >= 2) {
				this.logic.toggleButtons();
			}

			this.hideFilterEditor(callback);

			this.trigger('filterSave', [filter]);
		},

		/**
		 * Removes the filter at the given index.
		 *
		 * @param  {Number} index
		 */
		deleteFilter : function(index) {
			var filter = this.filters[index];

			// remove from the DOM
			this.$filtersList.find('.jcsdl-filter.filter-' + filter.id).remove();

			// remove from the filters list
			this.filters.splice(index, 1);

			// remove this filter from the logic editor as well
			this.logic.deleteGuiFilterToken(filter.id);

			this.trigger('filterDelete', [filter]);

			// hide footer if there are no more filters
			if (!this.filters.length) {
				this.$mainView.find('.jcsdl-footer').fadeOut(this.config.animate);
			}

			// disable logic buttons if there are less than two filters left
			if (this.filters.length < 2) {
				this.logic.toggleButtons(false);
			}
		},

		/* ##########################
		 * VIEW FACTORIES
		 * ########################## */
		/**
		 * Shows an error.
		 *
		 * @param  {mixed} error Error message to be displayed ({String}) or {JCSDL.LogicValidationException}.
		 * @param  {String} code    Code that caused the error.
		 */
		showError : function(error, code) {
			// pass on the TypeError
			if (error instanceof TypeError) throw error;

			// clear all previous errors
			this.clearErrors();

			// if error is a {JCSDL.LogicValidationException} then delegate this to logic error handler
			if (error instanceof JCSDL.LogicValidationException) {
				return this.logic.showError(error);
			}

			var message = (error instanceof JCSDL.ValidationException) ? error.message : error;

			var $error = this.getTemplate('error');
			$error.find('span').html(message);

			$error.insertBefore(this.$mainView.find('.jcsdl-footer'));
			$error.hide().fadeIn();

			if (console !== undefined) {
				console.error(message, arguments);
			}

			$error.animateIntoView(this.config.animate);
		},

		/**
		 * Clears all errors from the main view.
		 */
		clearErrors : function() {
			this.$mainView.find('.jcsdl-error').remove();
		},

		/**
		 * Creates a filter row element for the specified filter.
		 *
		 * @param  {Object} filter Filter object.
		 * @return {jQuery}
		 */
		createFilterRow : function(filter) {
			var self = this,
				$filterRow = this.getTemplate('filter');

			// fill with data
			// ID
			$filterRow
				.addClass('filter-' + filter.id)
				.data('filterId', filter.id)
				.find('.jcsdl-filter-info.id')
					.html(filter.id);

			// target
			var targetInfo = this.parser.getTargetInfo(filter.target),
				$target = this.getTemplate('filterTarget')
					.addClass('selected target-' + filter.target)
					.html(targetInfo.name);

			$filterRow.find('.target').html($target);

			// fields (separate icon for each field in path)
			var currentPath = [];
			$.each(filter.fieldPath, function(i, field) {
				currentPath.push(field);

				var fieldInfo = self.parser.getFieldInfo(filter.target, currentPath),
					$field = self.getTemplate('filterField')
						.addClass('selected icon-' + self.getIconForField(field, fieldInfo))
						.html(fieldInfo.name);

				$filterRow.find('.jcsdl-filter-info.field').append($field);
			});

			// get the field definition
			var field = this.parser.getFieldInfo(filter.target, currentPath);

			// operator
			var $operator = this.getTemplate('filterOperator')
				.addClass('operator-' + filter.operator + ' icon-' + filter.operator + ' selected')
				.attr('title', this.definition.operators[filter.operator].description)
				.html(this.definition.operators[filter.operator].code.escapeHtml())
				.tipsy({gravity:'s',offset:9});
			$filterRow.find('.operator').html($operator);

			// case sensitive?
			if (filter.cs) {
				var $cs = this.getTemplate('filterOperator')
					.addClass('operator-cs icon-cs selected')
					.attr('title', 'Case Sensitive')
					.html('case sensitive')
					.tipsy({gravity:'s',offset:9});
				$filterRow.find('.jcsdl-filter-info.operator').append($cs);
				$cs.tipsy('show');
			}

			// value (but not for 'exists' operator)
			if (filter.operator !== 'exists') {
				var $value = null,
					isGeo = ($.inArray(filter.operator, ['geo_box', 'geo_polygon', 'geo_radius']) >= 0),
					// in case of 'geo' the input is decided on operator, not input type
					input = (isGeo) ? filter.operator : field.input;

				if (isGeo) {
					// also display the input icon (but remove the operator)
					var $input = this.getTemplate('filterFieldInput')
						.insertAfter($filterRow.find('.jcsdl-filter-info.field'))
						.find('.jcsdl-filter-field-input')
							.addClass('selected icon-' + filter.operator);
					$operator.remove();
				}

				// use a custom display value function for this field's input type (if any)
				if (this.inputs[input] && typeof(this.inputs[input].displayValue) == 'function') {
					$value = this.inputs.exec(input, 'displayValue', [field, filter.value, filter]);

				// or display a standard text
				} else {
					$value = this.getTemplate('filterValue')
						.html(filter.value.truncate(50).escapeHtml());
				}

				$filterRow.find('.value').addClass('input-' + input).html($value);
				$filterRow.find('.operator').addClass('input-' + input);

			} else {
				$filterRow.find('.value').remove();
			}

			// also attach the filter data to the row
			$filterRow.data('filter', filter);

			/*
			 * REGISTER SOME LISTENERS
			 */
			/**
			 * Shows the filter editor for the clicked filter.
			 *
			 * @param  {Event} ev Click Event.
			 */
			$filterRow.find('.edit').bind('click touchstart', function(ev) {
				ev.preventDefault();
				ev.target.blur();

				self.showFilterEditor(filter, self.getFilterIndexByElement($filterRow));
			});

			/**
			 * Delete the filter when clicked on delete option.
			 *
			 * @param  {Event} ev Click Event.
			 */
			$filterRow.find('.delete').bind('click touchstart', function(ev) {
				ev.preventDefault();
				ev.target.blur();

				self.deleteFilter(self.getFilterIndexByElement($filterRow));
			});

			return $filterRow;
		},

		/* ##########################
		 * HELPERS
		 * ########################## */
		/**
		 * Creates a unique filter ID.
		 *
		 * @return {Number}
		 */
		createFilterId : function() {
			var ids = [],
				i = 1;

			$.each(this.filters, function(i, filter) {
				ids.push(parseInt(filter.id));
			});

			while($.inArray(i, ids) >= 0) i++;
			return i;
		},

		/**
		 * Highlights a filter based on the given ID.
		 *
		 * @param  {Number} filterId Filter ID.
		 * @param  {Boolean} on[optional] True to highlight, false to unhighlight. Default: true.
		 */
		highlightFilter : function(filterId, on) {
			on = (on === undefined) ? true : false;
			this.$filtersList.find('.filter-' + filterId)[on ? 'addClass' : 'removeClass']('on');
		},

        /**
         * Syntax highlight CSDL code.
         * 
         * @param  {String} code CSDL code.
         * @return {String}
         */
        highlightCSDL : function(code) {
            var self = this,
                lines = code.split("\n"),
                highlighted = [];

            // make use of the fact that we know the structure of the code perfectly,
            // so no need for advanced regexes to match strings outside of quotes (for operators, etc)
            $.each(lines, function(i, line) {
                line = $.trim(line);

                // match all strings in quotes (they are values)
                line = line.replace(/"[^"]+"/gi, function(match) {
                    return '<span class="jcsdl-code-string">' + match + '</span>';
                });

                var elements = line.split(' ');

                // it can be either a logic line or a target line
                // logic lines start with (, ), AND, OR, NOT
                if ($.inArray(elements[0].charAt(0), ['(', ')']) !== -1 || $.inArray(elements[0], ['AND', 'OR', 'NOT']) !== -1) {
                    // match logical operators AND, OR
                    line = line.replace(/AND|OR/gi, function(match) {
                        return '<span class="jcsdl-code-logical-operator">' + match + '</span>';
                    });

                    // match NOT operator
                    line = line.replace(/NOT/gi, function(match) {
                        return '<span class="jcsdl-code-logical-operator-not">' + match + '</span>';
                    });

                    // match parentheses
                    line = line.replace(/\(|\)/gi, function(match) {
                        return '<span class="jcsdl-code-parenthesis">' + match + '</span>';
                    });

                    highlighted.push(line);

                    // parsed so continue
                    return true;
                }

                // this is a target line
                elements[0] = '<span class="jcsdl-code-target">' + elements[0] + '</span>';
                elements[1] = '<span class="jcsdl-code-operator">' + elements[1] + '</span>';

                var newline = elements.join(' ');

                // match all numbers (as numbers can only be values)
                newline = newline.replace(/[0-9]*\.?[0-9]+/gi, function(match) {
                    return '<span class="jcsdl-code-number">' + match + '</span>';
                });

                highlighted.push(newline);
            });

            // join the highlighted lines by <br>
            return '<code class="jcsdl-code">' + highlighted.join('<br>') + '</code>';
        },

		/* ##########################
		 * SETTERS AND GETTERS
		 * ########################## */
		/**
		 * Returns a template (jQuery object) of the given name.
		 *
		 * @param  {String} name Name of the template to fetch.
		 * @return {jQuery}
		 */
		getTemplate : function(name) {
			if (JCSDL.GUITemplates[name] !== undefined) {
				return JCSDL.GUITemplates[name].clone();
			}

			return $();
		},

		/**
		 * Given the field name and it's definition decide what the icon for this field is.
		 *
		 * @param  {String} field     Name of the string.
		 * @param  {Object} fieldInfo Field definition.
		 * @return {String}
		 */
		getIconForField : function(field, fieldInfo) {
			return (fieldInfo.icon !== undefined) ? fieldInfo.icon : field;
		},

		/**
		 * Returns the filter index of the filter to which the given DOM representation belongs.
		 *
		 * @param  {jQuery} $filterRow
		 * @return {Number}
		 */
		getFilterIndexByElement : function($filterRow) {
			return this.$filtersList.find('.jcsdl-filter').index($filterRow);
		}

	};

	// register JCSDL GUI as a jQuery plugin as well
	// the difference to using new JCSDL.GUI() is that it will return {jQuery} instead of the editor
	$.fn.jcsdlGui = function(options) {
		function get($el) {
			var gui = $el.data('jcsdlGui');
			if (!gui) {
				gui = new JCSDL.GUI($el, options);
				$el.data('jcsdlGui', gui);
			}
			return gui;
		}

		if (typeof(options) == 'string') {
			// call a public method
			if ($.inArray(options, ['loadJCSDL', 'adjust']) >= 0) {
				var argmns = [];
				$.each(arguments, function(i, arg) {
					if (i == 0) return true;
					argmns.push(arg);
				});

				this.each(function() {
					var gui = get($(this));
					gui[options].apply(gui, argmns);
				});
			}
			return this;
		}

		this.each(function() {get($(this));});
		return this;
	};

	// backward compatibility
	JCSDLGui = function($el, o) {
		return new JCSDL.GUI($el, o);
	};

});
