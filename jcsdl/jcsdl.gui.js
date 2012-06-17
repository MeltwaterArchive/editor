var JCSDLGui = function(el, cfg) {
	var $el = $(el); // ensure that the container element is a jQuery object
	if ($el.length == 0) return false; // break if no such element in DOM
	this.$el = $el.eq(0); // use only on the first matched element

	var self = this;

	/** @var {jQuery} jQuery object that holds the whole editor. */
	this.$container = $();

	/** @var {Object} GUI config object. */
	this.config = $.extend(true, {
		animate : 200,
		cancelButtton : true,
		googleMapsApiKey : '',
		mapsOverlay : {
			strokeWeight : 0,
			fillColor : '#7585dd',
			fillOpacity : 0.5
		},
		mapsMarker : 'jcsdl/img/maps-marker.png',
		hideTargets : [],
		definition : {},
		save : function(code) {},
		cancel : function() {
			self.$container.hide();
		}
	}, cfg);

	/** @var {Object} Definition of JCSDL, that can be altered via config. */
	this.definition = $.extend(true, JCSDLDefinition, this.config.definition);

	/** @var {JCSDLParser} The actual JCSDL "parser". */
	this.parser = new JCSDLParser(this);

	/** @var {JCSDLGuiInputs} Input types and their handlers. */
	this.inputs = new JCSDLGuiInputs(this);

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

	this.init();
};

