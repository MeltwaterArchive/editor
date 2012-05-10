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
		mapsColor : '#7585dd',
		mapsMarker : 'jcsdl/img/maps-marker.png',
		hideTargets : [],
		definition : {},
		save : function(code) {},
		cancel : function() {
			self.$container.hide();
		}
	}, config);

	// create "local" definition of the JCSDL, possible to be altered via config
	this.definition = $.extend(true, JCSDLDefinition, this.config.definition);

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

			// also select which field based on operator
			if (typeof(fieldInfo.input) !== 'string') {
				self.$currentFilterView.find('.jcsdl-filter-target-field-input .input-' + filter.operator).click();
			}

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
		if (typeof(self.definition.targets[targetName]) == 'undefined') return false;

		self.currentFilterTarget = targetName;
		self.currentFilterFieldsPath = [];

		// remove all steps regarding selection of fields in case another target was selected first
		var firstRemoved = self.removeFilterStepsAfterPosition(0); // target is always position 0

		// now need to select a field, so build the selection view
		var $fieldView = createFieldSelectionView(self.definition.targets[targetName].fields);
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
		var $error = self.getTemplate('error');
		$error.find('span').html(message);

		if (self.$mainView.is(':visible')) {
			$error.insertBefore(self.$mainView.find('.jcsdl-footer'));
		} else {
			$error.prependTo(self.$currentFilterView.find('.jcsdl-footer'));
		}
		$error.hide().fadeIn();

		if (typeof(console) !== 'undefined') {
			console.error(message, arguments);
		}
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
			.prop('title', self.definition.operators[filter.operator].description)
			.html(self.definition.operators[filter.operator].code.escapeHtml())
			.tipsy({gravity:'s'});
		$filterRow.find('.operator').html($operator);

		// value (but not for 'exists' operator)
		if (filter.operator !== 'exists') {
			var $value = $();
			var isGeo = ($.inArray(filter.operator, ['geo_box', 'geo_polygon', 'geo_radius']) >= 0);

			// in case of 'geo' the input is decided on operator, not input type
			var input = (isGeo) ? filter.operator : field.input;

			if (isGeo) {
				// also display the input icon (but remove the operator)
				var $input = self.getTemplate('filterFieldInput');
				$input.find('.jcsdl-filter-field-input').addClass('selected icon-' + filter.operator);
				$input.insertAfter($filterRow.find('.jcsdl-filter-info.field'));
				$operator.remove();
			}

			// use a custom display value function for this field's input type (if any)
			if (fieldTypes[input] && typeof(fieldTypes[input].displayValue) == 'function') {
				$value = fieldTypes[input].displayValue.apply(fieldTypes[input], [field, filter.value, filter]);

			// or display a standard text
			} else {
				$value = self.getTemplate('filterValue');
				$value.html(filter.value.truncate(50).escapeHtml());
			}

			$filterRow.find('.value').addClass('input-' + input).html($value);

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
		$.each(self.definition.targets, function(name, target) {
			// maybe this target is hidden?
			if ($.inArray(name, self.config.hideTargets) >= 0) return true; // continue

			// delegate creation of the option to a function
			var $targetView = createOptionForTarget(name, target);

			// append the option to the select
			$targetView.appendTo($targetSelect);
		});

		return $targetSelectView;
	};

	/**
	 * Creates a select option for the given target with the specified name.
	 * @param  {String} name   Unique name of the target, matching one from the JCSDL definition.
	 * @param  {Object} target Definition of the target from JCSDL definition.
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

		var currentPath = self.currentFilterTarget + (self.currentFilterFieldsPath.length > 0 ? '.' + self.currentFilterFieldsPath.join('.') : '');

		// add all possible selections
		var $fieldSelect = $fieldView.find('.jcsdl-filter-target-field');
		$.each(fields, function(name, field) {
			// check if this field isn't hidden
			var path = currentPath + '.' + name;
			if ($.inArray(path, self.config.hideTargets) >= 0) return true; // continue

			// sometimes the field target path is joined with a '-' - so check for these cases as well (e.g. digg.item)
			var hidden = false;
			var sectionPath = '';
			path = path.split('-');
			$.each(path, function(i, section) {
				sectionPath += (i > 0 ? '.' : '') + section;
				if ($.inArray(sectionPath, self.config.hideTargets) >= 0) {
					hidden = true;
					return true;
				}
			});
			if (hidden) return true; // continue

			// field not hidden, continue with adding it ;)
			var $fieldView = createOptionForField(name, field);
			$fieldView.appendTo($fieldSelect);
		});

		return $fieldView;
	};

	/**
	 * Creates a select option for the given field with the specified name.
	 * @param  {String} name  Unique name of the field in the current target, matching one from JCSDL definition.
	 * @param  {Object} fieldInfo Definition of the field from JCSDL definition.
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
		var operator = self.definition.operators[name];
		if (typeof(operator) == 'undefined') return $(); // return empty jquery object if no such operator defined

		var $operatorView = self.getTemplate('operatorSelect');
		$operatorView.data('name', name)
			.addClass('icon-' + name + ' operator-' + name)
			.prop('title', self.definition.operators[name].description)
			.html(self.definition.operators[name].label)
			.tipsy({gravity:'s'});
		return $operatorView;
	};

	/**
	 * Creates a DOM element for inputting the value for the given field.
	 * @param  {Object} field Definition of the field from JCSDL definition.
	 * @param  {String} inputType Which input type to use (if many).
	 * @return {jQuery}
	 */
	var createValueInputView = function(field, inputType) {
		inputType = inputType || field.input;

		var $valueView = self.getTemplate('valueInput');
		if (typeof(fieldTypes[inputType]) == 'undefined') return $valueView;

		// get the config definition of this input type (if any) and a list of allowed operators
		var inputConfig = (typeof(self.definition.inputs[inputType]) !== 'undefined') ? self.definition.inputs[inputType] : {};
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

			// for text input field enable/disable the tag input
			if (inputType == 'text') {
				var action = ($.inArray($operator.data('name'), inputConfig.arrayOperators) >= 0) ? 'enable' : 'disable';
				$inputView.find('input:first').jcsdlTagInput(action);
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
				$view.find('input').jcsdlTagInput();
				return $view;
			},

			setValue : function(fieldInfo, value) {
				this.find('input[type=text]:first').val(value);
			},

			getValue : function(fieldInfo) {
				return this.find('input[type=text]:first').val();
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
				} else if ((typeof(fieldInfo.optionsSet) !== 'undefined') && (typeof(self.definition.inputs.select.sets[fieldInfo.optionsSet]) !== 'undefined')) {
					options = self.definition.inputs.select.sets[fieldInfo.optionsSet];
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
					}
				});

				// set the default value
				fieldTypes.slider.setValue.apply($view, [fieldInfo, options.default]);

				// display the min and max labels
				$view.find('.jcsdl-slider-label.min').html(fieldTypes.slider.displayValue(fieldInfo, options.min));
				$view.find('.jcsdl-slider-label.max').html(fieldTypes.slider.displayValue(fieldInfo, options.max));

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
				var options = $.extend({}, self.definition.inputs.slider, {
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
				var $view = self.getTemplate('valueInput_geobox');
				$view.append(self.getTemplate('valueInput_geo_map'));
				$view.find('.jcsdl-map-coordinates').html(self.getTemplate('valueInput_geobox_coordinates'));
				$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_box.instructions);
				loadGoogleMapsApi(self, fieldTypes.geo_box.load, [fieldInfo, $view]);
				return $view;
			},

			load : function(fieldInfo, $view) {
				// initialize the map
				var map = new google.maps.Map($view.find('.jcsdl-map-canvas')[0], jcsdlMapsOptions);
				$view.data('map', map);

				// initialize the rectangle that we're gonna draw
				var rect = new google.maps.Rectangle({
					strokeWeight : 0,
					fillColor : self.config.mapsColor,
					fillOpacity : 0.5
				});
				$view.data('rect', rect);

				// store rectangle coordinates in an array
				var coords = [];

				// create corresponding markers
				var markerOptions = {
					position : new google.maps.LatLng(0, 0),
					draggable : true,
					icon : self.config.mapsMarker
				};

				var markers = [
					new google.maps.Marker(markerOptions),
					new google.maps.Marker(markerOptions)
				];
				$view.data('markers', markers);

				// initialize places autocomplete search
				fieldTypes._geo.initSearch($view);

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
						fieldTypes.geo_box.drawRectangle(map, rect, coords);
						$view.data('bothMarkersVisible', true);
					}
				});

				/**
				 * When a marker is dragged to a different position then redraw the rectangle.
				 * @listener
				 */
				google.maps.event.addListener(markers[0], 'position_changed', function() {
					coords[0] = this.getPosition();
					fieldTypes.geo_box.drawRectangle(map, rect, coords);
					
					// calculate the area size
					if (coords.length == 2) {
						fieldTypes.geo_box.updateInfo($view, rect);
					}
				});

				/**
				 * When a marker is dragged to a different position then redraw the rectangle.
				 * @listener
				 */
				google.maps.event.addListener(markers[1], 'position_changed', function() {
					coords[1] = this.getPosition();
					fieldTypes.geo_box.drawRectangle(map, rect, coords);

					// calculate the area size
					fieldTypes.geo_box.updateInfo($view, rect);
				});

				/**
				 * Remove the rectangle and all values from the map.
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-clear-map').click(function(ev) {
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
				});
			},

			setValue : function(fieldInfo, value) {
				var $view = this.find('.jcsdl-input-geo');

				value = value.split(':');
				var nw = value[0].split(',');
				var se = value[1].split(',');

				setTimeout(function() {
					var map = $view.data('map');
					var rect = $view.data('rect');

					var tips = fieldTypes.geo_box.getAllTipsFromNWSE(nw, se);
					var bounds = new google.maps.LatLngBounds(tips.sw, tips.ne);

					fieldTypes.geo_box.drawRectangleFromBounds(map, rect, bounds);

					var markers = $view.data('markers');
					markers[0].setMap(map);
					markers[0].setPosition(tips.ne);
					markers[1].setMap(map);
					markers[1].setPosition(tips.sw);

					map.fitBounds(rect.getBounds());

					// calculate the area size
					fieldTypes.geo_box.updateInfo($view, rect);
					
				}, self.config.animationSpeed + 200); // make sure everything is properly loaded
			},

			getValue : function(fieldInfo) {
				var rect = this.find('.jcsdl-input-geo').data('rect');

				// if no map then rect is not visible, so has no values
				if (!rect.getMap()) return '';

				var tips = fieldTypes.geo_box.getAllTipsFromBounds(rect.getBounds());
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

				var tips = fieldTypes.geo_box.getAllTipsFromUnspecified(coords[0], coords[1]);
				var bounds = new google.maps.LatLngBounds(tips.sw, tips.ne);

				/*
				var sw = (coords[0].lng() > coords[1].lng()) ? 1 : 0;
				var ne = (sw == 0) ? 1 : 0;
				var bounds = new google.maps.LatLngBounds(coords[sw], coords[ne]);
				*/
				fieldTypes.geo_box.drawRectangleFromBounds(map, rect, bounds);
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
				if (fieldTypes._geo.isNorth(coords1, coords2)) {
					north = coords1;
					south = coords2;
				} else {
					north = coords2;
					south = coords1;
				}

				var west, east;
				if (fieldTypes._geo.isEast(coords1, coords2)) {
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
				var tips = fieldTypes.geo_box.getAllTipsFromBounds(rect.getBounds());
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
				var $view = self.getTemplate('valueInput_georadius');
				$view.append(self.getTemplate('valueInput_geo_map'));
				$view.find('.jcsdl-map-coordinates').html(self.getTemplate('valueInput_georadius_coordinates'));
				$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_radius.instructions);
				loadGoogleMapsApi(self, fieldTypes.geo_radius.load, [fieldInfo, $view]);
				return $view;
			},

			load : function(fieldInfo, $view) {
				// initialize the map
				var map = new google.maps.Map($view.find('.jcsdl-map-canvas')[0], jcsdlMapsOptions);
				$view.data('map', map);

				// initialize the circle that we're gonna draw
				var circle = new google.maps.Circle({
					strokeWeight : 0,
					fillColor : self.config.mapsColor,
					fillOpacity : 0.5
				});
				$view.data('circle', circle);

				// create center marker
				var markerOptions = {
					position : new google.maps.LatLng(0, 0),
					draggable : true,
					icon : self.config.mapsMarker
				};

				var centerMarker = new google.maps.Marker(markerOptions);
				$view.data('centerMarker', centerMarker);
				var radiusMarker = new google.maps.Marker(markerOptions);
				$view.data('radiusMarker', radiusMarker);

				// initialize places autocomplete search
				fieldTypes._geo.initSearch($view);

				/**
				 * Listen for clicks on the map and adjust the circle to it.
				 * @param  {Event} ev Google Maps Event.
				 * @listener
				 */
				google.maps.event.addListener(map, 'click', function(ev) {
					var center = circle.getCenter();

					// the center has already been marked, so this is a click for the radius
					if (typeof(center) !== 'undefined') {
						var radius = google.maps.geometry.spherical.computeDistanceBetween(center, ev.latLng);
						circle.setRadius(radius);
						circle.setMap(map);

						// drop the corresponding marker
						radiusMarker.setPosition(ev.latLng);
						radiusMarker.setMap(map);

						fieldTypes.geo_radius.updateInfo($view, circle);

					// the center hasn't been marked yet, so this is the click for it
					} else {
						circle.setCenter(ev.latLng);

						// drop the corresponding marker
						centerMarker.setPosition(ev.latLng);
						centerMarker.setMap(map);
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
						fieldTypes.geo_radius.updateInfo($view, circle);
					}
				});

				/**
				 * Remove the circle and all values from the map.
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-clear-map').click(function(ev) {
					ev.preventDefault();
					ev.target.blur();

					circle.setMap(null);
					centerMarker.setMap(null);
					radiusMarker.setMap(null);
					$view.find('.jcsdl-map-area span').html('0 km<sup>2</sup>');
				});
			},

			setValue : function(fieldInfo, value) {
				var $view = this.find('.jcsdl-input-geo');

				value = value.split(':');
				var latlng = value[0].split(',');
				var radius = parseFloat(value[1]) * 1000;

				setTimeout(function() {
					var map = $view.data('map');
					var circle = $view.data('circle');
					var center = new google.maps.LatLng(latlng[0], latlng[1])

					// first, set markers because changing their positions causes changes in the circle
					var centerMarker = $view.data('centerMarker');
					centerMarker.setPosition(center);
					centerMarker.setMap(map);

					var radiusMarker = $view.data('radiusMarker');
					var radiusPosition = google.maps.geometry.spherical.computeOffset(center, radius, 90);
					radiusMarker.setPosition(radiusPosition);
					radiusMarker.setMap(map);

					circle.setCenter(center);
					circle.setRadius(radius);
					circle.setMap(map); 

					map.fitBounds(circle.getBounds());

					// calculate the area size
					fieldTypes.geo_radius.updateInfo($view, circle);
					
				}, self.config.animationSpeed + 200); // make sure everything is properly loaded
			},

			getValue : function(fieldInfo) {
				var circle = this.find('.jcsdl-input-geo').data('circle');

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
				var $view = self.getTemplate('valueInput_geopolygon');
				$view.append(self.getTemplate('valueInput_geo_map'));
				$view.find('.jcsdl-map-coordinates').html(self.getTemplate('valueInput_geopolygon_coordinates'));
				$view.find('.jcsdl-map-instructions').html(self.definition.inputs.geo_polygon.instructions);
				loadGoogleMapsApi(self, fieldTypes.geo_polygon.load, [fieldInfo, $view]);
				return $view;
			},

			load : function(fieldInfo, $view) {
				// initialize the map
				var map = new google.maps.Map($view.find('.jcsdl-map-canvas')[0], jcsdlMapsOptions);
				$view.data('map', map);

				// initialize the polygon that we're gonna draw
				var polygon = new google.maps.Polygon({
					paths : [[]],
					strokeWeight : 0,
					fillColor : self.config.mapsColor,
					fillOpacity : 0.5
				});
				$view.data('polygon', polygon);

				// storage markers
				var markers = [];
				$view.data('markers', markers);

				// initialize places autocomplete search
				fieldTypes._geo.initSearch($view);

				/**
				 * Listen for clicks on the map and create new polygon points.
				 * @param  {Event} ev Google Maps Event.
				 * @listener
				 */
				google.maps.event.addListener(map, 'click', function(ev) {
					var marker = fieldTypes.geo_polygon.addTip($view, ev.latLng.lat(), ev.latLng.lng());
					markers.push(marker);
				});

				/**
				 * Remove the circle and all values from the map.
				 * @param  {Event} ev
				 * @listener
				 */
				$view.find('.jcsdl-clear-map').click(function(ev) {
					ev.preventDefault();
					ev.target.blur();

					$.each($view.data('markers'), function(i, marker) {
						marker.setMap(null);
					});
					polygon.getPath().clear();

					fieldTypes.geo_polygon.updateInfo($view, polygon);
				});
			},

			setValue : function(fieldInfo, value) {
				var $view = this.find('.jcsdl-input-geo');

				value = value.split(':');

				setTimeout(function() {
					var markers = $view.data('markers');

					$.each(value, function(i, val) {
						val = val.split(',');
						var marker = fieldTypes.geo_polygon.addTip($view, val[0], val[1]);
						markers.push(marker);
					});

					$view.data('markers', markers);

					var map = $view.data('map');
					var polygon = $view.data('polygon');

					map.fitBounds(polygon.getBounds());

					// calculate the area size
					fieldTypes.geo_polygon.updateInfo($view, polygon);
					
				}, self.config.animationSpeed + 200); // make sure everything is properly loaded
			},

			getValue : function(fieldInfo) {
				var polygon = this.find('.jcsdl-input-geo').data('polygon');
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
				var map = $view.data('map');
				var polygon = $view.data('polygon');
				var tips = $view.data('tips');

				var position = new google.maps.LatLng(parseFloat(lat), parseFloat(lng));

				// create a marker
				var marker = new google.maps.Marker({
					map : map,
					position : position,
					draggable : true,
					icon : self.config.mapsMarker
				});

				// add the polygon point
				var polyPath = polygon.getPath();
				polyPath.push(position);

				// if there are at least 3 tips then we can show the polygon
				if (polyPath.getLength() >= 3) {
					polygon.setMap(map);
				}

				google.maps.event.addListener(marker, 'position_changed', function(ev) {
					var i = fieldTypes.geo_polygon.indexOfPosition(position, polygon);
					position = this.getPosition();
					if (i == -1) return;

					polyPath.setAt(i, position);

					fieldTypes.geo_polygon.updateInfo($view, polygon);
				});

				// remove the marker and the polygon tip
				google.maps.event.addListener(marker, 'dblclick', function(ev) {
					var i = fieldTypes.geo_polygon.indexOfPosition(position, polygon);
					position = this.getPosition();
					if (i == -1) return;

					polyPath.removeAt(i);
					this.setMap(null);

					fieldTypes.geo_polygon.updateInfo($view, polygon);
				});

				fieldTypes.geo_polygon.updateInfo($view, polygon);

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

	$.fn.jcsdlNumberMask = function(allowFloat) {
		this.each(function() {
			$(this).keydown(function(ev) {
				// dot can be entered only once (if float is allowed)
				if ((ev.which == 190 || ev.which == 110) && (($(this).val().indexOf('.') >= 0) || !allowFloat)) {
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

/**
 * JCSDL Tag Input
 */
(function($) {

	$.fn.jcsdlOrigVal = $.fn.val;
	$.fn.val = function(value) {
		if (!this[0]) return undefined;

		var $self = $(this[0]);

		// override only for JCSDL Tag Input field
		if ($self.data('jcsdlTagInput')) {
			// setting a value
			if (typeof(value) !== 'undefined') {
				$self.jcsdlOrigVal(value);
				$self.trigger('change');
				return $self;
			}

			// reading a value
			var values = $self.data('jcsdlTagValue');
			if (typeof(values) !== 'undefined') {
				return values.join(',');
			} else {
				return '';
			}
		}

		if (typeof(value) !== 'undefined') {
			return $self.jcsdlOrigVal(value);
		}

		return $self.jcsdlOrigVal();
	};

	function JCSDLTagInput($el, options) {
		var self = this;

		this.delimeter = options.delimeter;

		this.$original = $el;
		this.$original.data('jcsdlTagInputEnabled', true);
		this.$wrap = $(this.tpl);
		this.$inputWrap = this.$wrap.find('.jcsdl-tag-field');
		this.$input = this.$inputWrap.find('input');
		this.$input.attr('placeholder', this.$original.attr('placeholder'));

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

		this.update();

		/*
		 * REGISTER LISTENERS
		 */
		this.$wrap.click(function(ev) {
			self.$input.focus();
		});

		this.$original.bind('change.jcsdltaginput', function(ev) {
			if (self.updating) return;
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
				'<a href="#" class="jcsdl-tag-remove" title="Remove">x</a>',
			'</span>'
		].join(''),

		/* vars */
		updating : false,
		delimeter : ',',

		/* functions */
		addTag : function(val) {
			this.$input.val('');

			if (typeof(val) == 'undefined' || val.length == 0) return;
			var self = this;

			var $tag = $(this.tagTpl);
			$tag.find('span').html(val.truncate());
			$tag.insertBefore(this.$inputWrap);

			var values = this.$original.data('jcsdlTagValue');
			values.push(val);
			this.$original.data('jcsdlTagValue', values);
			this.$original.val(values.join(this.delimeter));

			// remove the tag
			$tag.find('a').click(function(ev) {
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

			this.reposition();
		},

		update : function() {
			// load from the current original value
			var origVal = this.$original.jcsdlOrigVal();
			if (origVal.length == 0) return;

			var self = this;

			// clear all current tags
			this.$original.data('jcsdlTagValue', []);
			this.$wrap.find('.jcsdl-tag').remove();

			this.updating = true;

			var values = origVal.split(this.delimeter);
			var fixedValues = [];
			// but look for escaped items as well
			$.each(values, function(i, val) {
				if (typeof(val) == 'undefined') return true; // continue

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

		/* public functions */
		enable : function() {
			this.$original.data('jcsdlTagInputEnabled', true);
			this.$original.hide();
			this.$wrap.show();
		},

		disable : function() {
			this.$original.data('jcsdlTagInputEnabled', false);
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
			if ($.inArray(options, ['enable', 'disable']) >= 0) {
				this.each(function() {
					var tagInput = get($(this));
					tagInput[options].apply(tagInput, []);
				});
			}
			return this;
		}

		options = $.extend({}, {
			delimeter : ','
		});

		this.each(function() {get($(this));});
		return this;
	};

})(window.jQuery);

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
		$('body').append('<script type="text/javascript" src="//maps.googleapis.com/maps/api/js?key=' + jcsdlMapsCurrentGui.definition.mapsApiKey + '&libraries=places,geometry&sensor=false&callback=jcsdlMapsInit" />');

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
			jcsdlMapsCurrentCallback.apply(jcsdlMapsCurrentGui, jcsdlMapsCurrentCallbackArgs);
		}, jcsdlMapsCurrentGui.config.animationSpeed + 10); // make sure the map canvas is fully visible before loading them
	}
};

$.extend(String.prototype, {
	truncate : function(l, a) {
		l = l || 72;
		a = a || '...';
		if (this.length <= l) return this.valueOf();

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

$.extend(Number.prototype, {
	format : function(decimals, dec_point, thousands_sep) {
	    // Strip all characters but numerical ones.
	    var number = this.toString().replace(/[^0-9+\-Ee.]/g, '');
	    var n = !isFinite(+number) ? 0 : +number,
	        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
	        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
	        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
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