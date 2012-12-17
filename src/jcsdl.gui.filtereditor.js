JCSDL.Loader.addComponent(function($, undefined) {

	/**
	 * Single filter editor.
	 * 
	 * @param {JCSDL.GUI} gui GUI instance to which this filter editor belongs.
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

		/** @var JCSDL.Parser */
		this.parser = gui.parser;

		/** @var JCSDL.GUIInputs */
		this.inputs = gui.inputs;

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

		// now we need to display the editor in order for all plugins to be properly sized
		this.$view.appendTo($appendTo).show();

		// by default always prepare the selection of targets first
		this.addFilterStep('target', this.createTargetSelectView());

		// hide the save button until all steps haven't been gone through
		this.$view.find('.jcsdl-filter-save').hide();
		this.$view.find('.jcsdl-footer span').hide();

		/*
		 * REGISTER LISTENERS
		 */
		/**
		 * Saves the filter that is currently being edited when clicked its save button.
		 * 
		 * @param  {Event} ev Click Event.
		 */
		this.$view.find('.jcsdl-filter-save').bind('click touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			self.didSubmitFilter();
		});

		/**
		 * Hides the single filter editor and doesn't save the filter when the cancel button is clicked.
		 * 
		 * @param  {Event} ev Click Event.
		 */
		this.$view.find('.jcsdl-filter-cancel').bind('click touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			self.gui.hideFilterEditor();
			self.trigger('filterCancel');
		});

		// finally load a filter if any specified
		this.loadFilter(filter);
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
		 * Load a filter into the editor.
		 * 
		 * @param  {Object} filter Filter to be loaded.
		 */
		loadFilter : function(filter) {
			var self = this;
			this.filter = filter;

			// if no filter or invalid filter then break
			if (filter === undefined || !filter || filter.target === undefined) return false;

			var fieldInfo = this.parser.getFieldInfo(filter.target, filter.fieldPath);

			this.$view.find('.jcsdl-filter-target .target-' + filter.target).trigger('jcsdlclick');

			// select all fields and subfields
			$.each(filter.fieldPath, function(i, field) {
				var $fieldView = self.$view.find('.jcsdl-filter-target-field:last');
				$fieldView.find('.field-' + field).trigger('jcsdlclick');
			});

			// also select which field based on operator
			if (typeof(fieldInfo.input) !== 'string') {
				this.$view.find('.jcsdl-filter-target-field-input .input-' + filter.operator).trigger('jcsdlclick');
			}

			// select operator
			if (fieldInfo.input == 'text') {
				$('.jcsdl-dropdown .jcsdl-dropdown-option.operator-' + filter.operator).click();
			} else {
				this.$view.find('.jcsdl-filter-value-input-operators .operator-' + filter.operator).click();
			}
			
			// fill in the value (using the proper delegate)
			var $valueInputView = this.$view.find('.jcsdl-filter-value-input-field');
			this.setValueForField($valueInputView, fieldInfo, filter.value, filter.operator);

			// set case sensitivity (if any)
			if (filter.cs) {
				this.$view.find('.jcsdl-operator-cs').click();
			}
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
			var self = this,
				slide = (slide === undefined) ? true : slide,
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
			if (stepName == 'target') {
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
			if (stepName == 'field') {
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
			if (stepName == 'input') {
				$stepView.jcsdlCarousel({
					select : function() {
						var $item = $(this);

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
						self.didSelectInput($item.data('name'), $view, $stepView);
					}
				});
			}
			if (stepName == 'value') {
				// show the submit button
				this.$view.find('.jcsdl-filter-save').fadeIn(this.config.animate);
				this.$view.find('.jcsdl-footer span').show();
			}

			// animate into view nicely
			if (slide) {
				$stepView.hide().slideDown(this.config.animate);
			} else {
				if (stepName == 'field') {
					$stepView.find('.jcsdl-filter-target-field').hide().fadeIn(this.config.animate);
				} else {
					$stepView.hide().fadeIn(this.config.animate);
				}
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
			var $theStep = this.$steps.find('.jcsdl-step').eq(position)
					.removeClass('field-selected'),
				steps = this.steps.splice(position + 1, this.steps.length - position),
				firstName = '';

			// most definetely hide the submit button
			this.$view.find('.jcsdl-filter-save').hide();
			this.$view.find('.jcsdl-footer span').hide();

			$.each(steps, function(i, step) {
				var $step = $(step);

				if (i == 0) {
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
			if (this.definition.targets[targetName] === undefined) return false;

			this.target = targetName;
			this.path = [];

			// remove all steps regarding selection of fields in case another target was selected first
			var firstRemoved = this.removeFilterStepsAfterPosition(0); // target is always position 0

			// now need to select a field, so build the selection view
			var $fieldView = this.createFieldSelectionView(this.definition.targets[targetName].fields);
			this.addFilterStep('field', $fieldView, (firstRemoved != 'field'));

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
			var fieldPosition = $fieldView.data('position');
			this.path.splice(fieldPosition, this.path.length - fieldPosition);

			// also remove the target help, just in case it was added before
			$stepView.removeClass('selected-final').find('.jcsdl-target-help').remove();

			var field = this.getFieldInfoAtCurrentPath(fieldName);
			if (field == false) return;

			// from DOM as well
			var firstRemoved = this.removeFilterStepsAfterPosition($fieldView.closest('.jcsdl-step').data('number'));

			// now proceed with adding the current one
			this.path.push(fieldName);

			// if this fields has some more subfields then add them now
			if (field.fields !== undefined) {
				var $fieldView = this.createFieldSelectionView(field.fields),
					slide = (firstRemoved != 'field');

				this.addFilterStep('field', $fieldView, slide);
				return;
			}

			// if this fields has multiple possible input fields then add a step to choose one
			if (typeof(field.input) !== 'string') {
				var $inputView = this.createInputSelectionView(field.input),
					slide = (firstRemoved != 'input');

				this.addFilterStep('input', $inputView, slide);
				return;
			}

			// this is a "final" field, so now the user needs to input desired value(s)
			var $valueView = this.createValueInputView(field);
			this.addFilterStep('value', $valueView, (firstRemoved != 'value'));

			// also, if this is final selection then show "Learn more" option
			this.addTargetHelpToStep($stepView);

			this.trigger('targetSelect', [this.getCurrentPath()]);
		},

		/**
		 * When an input is selected then the user needs to input a value.
		 * 
		 * @param  {String} inputName  Name of the selected input type.
		 * @param  {jQuery} $inputView The input selection view that was used.
		 * @param  {jQuery} $stepView Step view at which the field was selected.
		 */
		didSelectInput : function(inputName, $inputView, $stepView) {
			// remove any steps that are farther then this one, just in case
			var inputPosition = $inputView.data('position'),
				firstRemoved = this.removeFilterStepsAfterPosition($inputView.closest('.jcsdl-step').data('number'));

			// also remove the target help, just in case it was added before
			$stepView.removeClass('selected-final').find('.jcsdl-target-help').remove();

			// now the user needs to input desired value(s)
			var $valueView = this.createValueInputView(this.getFieldInfoAtCurrentPath(), inputName);
			this.addFilterStep('value', $valueView, (firstRemoved != 'value'));

			// also, if this is final selection then show "Learn more" option
			this.addTargetHelpToStep($stepView);
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
					targetInfo = self.parser.getTargetInfo(target);
					path = self.path.join('-'),
					title = targetInfo.name,
					cPath = [];

				$.each(self.path, function(i, name) {
					cPath.push(name);
					title += ' &raquo; ' + self.parser.getFieldInfo(target, cPath).name;
				});

				// Copes with the differing path names in the Query editor
				var cacheName = path;
				if (target != 'augmentation') { // Augmentations don't live in an augmentation namespace
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

		/**
		 * Handles the saving of a filter from the single filter editor.
		 */
		didSubmitFilter : function() {
			// notify the GUI about the fact that the save button was pressed
			var filterInfo = this.getFilterInfo();
			if (filterInfo) {
				this.gui.didSubmitFilter(filterInfo);
			}
		},

		/* ##########################
		 * VIEW FACTORIES
		 * ########################## */
		/**
		 * Shows an error.
		 * 
		 * @param  {String} message Error message to be displayed.
		 * @param  {String} code    Code that caused the error.
		 */
		showError : function(message, code) {
			// clear all previous errors
			this.$view.find('.jcsdl-error').remove();

			var $error = this.getTemplate('error');
			$error.find('span').html(message);

			$error.prependTo(this.$view.find('.jcsdl-footer'))
				.hide().fadeIn();

			if (console !== undefined) {
				console.error(message, arguments);
			}
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
			if ($.inArray(name, this.config.hideTargets) >= 0) {
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
				if ($.inArray(cPath, self.config.hideTargets) >= 0) {
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
				if ($.inArray(path, self.config.hideTargets) >= 0) {
					hidden = true;
				} else {
					// sometimes the field target path is joined with a '-' - so check for these cases as well (e.g. digg.item)
					path = path.split('-');
					var sectionPath = '';
					$.each(path, function(i, section) {
						sectionPath += (i > 0 ? '.' : '') + section;
						if ($.inArray(sectionPath, self.config.hideTargets) >= 0) {
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

				if (cFilterPath == cPath) {
					hidden = false;
				}
			}

			if (hidden) {
				$option.hide();
			}

			return $option;
		},

		/**
		 * Creates an value input fields selection view for the given collection of possible inputs.
		 * 
		 * @param  {Object} inputs Collection of possible inputs.
		 * @return {jQuery}
		 */
		createInputSelectionView : function(inputs) {
			var self = this,
				$inputView = this.getTemplate('inputSelect'),
				$inputSelect = $inputView.find('.jcsdl-filter-target-field-input');

			// add all possible selections
			$.each(inputs, function(i, name) {
				var $inputOptionView = self.createOptionForInput(name);
				$inputOptionView.appendTo($inputSelect);
			});

			return $inputView;
		},

		/**
		 * Creates a select option for the given value input type.
		 * 
		 * @param  {String} name  Unique name of the value input type.
		 * @return {jQuery}
		 */
		createOptionForInput : function(name) {
			var $option = this.getTemplate('inputSelectOption')
				.data('name', name)
				.addClass('icon-' + name + ' input-' + name)
				.html(name);
			return $option;
		},

		/* ##########################
		 * FILTER VALUE INPUTS
		 * ########################## */
		/**
		 * Creates a DOM element for inputting the value for the given field.
		 * 
		 * @param  {Object} field Definition of the field from JCSDL definition.
		 * @param  {String} inputType Which input type to use (if many).
		 * @return {jQuery}
		 */
		createValueInputView : function(field, inputType) {
			inputType = inputType || field.input;
			var self = this,
				$valueView = this.getTemplate('valueInput');

			if (this.inputs[inputType] === undefined) return $valueView;

			// create the input view by this input type's handler and add it to the value view container
			var $inputView = this.inputs.exec(inputType, 'init', [field]),
				$input = $inputView.find('input:first'),
				$valueInput = $valueView.find('.jcsdl-filter-value-input-field')
					.data('inputType', inputType)
					.html($inputView),
				$operatorsListView = $valueView.find('.jcsdl-filter-value-input-operators');

			// create a list of possible operators
			if (inputType == 'text') {
				this.createTextOperatorsSelectView($operatorsListView, field, inputType, $valueInput);
			} else {
				this.createOperatorsSelectView($operatorsListView, field, inputType, $valueInput);
			}

			return $valueView;
		},

		/**
		 * Create operators selection for most input fields.
		 * 
		 * @param  {jQuery} $view      Operators list view.
		 * @param  {Object} field      Field definition from JCSDL Definition.
		 * @param  {String} inputType  Name of the input type.
		 * @param  {jQuery} $inputView View of the input.
		 * @return {jQuery}            Should return the original $view with appended operators.
		 */
		createOperatorsSelectView : function($view, field, inputType, $inputView) {
			var self = this,
				$input = $inputView.find('input:first'),

				// get the config definition of this input type (if any) and a list of allowed operators
				inputConfig = (this.definition.inputs[inputType] !== undefined) ? this.definition.inputs[inputType] : {},
				allowedOperators = (inputConfig.operators !== undefined) ? inputConfig.operators : [];

			$.each(field.operators, function(i, operator) {
				// if a list of allowed operators is defined and this operator is not on it, then continue to the next one
				if (allowedOperators.length > 0 && ($.inArray(operator, allowedOperators) == -1)) return true;

				var $operatorView = self.createOperatorOptionView(operator);
				if ($.browser.msie) {
					$operatorView.html('&nbsp;');
				}
				$view.append($operatorView);
			});

			/**
			 * Listen for clicks on the operators and select the clicked one.
			 * If 'exists' operator selected then hide the value input.
			 * 
			 * @param  {Event} ev
			 * @listener
			 */
			$view.children().bind('click touchstart', function(ev) {
				ev.preventDefault();
				ev.target.blur();

				var $operator = $(this),
					opName = $operator.data('name');

				$view.children().removeClass('selected');
				$operator.addClass('selected');

				if (opName == 'exists') {
					$inputView.fadeOut(self.config.animate);
				} else if (!$inputView.is(':visible')) {
					$inputView.fadeIn(self.config.animate);
				}

				// for text or number input field enable/disable the tag input
				if (inputType == 'number') {
					var tagAction = ($.inArray(opName, inputConfig.arrayOperators) >= 0) ? 'enable' : 'disable';
					$input.jcsdlTagInput(tagAction);
				}

				self.trigger('operatorSelect', [opName]);
			});

			// if there's only one possible operator then automatically select it and hide it
			if ($view.children().length == 1) {
				$view.children().eq(0).click();
				$view.children().hide();
			} else {
				var preselect = (field.operator !== undefined) ? field.operator : inputConfig.operator,
					$preselect = $view.find('.operator-' + preselect);

				// if preselected operator exists then select it
				if ($preselect.length > 0) {
					$preselect.click();
				} else {
					// if not, then select first operator (other than "exists")
					$view.find('.operator:not(.operator-exists):first').click();
				}
			}

			return $view;
		},

		/**
		 * Create operators selection for text input fields.
		 * 
		 * @param  {jQuery} $view      Operators list view.
		 * @param  {Object} field      Field definition from JCSDL Definition.
		 * @param  {String} inputType  Name of the input type.
		 * @param  {jQuery} $inputView View of the input.
		 * @return {jQuery}            Should return the original $view with appended operators.
		 */
		createTextOperatorsSelectView : function($view, field, inputType, $inputView) {
			var self = this;

			// remove all old dropdowns
			$('.jcsdl-dropdown').remove();

			$view.addClass('text');
			var $input = $inputView.find('input.orig'),
				$select = this.getTemplate('textOperatorsSelect'),
				$dropdown = this.getTemplate('textOperatorsDropdown'),

				// get the config definition of this input type (if any) and a list of allowed operators
				inputConfig = (this.definition.inputs[inputType] !== undefined) ? this.definition.inputs[inputType] : {},
				allowedOperators = (inputConfig.operators !== undefined) ? inputConfig.operators : [];

			$.each(field.operators, function(i, operator) {
				// if a list of allowed operators is defined and this operator is not on it, then continue to the next one
				if (allowedOperators.length > 0 && ($.inArray(operator, allowedOperators) == -1)) return true;

				var $operatorView = self.createTextOperatorOptionView(operator);
				$dropdown.append($operatorView);
			});

			$view.html($select).insertAfter($inputView);
			$dropdown.hide().appendTo('body');

			// add case sensitivity toggle
			if (field.cs) {
				var $csView = this.getTemplate('caseSensitivity');
				$csView.bind('click touchstart', function(ev) {
					ev.preventDefault();
					ev.target.blur();
					$(this).toggleClass('selected');
					self.trigger('caseSensitivityChange', [$(this).is('.selected')]);
				}).tipsy({gravity:'s',offset:9});

				$csView.prependTo($view);
				$select.addClass('has-cs');
			}

			/*
			 * LISTENERS
			 */
			/**
			 * Shows the operators dropdown when clicked on the select box.
			 * 
			 * @param  {Event} ev Click event.
			 * @listener
			 */
			$select.click(function(ev) {
				ev.preventDefault();
				ev.target.blur();
				ev.stopPropagation();

				// if already visible then hide it
				if ($select.hasClass('active')) {
					$dropdown.slideUp(self.config.animate);
					$select.removeClass('active');

				} else {
					// update position of the dropdown and show it
					$dropdown.css({
						top : $select.offset().top + $select.outerHeight() - 1,
						left : $select.offset().left,
						width : $select.outerWidth() - 2
					}).slideDown(self.config.animate);
					$select.addClass('active');

					// hide on click out
					$('body').bind('click.jcsdldropdown', function(ev) {
						var $parent = $(ev.target).closest('.jcsdl-dropdown');
						if ($parent == null || !$parent.is('.jcsdl-dropdown')) {
							$select.removeClass('active');
							$dropdown.slideUp(self.config.animate);
							$('body').unbind('click.jcsdldropdown');
						}
					});
				}
			});

			/**
			 * Shows details of the operator.
			 * 
			 * @param  {Event} ev Click event.
			 * @listener
			 */
			$dropdown.find('.jcsdl-dropdown-details-trigger, .jcsdl-operator-help').click(function(ev) {
				ev.preventDefault();
				ev.target.blur();
				ev.stopPropagation();

				var $option = $(this).closest('.jcsdl-dropdown-option'),
					name = $option.data('name'),
					popup = $.jcsdlPopup({
						title : $option.data('title')
					});

				if (self.jsonpCache.operators[name] === undefined) {
					$.ajax({
						url : $option.data('jsonp'),
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

							self.jsonpCache.operators[name] = data.html;
						}
					});
				} else {
					popup.setContent(self.jsonpCache.operators[name]);
					popup.reposition();
				}
			});

			/**
			 * Select the operator when it was clicked in the dropdown.
			 * 
			 * @param  {Event} ev Click event.
			 * @listener
			 */
			$dropdown.find('.jcsdl-dropdown-option').click(function(ev) {
				ev.preventDefault();
				ev.target.blur();

				$select.removeClass('active');
				$dropdown.hide();

				var name = $(this).data('name'),
					operator = self.definition.operators[name];

				$select.data('operator', name)
					.find('.jcsdl-operator-label').html(operator.label);

				if (name == 'exists') {
					$inputView.fadeOut(self.config.animate);
					if (field.cs) {
						$csView.fadeOut(self.config.animate);
					}
				} else if (!$inputView.is(':visible')) {
					$inputView.fadeIn(self.config.animate);
					if (field.cs) {
						$csView.fadeIn(self.config.animate);
					}
				}

				if (name == 'contains_near') {
					$inputView.find('.jcsdl-containsnear-distance').fadeIn();

					// dont allow space
					$inputView.find('.jcsdl-tag-field input').bind('keydown.nospace', function(ev) {
						if (ev.which == 32) {
							ev.preventDefault();
							return;
						}
					});

					$input.jcsdlTagInput('update', true);
					$input.data('split', true);

				} else {
					$inputView.find('.jcsdl-containsnear-distance').hide();
					
					// allow space again
					$inputView.find('.jcsdl-tag-field input').unbind('keydown.nospace');
					if ($input.data('split')) {
						$input.jcsdlTagInput('update');
						$input.data('split', false);
					}
				}

				var tagAction = ($.inArray(name, inputConfig.arrayOperators) >= 0) ? 'enable' : 'disable';
				$input.jcsdlTagInput(tagAction);
				if (tagAction == 'enable') {
					$input.jcsdlTagInput('update');
				}

				var regExAction = ($.inArray(name, ['regex_partial', 'regex_exact']) >= 0) ? 'enable' : 'disable';
				$input.jcsdlRegExTester(regExAction);
				if (regExAction == 'enable') {
					var regExSetting = (name == 'regex_partial') ? 'Partial' : 'Exact';
					$input.jcsdlRegExTester('set' + regExSetting);
					$input.jcsdlRegExTester('test');
				}

				self.trigger('operatorSelect', [name]);
			});

			/**
			 * Resize the dropdown to match the original input when the window resizes.
			 * 
			 * @param  {Event} ev Window resize event.
			 * @listener
			 */
			$(window).resize(function(ev) {
				// do it only when dropdown actually visible
				if (!$select.hasClass('active')) return;

				$dropdown.css({
					top : $select.offset().top + $select.outerHeight() - 1,
					left : $select.offset().left,
					width : $select.outerWidth() - 2
				});
			});

			// if there's only one possible operator then automatically select it and hide it
			if ($dropdown.find('.jcsdl-dropdown-option').length == 1) {
				$dropdown.find('.jcsdl-dropdown-option:first').click();
			} else {
				var preselect = (field.operator !== undefined) ? field.operator : inputConfig.operator,
					$preselect = $dropdown.find('.jcsdl-dropdown-option.operator-' + preselect);

				// if preselected operator exists then select it
				if ($preselect.length > 0) {
					$preselect.click();
				} else {
					// if not, then select first operator (other than "exists")
					$dropdown.find('.jcsdl-dropdown-option:not(.operator-exists):first').click();
				}
			}

			return $view;
		},

		/**
		 * Creates a single operator select view for the specified operator.
		 * 
		 * @param  {String} name Name of the operator.
		 * @return {jQuery}
		 */
		createOperatorOptionView : function(name) {
			var operator = this.definition.operators[name];
			if (operator === undefined) return $(); // return empty jquery object if no such operator defined

			var $operatorView = this.getTemplate('operatorOption')
				.data('name', name)
				.addClass('icon-' + name + ' operator-' + name)
				.attr('title', operator.description)
				.html(operator.label)
				.tipsy({gravity:'s',offset:9});
			return $operatorView;
		},

		/**
		 * Creates a single operator view for operators selection for text inputs.
		 * 
		 * @param  {String} name Name of the operator.
		 * @return {jQuery} View of the operator.
		 */
		createTextOperatorOptionView : function(name) {
			var operator = this.definition.operators[name];
			if (operator === undefined) return $();

			var $view = this.getTemplate('textOperatorOption')
				.data('name', name)
				.data('title', operator.label)
				.addClass('operator-' + name);

			$view.find('.jcsdl-icon').addClass('icon-' + name + ' operator-' + name + ' selected');
			$view.find('.jcsdl-operator-label span').html(operator.label);
			$view.find('.jcsdl-operator-desc').html(operator.description);

			if (operator.jsonp) {
				$view.data('jsonp', operator.jsonp);
			} else {
				$view.find('.jcsdl-dropdown-details-trigger').remove();
				$view.find('.jcsdl-operator-help').remove();
			}

			return $view;
		},

		/**
		 * Sets the value for the given vale view (delegates it to proper function that will handle the specific view).
		 * 
		 * @param {jQuery} $view Value input view.
		 * @param {String} value String representation of the value to be set.
		 * @return {Boolean}
		 */
		setValueForField : function($view, fieldInfo, value, operator) {
			var self = this,
				inputType = $view.data('inputType');

			if (this.inputs[inputType] === undefined) return false;

			// for these 3 field types we need a delayed set value and an additional function to be called
			if ($.inArray(inputType, ['geo_box', 'geo_radius', 'geo_polygon']) >= 0) {
				// store the current gui, callback and its arguments in local values (in case they change in the meantime)
				var mapsGui = jcsdlMapsCurrentGui, // these are global
					mapsCallback = jcsdlMapsCurrentCallback,
					mapsCallbackArgs = jcsdlMapsCurrentCallbackArgs;

				// override the callback - this will be called once the google maps api is fully loaded
				jcsdlMapsCurrentCallback = function() {
					// make sure all is ok
					if (mapsGui && mapsCallback) {
						setTimeout(function() {
							// execute the standard callback (should be this.inputs[inputType].load typically)
							mapsCallback.apply(mapsGui.inputs, mapsCallbackArgs);

							// and now when the maps are loaded, execute the setValue method of that input
							self.inputs.exec(inputType, 'setValue', [$view, fieldInfo, value, operator]);
						}, mapsGui.config.animate + 10); // make sure the map canvas is fully visible before loading them
					}
				};
			} else {
				this.inputs.exec(inputType, 'setValue', [$view, fieldInfo, value, operator]);
			}
			return true;
		},

		/**
		 * Reads the value from the given value view (delegates it to proper function that will handle the specific view).
		 * 
		 * @param  {jQuery} $view Value input view.
		 * @return {String}
		 */
		getValueFromField : function($view, fieldInfo, operator) {
			var inputType = $view.data('inputType');
			if (this.inputs[inputType] === undefined) return '';
			return this.inputs.exec(inputType, 'getValue', [$view, fieldInfo, operator]);
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
		 * Returns the filter info that's being edited based on the current selections.
		 * 
		 * @return {Object} Filter object.
		 */
		getFilterInfo : function() {
			var fieldInfo = this.getFieldInfoAtCurrentPath();

			// read the operator
			var operator = (fieldInfo.input == 'text')
					? this.$view.find('.jcsdl-filter-value-input-operators .jcsdl-operators-select').data('operator')
					: this.$view.find('.jcsdl-filter-value-input-operators .operator.selected').data('name');
			if (operator === undefined) {
				this.showError('You need to select an operator!');
				return;
			}

			// then check if there is a value specified (only if operator is something else than 'exists')
			var value = '';
			if (operator !== 'exists') {
				var $valueView = this.$view.find('.jcsdl-filter-value-input-field');
				value = this.getValueFromField($valueView, fieldInfo, operator);
				if (value.length == 0) {
					this.showError('You need to specify a value!');
					return;
				}
			}

			// now that we have all data, let's create a filter object from this
			var filterInfo = {
				target : this.target,
				path : this.path,
				operator : operator,
				value : value,
				additional : {
					cs : ((operator !== 'exists') && fieldInfo.cs && this.$view.find('.jcsdl-operator-cs.selected').length > 0) ? true : false
				}
			};

			return filterInfo;
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
			if (typeof(newFieldName) == 'string') {
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
		}

	};

});