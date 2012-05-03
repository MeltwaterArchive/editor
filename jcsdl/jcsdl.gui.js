var JCSDLGui = function(el, config) {
	var self = this;

	var $el = $(el); // ensure that the container element is a jQuery object
	if ($el.length == 0) return false; // break if no such element in DOM

	self.$container = $();

	/** @var {JCSDL} The actual JCSDL "parser". */
	var jcsdl = new JCSDL(this);

	this.config = $.extend(true, {
		animationSpeed : 200,
		displayCancelButton : true,
		save : function(code) {},
		cancel : function() {
			self.$container.hide();
		}
	}, config);

	// data
	this.logic = 'AND';
	this.filters = [];

	// current choice data
	this.currentFilterIndex = null;
	this.currentFilterSteps = [];
	this.currentFilterTarget = null;
	this.currentFilterFieldsPath = [];

	// DOM elements
	this.$mainView = $();
	this.$filtersList = $();
	this.$currentFilterView = $();

	// all templates are defined elsewhere
	this.templates = JCSDLGuiTemplates;

	/*
	 * INITIALIZE THE EDITOR
	 */
	/**
	 * Initializes (or reinitializes) the JCSDL GUI Editor.
	 */
	this.init = function() {
		// reset everything in case this is a reinitialization
		self.logic = 'AND';
		self.filters = [];

		self.currentFilterIndex = null;
		self.currentFilterSteps = [];
		self.currentFilterTarget = null;
		self.currentFilterFieldsPath = [];
		self.$currentFilterView = $();
		self.$currentFilterStepsView = $();

		// and insert the editor into the container
		self.$mainView = self.getTemplate('editor');
		self.$filtersList = self.$mainView.find('.jcsdl-filters-list');

		self.$container = self.getTemplate('container');
		self.$container.html(self.$mainView);
		$el.html(self.$container);

		// hide the cancel button if so desired
		if (!self.config.displayCancelButton) {
			self.$mainView.find('.jcsdl-editor-cancel').hide();
		}

		/*
		 * REGISTER LISTENERS
		 */
		/**
		 * Set the logic upon selection.
		 * @param  {Event} ev
		 */
		self.$mainView.find('.jcsdl-filters-logic input[name="logic"]').change(function(ev) {
			self.logic = $(this).val();
		});

		/**
		 * Switch between expanded and collapsed view mode of filters list.
		 * @param  {Event} ev
		 */
		self.$mainView.find('.jcsdl-mainview-mode .jcsdl-mainview-mode-option').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var $this = $(this);

			self.$filtersList.removeClass('expanded collapsed');
			self.$filtersList.addClass($this.data('mode'));

			self.$mainView.find('.jcsdl-mainview-mode .jcsdl-mainview-mode-option').removeClass('active');
			$this.addClass('active');
		});

		/**
		 * Show filter editor to create a new one from scratch upon clicking 'Add filter'.
		 * @param  {Event} ev Click Event.
		 */
		self.$mainView.find('.jcsdl-add-filter').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			self.showFilterEditor();
		});

		/**
		 * Handle output / returning of the resulting JCSDL upon clicking save.
		 * @param  {Event} ev Click Event.
		 */
		self.$mainView.find('.jcsdl-editor-save').bind('click.jcsdl', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			self.returnJCSDL();
		});

		/**
		 * Handle pressing the cancel button,
		 * @param  {Event} ev Click Event.
		 */
		self.$mainView.find('.jcsdl-editor-cancel').bind('click.jcsdl', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			self.config.cancel.apply(self, []);
		});
	};

	/**
	 * Loads the given JCSDL string and builds the whole editor based on it.
	 * @param  {String} code JCSDL string.
	 */
	this.loadJCSDL = function(code) {
		this.init(); // just in case we're loading JCSDL for a 2nd time

		var parsed = jcsdl.parseJCSDL(code);
		if (parsed === false) {
			self.showError('Invalid JCSDL input!', code);
			return;
		}

		self.logic = (parsed.logic == 'AND') ? 'AND' : 'OR';
		self.filters = parsed.filters;

		// mark the logic
		self.$mainView.find('.jcsdl-filters-logic input[name="logic"][value="' + self.logic + '"]').click();
		
		// display the filters
		// add each filter to the list
		$.each(self.filters, function(i, filter) {
			var $filterRow = createFilterRow(filter);
			$filterRow.appendTo(self.$filtersList);
		});

		// make the cancel button visible
		self.$mainView.find('.jcsdl-editor-cancel').show();
	};

	/**
	 * Returns the JCSDL
	 * @return {[type]}
	 */
	this.returnJCSDL = function() {
		var code = jcsdl.getJCSDLForFilters(self.filters, self.logic);
		self.config.save.apply(self, [code]);
	};

	/* ##########################
	 * FILTER MANAGEMENT (ADDING, EDITOR and DELETING)
	 * ########################## */
	/**
	 * Shows the filter editor.
	 */
	this.showFilterEditor = function(filter, filterIndex) {
		self.$mainView.hide();

		// prepare the filter editor
		self.$currentFilterView = self.getTemplate('filterEditor');
		self.$currentFilterStepsView = self.$currentFilterView.find('.jcsdl-steps');

		// append the filter editor to the container and show it
		self.$currentFilterView.appendTo(self.$container);
		self.$currentFilterView.show();

		// now that it's visible configure it
		// (it needs to be visible before configuration so various element's have dimensions higher than 0)
		self.initFilterEditor();

		// if specified filter then load it into the editor
		if (typeof(filter) !== 'undefined' && filter) {
			self.currentFilterIndex = filterIndex;

			var fieldInfo = jcsdl.getFieldInfo(filter.target, filter.fieldPath);

			self.$currentFilterView.find('.jcsdl-filter-target .target-' + filter.target).click();

			// select all fields and subfields
			$.each(filter.fieldPath, function(i, field) {
				var $fieldView = self.$currentFilterView.find('.jcsdl-filter-target-field:last');
				$fieldView.find('.field-' + field).click();
			});

			// select operator
			self.$currentFilterView.find('.jcsdl-filter-value-input-operators .operator-' + filter.operator).click();
			
			// fill in the value (using the proper delegate)
			var $valueInputView = self.$currentFilterView.find('.jcsdl-filter-value-input-field');
			setValueForField($valueInputView, fieldInfo, filter.value);

			// set case sensitivity (if any)
			if (filter.cs) {
				self.$currentFilterView.find('.jcsdl-operator-cs').click();
			}
		}
	};

	/**
	 * Initializes and returns the filter editor.
	 * @return {jQuery} Filter Editor element.
	 */
	this.initFilterEditor = function(filter, filterIndex) {
		// by default always prepare the selection of targets first
		var $targetSelectView = createTargetSelectView();
		self.addFilterStep('target', $targetSelectView);

		// hide the save button until all steps haven't been gone through
		self.$currentFilterView.find('.jcsdl-filter-save').hide();
		self.$currentFilterView.find('.jcsdl-footer span').hide();

		/*
		 * REGISTER PROPER LISTENERS
		 */
		/**
		 * Saves the filter that is currently being edited when clicked its save button.
		 * @param  {Event} ev Click Event.
		 */
		self.$currentFilterView.find('.jcsdl-filter-save').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();
			self.didSubmitFilter();
		});

		/**
		 * Hides the single filter editor and doesn't save the filter when the cancel button is clicked.
		 * @param  {Event} ev Click Event.
		 */
		self.$currentFilterView.find('.jcsdl-filter-cancel').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();
			self.hideFilterEditor();
		});
	};

	/**
	 * Hides the filter editor and shows the main editor view.
	 * NOTICE: This does not save the filter!
	 */
	this.hideFilterEditor = function() {
		// clear all the values
		self.currentFilterIndex = null;
		self.currentFilterSteps = [];
		self.currentFilterTarget = null;
		self.currentFilterFieldsPath = [];

		self.$currentFilterView.fadeOut(self.config.animationSpeed, function() {
			self.$currentFilterView.remove();
			self.$mainView.show();
		});
	};

	/**
	 * Removes the filter at the given index.
	 * @param  {Number} index
	 */
	this.deleteFilter = function(index) {
		// remove from the DOM
		self.$filtersList.find('.jcsdl-filter').eq(index).remove();

		// remove from the filters list
		self.filters.splice(index, 1);
	};

	/* ##########################
	 * FILTER EDITOR STEPS
	 * ########################## */
	/**
	 * Adds a filter step with proper numbering/position.
	 * @param {String} stepName Name of the step.
	 * @param {jQuery} $view    View of the step.
	 * @param {Boolean} slide[optional] Should the displaying of the step be a slide down animate (true) or a fade in (false). Default: true.
	 */
	this.addFilterStep = function(stepName, $view, slide) {
		var slide = (typeof(slide) == 'undefined') ? true : slide;

		var $stepView = self.getTemplate('step');
		$stepView.html($view);

		var stepNumber = self.currentFilterSteps.length;

		// attach some data and classes (for easy selectors)
		$stepView.data('number', stepNumber);
		$stepView.addClass('jcsdl-filter-step-number-' + stepNumber);
		$stepView.data('name', stepName);
		$stepView.addClass('jcsdl-filter-step-' + stepName);

		// add to the DOM
		$stepView.appendTo(self.$currentFilterStepsView);

		// if target or field select then initiate the carousel on it
		if (stepName == 'target') {
			$stepView.jcsdlCarousel({
				select : function() {
					var $item = $(this);

					// mark the current step that it has been selected
					$stepView.addClass('selected');

					// mark the selected item
					$stepView.find('.jcsdl-carousel-item.selected').removeClass('selected');
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
					self.$currentFilterStepsView.find('.jcsdl-filter-step-target').addClass('field-selected');

					// mark the previous step that its' child has now been selected
					var previousStep = $stepView.data('number') - 1;
					self.$currentFilterStepsView.find('.jcsdl-filter-step-field.jcsdl-filter-step-number-' + previousStep).addClass('field-selected');

					// mark the current step that it has been selected
					$stepView.addClass('selected');

					// mark the selected item
					$stepView.find('.jcsdl-carousel-item.selected').removeClass('selected');
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
					self.$currentFilterStepsView.find('.jcsdl-filter-step-field.jcsdl-filter-step-number-' + previousStep).addClass('field-selected');

					// mark the current step that it has been selected
					$stepView.addClass('selected');

					// mark the selected item
					$stepView.find('.jcsdl-carousel-item.selected').removeClass('selected');
					$item.addClass('selected');

					// call the callback
					self.didSelectInput($item.data('name'), $view, $stepView);
				}
			});
		}
		if (stepName == 'value') {
			// show the submit button
			self.$currentFilterView.find('.jcsdl-filter-save').fadeIn(self.config.animationSpeed);
			self.$currentFilterView.find('.jcsdl-footer span').show();
		}

		// animate into view nicely
		if (slide) {
			$stepView.hide().slideDown(self.config.animationSpeed);
		} else {
			if (stepName == 'field') {
				$stepView.find('.jcsdl-filter-target-field').hide().fadeIn(self.config.animationSpeed);
			} else {
				$stepView.hide().fadeIn(self.config.animationSpeed);
			}
		}

		// adjust all carousels because the document size might have changed (right scroll bar might have appeared, but that doesn't trigger window.resize event)
		setTimeout(function() {
			self.$currentFilterStepsView.find('.jcsdl-step').jcsdlCarousel('adjust');
		}, self.config.animationSpeed);

		// add to the steps pool
		self.currentFilterSteps.push($stepView);
	};

	/**
	 * Removes all filter steps after the given position.
	 * Also clears the resulting CSDL if there was any before.
	 * @param  {Integer} position
	 * @return {String}  Name of the first step that was removed.
	 */
	this.removeFilterStepsAfterPosition = function(position) {
		// mark the step that stays that no longer any fields are selected
		var $theStep = self.$currentFilterStepsView.find('.jcsdl-step').eq(position);
		$theStep.removeClass('field-selected');

		// most definetely hide the submit button
		self.$currentFilterView.find('.jcsdl-filter-save').hide();
		self.$currentFilterView.find('.jcsdl-footer span').hide();

		var steps = self.currentFilterSteps.splice(position + 1, self.currentFilterSteps.length - position);
		var firstName = '';
		$.each(steps, function(i, step) {
			var $step = $(step);

			if (i == 0) {
				firstName = $step.data('name');
			}
			$step.remove(); // ensure jQuery
		});

		return firstName;
	};

	/**
	 * When a target is selected, the user needs to select a field.
	 * @param  {String} targetName Name of the selected target.
	 */
	this.didSelectTarget = function(targetName) {
		if (typeof(JCSDLConfig.targets[targetName]) == 'undefined') return false;

		self.currentFilterTarget = targetName;
		self.currentFilterFieldsPath = [];

		// remove all steps regarding selection of fields in case another target was selected first
		var firstRemoved = self.removeFilterStepsAfterPosition(0); // target is always position 0

		// now need to select a field, so build the selection view
		var $fieldView = createFieldSelectionView(JCSDLConfig.targets[targetName].fields);
		self.addFilterStep('field', $fieldView, (firstRemoved != 'field'));
	};

	/**
	 * When a field is selected then the user either needs to input a value or select a subfield if such exists.
	 * @param  {String} fieldName  Name of the selected field.
	 * @param  {jQuery} $fieldView The field selection view that was used.
	 * @param  {jQuery} $stepView Step view at which the field was selected.
	 */
	this.didSelectField = function(fieldName, $fieldView, $stepView) {
		// remove any steps that are farther then this one, just in case
		var fieldPosition = $fieldView.data('position');
		self.currentFilterFieldsPath.splice(fieldPosition, self.currentFilterFieldsPath.length - fieldPosition);

		var field = getFieldInfoAtCurrentPath(fieldName);
		if (field == false) return;

		// from DOM as well
		var firstRemoved = self.removeFilterStepsAfterPosition($fieldView.closest('.jcsdl-step').data('number'));

		// now proceed with adding the current one
		self.currentFilterFieldsPath.push(fieldName);

		// if this fields has some more subfields then add them now
		if (typeof(field.fields) !== 'undefined') {
			var $fieldView = createFieldSelectionView(field.fields);
			var slide = (firstRemoved != 'field');
			self.addFilterStep('field', $fieldView, slide);
			return;
		}

		// if this fields has multiple possible input fields then add a step to choose one
		if (typeof(field.input) !== 'string') {
			var $inputView = createInputSelectionView(field.input);
			var slide = (firstRemoved != 'input');
			self.addFilterStep('input', $inputView, slide);
			return;
		}

		// this is a "final" field, so now the user needs to input desired value(s)
		var $valueView = createValueInputView(field);
		self.addFilterStep('value', $valueView, (firstRemoved != 'value'));
	};

	/**
	 * When an input is selected then the user needs to input a value.
	 * @param  {String} inputName  Name of the selected input type.
	 * @param  {jQuery} $inputView The input selection view that was used.
	 * @param  {jQuery} $stepView Step view at which the field was selected.
	 */
	this.didSelectInput = function(inputName, $inputView, $stepView) {
		// remove any steps that are farther then this one, just in case
		var inputPosition = $inputView.data('position');
		var firstRemoved = self.removeFilterStepsAfterPosition($inputView.closest('.jcsdl-step').data('number'));

		// now the user needs to input desired value(s)
		var $valueView = createValueInputView(getFieldInfoAtCurrentPath(), inputName);
		self.addFilterStep('value', $valueView, (firstRemoved != 'value'));
	};

	/**
	 * Handles the saving of a filter from the single filter editor.
	 */
	this.didSubmitFilter = function() {
		var fieldInfo = getFieldInfoAtCurrentPath();

		// first check if the operator is selected
		var operator = self.$currentFilterView.find('.jcsdl-filter-value-input-operators .operator.selected').data('name');
		if (typeof(operator) == 'undefined') {
			self.showError('You need to select an operator!');
			return;
		}

		// then check if there is a value specified (only if operator is something else than 'exists')
		var value = '';
		if (operator !== 'exists') {
			var $valueView = self.$currentFilterView.find('.jcsdl-filter-value-input-field');
			value = getValueFromField($valueView, fieldInfo);
			if (value.length == 0) {
				self.showError('You need to specify a value!');
				return;
			}
		}

		// now that we have all data, let's create a filter object from this
		var filter = jcsdl.createFilter(self.currentFilterTarget, self.currentFilterFieldsPath, operator, value, {
			cs : ((operator !== 'exists') && fieldInfo.cs && self.$currentFilterView.find('.jcsdl-operator-cs.selected').length > 0) ? true : false
		});

		// also the filter row
		var $filterRow = createFilterRow(filter);

		// and now finally either add it to the end of the filters list
		// or replace if we were editing another filter
		if (self.currentFilterIndex !== null) {
			// we were editing, so let's replace it
			self.$filtersList.find('.jcsdl-filter').eq(self.currentFilterIndex).replaceWith($filterRow);
			self.filters[self.currentFilterIndex] = filter;
			
		} else {
			// we were adding a filter, so simply add it to the list
			$filterRow.appendTo(self.$filtersList);
			self.filters.push(filter);
		}

		self.hideFilterEditor();
	};

	/* ##########################
	 * HELPERS
	 * ########################## */
	/**
	 * Shows an error.
	 * @param  {String} message Error message to be displayed.
	 * @param  {String} code    Code that caused the error.
	 */
	this.showError = function(message, code) {
		alert(message + "\n\n##################\n\n" + code + "\n\n#####\n\n See console for more info.");
		console.error(message, arguments);
	};

	/**
	 * Creates a filter row element for the specified filter.
	 * @param  {Object} filter Filter object.
	 * @return {jQuery}
	 */
	var createFilterRow = function(filter) {
		var $filterRow = self.getTemplate('filter');

		// fill with data
		// target
		var $target = self.getTemplate('filterTarget');
		var targetInfo = jcsdl.getTargetInfo(filter.target);
		$target.addClass('selected target-' + filter.target).html(targetInfo.name);
		$filterRow.find('.target').html($target);

		// fields (separate icon for each field in path)
		var currentPath = [];
		$.each(filter.fieldPath, function(i, field) {
			currentPath.push(field);

			var $field = self.getTemplate('filterField');
			var fieldInfo = jcsdl.getFieldInfo(filter.target, currentPath);

			$field.addClass('selected icon-' + getIconForField(field, fieldInfo));
			$field.html(fieldInfo.name);

			$filterRow.find('.jcsdl-filter-info.field').append($field);
		});

		// get the field definition
		var field = jcsdl.getFieldInfo(filter.target, currentPath);

		// operator
		var $operator = self.getTemplate('filterOperator');
		$operator.addClass('operator-' + filter.operator + ' icon-' + filter.operator + ' selected')
			.prop('title', JCSDLConfig.operators[filter.operator].description)
			.html(JCSDLConfig.operators[filter.operator].code.escapeHtml())
			.tipsy({gravity:'s'});
		$filterRow.find('.operator').html($operator);

		// value (but not for 'exists' operator)
		if (filter.operator !== 'exists') {
			var $value = $();
			// use a custom display value function for this field's input type (if any)
			if (typeof(fieldTypes[field.input].displayValue) == 'function') {
				$value = fieldTypes[field.input].displayValue.apply(fieldTypes[field.input], [field, filter.value, filter]);

			// or display a standard text
			} else {
				$value = self.getTemplate('filterValue');
				$value.html(filter.value.truncate(50).escapeHtml());
			}

			$filterRow.find('.value').addClass('input-' + field.input).html($value);

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
		 * @param  {Event} ev Click Event.
		 */
		$filterRow.find('.edit').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var index = self.getFilterIndexByElement($filterRow);
			self.showFilterEditor(filter, index);
		});

		/**
		 * Delete the filter when clicked on delete option.
		 * @param  {Event} ev Click Event.
		 */
		$filterRow.find('.delete').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var index = self.getFilterIndexByElement($filterRow);
			self.deleteFilter(index);
		});

		return $filterRow;
	};

	/**
	 * Creates the target select view for single filter editor.
	 * @return {jQuery}
	 */
	var createTargetSelectView = function() {
		var $targetSelectView = self.getTemplate('target');
		var $targetSelect = $targetSelectView.find('.jcsdl-filter-target');

		// create a select option for every possible target
		$.each(JCSDLConfig.targets, function(name, target) {
			// delegate creation of the option to a function
			var $targetView = createOptionForTarget(name, target);

			// append the option to the select
			$targetView.appendTo($targetSelect);
		});

		return $targetSelectView;
	};

	/**
	 * Creates a select option for the given target with the specified name.
	 * @param  {String} name   Unique name of the target, matching one from JCSDLConfig.
	 * @param  {Object} target Definition of the target from JCSDLConfig.
	 * @return {jQuery}
	 */
	var createOptionForTarget = function(name, target) {
		var $option = self.getTemplate('targetOption');
		$option.data('name', name);
		$option.data('target', target);
		$option.addClass('target-' + name);
		return $option;
	};

	/**
	 * Creates a field selection view for the given collection of possible fields.
	 * @param  {Object} fields Collection of possible fields.
	 * @return {jQuery}
	 */
	var createFieldSelectionView = function(fields) {
		var $fieldView = self.getTemplate('field');

		// attach some data and classes (for easy selectors)
		var fieldPosition = self.currentFilterFieldsPath.length;
		$fieldView.data('position', fieldPosition);
		$fieldView.addClass('field-select-' + fieldPosition);

		// add all possible selections
		var $fieldSelect = $fieldView.find('.jcsdl-filter-target-field');
		$.each(fields, function(name, field) {
			var $fieldView = createOptionForField(name, field);
			$fieldView.appendTo($fieldSelect);
		});

		return $fieldView;
	};

	/**
	 * Creates a select option for the given field with the specified name.
	 * @param  {String} name  Unique name of the field in the current target, matching one from JCSDLConfig.
	 * @param  {Object} fieldInfo Definition of the field from JCSDLConfig.
	 * @return {jQuery}
	 */
	var createOptionForField = function(name, fieldInfo) {
		var $option = self.getTemplate('fieldOption');

		$option.data('name', name);
		$option.data('field', fieldInfo);
		$option.html(fieldInfo.name);
		$option.addClass('icon-' + getIconForField(name, fieldInfo));
		$option.addClass('field-' + name);

		return $option;
	};

	/**
	 * Creates an value input fields selection view for the given collection of possible inputs.
	 * @param  {Object} inputs Collection of possible inputs.
	 * @return {jQuery}
	 */
	var createInputSelectionView = function(inputs) {
		var $inputView = self.getTemplate('inputSelect');

		// add all possible selections
		var $inputSelect = $inputView.find('.jcsdl-filter-target-field-input');
		$.each(inputs, function(i, name) {
			var $inputOptionView = createOptionForInput(name);
			$inputOptionView.appendTo($inputSelect);
		});

		return $inputView;
	};

	/**
	 * Creates a select option for the given value input type.
	 * @param  {String} name  Unique name of the value input type.
	 * @return {jQuery}
	 */
	var createOptionForInput = function(name) {
		var $option = self.getTemplate('inputSelectOption');
		$option.data('name', name).addClass('icon-' + name + ' input-' + name).html(name);
		return $option;
	};

	/*
	 * FILTER VALUE INPUTS
	 */
	/**
	 * Creates a single operator select view for the specified operator.
	 * @param  {String} name Name of the operator.
	 * @return {jQuery}
	 */
	var createOperatorSelectView = function(name) {
		var operator = JCSDLConfig.operators[name];
		if (typeof(operator) == 'undefined') return $(); // return empty jquery object if no such operator defined

		var $operatorView = self.getTemplate('operatorSelect');
		$operatorView.data('name', name)
			.addClass('icon-' + name + ' operator-' + name)
			.prop('title', JCSDLConfig.operators[name].description)
			.html(JCSDLConfig.operators[name].label)
			.tipsy({gravity:'s'});
		return $operatorView;
	};

	/**
	 * Creates a DOM element for inputting the value for the given field.
	 * @param  {Object} field Definition of the field from JCSDLConfig.
	 * @param  {String} inputType Which input type to use (if many).
	 * @return {jQuery}
	 */
	var createValueInputView = function(field, inputType) {
		inputType = inputType || field.input;

		var $valueView = self.getTemplate('valueInput');
		if (typeof(fieldTypes[inputType]) == 'undefined') return $valueView;

		// get the config definition of this input type (if any) and a list of allowed operators
		var inputConfig = (typeof(JCSDLConfig.inputs[inputType]) !== 'undefined') ? JCSDLConfig.inputs[inputType] : {};
		var allowedOperators = (typeof(inputConfig.operators) !== 'undefined') ? inputConfig.operators : [];

		// first take care of possible operators
		var $operatorsListView = $valueView.find('.jcsdl-filter-value-input-operators');
		$.each(field.operators, function(i, operator) {
			// if a list of allowed operators is defined and this operator is not on it, then continue to the next one
			if (allowedOperators.length > 0 && ($.inArray(operator, allowedOperators) == -1)) return true;

			var $operatorView = createOperatorSelectView(operator);
			$operatorsListView.append($operatorView);
		});

		// create the input view by this input type's handler and add it to the value view container
		var $inputView = fieldTypes[inputType].init.apply($(), [field]);
		var $valueInput = $valueView.find('.jcsdl-filter-value-input-field');
		$valueInput.data('inputType', inputType).html($inputView);

		// add case sensitivity toggle
		if (field.cs) {
			var $csView = self.getTemplate('caseSensitivity');
			$csView.click(function(ev) {
				ev.preventDefault();
				ev.target.blur();
				$(this).toggleClass('selected');
			}).tipsy({gravity:'s'});
			$valueInput.prepend($csView);
		}

		/**
		 * Listen for clicks on the operators and select the clicked one.
		 * If 'exists' operator selected then hide the value input.
		 * @param  {Event} ev
		 * @listener
		 */
		$operatorsListView.children().click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var $operator = $(this);

			$operatorsListView.children().removeClass('selected');
			$operator.addClass('selected');

			if ($operator.data('name') == 'exists') {
				$valueInput.fadeOut(self.config.animationSpeed);
			} else if (!$valueInput.is(':visible')) {
				$valueInput.fadeIn(self.config.animationSpeed);
			}
		});

		// if there's only one possible operator then automatically select it and hide it
		if ($operatorsListView.children().length == 1) {
			$operatorsListView.children().eq(0).click();
			$operatorsListView.hide();
		}

		return $valueView;
	};

	/**
	 * Sets the value for the given vale view (delegates it to proper function that will handle the specific view).
	 * @param {jQuery} $view Value input view.
	 * @param {String} value String representation of the value to be set.
	 * @return {Boolean}
	 */
	var setValueForField = function($view, fieldInfo, value) {
		var inputType = $view.data('inputType');
		if (typeof(fieldTypes[inputType]) == 'undefined') return false;

		fieldTypes[inputType].setValue.apply($view, [fieldInfo, value]);
		return true;
	};

	/**
	 * Reads the value from the given value view (delegates it to proper function that will handle the specific view).
	 * @param  {jQuery} $view Value input view.
	 * @return {String}
	 */
	var getValueFromField = function($view, fieldInfo) {
		var inputType = $view.data('inputType');
		if (typeof(fieldTypes[inputType]) == 'undefined') return '';
		return fieldTypes[inputType].getValue.apply($view, [fieldInfo]);
	};

	/* ##########################
	 * VARIOUS FIELD TYPES HANDLERS
	 * ########################## */
	/**
	 * This object is a collection of all possible input field types and their handlers for creating, setting and reading values.
	 * @type {Object}
	 */
	var fieldTypes = {

		/*
		 * TEXT FIELD
		 */
		text : {
			init : function(fieldInfo) {
				var $view = self.getTemplate('valueInput_text');
				return $view;
			},

			setValue : function(fieldInfo, value) {
				this.find('input[type=text]').val(value);
			},

			getValue : function(fieldInfo) {
				return this.find('input[type=text]').val();
			}
		},

		/*
		 * NUMBER FIELD
		 */
		number : {
			init : function(fieldInfo) {
				var $view = self.getTemplate('valueInput_number');

				// mask the input to allow only digits and dots and commas
				$view.find('input[type=text]').jcsdlNumberMask();

				return $view;
			},

			setValue : function(fieldInfo, value) {
				this.find('input[type=text]').val(value);
			},

			getValue : function(fieldInfo) {
				return this.find('input[type=text]').val();
			}
		},

		/*
		 * SELECT FIELD
		 */
		select : {
			init : function(fieldInfo) {
				var $view = self.getTemplate('valueInput_select');

				// decide from where to get the options
				var options = fieldTypes.select.getOptionsSet(fieldInfo);

				// render the options
				$.each(options, function(value, label) {
					var $optionView = fieldTypes.select.createOptionView(value, label);
					$optionView.appendTo($view);
				});

				/**
				 * Turn on/off the clicked option.
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-input-select-option').click(function(ev) {
					ev.preventDefault();
					ev.target.blur();
					$(this).toggleClass('selected');
				});

				return $view;
			},

			setValue : function(fieldInfo, value) {
				var values = value.split(',');
				var $view = this;
				$.each(values, function(i, val) {
					$view.find('.jcsdl-input-select-option[data-value="' + val + '"]').addClass('selected');
				});
			},

			getValue : function(fieldInfo) {
				var values = [];
				this.find('.jcsdl-input-select-option.selected').each(function(i, option) {
					values.push($(option).data('value'));
				});

				return values.join(',');
			},

			displayValue : function(fieldInfo, value, filter) {
				var values = value.split(',');
				var $view = self.getTemplate('valueInput_select');

				// return nothing if empty
				if (values.length == 0) return $view;

				var options = fieldTypes.select.getOptionsSet(fieldInfo);

				// only show maximum of 5 selected options
				var showValues = values.slice(0, 5);
				$.each(showValues, function(i, val) {
					if (typeof(options[val]) == 'undefined') return true;

					var $optionView = fieldTypes.select.createOptionView(val, options[val]);
					$optionView.addClass('selected');
					$optionView.appendTo($view);
				});

				// show more indicator if there are more left
				if (values.length > showValues.length) {
					var $indicator = self.getTemplate('valueInput_select_more');
					$indicator.find('.count').html(values.length - showValues.length);
					$indicator.appendTo($view);
				}

				/**
				 * Turn off clicking of the options.
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-input-select-option').click(function(ev) {
					ev.preventDefault();
					ev.target.blur();
				});

				return $view;
			},

			getOptionsSet : function(fieldInfo) {
				var options = {};
				if (typeof(fieldInfo.options) !== 'undefined') {
					options = fieldInfo.options;
				} else if ((typeof(fieldInfo.optionsSet) !== 'undefined') && (typeof(JCSDLConfig.inputs.select.sets[fieldInfo.optionsSet]) !== 'undefined')) {
					options = JCSDLConfig.inputs.select.sets[fieldInfo.optionsSet];
				}
				return options;
			},

			createOptionView : function(value, label) {
				var $optionView = self.getTemplate('valueInput_select_option');
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
				var $view = self.getTemplate('valueInput_slider');
				var options = fieldTypes.slider.getOptions(fieldInfo);

				// init slider
				var $slider = $view.find('.jcsdl-slider').slider({
					animate : true,
					min : options.min,
					max : options.max,
					step : options.step,
					value : options.default,
					slide : function(ev, ui) {
						var value = fieldTypes.slider.parseValue(fieldInfo, ui.value);
						$view.find('.jcsdl-slider-input').val(value);
					},
					change : function(ev, ui) {
						//$vision.find('input.satisfaction-value').val(ui.value);
					}
				});

				// set the default value
				fieldTypes.slider.setValue.apply($view, [fieldInfo, options.default]);

				// display the min and max labels
				$view.find('.jcsdl-slider-label.min').html(fieldTypes.slider.displayValue(fieldInfo, options.min));
				$view.find('.jcsdl-slider-label.max').html(fieldTypes.slider.displayValue(fieldInfo, options.max));

				/**
				 * Mask the input as a number field and update the slider when the value was changed in the input.
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-slider-input').jcsdlNumberMask().keyup(function(ev) {
					// don't do anything if a dot has been entered
					if (ev.which == 110 || ev.which == 190) return;

					var value = $(this).val();
					value = (value) ? value : 0;
					fieldTypes.slider.setValue.apply($view, [fieldInfo, parseFloat(value)]);
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
					fieldTypes.slider.setValue.apply($view, [fieldInfo, value]);
				}

				// helper var for the listener below
				var changeValueInterval = null;

				/**
				 * Make the plus and minus signs clickable. They should change the slider value.
				 * Using mousedown and mouseup events so the mouse button can be hold to change the value.
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-slider-minus, .jcsdl-slider-plus').mousedown(function(ev) {
					var minus = $(this).is('.jcsdl-slider-minus');
					changeValueInterval = setInterval(function() {
						changeValue($view, fieldInfo, options.step, minus);
					}, 50);
				// mouse up will remove the interval (also mouseout)
				}).bind('mouseup mouseout', function(ev) {
					clearInterval(changeValueInterval);
				// and prevent default behavior on click()
				}).click(function(ev) {
					ev.preventDefault();
					ev.target.blur();
				});

				return $view;
			},

			setValue : function(fieldInfo, value) {
				var options = fieldTypes.slider.getOptions(fieldInfo);

				value = (value > options.max)
					? options.max
					: ((value < options.min) 
						? options.min
						: value);

				this.find('.jcsdl-slider').slider('value', value);
				this.find('.jcsdl-slider-input').val(value);
			},

			getValue : function(fieldInfo) {
				var value = this.find('.jcsdl-slider-input').val();
				return fieldTypes.slider.parseValue(fieldInfo, value);
			},

			displayValue : function(fieldInfo, value, filter) {
				var options = fieldTypes.slider.getOptions(fieldInfo);
				return options.displayFormat.apply(options, [value.toString()]);
			},

			parseValue : function(fieldInfo, value) {
				return value;
			},

			getOptions : function(fieldInfo) {
				var options = $.extend({}, JCSDLConfig.inputs.slider, {
					min : fieldInfo.min,
					max : fieldInfo.max,
					step : fieldInfo.step,
					default : fieldInfo.default,
					displayFormat : fieldInfo.displayFormat
				});
				return options;
			}
		},

		/*
		 * GEO BOX
		 */
		geo_box : {
			init : function(fieldInfo) {
				console.log('init geo_box');
				return $();
			},

			setValue : function(fieldInfo, value) {
			},

			getValue : function(fieldInfo) {
				return '';
			}
		},

		/*
		 * GEO RADIUS
		 */
		geo_radius : {
			init : function(fieldInfo) {
				console.log('init geo_radius');
				return $();
			},

			setValue : function(fieldInfo, value) {
			},

			getValue : function(fieldInfo) {
				return '';
			}
		},

		/*
		 * GEO POLYGON
		 */
		geo_polygon : {
			init : function(fieldInfo) {
				console.log('init geo_polygon');
				return $();
			},

			setValue : function(fieldInfo, value) {
			},

			getValue : function(fieldInfo) {
				return '';
			}
		},

		/*
		 * GEO TEXT
		 */
		geo_text : {
			init : function(fieldInfo) {
				console.log('init geo_text');
				return $();
			},

			setValue : function(fieldInfo, value) {
			},

			getValue : function(fieldInfo) {
				return '';
			}
		}

	};

	/* ##########################
	 * SETTERS AND GETTERS
	 * ########################## */
	/**
	 * Returns definition of the field found under the current root path and specified field name.
	 * @param  {String} newFieldName
	 * @return mixed Either Object or bool false if no such field was found.
	 */
	var getFieldInfoAtCurrentPath = function(newFieldName) {
		var fieldsPath = self.currentFilterFieldsPath.slice(0); // copy the array instead of referencing it

		// if specified a following field then include it in the path
		if (typeof(newFieldName) == 'string') {
			fieldsPath.push(newFieldName);
		}

		// and delegate this task to JCSDL object.
		return jcsdl.getFieldInfo(self.currentFilterTarget, fieldsPath);
	};

	/**
	 * Given the field name and it's definition decide what the icon for this field is.
	 * @param  {String} field     Name of the string.
	 * @param  {Object} fieldInfo Field definition.
	 * @return {String}
	 */
	var getIconForField = function(field, fieldInfo) {
		var icon = (typeof(fieldInfo.icon) !== 'undefined') ? fieldInfo.icon : field;
		return icon;
	}

	/**
	 * Returns a template (jQuery object) of the given name.
	 * @param  {String} name Name of the template to fetch.
	 * @return {jQuery}
	 */
	this.getTemplate = function(name) {
		if (typeof(self.templates[name]) !== 'undefined') {
			return self.templates[name].clone();
		}
		
		return $();
	};

	/**
	 * Returns the filter index of the filter to which the given DOM representation belongs.
	 * @param  {jQuery} $filterRow
	 * @return {Number}
	 */
	this.getFilterIndexByElement = function($filterRow) {
		return self.$filtersList.find('.jcsdl-filter').index($filterRow);
	};

	// automatically call the initialization after everything has been defined
	this.init();
};

/**
 * JCSDL Filter carousel as a separate jQuery plugin for easy use.
 */
(function($) {

	function JCSDLCarousel($el, options) {
		var self = this;

		this.select = options.select;

		// link to various elements that are used by the carousel
		this.$carousel = $el.find('.jcsdl-carousel');
		this.$carouselWrap = this.$carousel.closest('.jcsdl-carousel-wrap');
		
		this.$carouselItems = this.$carousel.find('.jcsdl-carousel-item');
		this.$exampleItem = this.$carouselItems.eq(0);

		this.$scrollLeft = this.$carouselWrap.siblings('.jcsdl-carousel-scroll.left');
		this.$scrollRight = this.$carouselWrap.siblings('.jcsdl-carousel-scroll.right');

		// some other carousel data
		this.itemsCount = this.$carouselItems.length;
		this.itemWidth = this.$exampleItem.outerWidth(true);
		this.itemMargin = parseInt(this.$exampleItem.css('marginRight'));
		this.margin = this.calculateCenterMargin();
		
		// select the item that is suppose to be selected (middle if there isn't any)
		var $selected = this.$carouselItems.filter('.selected');
		this.selectedIndex = ($selected.length == 1) ? $selected.prevAll().length : Math.floor(this.itemsCount / 2);

		// style the wrap so nothing goes over the borders
		this.$carouselWrap.css({
			maxWidth : this.calculateWrapWidth(),
			height : this.$exampleItem.outerHeight(true)
		});

		// prepare the carousel's css
		this.$carousel.css({
			position : 'relative',
			left : this.calculateCurrentPosition(),
			width : this.itemWidth * this.itemsCount,
			height : this.$exampleItem.outerHeight(true)
		});

		this.changePosition(0, !options.expand);

		/*
		 * REGISTER LISTENERS
		 */
		// activate the scroll left and right buttons
		this.$carouselWrap.siblings('.jcsdl-carousel-scroll').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var $scroll = $(this);
			if ($scroll.hasClass('inactive')) return;

			var changeIndex = $scroll.is(self.$scrollLeft) ? -1 : 1;
			self.selectedIndex = self.selectedIndex + changeIndex;
			self.changePosition(options.speed);
		});

		// clicking on an item also makes it selected
		this.$carouselItems.click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			self.selectedIndex = $(this).prevAll().length;
			self.changePosition(options.speed);
		});

		// adjust the carousel's width when window resizing
		$(window).resize(function(ev) {
			self.adjust();
		});
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
			if (this.selectedIndex + 1 == this.itemsCount) this.$scrollRight.addClass('inactive');
		},
		// get the currently selected item
		getSelectedItem : function() {
			return this.$carouselItems.eq(this.selectedIndex);
		},

		// animate the carousel to its proper position
		changePosition : function(speed, dontExpand) {
			var self = this;
			this.$carousel.animate({
				left : this.calculateCurrentPosition()
			}, speed, function() {
				self.adjust();
			});

			// because position is changing, we may activate both buttons
			this.toggleScrollButtons();

			// and finally call the selectCallback method if any
			if (!dontExpand && typeof(this.select) == 'function') {
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
})(window.jQuery);

/**
 * JCSDL Number Mask to prevent inputting other characters than digits into number inputs.
 */
(function($) {

	$.fn.jcsdlNumberMask = function() {
		this.each(function() {
			$(this).keydown(function(ev) {
				// dot can be entered only once
				if ((ev.which == 190 || ev.which == 110) && ($(this).val().indexOf('.') >= 0)) {
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
		            // Allow: Ctrl+A
		            (ev.which == 65 && ev.ctrlKey === true) || 
		            // Allow: home, end, left, right
		            (ev.which >= 35 && ev.which <= 39)
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
})(window.jQuery);

$.extend(String.prototype, {
	truncate : function(l, a) {
		l = l || 72;
		a = a || '...';
		if (this.length <= l) return this;

		s = this.substr(0, l);
		s = s.substr(0, s.lastIndexOf(' '));

		return s + a;
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
		return this.replace(/"/g, '\\"');
	},
	unescapeCsdl : function() {
		return this.replace(/\\"/g, '"');
	}
});