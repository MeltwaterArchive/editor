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
			self.$currentFilterView.find('input[value="' + filter.operator + '"]').click();
			
			// fill in the value (using the proper delegate)
			var $valueInputView = self.$currentFilterView.find('.jcsdl-filter-value-input-field');
			setValueForField($valueInputView, fieldInfo, filter.value);
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
	 */
	this.addFilterStep = function(stepName, $view) {
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
			buildCarousel($stepView, function() {
				self.didSelectTarget($(this).data('name'));
			});
		}
		if (stepName == 'field') {
			// mark that the editor now has fields selection
			self.$currentFilterView.addClass('has-fields');

			// mark the last field select
			self.$currentFilterStepsView.find('.jcsdl-filter-step-field').removeClass('last');
			$stepView.addClass('last');

			buildCarousel($stepView, function() {
				self.didSelectField($(this).data('name'), $view);
			});
		}

		// animate into view nicely
		$stepView.hide().slideDown(self.config.animationSpeed);

		// add to the steps pool
		self.currentFilterSteps.push($stepView);
	};

	/**
	 * Removes all filter steps after the given position.
	 * Also clears the resulting CSDL if there was any before.
	 * @param  {Integer} position
	 */
	this.removeFilterStepsAfterPosition = function(position) {
		// update the 'last' class for step fields
		var $theStep = self.$currentFilterStepsView.find('.jcsdl-step').eq(position);
		if ($theStep.hasClass('jcsdl-filter-step-field')) {
			$theStep.addClass('last');
		}

		var steps = self.currentFilterSteps.splice(position + 1, self.currentFilterSteps.length - position);
		$.each(steps, function(i, $step) {
			$($step).remove(); // ensure jQuery
		});
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
		self.removeFilterStepsAfterPosition($fieldView.closest('.jcsdl-step').data('number'));

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
		self.$currentFilterView.find('.jcsdl-filter-save').fadeIn(self.config.animationSpeed);
		self.$currentFilterView.find('.jcsdl-footer span').show();
	};

	/**
	 * Handles the saving of a filter from the single filter editor.
	 */
	this.didSubmitFilter = function() {
		// first check if the operator is selected
		var $selectedOperator = self.$currentFilterView.find('.jcsdl-filter-value-input-operators [name="operator"]:checked');
		if ($selectedOperator.length == 0) {
			self.showError('You need to select an operator!');
			return;
		}

		// then check if there is a value specified
		var $valueView = self.$currentFilterView.find('.jcsdl-filter-value-input-field');
		var value = getValueFromField($valueView, getFieldInfoAtCurrentPath());
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

		// operator
		var $operator = self.getTemplate('filterOperator');
		$operator.addClass('operator-' + filter.operator).html(jcsdl.getOperatorCode(filter.operator).escapeHtml());
		$filterRow.find('.operator').html($operator);

		// value
		var $value = self.getTemplate('filterValue');
		$value.html(filter.value.escapeHtml());
		$filterRow.find('.value').html($value);

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
		//$option.html(target.name);
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

	/*
	 * FILTER STEP CAROUSEL METHODS
	 */
	/**
	 * Builds a carousel for target and field selection steps. Takes care of all internal functionality.
	 * @param  {jQuery} $step          Selection step element.
	 * @param  {Function} selectCallback Function to be called when an option is selected.
	 * @param  {Boolean} expand[optional] Should the carousel automatically expand to the next level on selected item.
	 */
	var buildCarousel = function($step, selectCallback, expand) {
		$step.jcsdlCarousel({
			select : selectCallback,
			expand : expand
		});
	};

	/*
	 * FILTER VALUE INPUTS
	 */
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
	 * Creates a DOM element for inputting the value for the given field.
	 * @param  {Object} field Definition of the field from JCSDLConfig.
	 * @return {jQuery}
	 */
	var createValueInputView = function(field) {
		var $valueView = self.getTemplate('valueInput');

		// create the actual input based on the field definition
		if (typeof(fieldTypes[field.input]) == 'undefined') return $valueView;

		// create the input view by this input type's handler and add it to the value view ontainer
		var $inputView = fieldTypes[field.input].init.apply($(), [field]);
		$valueView.find('.jcsdl-filter-value-input-field').data('inputType', field.input).html($inputView);;

		// now take care of possible operators
		var $operatorsListView = $valueView.find('.jcsdl-filter-value-input-operators');
		$.each(field.operators, function(i, operator) {
			var $operatorView = createOperatorSelectView(operator);
			$operatorsListView.append($operatorView);
		});

		// if there's only one possible operator then automatically select it and hide it
		if (field.operators.length == 1) {
			$operatorsListView.find('.jcsdl-operator-select:first input').click();
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

				// also include all options
				if (typeof(fieldInfo.options) !== 'undefined') {
					$.each(fieldInfo.options, function(name, label) {
						var $optionView = self.getTemplate('valueInput_select_option');
						$optionView.find('input').val(name);
						$optionView.find('label span').html(label);
						$optionView.appendTo($view);
					});
				}

				return $view;
			},

			setValue : function(fieldInfo, value) {
				var values = value.split(',');
				var $view = this;
				$.each(values, function(i, name) {
					$view.find('input[value="' + name + '"]').attr('checked', true);
				});
			},

			getValue : function(fieldInfo) {
				var values = [];
				this.find('input:checked').each(function(i, option) {
					values.push($(option).val());
				});

				return values.join(',');
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
		var resizeTimeout = null;
		$(window).resize(function(ev) {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(function() {
				var wrapWidth = self.calculateWrapWidth();
				self.$carouselWrap.css({
					//width : wrapWidth,
					maxWidth : wrapWidth
				});
				self.calculateCenterMargin();
				self.changePosition(0, true);
			}, 30);
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
			this.$carousel.animate({
				left : this.calculateCurrentPosition()
			}, speed);

			var $selectedItem = this.getSelectedItem();
			this.$carouselItems.removeClass('selected');
			$selectedItem.addClass('selected');

			// because position is changing, we may activate both buttons
			this.toggleScrollButtons();

			// and finally call the selectCallback method if any
			if (!dontExpand && typeof(this.select) == 'function') {
				this.select.apply($selectedItem);
			}
		}
	};

	// the proper plugin
	$.fn.jcsdlCarousel = function(options) {
		options = $.extend({}, {
			select : function() {},
			expand : false,
			speed : 200
		}, options);

		function getJCSDLCarousel($el) {
			var carousel = $el.data('jcsdlCarousel');
			if (!carousel) {
				carousel = new JCSDLCarousel($el, options);
				$el.data('jcsdlCarousel', carousel);
			}
			return carousel;
		}

		this.each(function() {getJCSDLCarousel($(this));});
		return this;
	};
})(window.jQuery);

String.prototype.escapeHtml = function() {
	var str = this.valueOf();
	str = str.replace('&', '&amp;');
	str = str.replace('<', '&lt;');
	str = str.replace('>', '&gt;');
	return str;
};