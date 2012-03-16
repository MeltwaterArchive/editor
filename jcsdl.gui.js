var JCSDLGui = function(el, config) {
	var self = this;

	var $el = $(el); // ensure that the container element is a jQuery object
	if ($el.length == 0) return false; // break if no such element in DOM

	self.$container = $();

	/** @var {JCSDL} The actual JCSDL "parser". */
	var jcsdl = new JCSDL(this);

	this.config = $.extend(true, {
		animationSpeed : 200,
		onSave : function(code) {}
	}, config);

	// data
	this.logic = 'AND';
	this.filters = [];

	// current choice data
	this.currentFilter = null;
	this.currentFilterSteps = [];
	this.currentFilterTarget = null;
	this.currentFilterFieldsPath = [];

	// DOM elements
	this.$editor = $();
	this.$editorFiltersList = $();
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

		self.currentFilter = null;
		self.currentFilterSteps = [];
		self.currentFilterTarget = null;
		self.currentFilterFieldsPath = [];
		self.$currentFilterView = $();
		self.$currentFilterStepsView = $();

		// and insert the editor into the container
		self.$editor = self.getTemplate('editor');
		self.$editorFiltersList = self.$editor.find('.filters-list');

		self.$container = self.getTemplate('container');
		self.$container.html(self.$editor);
		$el.html(self.$container);

		/*
		 * REGISTER LISTENERS
		 */
		/**
		 * Set the logic upon selection.
		 * @param  {Event} ev
		 */
		self.$editor.find('.filters-logic input[name="logic"]').change(function(ev) {
			self.logic = $(this).val();
		});

		/**
		 * Show filter editor to create a new one from scratch upon clicking 'Add filter'.
		 * @param  {Event} ev Click Event.
		 */
		self.$editor.find('.filter-add').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			self.showFilterEditor();
		});

		/**
		 * Handle output / returning of the resulting JCSDL upon clicking save.
		 * @param  {Event} ev Click Event.
		 */
		self.$editor.find('.jcsdl-editor-save').bind('click.jcsdl', function(ev) {
			self.returnJCSDL();
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
		self.$editor.find('.filters-logic input[name="logic"][value="' + self.logic + '"]').click();
		
		// display the filters
		// add each filter to the list
		$.each(self.filters, function(i, filter) {
			var $filterRow = createFilterRow(filter);
			$filterRow.appendTo(self.$editorFiltersList);
		});

		/*
		// select target
		self.$currentFilterView.find('select[name="target"]').val(filter.target);
		self.didSelectTarget(filter.target);

		// select all fields and subfields
		$.each(filter.fieldPath, function(i, field) {
			var $fieldView = self.$currentFilterView.find('.filter-target-field:last');
			$fieldView.find('select[name="field[]"]').val(field);
			self.didSelectField(field, $fieldView);
		});

		// select operator
		self.$currentFilterView.find('#operator-' + filter.operator).click();
		
		// fill in the value
		self.$currentFilterView.find('#filter-value-input-field input').val(filter.value);
		*/
	};

	/**
	 * Returns the JCSDL
	 * @return {[type]}
	 */
	this.returnJCSDL = function() {
		var code = jcsdl.getCSDLFromFilters(self.filters, self.logic);
		self.config.onSave.apply(self, [code]);
	};

	/**
	 * Removes the filter at the given index.
	 * @param  {Number} index
	 */
	this.deleteFilter = function(index) {
		// remove from the DOM
		self.$editorFiltersList.find('.filter').eq(index).remove();

		// remove from the filters list
		self.filters.splice(index, 1);
	};

	/* ##########################
	 * SINGLE FILTER EDITOR
	 * ########################## */
	/**
	 * Shows the filter editor.
	 */
	this.showFilterEditor = function() {
		self.initFilterEditor();

		// hide the main editor view
		self.$editor.hide();

		// append the filter editor to the container and show it
		self.$currentFilterView.appendTo(self.$container);
		self.$currentFilterView.show();
	};

	/**
	 * Initializes and returns the filter editor.
	 * @return {jQuery} Filter Editor element.
	 */
	this.initFilterEditor = function() {
		// prepare the filter editor
		self.$currentFilterView = self.getTemplate('filterEditor');
		self.$currentFilterStepsView = self.$currentFilterView.find('.steps');

		// by default always prepare the selection of targets first
		var $targetSelectView = self.getTemplate('target');
		var $targetSelect = $targetSelectView.find('select');

		// create a select option for every possible target
		$.each(JCSDLConfig.targets, function(name, target) {
			// delegate creation of the option to a function
			var $targetView = createOptionForTarget(name, target);

			// append the option to the select
			$targetView.appendTo($targetSelect);
		});

		// register listener for change event
		$targetSelect.change(function(ev) {
			self.didSelectTarget($(this).val());
		});

		// append the select view to the filter view
		self.addFilterStep('target', $targetSelectView);

		// hide the save button until all steps haven't been gone through
		self.$currentFilterView.find('.filter-save').hide();

		/*
		 * REGISTER PROPER LISTENERS
		 */
		/**
		 * Saves the filter that is currently being edited when clicked its save button.
		 * @param  {Event} ev Click Event.
		 */
		self.$currentFilterView.find('.filter-save').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			self.didSubmitFilter();
		});

		/**
		 * Hides the single filter editor and doesn't save the filter when the cancel button is clicked.
		 * @param  {Event} ev Click Event.
		 */
		self.$currentFilterView.find('.filter-cancel').click(function(ev) {
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
		self.currentFilter = null;
		self.currentFilterSteps = [];
		self.currentFilterTarget = null;
		self.currentFilterFieldsPath = [];

		self.$currentFilterView.fadeOut(self.config.animationSpeed, function() {
			self.$currentFilterView.remove();
			self.$editor.show();
		});
	};

	/* ##########################
	 * FILTER EDITOR BUILDING
	 * ########################## */
	/**
	 * Adds a filter step with proper numbering/position.
	 * @param {String} stepName Name of the step.
	 * @param {jQuery} $view    View of the step.
	 */
	this.addFilterStep = function(stepName, $view) {
		var $stepView = self.getTemplate('step');
		$stepView.html($view);

		var stepNumber = self.currentFilterSteps.length;

		// attach some data and classes (for easy selectors)
		$stepView.data('number', stepNumber);
		$stepView.addClass('filter-step-number-' + stepNumber);
		$stepView.data('name', stepName);
		$stepView.addClass('filter-step-name-' + stepName);

		// add to the DOM
		$stepView.appendTo(self.$currentFilterStepsView);
		$stepView.hide().fadeIn(self.config.animationSpeed);

		// add to the steps pool
		self.currentFilterSteps.push($stepView);
	};

	/**
	 * Removes all filter steps after the given position.
	 * Also clears the resulting CSDL if there was any before.
	 * @param  {Integer} position
	 */
	this.removeFilterStepsAfterPosition = function(position) {
		var steps = self.currentFilterSteps.splice(position + 1, self.currentFilterSteps.length - position);
		$.each(steps, function(i, $step) {
			$($step).remove(); // ensure jQuery
		});
	};

	/*
	 * EVENT HANDLERS
	 */
	/**
	 * When a target is selected, the user needs to select a field.
	 * @param  {String} targetName Name of the selected target.
	 */
	this.didSelectTarget = function(targetName) {
		if (typeof(JCSDLConfig.targets[targetName]) == 'undefined') return false;

		self.currentFilterTarget = targetName;
		self.currentFilterFieldsPath = [];

		// remove all steps regarding selection of fields in case another target was selected first
		self.removeFilterStepsAfterPosition(0); // target is always position 0

		// now need to select a field, so build the selection view
		var target = JCSDLConfig.targets[targetName];
		var $fieldView = createFieldSelectionView(target.fields);

		self.addFilterStep('field', $fieldView);
	};

	/**
	 * When a field is selected then the user either needs to input a value or select a subfield if such exists.
	 * @param  {String} fieldName  Name of the selected field.
	 * @param  {jQuery} $fieldView The field selection view that was used.
	 */
	this.didSelectField = function(fieldName, $fieldView) {
		// remove any steps that are farther then this one, just in case
		var fieldPosition = $fieldView.data('position');
		self.currentFilterFieldsPath.splice(fieldPosition, self.currentFilterFieldsPath.length - fieldPosition);

		var field = getFieldInfoAtCurrentPath(fieldName);
		if (field == false) return;

		// from DOM as well
		self.removeFilterStepsAfterPosition($fieldView.closest('.filter-step').data('number'));

		// now proceed with adding the current one
		self.currentFilterFieldsPath.push(fieldName);

		// if this fields has some more subfields then add them now
		if (typeof(field.fields) !== 'undefined') {
			var $fieldView = createFieldSelectionView(field.fields);
			self.addFilterStep('field', $fieldView);
			return;
		}

		// this is a "final" field, so now the user needs to input desired value(s)
		var $valueView = createValueInputView(field);
		self.addFilterStep('value', $valueView);

		// also show the submit button
		self.$currentFilterView.find('.filter-save').fadeIn(self.config.animationSpeed);
	};

	/**
	 * Handles the saving of a filter from the single filter editor.
	 */
	this.didSubmitFilter = function() {
		// first check if the operator is selected
		var $selectedOperator = self.$currentFilterView.find('.filter-value-input-operators [name="operator"]:checked');
		if ($selectedOperator.length == 0) {
			self.showError('You need to select an operator!');
			return;
		}

		// then check if there is a value specified
		var value = self.$currentFilterView.find('.filter-value-input-field input').val();
		if (value.length == 0) {
			self.showError('You need to specify a value!');
			return;
		}
		
		// now that we have all data, let's create a filter object from this
		var filter = jcsdl.createFilter(self.currentFilterTarget, self.currentFilterFieldsPath, $selectedOperator.val(), value);
		// also the filter row
		var $filterRow = createFilterRow(filter);

		// and now finally either add it to the end of the filters list
		// or replace if we were editing another filter
		if (self.currentFilter) {
			// we were editing, so let's replace it
			
		} else {
			// we were adding a filter, so simply add it to the list
			$filterRow.appendTo(self.$editorFiltersList);
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
		console.log(message, arguments);
	};

	/**
	 * Creates a filter row element for the specified filter.
	 * @param  {Object} filter Filter object.
	 * @return {jQuery}
	 */
	var createFilterRow = function(filter) {
		var $filterRow = self.getTemplate('filter');

		$filterRow.find('.j-target').html(filter.target);
		$filterRow.find('.j-field').html(filter.fieldPath.join('.'));
		$filterRow.find('.j-operator').html(filter.operator);
		$filterRow.find('.j-value').html(filter.value);

		// also attach the filter data to the row
		$filterRow.data('filter', filter);

		// bind the delete event
		$filterRow.find('.j-delete').click(function(ev) {
			ev.preventDefault();
			ev.target.blur();

			var index = self.getFilterIndexByElement($filterRow);
			self.deleteFilter(index);
		});

		return $filterRow;
	};

	/**
	 * Creates a select option for the given target with the specified name.
	 * @param  {String} name   Unique name of the target, matching one from JCSDLConfig.
	 * @param  {Object} target Definition of the target from JCSDLConfig.
	 * @return {jQuery}
	 */
	var createOptionForTarget = function(name, target) {
		var $option = self.getTemplate('targetOption');
		$option.val(name);
		$option.html(target.name);
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
		var $fieldSelect = $fieldView.find('select');
		$.each(fields, function(name, field) {
			var $fieldView = createOptionForField(name, field);
			$fieldView.appendTo($fieldSelect);
		});

		// bind event listener on change
		$fieldSelect.change(function(ev) {
			self.didSelectField($(this).val(), $fieldView);
		});

		return $fieldView;
	};

	/**
	 * Creates a select option for the given field with the specified name.
	 * @param  {String} name  Unique name of the field in the current target, matching one from JCSDLConfig.
	 * @param  {Object} field Definition of the field from JCSDLConfig.
	 * @return {jQuery}
	 */
	var createOptionForField = function(name, field) {
		var $option = self.getTemplate('fieldOption');
		$option.val(name);
		$option.html(field.name);
		return $option;
	};

	/**
	 * Creates a DOM element for inputting the value for the given field.
	 * @param  {Object} field Definition of the field from JCSDLConfig.
	 * @return {jQuery}
	 */
	var createValueInputView = function(field) {
		var $valueView = self.getTemplate('valueInput');

		// create the actual input based on the field definition
		var $inputView = self.getTemplate('valueInput_' + field.input);
		$inputView.addClass('type-' + field.type);

		// add the input in proper area of the value view
		$valueView.find('.filter-value-input-field').html($inputView);

		// now take care of possible operators
		$.each(field.operators, function(i, operator) {
			var $operatorView = createOperatorSelectView(operator);
			$valueView.find('.filter-value-input-operators').append($operatorView);
		});

		return $valueView;
	};

	/**
	 * Creates a single operator select view for the specified operator.
	 * @param  {String} operatorName Name of the operator.
	 * @return {jQuery}
	 */
	var createOperatorSelectView = function(operatorName) {
		var operator = JCSDLConfig.operators[operatorName];
		if (typeof(operator) == 'undefined') return $(); // return empty jquery object if no such operator defined

		var $operatorView = self.getTemplate('operatorSelect');
		$operatorView.find('input').val(operatorName);
		$operatorView.find('label').append(operator.description);

		return $operatorView;
	};

	/**
	 * Returns definition of the field found under the current root path and specified field name.
	 * @param  {String} newFieldName
	 * @return mixed Either Object or bool false if no such field was found.
	 */
	var getFieldInfoAtCurrentPath = function(newFieldName) {
		// starting field is naturally the current target
		var field = JCSDLConfig.targets[self.currentFilterTarget];

		// get to the end of the path
		$.each(self.currentFilterFieldsPath, function(i, fieldName) {
			if (typeof(field.fields) !== 'undefined') {
				// get the next field definition in line
				field = field.fields[fieldName];

			} else {
				field = false;
				return false; // break the $.each
			}
		});

		if (typeof(field.fields) !== 'undefined') {
			field = (typeof(field.fields[newFieldName]) !== 'undefined') ? field.fields[newFieldName] : false;
		}

		return field;
	};

	/* ##########################
	 * SETTERS AND GETTERS
	 * ########################## */
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
		return self.$editorFiltersList.find('.filter').index($filterRow);
	};

	// automatically call the initialization after everything has been defined
	this.init();
};