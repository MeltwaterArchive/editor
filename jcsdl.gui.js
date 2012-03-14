var JCSDLGui = function($container, config) {
	var self = this;

	this.$container = $($container); // ensure jQuery object
	if (this.$container.length == 0) return false; // break if no such element in DOM

	/** @var {JCSDL} The actual JCSDL "parser". */
	var jcsdl = new JCSDL();

	this.config = $.extend(true, {
		animationSpeed : 200
	}, config);

	this.$currentFilterView = null;
	this.filterSteps = [];

	// current choice data
	this.currentFilterTarget = null;
	this.currentFilterFieldsPath = [];

	// all templates are defined elsewhere
	this.templates = JCSDLGuiTemplates;

	/**
	 * Initializes the filter editor.
	 */
	this.initFilterEditor = function() {
		// prepare the filter editor
		self.$currentFilterView = self.getTemplate('filter');

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
		this.addFilterStep('target', $targetSelectView);

		// and finally add the editor to the DOM
		self.$container.html(self.$currentFilterView);
	};

	/**
	 * Loads the given JCSDL string and builds the whole editor based on it.
	 * @param  {String} code JCSDL string.
	 */
	this.loadJCSDL = function(code) {
		var filter = jcsdl.parseJCSDL(code);
		if (filter === false) {
			alert('Invalid JCSDL input!');
			return;
		}

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
	};

	/* ##########################
	 * EDITOR BUILDING
	 * ########################## */
	/**
	 * Adds a filter step with proper numbering/position.
	 * @param {String} stepName Name of the step.
	 * @param {jQuery} $view    View of the step.
	 */
	this.addFilterStep = function(stepName, $view) {
		var $stepView = self.getTemplate('step');
		$stepView.html($view);

		var stepNumber = self.filterSteps.length;

		// attach some data and classes (for easy selectors)
		$stepView.data('number', stepNumber);
		$stepView.addClass('filter-step-number-' + stepNumber);
		$stepView.data('name', stepName);
		$stepView.addClass('filter-step-name-' + stepName);

		// add to the DOM
		$stepView.appendTo(self.$currentFilterView);
		$stepView.hide().fadeIn(self.config.animationSpeed);

		// add to the steps pool
		self.filterSteps.push($stepView);
	};

	/**
	 * Removes all filter steps after the given position.
	 * Also clears the resulting CSDL if there was any before.
	 * @param  {Integer} position
	 */
	this.removeFilterStepsAfterPosition = function(position) {
		var steps = self.filterSteps.splice(position + 1, self.filterSteps.length - position);
		$.each(steps, function(i, $step) {
			$($step).remove(); // ensure jQuery
		});

		$('#filter-csdl').val('');
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
		var $submitView = self.getTemplate('submit');
		self.addFilterStep('submit', $submitView);

		$submitView.click(function(ev) {
			self.didSubmitFilter($valueView);
		});
	};

	this.didSubmitFilter = function($valueView) {
		// first check if the operator is selected
		var $selectedOperator = $valueView.find('[name="operator"]:checked');
		if ($selectedOperator.length == 0) {
			alert('You need to select an operator!');
			return;
		}

		// then check if there is a value specified
		var value = $valueView.find('#filter-value-input-field input').val();
		if (value.length == 0) {
			alert('You need to specify a value!');
			return;
		}
		
		jcsdl.addFilter(self.currentFilterTarget, self.currentFilterFieldsPath, $selectedOperator.val(), value);
		var theCode = jcsdl.getCSDL();
		jcsdl.clearFilters();

		$('#filter-csdl').val(theCode);
	};

	/* ##########################
	 * HELPERS
	 * ########################## */
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

	var createValueInputView = function(field) {
		var $valueView = self.getTemplate('valueInput');

		// create the actual input based on the field definition
		var $inputView = self.getTemplate('valueInput_' + field.input);
		$inputView.addClass('type-' + field.type);

		// add the input in proper area of the value view
		$valueView.find('#filter-value-input-field').html($inputView);

		// now take care of possible operators
		$.each(field.operators, function(i, operator) {
			var $operatorView = createOperatorSelectView(operator);
			$valueView.find('#filter-value-input-operators').append($operatorView);
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
		var operatorId = 'operator-' + operatorName;
		$operatorView.find('input').val(operatorName);
		$operatorView.find('input').attr('id', operatorId);
		$operatorView.find('label').html(operator.description);
		$operatorView.find('label').attr('for', operatorId);

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
	}
};