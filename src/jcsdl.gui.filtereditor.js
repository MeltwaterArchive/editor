/*global JCSDLTargets*/
JCSDLTargets.Loader.addComponent(function($, undefined) {

    /* define some static private vars */
    var

    /** @type {Object} A map of keys used for better readability. */
    KEYS = {
        BACKSPACE : 8,
        TAB : 9,
        DELETE : 46,
        ENTER : 13,
        ESC : 27,
        UP : 38,
        DOWN : 40,
        LEFT : 37,
        RIGHT : 39
    };

	/**
	 * Single filter editor.
	 * 
	 * @param {JCSDLTargets.GUI} gui GUI instance to which this filter editor belongs.
	 * @param {jQuery} $appendTo Element to which the filter editor view should be appended and shown (required in order to properly set dimensions of various plugins).
	 * @param {Object} filter[optional] Optional filter object to be loaded.
	 */
	this.GUIFilterEditor = function(gui, $appendTo, filter) {
		$appendTo = $appendTo || $();
		filter = filter || {};

		var self = this;

		// reference some useful or required elements of the GUI
		this.gui = gui;
		this.config = gui.config;
		this.definition = gui.definition;

		/** @var JCSDLTargets.Parser */
		this.parser = gui.parser;

		// reference some functions that we'd want to reuse
		this.getTemplate = gui.getTemplate;
		this.getIconForField = gui.getIconForField;

		/*
		 * SETUP
		 */
		this.filter = filter; // some potential data found in filter object are already needed here

		// current filter data
		this.steps = [];
		this.target = null;
		this.path = [];

		// prepare the filter editor
		this.$view = this.getTemplate('filterEditor');
		this.$steps = this.$view.find('.jcsdl-steps');
        this.$search = this.$view.find('.jcsdl-search');
        this.$searchInput = this.$view.find('.jcsdl-search input');
        this.$searchResults = this.$view.find('.jcsdl-search-results');

		// now we need to display the editor in order for all plugins to be properly sized
		this.$view.appendTo($appendTo).show();

		// by default always prepare the selection of targets first
		this.addFilterStep('target', this.createTargetSelectView());

        // generate flat map of targets for searching
        this.populateSearch();

		/*
		 * REGISTER LISTENERS
		 */
        /*
         * SEARCH EVENTS
         */
        /**
         * Show the search results dropdown when focused in the search input.
         */
        this.$searchInput.focus(function() {
            self.$search.addClass('jcsdl-active');
            self.$searchResults.show();
        });

        /**
         * Hide the search results dropdown when blurred the search input.
         */
        this.$searchInput.blur(function() {
            self.$searchResults.fadeOut(200);
            self.$search.removeClass('jcsdl-active');
        });

        /**
         * Select the chosen target when pressed ENTER.
         */
        this.$searchInput.keypress(function(ev) {
            if (ev.which === KEYS.ENTER) {
                var $current = self.$searchResults.find('li.jcsdl-selected');
                if ($current.length) {
                    self.selectTarget($current.data('target'));
                }
                return false;
            }
        });

        /**
         * Perform live search when typing or cancel and clear on ESCAPE.
         */
        this.$searchInput.bind('keyup', function(ev) {
            // when pressed ESCAPE then reset the search
            if (ev.which === KEYS.ESC) {
                self.$searchInput.val('').blur();
                self.$searchResults.children().show();
                return;
            }

            if (ev.which === KEYS.UP || ev.which === KEYS.DOWN) {
                ev.preventDefault();
                return;
            }

            var search = $.trim(self.$searchInput.val()),
                regexPattern = new RegExp('(^|\\s)(' + search + '|' + search.replace(/\s/g, '.') + ')', 'i'),
                highlightRegexPattern = new RegExp('(^|\\s)(' + search.replace(/\s/g, '|') + ')', 'gi');

            self.$searchResults.children().quickEach(function() {
                if (regexPattern.test(this.data('name')) || regexPattern.test(this.data('target'))) {
                    this.show()
                        .find('span').html(this.data('fullname').replace(highlightRegexPattern, '$1<strong>$2</strong>'));
                } else {
                    this.hide();
                }
            });
        });

        /**
         * Navigate up and down when pressing arrow keys.
         */
        this.$searchInput.bind('keydown', function(ev) {
            // break if not up arrow or down arrow or enter
            if ($.inArray(ev.which, [KEYS.UP, KEYS.DOWN]) === -1) {
                return;
            }

            ev.preventDefault();

            // find the crucial items
            var $current = self.$searchResults.find('li.jcsdl-selected').removeClass('jcsdl-selected'),
                $next = ($current.length && $current.nextAll('li:visible:first').length) ? $current.nextAll('li:visible:first') : self.$searchResults.find('li:visible:first'),
                $prev = ($current.length && $current.prevAll('li:visible:first').length) ? $current.prevAll('li:visible:first') : self.$searchResults.find('li:visible:last');
            
            if (ev.which === KEYS.UP) {
                $current = $prev.addClass('jcsdl-selected');
            } else if (ev.which === KEYS.DOWN) {
                $current = $next.addClass('jcsdl-selected');
            }

            // scroll the dropdown to the new selected item
            $current.scrollIntoView(self.$searchResults);
        });

        /**
         * Display the search results dropdown when clicked on the arrow.
         */
        this.$view.find('.jcsdl-search-arrow').click(function() {
            self.$searchInput.focus();
            return false;
        });
	};

	this.GUIFilterEditor.prototype = {
		filter : {},

		jsonpCache : {
			operators : {},
			targets : {}
		},

		/**
		 * Adjusts the editor size to the container (in case it's size has changed).
		 */
		adjust : function() {
			this.$steps.find('.jcsdl-step').jcsdlCarousel('adjust');
		},

        /**
         * Select the given target in the target selector carousel.
         * 
         * @param  {String} target Target name.
         */
        selectTarget : function(target) {
            var self = this,
                targetPath = target.split('.'),
                source = targetPath.shift();

            this.$view.find('.jcsdl-filter-target .target-' + source).trigger('jcsdlclick');

            // select all fields and subfields
            $.each(targetPath, function(i, field) {
                var $fieldView = self.$view.find('.jcsdl-filter-target-field:last');
                $fieldView.find('.field-' + field).trigger('jcsdlclick');
            });
        },

		/* ##########################
		 * FILTER EDITOR STEPS
		 * ########################## */
		/**
		 * Adds a filter step with proper numbering/position.
		 * 
		 * @param {String} stepName Name of the step.
		 * @param {jQuery} $view    View of the step.
		 * @param {Boolean} slide[optional] Should the displaying of the step be a slide down animate (true) or a fade in (false). Default: true.
		 */
		addFilterStep : function(stepName, $view, slide) {
            slide = (slide === undefined) ? true : slide;
			var self = this,
				$stepView = this.getTemplate('step'),
				stepNumber = this.steps.length;

			$stepView.html($view)
				// attach some data and classes (for easy selectors)
				.data('number', stepNumber)
				.addClass('jcsdl-filter-step-number-' + stepNumber)
				.data('name', stepName)
				.addClass('jcsdl-filter-step-' + stepName)
				// add to the DOM
				.appendTo(this.$steps);

			// if target or field select then initiate the carousel on it
			if (stepName === 'target') {
				$stepView.jcsdlCarousel({
					select : function() {
						var $item = $(this);

						// mark the current step that it has been selected
						$stepView.addClass('selected')
							// mark the selected item
							.find('.jcsdl-carousel-item.selected')
								.removeClass('selected');
						$item.addClass('selected');

						// call the callback
						self.didSelectTarget($item.data('name'));
					}
				});
			}
			if (stepName === 'field') {
				$stepView.jcsdlCarousel({
					select : function() {
						var $item = $(this);

						// mark the target step that at least one field has been selected
						self.$steps.find('.jcsdl-filter-step-target').addClass('field-selected');

						// mark the previous step that its' child has now been selected
						var previousStep = $stepView.data('number') - 1;
						self.$steps.find('.jcsdl-filter-step-field.jcsdl-filter-step-number-' + previousStep).addClass('field-selected');

						// mark the current step that it has been selected
						$stepView.addClass('selected')
							// mark the selected item
							.find('.jcsdl-carousel-item.selected')
								.removeClass('selected');
						$item.addClass('selected');

						// call the callback
						self.didSelectField($item.data('name'), $view, $stepView);
					}
				});
			}

			// animate into view nicely
			if (slide) {
				$stepView.hide().slideDown(this.config.animate);
			} else {
				$stepView.hide().fadeIn(this.config.animate);
			}

			// adjust all carousels because the document size might have changed (right scroll bar might have appeared, but that doesn't trigger window.resize event)
			setTimeout(function() {
				self.adjust();
			}, this.config.animate);

			// add to the steps pool
			this.steps.push($stepView);
		},

		/**
		 * Removes all filter steps after the given position.
		 * Also clears the resulting CSDL if there was any before.
		 * 
		 * @param  {Number} position
		 * @return {String}  Name of the first step that was removed.
		 */
		removeFilterStepsAfterPosition : function(position) {
			// mark the step that stays that no longer any fields are selected
            this.$steps.find('.jcsdl-step').eq(position)
                    .removeClass('field-selected');

			var steps = this.steps.splice(position + 1, this.steps.length - position),
				firstName = '';

			$.each(steps, function(i, step) {
				var $step = $(step);

				if (!i) {
					firstName = $step.data('name');
				}
				$step.remove();
			});

			return firstName;
		},

		/**
		 * When a target is selected, the user needs to select a field.
		 * 
		 * @param  {String} targetName Name of the selected target.
		 */
		didSelectTarget : function(targetName) {
			if (this.definition.targets[targetName] === undefined) {
                return false;
            }

			this.target = targetName;
			this.path = [];

			// remove all steps regarding selection of fields in case another target was selected first
			var firstRemoved = this.removeFilterStepsAfterPosition(0); // target is always position 0

			// now need to select a field, so build the selection view
			var $fieldView = this.createFieldSelectionView(this.definition.targets[targetName].fields);
			this.addFilterStep('field', $fieldView, (firstRemoved !== 'field'));

			this.trigger('targetSelect', [targetName]);
		},

		/**
		 * When a field is selected then the user either needs to input a value or select a subfield if such exists.
		 * 
		 * @param  {String} fieldName  Name of the selected field.
		 * @param  {jQuery} $fieldView The field selection view that was used.
		 * @param  {jQuery} $stepView Step view at which the field was selected.
		 */
		didSelectField : function(fieldName, $fieldView, $stepView) {
			// remove any steps that are farther then this one, just in case
			var fieldPosition = $fieldView.data('position'),
                slide;
			this.path.splice(fieldPosition, this.path.length - fieldPosition);

			// also remove the target help, just in case it was added before
			$stepView.removeClass('selected-final').find('.jcsdl-target-help').remove();

			var field = this.getFieldInfoAtCurrentPath(fieldName);
			if (field === false) {
                return;
            }

			// from DOM as well
			var firstRemoved = this.removeFilterStepsAfterPosition($fieldView.closest('.jcsdl-step').data('number'));

			// now proceed with adding the current one
			this.path.push(fieldName);

			// if this fields has some more subfields then add them now
			if (field.fields !== undefined) {
                $fieldView = this.createFieldSelectionView(field.fields);
				slide = (firstRemoved !== 'field');

				this.addFilterStep('field', $fieldView, slide);
				return;
			}

			// also, if this is final selection then show "Learn more" option
			this.addTargetHelpToStep($stepView);

			this.trigger('targetSelect', [this.getCurrentPath()]);
		},

		/**
		 * Adds a target help trigger to the given step. It should be final step of the carousel.
		 * 
		 * @param {jQuery} $stepView
		 */
		addTargetHelpToStep : function($stepView) {
			var self = this;

			this.getTemplate('targetHelp').appendTo($stepView);

			/**
			 * Open target help popup on click.
			 * @param  {Event} ev Click event.
			 * @listener
			 */
			$stepView.find('.jcsdl-target-help').click(function(ev) {
				ev.preventDefault();
				ev.target.blur();

				var info = self.getFieldInfoAtCurrentPath(),
					target = self.target,
					targetInfo = self.parser.getTargetInfo(target),
					path = self.path.join('-'),
					title = targetInfo.name,
					cPath = [];

				$.each(self.path, function(i, name) {
					cPath.push(name);
					title += ' &raquo; ' + self.parser.getFieldInfo(target, cPath).name;
				});

				// Copes with the differing path names in the Query editor
				var cacheName = path;
				if (target !== 'augmentation') { // Augmentations don't live in an augmentation namespace
					cacheName = target + '.' + cacheName;
				}

				var url = self.config.targetHelpUrl.apply(self, [cacheName.replace(/-/g, '.'), info]),
					popup = $.jcsdlPopup({
						title : title
					});

				if (self.jsonpCache.targets[cacheName] === undefined) {
					$.ajax({
						url : url,
						type : 'GET',
						async : false,
						jsonpCallback : 'jcsdlJSONP',
						contentType : 'application/json',
						dataType : 'jsonp',
						success : function(data) {
							if (!data || !data.html || !$.trim(data.html)) {
								popup.setContent('<p>No documentation available.</p>');
								popup.reposition();
								return;
							}

							popup.setContent(data.html);
							popup.reposition();

							self.jsonpCache.targets[cacheName] = data.html;
						},
						error : function() {
							popup.setContent('<p>No documentation available.</p>');
							popup.reposition();
						}
					});
				} else {
					popup.setContent(self.jsonpCache.targets[cacheName]);
					popup.reposition();
				}
			});
		},

		/* ##########################
		 * VIEW FACTORIES
		 * ########################## */
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
		 * Creates the target select view.
		 * 
		 * @return {jQuery}
		 */
		createTargetSelectView : function() {
			var self = this,
				$targetSelectView = this.getTemplate('target'),
				$targetSelect = $targetSelectView.find('.jcsdl-filter-target');

			// create a select option for every possible target
			$.each(this.definition.targets, function(name, target) {
				// delegate creation of the option to a function
				var $targetView = self.createOptionForTarget(name, target);

				// append the option to the select
				$targetView.appendTo($targetSelect);
			});

			return $targetSelectView;
		},

		/**
		 * Creates a select option for the given target with the specified name.
		 * 
		 * @param  {String} name   Unique name of the target, matching one from the JCSDL definition.
		 * @param  {Object} target Definition of the target from JCSDL definition.
		 * @return {jQuery}
		 */
		createOptionForTarget : function(name, target) {
			var $option = this.getTemplate('targetOption')
				.data('name', name)
				.data('target', target)
				.addClass('target-' + name);

			// maybe this target is hidden?
			if (!this.isTargetVisible(name)) {
				// mark that it's suppose to be hidden
				$option.addClass('jcsdl-option-hidden');

				// but maybe it's selected, so dont hide it
				if (this.filter.target === undefined || this.filter.target !== name) {
					$option.hide();
				}
			}

			return $option;
		},

		/**
		 * Creates a field selection view for the given collection of possible fields.
		 * 
		 * @param  {Object} fields Collection of possible fields.
		 * @return {jQuery}
		 */
		createFieldSelectionView : function(fields) {
			var self = this,
				fieldPosition = this.path.length,
				currentPath = this.target + (this.path.length > 0 ? '.' + this.path.join('.') : ''),
				$fieldView = this.getTemplate('field'),
				hidden = false,
				path = $.merge([this.target],  this.path),
				cPath = '';

			// attach some data and classes (for easy selectors)
			$fieldView.data('position', fieldPosition)
				.addClass('field-select-' + fieldPosition);

			// maybe all fields here are hidden? check already here, so we don't need to for every field separately
			$.each(path, function(i, target) {
				cPath = cPath + (i > 0 ? '.' : '') + target;
				if (!self.isTargetVisible(cPath)) {
					hidden = true;
					return true; // break and don't search anymore
				}
			});

			// add all possible selections
			var $fieldSelect = $fieldView.find('.jcsdl-filter-target-field');
			$.each(fields, function(name, field) {
				var $fieldView = self.createOptionForField(name, field, currentPath, hidden);
				$fieldView.appendTo($fieldSelect);
			});

			return $fieldView;
		},

		/**
		 * Creates a select option for the given field with the specified name.
		 * 
		 * @param  {String} name  Unique name of the field in the current target, matching one from JCSDL definition.
		 * @param  {Object} fieldInfo Definition of the field from JCSDL definition.
		 * @param  {Array} parentPath Path to the parent target.
		 * @param  {Boolean} hidden Is this field option hidden?
		 * @return {jQuery}
		 */
		createOptionForField : function(name, fieldInfo, parentPath, hidden) {
			var self = this,
				$option = this.getTemplate('fieldOption')
					.data('name', name)
					.data('field', fieldInfo)
					.html(fieldInfo.name)
					.addClass('icon-' + this.getIconForField(name, fieldInfo))
					.addClass('field-' + name);

			// check if this field isn't hidden
			if (!hidden) {
				var path = parentPath + '.' + name;
                if (!this.isTargetVisible(path)) {
					hidden = true;
				} else {
					// sometimes the field target path is joined with a '-' - so check for these cases as well (e.g. digg.item)
					path = path.split('-');
					var sectionPath = '';
					$.each(path, function(i, section) {
						sectionPath += (i > 0 ? '.' : '') + section;
                        if (!self.isTargetVisible(sectionPath)) {
							hidden = true;
							return true; // break already
						}
					});
				}
			}

			// mark that its suppose to be hidden
			if (hidden) {
				$option.addClass('jcsdl-option-hidden');
			}

			// if it's suppose to be hidden just do one more check
			// with the current filter, because maybe it isn't suppose to be hidden if it's selected
			if (hidden && this.filter && this.filter.target !== undefined && this.filter.fieldPath !== undefined) {
				var cFilterPath = this.filter.target + '.' + this.filter.fieldPath.join('.').replace(/-/g, '.'),
					cPath = parentPath + '.' + name;

				if (cFilterPath === cPath) {
					hidden = false;
				}
			}

			if (hidden) {
				$option.hide();
			}

			return $option;
		},

        /* ##########################
         * SEARCH
         * ########################## */
        /**
         * Populate search results dropdown from defined targets.
         */
        populateSearch : function() {
            var self = this,
                flatten = function(name, definition, targetPath, namePath) {
                    targetPath = targetPath.length ? targetPath + '.' + name : name;
                    namePath = namePath.length ? namePath + '|' + definition.name : definition.name;

                    // break already for targets that shouldn't be visible
                    if (!self.isTargetVisible(targetPath)) {
                        return;
                    }

                    if (definition.fields !== undefined) {
                        $.each(definition.fields, function(key, val) {
                            flatten(key, val, targetPath, namePath);
                        });
                        return;
                    }

                    var $item = self.getTemplate('filterEditor_searchItem');
                    $item.data('name', namePath.replace(/\|/g, ' '))
                        .data('fullname', namePath.replace(/\|/g, ' &raquo; '))
                        .data('target', targetPath)
                        .find('span').html($item.data('fullname'));
                    $item.find('.jcsdl-icon').addClass('target-' + targetPath.split('.')[0]);

                    $item.click(function() {
                        self.selectTarget(targetPath);
                        return false;
                    });

                    $item.appendTo(self.$searchResults);
                };

            $.each(this.definition.targets, function(name, source) {
                flatten(name, source, '', '');
            });
        },

		/* ##########################
		 * SETTERS AND GETTERS
		 * ########################## */
		/**
		 * Returns the current editor view.
		 * 
		 * @return {jQuery}
		 */
		getView : function() {
			return this.$view;
		},

		/**
		 * Returns definition of the field found under the current root path and specified field name.
		 * 
		 * @param  {String} newFieldName
		 * @return mixed Either Object or bool false if no such field was found.
		 */
		getFieldInfoAtCurrentPath : function(newFieldName) {
			var fieldsPath = this.path.slice(0); // copy the array instead of referencing it

			// if specified a following field then include it in the path
			if (typeof newFieldName === 'string') {
				fieldsPath.push(newFieldName);
			}

			// and delegate this task to JCSDL object.
			return this.parser.getFieldInfo(this.target, fieldsPath);
		},

		/**
		 * Returns the current selected path in the filter editor.
		 * 
		 * @return {String}
		 */
		getCurrentPath : function() {
			return this.target + (this.path.length > 0 ? '.' : '') + this.path.join('.').replace(/-/g, '.');
		},

        /**
         * Checks whether the given target is enabled (based on 'hideTargets' and 'showTargets' option).
         *
         * If there are any entries in 'showTargets' then a target to be visible needs to be in there.
         * Otherwise if the target is in 'hideTargets' then it will be hidden.
         * Otherwise it will be displayed.
         * 
         * @param  {String}  name Target name (can be a part of the name).
         * @return {Boolean}
         */
        isTargetVisible : function(name) {
            // for some reason sometimes can be undefined
            if (!name) {
                return false;
            }

            var showTargets = this.config.showTargets;

            if (showTargets.length) {
                // check for the specific target
                if ($.inArray(name, showTargets) >= 0) {
                    return true;
                }

                // specific target not found, but let's see if any of the parents of this target is marked as visible
                var namePath = name.split('.');
                while(namePath.length) {
                    if ($.inArray(namePath.join('.'), showTargets) >= 0) {
                        return true;
                    }

                    namePath.pop();
                }

                // if still no luck then search the other way around
                // check if any children of this target are marked as visible
                var nameAsParent = name + '.';
                for (var i = 0; i < showTargets.length; i++) {
                    if (showTargets[i].indexOf(nameAsParent) === 0) {
                        return true;
                    }
                }

                return false;
            }

            return $.inArray(name, this.config.hideTargets) === -1;
        }

	};

});