JCSDLGui.prototype = {
	/*
	 * INITIALIZE THE EDITOR
	 */
	/**
	 * Initializes (or reinitializes) the JCSDL GUI Editor.
	 */
	init : function() {
		var self = this;

		// reset everything in case this is a reinitialization
		this.logic = 'AND';
		this.filters = [];

		this.currentFilterIndex = null;
		this.currentFilterSteps = [];
		this.currentFilterTarget = null;
		this.currentFilterFieldsPath = [];
		this.$currentFilterView = $();
		this.$currentFilterStepsView = $();

		// and insert the editor into the container
		this.$mainView = this.getTemplate('editor');
		this.$filtersList = this.$mainView.find('.jcsdl-filters-list');

		this.$container = this.getTemplate('container');
		this.$container.html(this.$mainView);
		this.$el.html(this.$container);

		// hide the cancel button if so desired
		if (!this.config.cancelButton) {
			this.$mainView.find('.jcsdl-editor-cancel').hide();
		}

		// add class for IE
		if ($.browser.msie) {
			this.$container.addClass('msie');
		}

		/*
		 * REGISTER LISTENERS
		 */
		/**
		 * Set the logic upon selection.
		 * @param  {Event} ev
		 */
		this.$mainView.find('.jcsdl-filters-logic input[name="logic"]').change(function(ev) {
			self.logic = $(this).val();
		});

		/**
		 * Switch between expanded and collapsed view mode of filters list.
		 * @param  {Event} ev
		 */
		this.$mainView.find('.jcsdl-mainview-mode .jcsdl-mainview-mode-option').bind('click touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var $item = $(this);

			self.$filtersList.removeClass('expanded collapsed');
			self.$filtersList.addClass($item.data('mode'));

			self.$mainView.find('.jcsdl-mainview-mode .jcsdl-mainview-mode-option').removeClass('active');
			$item.addClass('active');
		});

		/**
		 * Show filter editor to create a new one from scratch upon clicking 'Add filter'.
		 * @param  {Event} ev Click Event.
		 */
		this.$mainView.find('.jcsdl-add-filter').bind('click touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			self.showFilterEditor();
		});

		/**
		 * Handle output / returning of the resulting JCSDL upon clicking save.
		 * @param  {Event} ev Click Event.
		 */
		this.$mainView.find('.jcsdl-editor-save').bind('click.jcsdl touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			self.returnJCSDL();
		});

		/**
		 * Handle pressing the cancel button,
		 * @param  {Event} ev Click Event.
		 */
		this.$mainView.find('.jcsdl-editor-cancel').bind('click.jcsdl touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			self.config.cancel.apply(self, []);
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
	 * @param  {String} code JCSDL string.
	 */
	loadJCSDL : function(code) {
		this.init(); // just in case we're loading JCSDL for a 2nd time
		var self = this;

		var parsed = this.parser.parseJCSDL(code);
		if (parsed === false) {
			this.showError('Invalid JCSDL input!', code);
			return;
		}

		this.logic = (parsed.logic == 'AND') ? 'AND' : 'OR';
		this.filters = parsed.filters;

		// mark the logic
		this.$mainView.find('.jcsdl-filters-logic input[name="logic"][value="' + this.logic + '"]').click();
		
		// display the filters
		// add each filter to the list
		$.each(this.filters, function(i, filter) {
			var $filterRow = self.createFilterRow(filter);
			$filterRow.appendTo(self.$filtersList);
		});

		// make the cancel button visible
		this.$mainView.find('.jcsdl-editor-cancel').show();
	},

	/**
	 * Returns the JCSDL by calling the 'save' function from the config.
	 */
	returnJCSDL : function() {
		var code = this.parser.getJCSDLForFilters(this.filters, this.logic);
		this.config.save.apply(this, [code]);
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

		// prepare the filter editor
		this.$currentFilterView = this.getTemplate('filterEditor');
		this.$currentFilterStepsView = this.$currentFilterView.find('.jcsdl-steps');

		// append the filter editor to the container and show it
		this.$currentFilterView.appendTo(this.$container);
		this.$currentFilterView.show();

		// now that it's visible configure it
		// (it needs to be visible before configuration so various element's have dimensions higher than 0)
		this.initFilterEditor();

		// if specified filter then load it into the editor
		if (typeof(filter) !== 'undefined' && filter) {
			this.currentFilterIndex = filterIndex;

			var fieldInfo = this.parser.getFieldInfo(filter.target, filter.fieldPath);

			this.$currentFilterView.find('.jcsdl-filter-target .target-' + filter.target).trigger('jcsdlclick');

			// select all fields and subfields
			$.each(filter.fieldPath, function(i, field) {
				var $fieldView = self.$currentFilterView.find('.jcsdl-filter-target-field:last');
				$fieldView.find('.field-' + field).trigger('jcsdlclick');
			});

			// also select which field based on operator
			if (typeof(fieldInfo.input) !== 'string') {
				this.$currentFilterView.find('.jcsdl-filter-target-field-input .input-' + filter.operator).trigger('jcsdlclick');
			}

			// select operator
			if (fieldInfo.input == 'text') {
				$('.jcsdl-dropdown .jcsdl-dropdown-option.operator-' + filter.operator).click();
			} else {
				this.$currentFilterView.find('.jcsdl-filter-value-input-operators .operator-' + filter.operator).click();
			}
			
			// fill in the value (using the proper delegate)
			var $valueInputView = this.$currentFilterView.find('.jcsdl-filter-value-input-field');
			this.setValueForField($valueInputView, fieldInfo, filter.value);

			// set case sensitivity (if any)
			if (filter.cs) {
				this.$currentFilterView.find('.jcsdl-operator-cs').click();
			}
		}
	},

	/**
	 * Initializes and returns the filter editor.
	 * @return {jQuery} Filter Editor element.
	 */
	initFilterEditor : function(filter, filterIndex) {
		var self = this;
		
		// by default always prepare the selection of targets first
		var $targetSelectView = this.createTargetSelectView();
		this.addFilterStep('target', $targetSelectView);

		// hide the save button until all steps haven't been gone through
		this.$currentFilterView.find('.jcsdl-filter-save').hide();
		this.$currentFilterView.find('.jcsdl-footer span').hide();

		/*
		 * REGISTER PROPER LISTENERS
		 */
		/**
		 * Saves the filter that is currently being edited when clicked its save button.
		 * @param  {Event} ev Click Event.
		 */
		this.$currentFilterView.find('.jcsdl-filter-save').bind('click touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();
			self.didSubmitFilter();
		});

		/**
		 * Hides the single filter editor and doesn't save the filter when the cancel button is clicked.
		 * @param  {Event} ev Click Event.
		 */
		this.$currentFilterView.find('.jcsdl-filter-cancel').bind('click touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();
			self.hideFilterEditor();
		});
	},

	/**
	 * Hides the filter editor and shows the main editor view.
	 * NOTICE: This does not save the filter!
	 */
	hideFilterEditor : function() {
		var self = this;

		// clear all the values
		this.currentFilterIndex = null;
		this.currentFilterSteps = [];
		this.currentFilterTarget = null;
		this.currentFilterFieldsPath = [];

		this.$currentFilterView.fadeOut(this.config.animate, function() {
			self.$currentFilterView.remove();
			self.$mainView.show();
		});
	},

	/**
	 * Removes the filter at the given index.
	 * @param  {Number} index
	 */
	deleteFilter : function(index) {
		// remove from the DOM
		this.$filtersList.find('.jcsdl-filter').eq(index).remove();

		// remove from the filters list
		this.filters.splice(index, 1);
	},

	/* ##########################
	 * FILTER EDITOR STEPS
	 * ########################## */
	/**
	 * Adds a filter step with proper numbering/position.
	 * @param {String} stepName Name of the step.
	 * @param {jQuery} $view    View of the step.
	 * @param {Boolean} slide[optional] Should the displaying of the step be a slide down animate (true) or a fade in (false). Default: true.
	 */
	addFilterStep : function(stepName, $view, slide) {
		var self = this;
		var slide = (typeof(slide) == 'undefined') ? true : slide;

		var $stepView = this.getTemplate('step');
		$stepView.html($view);

		var stepNumber = this.currentFilterSteps.length;

		// attach some data and classes (for easy selectors)
		$stepView.data('number', stepNumber);
		$stepView.addClass('jcsdl-filter-step-number-' + stepNumber);
		$stepView.data('name', stepName);
		$stepView.addClass('jcsdl-filter-step-' + stepName);

		// add to the DOM
		$stepView.appendTo(this.$currentFilterStepsView);

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
			this.$currentFilterView.find('.jcsdl-filter-save').fadeIn(this.config.animate);
			this.$currentFilterView.find('.jcsdl-footer span').show();
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
			self.$currentFilterStepsView.find('.jcsdl-step').jcsdlCarousel('adjust');
		}, this.config.animate);

		// add to the steps pool
		this.currentFilterSteps.push($stepView);
	},

	/**
	 * Removes all filter steps after the given position.
	 * Also clears the resulting CSDL if there was any before.
	 * @param  {Integer} position
	 * @return {String}  Name of the first step that was removed.
	 */
	removeFilterStepsAfterPosition : function(position) {
		// mark the step that stays that no longer any fields are selected
		var $theStep = this.$currentFilterStepsView.find('.jcsdl-step').eq(position);
		$theStep.removeClass('field-selected');

		// most definetely hide the submit button
		this.$currentFilterView.find('.jcsdl-filter-save').hide();
		this.$currentFilterView.find('.jcsdl-footer span').hide();

		var steps = this.currentFilterSteps.splice(position + 1, this.currentFilterSteps.length - position);
		var firstName = '';
		$.each(steps, function(i, step) {
			var $step = $(step);

			if (i == 0) {
				firstName = $step.data('name');
			}
			$step.remove(); // ensure jQuery
		});

		return firstName;
	},

	/**
	 * When a target is selected, the user needs to select a field.
	 * @param  {String} targetName Name of the selected target.
	 */
	didSelectTarget : function(targetName) {
		if (typeof(this.definition.targets[targetName]) == 'undefined') return false;

		this.currentFilterTarget = targetName;
		this.currentFilterFieldsPath = [];

		// remove all steps regarding selection of fields in case another target was selected first
		var firstRemoved = this.removeFilterStepsAfterPosition(0); // target is always position 0

		// now need to select a field, so build the selection view
		var $fieldView = this.createFieldSelectionView(this.definition.targets[targetName].fields);
		this.addFilterStep('field', $fieldView, (firstRemoved != 'field'));
	},

	/**
	 * When a field is selected then the user either needs to input a value or select a subfield if such exists.
	 * @param  {String} fieldName  Name of the selected field.
	 * @param  {jQuery} $fieldView The field selection view that was used.
	 * @param  {jQuery} $stepView Step view at which the field was selected.
	 */
	didSelectField : function(fieldName, $fieldView, $stepView) {
		// remove any steps that are farther then this one, just in case
		var fieldPosition = $fieldView.data('position');
		this.currentFilterFieldsPath.splice(fieldPosition, this.currentFilterFieldsPath.length - fieldPosition);

		var field = this.getFieldInfoAtCurrentPath(fieldName);
		if (field == false) return;

		// from DOM as well
		var firstRemoved = this.removeFilterStepsAfterPosition($fieldView.closest('.jcsdl-step').data('number'));

		// now proceed with adding the current one
		this.currentFilterFieldsPath.push(fieldName);

		// if this fields has some more subfields then add them now
		if (typeof(field.fields) !== 'undefined') {
			var $fieldView = this.createFieldSelectionView(field.fields);
			var slide = (firstRemoved != 'field');
			this.addFilterStep('field', $fieldView, slide);
			return;
		}

		// if this fields has multiple possible input fields then add a step to choose one
		if (typeof(field.input) !== 'string') {
			var $inputView = this.createInputSelectionView(field.input);
			var slide = (firstRemoved != 'input');
			this.addFilterStep('input', $inputView, slide);
			return;
		}

		// this is a "final" field, so now the user needs to input desired value(s)
		var $valueView = this.createValueInputView(field);
		this.addFilterStep('value', $valueView, (firstRemoved != 'value'));
	},

	/**
	 * When an input is selected then the user needs to input a value.
	 * @param  {String} inputName  Name of the selected input type.
	 * @param  {jQuery} $inputView The input selection view that was used.
	 * @param  {jQuery} $stepView Step view at which the field was selected.
	 */
	didSelectInput : function(inputName, $inputView, $stepView) {
		// remove any steps that are farther then this one, just in case
		var inputPosition = $inputView.data('position');
		var firstRemoved = this.removeFilterStepsAfterPosition($inputView.closest('.jcsdl-step').data('number'));

		// now the user needs to input desired value(s)
		var $valueView = this.createValueInputView(this.getFieldInfoAtCurrentPath(), inputName);
		this.addFilterStep('value', $valueView, (firstRemoved != 'value'));
	},

	/**
	 * Handles the saving of a filter from the single filter editor.
	 */
	didSubmitFilter : function() {
		var fieldInfo = this.getFieldInfoAtCurrentPath();

		// read the operator
		var operator = (fieldInfo.input == 'text')
			? this.$currentFilterView.find('.jcsdl-filter-value-input-operators .jcsdl-operators-select').data('operator')
			: this.$currentFilterView.find('.jcsdl-filter-value-input-operators .operator.selected').data('name');
		if (typeof(operator) == 'undefined') {
			this.showError('You need to select an operator!');
			return;
		}

		// then check if there is a value specified (only if operator is something else than 'exists')
		var value = '';
		if (operator !== 'exists') {
			var $valueView = this.$currentFilterView.find('.jcsdl-filter-value-input-field');
			value = this.getValueFromField($valueView, fieldInfo);
			if (value.length == 0) {
				this.showError('You need to specify a value!');
				return;
			}
		}

		// now that we have all data, let's create a filter object from this
		var filter = this.parser.createFilter(this.currentFilterTarget, this.currentFilterFieldsPath, operator, value, {
			cs : ((operator !== 'exists') && fieldInfo.cs && this.$currentFilterView.find('.jcsdl-operator-cs.selected').length > 0) ? true : false
		});

		// also the filter row
		var $filterRow = this.createFilterRow(filter);

		// and now finally either add it to the end of the filters list
		// or replace if we were editing another filter
		if (this.currentFilterIndex !== null) {
			// we were editing, so let's replace it
			this.$filtersList.find('.jcsdl-filter').eq(this.currentFilterIndex).replaceWith($filterRow);
			this.filters[this.currentFilterIndex] = filter;
			
		} else {
			// we were adding a filter, so simply add it to the list
			$filterRow.appendTo(this.$filtersList);
			this.filters.push(filter);
		}

		this.hideFilterEditor();
	},

	/* ##########################
	 * VIEW FACTORIES
	 * ########################## */
	/**
	 * Shows an error.
	 * @param  {String} message Error message to be displayed.
	 * @param  {String} code    Code that caused the error.
	 */
	showError : function(message, code) {
		// clear all previous errors
		this.$mainView.find('.jcsdl-error').remove();
		this.$currentFilterView.find('.jcsdl-error').remove();

		var $error = this.getTemplate('error');
		$error.find('span').html(message);

		if (this.$mainView.is(':visible')) {
			$error.insertBefore(this.$mainView.find('.jcsdl-footer'));
		} else {
			$error.prependTo(this.$currentFilterView.find('.jcsdl-footer'));
		}
		$error.hide().fadeIn();

		if (typeof(console) !== 'undefined') {
			console.error(message, arguments);
		}
	},

	/**
	 * Creates a filter row element for the specified filter.
	 * @param  {Object} filter Filter object.
	 * @return {jQuery}
	 */
	createFilterRow : function(filter) {
		var self = this;
		var $filterRow = this.getTemplate('filter');

		// fill with data
		// target
		var $target = this.getTemplate('filterTarget');
		var targetInfo = this.parser.getTargetInfo(filter.target);
		$target.addClass('selected target-' + filter.target).html(targetInfo.name);
		$filterRow.find('.target').html($target);

		// fields (separate icon for each field in path)
		var currentPath = [];
		$.each(filter.fieldPath, function(i, field) {
			currentPath.push(field);

			var $field = self.getTemplate('filterField');
			var fieldInfo = self.parser.getFieldInfo(filter.target, currentPath);

			$field.addClass('selected icon-' + self.getIconForField(field, fieldInfo));
			$field.html(fieldInfo.name);

			$filterRow.find('.jcsdl-filter-info.field').append($field);
		});

		// get the field definition
		var field = this.parser.getFieldInfo(filter.target, currentPath);

		// operator
		var $operator = this.getTemplate('filterOperator');
		$operator.addClass('operator-' + filter.operator + ' icon-' + filter.operator + ' selected')
			.prop('title', this.definition.operators[filter.operator].description)
			.html(this.definition.operators[filter.operator].code.escapeHtml())
			.tipsy({gravity:'s'});
		$filterRow.find('.operator').html($operator);

		// case sensitive?
		if (filter.cs) {
			var $cs = this.getTemplate('filterOperator');
			$cs.addClass('operator-cs icon-cs selected')
				.prop('title', 'Case Sensitive')
				.html('case sensitive')
				.tipsy({gravity:'s'});
			$filterRow.find('.jcsdl-filter-info.operator').append($cs);
		}

		// value (but not for 'exists' operator)
		if (filter.operator !== 'exists') {
			var $value = $();
			var isGeo = ($.inArray(filter.operator, ['geo_box', 'geo_polygon', 'geo_radius']) >= 0);

			// in case of 'geo' the input is decided on operator, not input type
			var input = (isGeo) ? filter.operator : field.input;

			if (isGeo) {
				// also display the input icon (but remove the operator)
				var $input = this.getTemplate('filterFieldInput');
				$input.find('.jcsdl-filter-field-input').addClass('selected icon-' + filter.operator);
				$input.insertAfter($filterRow.find('.jcsdl-filter-info.field'));
				$operator.remove();
			}

			// use a custom display value function for this field's input type (if any)
			if (this.inputs[input] && typeof(this.inputs[input].displayValue) == 'function') {
				$value = this.inputs.exec(input, 'displayValue', [field, filter.value, filter]);

			// or display a standard text
			} else {
				$value = this.getTemplate('filterValue');
				$value.html(filter.value.truncate(50).escapeHtml());
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
		 * @param  {Event} ev Click Event.
		 */
		$filterRow.find('.edit').bind('click touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var index = self.getFilterIndexByElement($filterRow);
			self.showFilterEditor(filter, index);
		});

		/**
		 * Delete the filter when clicked on delete option.
		 * @param  {Event} ev Click Event.
		 */
		$filterRow.find('.delete').bind('click touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var index = self.getFilterIndexByElement($filterRow);
			self.deleteFilter(index);
		});

		return $filterRow;
	},

	/**
	 * Creates the target select view for single filter editor.
	 * @return {jQuery}
	 */
	createTargetSelectView : function() {
		var self = this;
		var $targetSelectView = this.getTemplate('target');
		var $targetSelect = $targetSelectView.find('.jcsdl-filter-target');

		// create a select option for every possible target
		$.each(this.definition.targets, function(name, target) {
			// maybe this target is hidden?
			if ($.inArray(name, self.config.hideTargets) >= 0) return true; // continue

			// delegate creation of the option to a function
			var $targetView = self.createOptionForTarget(name, target);

			// append the option to the select
			$targetView.appendTo($targetSelect);
		});

		return $targetSelectView;
	},

	/**
	 * Creates a select option for the given target with the specified name.
	 * @param  {String} name   Unique name of the target, matching one from the JCSDL definition.
	 * @param  {Object} target Definition of the target from JCSDL definition.
	 * @return {jQuery}
	 */
	createOptionForTarget : function(name, target) {
		var $option = this.getTemplate('targetOption');
		$option.data('name', name);
		$option.data('target', target);
		$option.addClass('target-' + name);
		return $option;
	},

	/**
	 * Creates a field selection view for the given collection of possible fields.
	 * @param  {Object} fields Collection of possible fields.
	 * @return {jQuery}
	 */
	createFieldSelectionView : function(fields) {
		var self = this;

		var $fieldView = this.getTemplate('field');

		// attach some data and classes (for easy selectors)
		var fieldPosition = this.currentFilterFieldsPath.length;
		$fieldView.data('position', fieldPosition);
		$fieldView.addClass('field-select-' + fieldPosition);

		var currentPath = this.currentFilterTarget + (this.currentFilterFieldsPath.length > 0 ? '.' + this.currentFilterFieldsPath.join('.') : '');

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
			var $fieldView = self.createOptionForField(name, field);
			$fieldView.appendTo($fieldSelect);
		});

		return $fieldView;
	},

	/**
	 * Creates a select option for the given field with the specified name.
	 * @param  {String} name  Unique name of the field in the current target, matching one from JCSDL definition.
	 * @param  {Object} fieldInfo Definition of the field from JCSDL definition.
	 * @return {jQuery}
	 */
	createOptionForField : function(name, fieldInfo) {
		var $option = this.getTemplate('fieldOption');

		$option.data('name', name);
		$option.data('field', fieldInfo);
		$option.html(fieldInfo.name);
		$option.addClass('icon-' + this.getIconForField(name, fieldInfo));
		$option.addClass('field-' + name);

		return $option;
	},

	/**
	 * Creates an value input fields selection view for the given collection of possible inputs.
	 * @param  {Object} inputs Collection of possible inputs.
	 * @return {jQuery}
	 */
	createInputSelectionView : function(inputs) {
		var self = this;
		var $inputView = this.getTemplate('inputSelect');

		// add all possible selections
		var $inputSelect = $inputView.find('.jcsdl-filter-target-field-input');
		$.each(inputs, function(i, name) {
			var $inputOptionView = self.createOptionForInput(name);
			$inputOptionView.appendTo($inputSelect);
		});

		return $inputView;
	},

	/**
	 * Creates a select option for the given value input type.
	 * @param  {String} name  Unique name of the value input type.
	 * @return {jQuery}
	 */
	createOptionForInput : function(name) {
		var $option = this.getTemplate('inputSelectOption');
		$option.data('name', name).addClass('icon-' + name + ' input-' + name).html(name);
		return $option;
	},

	/* ##########################
	 * FILTER VALUE INPUTS
	 * ########################## */
	/**
	 * Creates a DOM element for inputting the value for the given field.
	 * @param  {Object} field Definition of the field from JCSDL definition.
	 * @param  {String} inputType Which input type to use (if many).
	 * @return {jQuery}
	 */
	createValueInputView : function(field, inputType) {
		var self = this;
		inputType = inputType || field.input;

		var $valueView = this.getTemplate('valueInput');
		if (typeof(this.inputs[inputType]) == 'undefined') return $valueView;

		// create the input view by this input type's handler and add it to the value view container
		var $inputView = this.inputs.exec(inputType, 'init', [field]);
		var $input = $inputView.find('input:first');
		var $valueInput = $valueView.find('.jcsdl-filter-value-input-field');
		$valueInput.data('inputType', inputType).html($inputView);

		// create a list of possible operators
		var $operatorsListView = $valueView.find('.jcsdl-filter-value-input-operators');
		if (inputType == 'text') {
			this.createTextOperatorsSelectView($operatorsListView, field, inputType, $valueInput);
		} else {
			this.createOperatorsSelectView($operatorsListView, field, inputType, $valueInput);
		}

		return $valueView;
	},

	/**
	 * Create operators selection for most input fields.
	 * @param  {jQuery} $view      Operators list view.
	 * @param  {Object} field      Field definition from JCSDL Definition.
	 * @param  {String} inputType  Name of the input type.
	 * @param  {jQuery} $inputView View of the input.
	 * @return {jQuery}            Should return the original $view with appended operators.
	 */
	createOperatorsSelectView : function($view, field, inputType, $inputView) {
		var self = this;

		var $input = $inputView.find('input:first');

		// get the config definition of this input type (if any) and a list of allowed operators
		var inputConfig = (typeof(this.definition.inputs[inputType]) !== 'undefined') ? this.definition.inputs[inputType] : {};
		var allowedOperators = (typeof(inputConfig.operators) !== 'undefined') ? inputConfig.operators : [];

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
		 * @param  {Event} ev
		 * @listener
		 */
		$view.children().bind('click touchstart', function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var $operator = $(this);

			$view.children().removeClass('selected');
			$operator.addClass('selected');

			if ($operator.data('name') == 'exists') {
				$inputView.fadeOut(self.config.animate);
			} else if (!$inputView.is(':visible')) {
				$inputView.fadeIn(self.config.animate);
			}

			// for text or number input field enable/disable the tag input
			if (inputType == 'number') {
				var opName = $operator.data('name');

				var tagAction = ($.inArray(opName, inputConfig.arrayOperators) >= 0) ? 'enable' : 'disable';
				$input.jcsdlTagInput(tagAction);
			}
		});

		// if there's only one possible operator then automatically select it and hide it
		if ($view.children().length == 1) {
			$view.children().eq(0).click();
			$view.children().hide();
		} else {
			var preselect = (typeof(field.operator) !== 'undefined') ? field.operator : inputConfig.operator;
			var $preselect = $view.find('.operator-' + preselect);

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
		var $input = $inputView.find('input:first');
		var $select = this.getTemplate('textOperatorsSelect');
		var $dropdown = this.getTemplate('textOperatorsDropdown');

		// get the config definition of this input type (if any) and a list of allowed operators
		var inputConfig = (typeof(this.definition.inputs[inputType]) !== 'undefined') ? this.definition.inputs[inputType] : {};
		var allowedOperators = (typeof(inputConfig.operators) !== 'undefined') ? inputConfig.operators : [];

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
			}).tipsy({gravity:'s'});

			$csView.prependTo($view);
			$select.addClass('has-cs');
		}

		/*
		 * LISTENERS
		 */
		/**
		 * Shows the operators dropdown when clicked on the select box.
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
					if ($parent == null || !$parent.is($dropdown)) {
						$select.removeClass('active');
						$dropdown.slideUp(self.config.animate);
						$('body').unbind('click.jcsdldropdown');
					}
				});
			}
		});

		/**
		 * Shows details of the operator.
		 * @param  {Event} ev Click event.
		 * @listener
		 */
		$dropdown.find('.jcsdl-dropdown-details-trigger, .jcsdl-operator-help').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();
			ev.stopPropagation();

			var $option = $(this).closest('.jcsdl-dropdown-option');

			if ($option.hasClass('expanded')) {
				$option.removeClass('expanded');
				$option.find('.jcsdl-dropdown-option-details').slideUp(self.config.animate);
			} else {
				$dropdown.find('.jcsdl-dropdown-option.expanded').removeClass('expanded').find('.jcsdl-dropdown-option-details').slideUp(self.config.animate);
				$option.addClass('expanded').find('.jcsdl-dropdown-option-details').slideDown(self.config.animate);
			}
		});

		/**
		 * Stop propagation of click event when clicked on external doc link.
		 * @param  {Event} ev Click event.
		 * @listener
		 */
		$dropdown.find('.jcsdl-doc-url').click(function(ev) {
			ev.stopPropagation();
		});

		/**
		 * Select the operator when it was clicked in the dropdown.
		 * @param  {Event} ev Click event.
		 * @listener
		 */
		$dropdown.find('.jcsdl-dropdown-option').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			$select.removeClass('active');
			$dropdown.hide();

			var name = $(this).data('name');
			var operator = self.definition.operators[$(this).data('name')];

			$select.find('.jcsdl-operator-label').html(operator.label);
			$select.data('operator', name);

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
		});

		// if there's only one possible operator then automatically select it and hide it
		if ($dropdown.find('.jcsdl-dropdown-option').length == 1) {
			$dropdown.find('.jcsdl-dropdown-option:first').click();
		} else {
			var preselect = (typeof(field.operator) !== 'undefined') ? field.operator : inputConfig.operator;
			var $preselect = $dropdown.find('.jcsdl-dropdown-option.operator-' + preselect);

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
	 * @param  {String} name Name of the operator.
	 * @return {jQuery}
	 */
	createOperatorOptionView : function(name) {
		var operator = this.definition.operators[name];
		if (typeof(operator) == 'undefined') return $(); // return empty jquery object if no such operator defined

		var $operatorView = this.getTemplate('operatorOption');
		$operatorView.data('name', name)
			.addClass('icon-' + name + ' operator-' + name)
			.prop('title', operator.description)
			.html(operator.label)
			.tipsy({gravity:'s'});
		return $operatorView;
	},

	/**
	 * Creates a single operator view for operators selection for text inputs.
	 * @param  {String} name Name of the operator.
	 * @return {jQuery} View of the operator.
	 */
	createTextOperatorOptionView : function(name) {
		var operator = this.definition.operators[name];
		if (typeof(operator) == 'undefined') return $();

		var $view = this.getTemplate('textOperatorOption');
		$view.data('name', name).addClass('operator-' + name);
		$view.find('.jcsdl-icon').addClass('icon-' + name + ' operator-' + name + ' selected');
		$view.find('.jcsdl-operator-label span').html(operator.label);
		$view.find('.jcsdl-operator-desc').html(operator.description);
		var $details = $view.find('.jcsdl-dropdown-option-details p');
		if (operator.details.length > 0) {
			$details.html(operator.details);
		} else {
			$details.remove();
		}
		$view.find('.jcsdl-dropdown-option-details a.jcsdl-doc-url').attr('href', operator.url).html(operator.url);

		return $view;
	},

	/**
	 * Sets the value for the given vale view (delegates it to proper function that will handle the specific view).
	 * @param {jQuery} $view Value input view.
	 * @param {String} value String representation of the value to be set.
	 * @return {Boolean}
	 */
	setValueForField : function($view, fieldInfo, value) {
		var self = this;

		var inputType = $view.data('inputType');
		if (typeof(this.inputs[inputType]) == 'undefined') return false;

		// for these 3 field types we need a delayed set value and an additional function to be called
		if ($.inArray(inputType, ['geo_box', 'geo_radius', 'geo_polygon']) >= 0) {
			// store the current gui, callback and its arguments in local values (in case they change in the meantime)
			var mapsGui = jcsdlMapsCurrentGui; // these are global
			var mapsCallback = jcsdlMapsCurrentCallback;
			var mapsCallbackArgs = jcsdlMapsCurrentCallbackArgs;

			// override the callback - this will be called once the google maps api is fully loaded
			jcsdlMapsCurrentCallback = function() {
				// make sure all is ok
				if (mapsGui && mapsCallback) {
					setTimeout(function() {
						// execute the standard callback (should be this.inputs[inputType].load typically)
						mapsCallback.apply(mapsGui.inputs, mapsCallbackArgs);

						// and now when the maps are loaded, execute the setValue method of that input
						self.inputs.exec(inputType, 'setValue', [$view, fieldInfo, value]);
					}, mapsGui.config.animate + 10); // make sure the map canvas is fully visible before loading them
				}
			};
		} else {
			this.inputs.exec(inputType, 'setValue', [$view, fieldInfo, value]);
		}
		return true;
	},

	/**
	 * Reads the value from the given value view (delegates it to proper function that will handle the specific view).
	 * @param  {jQuery} $view Value input view.
	 * @return {String}
	 */
	getValueFromField : function($view, fieldInfo) {
		var inputType = $view.data('inputType');
		if (typeof(this.inputs[inputType]) == 'undefined') return '';
		return this.inputs.exec(inputType, 'getValue', [$view, fieldInfo]);
	},

	/* ##########################
	 * SETTERS AND GETTERS
	 * ########################## */
	/**
	 * Returns a template (jQuery object) of the given name.
	 * @param  {String} name Name of the template to fetch.
	 * @return {jQuery}
	 */
	getTemplate : function(name) {
		if (typeof(JCSDLGuiTemplates[name]) !== 'undefined') {
			return JCSDLGuiTemplates[name].clone();
		}
		
		return $();
	},

	/**
	 * Returns definition of the field found under the current root path and specified field name.
	 * @param  {String} newFieldName
	 * @return mixed Either Object or bool false if no such field was found.
	 */
	getFieldInfoAtCurrentPath : function(newFieldName) {
		var fieldsPath = this.currentFilterFieldsPath.slice(0); // copy the array instead of referencing it

		// if specified a following field then include it in the path
		if (typeof(newFieldName) == 'string') {
			fieldsPath.push(newFieldName);
		}

		// and delegate this task to JCSDL object.
		return this.parser.getFieldInfo(this.currentFilterTarget, fieldsPath);
	},

	/**
	 * Given the field name and it's definition decide what the icon for this field is.
	 * @param  {String} field     Name of the string.
	 * @param  {Object} fieldInfo Field definition.
	 * @return {String}
	 */
	getIconForField : function(field, fieldInfo) {
		return (typeof(fieldInfo.icon) !== 'undefined') ? fieldInfo.icon : field;
	},

	/**
	 * Returns the filter index of the filter to which the given DOM representation belongs.
	 * @param  {jQuery} $filterRow
	 * @return {Number}
	 */
	getFilterIndexByElement : function($filterRow) {
		return this.$filtersList.find('.jcsdl-filter').index($filterRow);
	}

};