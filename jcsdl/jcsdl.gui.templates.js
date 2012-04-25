var JCSDLGuiTemplates = {
	// container of the whole thing
	container : $('<div class="jcsdl-container" />'),

	// editor
	editor : $([
		'<div class="jcsdl-mainview">',

			'<div class="jcsdl-header">',
				'<h3>Filters</h3>',
				'<div class="jcsdl-mainview-mode">',
					'<span class="jcsdl-label">View as:</span>',
					'<div class="jcsdl-bordered jcsdl-mainview-mode-options">',
						'<a href="#" class="jcsdl-mainview-mode-option jcsdl-expanded active" data-mode="expanded"></a>',
						'<a href="#" class="jcsdl-mainview-mode-option jcsdl-collapsed" data-mode="collapsed"></a>',
					'</div>',
				'</div>',
				'<div class="jcsdl-mainview-actions">',
					'<a href="#" class="jcsdl-bordered jcsdl-mainview-action jcsdl-add-filter">',
						'<div class="jcsdl-picto"></div>',
						'Create New Filter',
					'</a>',
				'</div>',
			'</div>',

			'<div class="jcsdl-filters-logic">',
				'<label class="jcsdl-filters-logic-option jcsdl-and">',
					'<input type="radio" name="logic" value="AND" checked />',
					'ALL of the following',
				'</label>',
				'<label class="jcsdl-filters-logic-option jcsdl-or">',
					'<input type="radio" name="logic" value="OR" />',
					'ANY of the following',
				'</label>',
			'</div>',

			'<div class="jcsdl-filters-list expanded">',
			'</div>',

			'<div class="jcsdl-footer">',
				'<div class="jcsdl-actions">',
					'<a href="#" class="jcsdl-button jcsdl-editor-save">Save and Preview</a>',
					'<a href="#" class="jcsdl-button jcsdl-editor-cancel">Cancel</a>',
				'</div>',

				'<div class="jcsdl-mainview-actions">',
					'<a href="#" class="jcsdl-bordered jcsdl-mainview-action jcsdl-add-filter">',
						'<div class="jcsdl-picto"></div>',
						'Create New Filter',
					'</a>',
				'</div>',
			'</div>',
		'</div>'
	].join('')),

	// filter row
	filter : $([
		'<div class="jcsdl-filter">',
			'<div class="jcsdl-filter-description">',
				'<div class="jcsdl-filter-info target"></div>',
				'<div class="jcsdl-filter-info field"></div>',
				'<div class="jcsdl-filter-info operator"></div>',
				'<div class="jcsdl-filter-info jcsdl-bordered value"></div>',
			'</div>',
			'<div class="jcsdl-filter-options">',
				'<a href="#" class="edit">Edit</a>',
				'<span>/</span>',
				'<a href="#" class="delete">Delete</a>',
			'</div>',
		'</div>'
	].join('')),

	filterTarget : $('<div class="jcsdl-filter-target jcsdl-icon target" />'),
	filterField : $('<div class="jcsdl-filter-field jcsdl-icon field" />'),
	filterOperator : $('<div class="jcsdl-filter-operator" />'),
	filterValue : $('<div class="jcsdl-filter-value" />'),

	/* ##########################
	 * SINGLE FILTER EDITOR
	 * ########################## */
	// filter editor container
	filterEditor : $([
		'<div class="jcsdl-filter-editor">',
			'<div class="jcsdl-steps">',
			'</div>',
			'<div class="jcsdl-footer">',
				'<a href="#" class="jcsdl-button jcsdl-filter-save">Save and Preview</a>',
				'<span style="display: none;">or</span> <a href="#" class="jcsdl-filter-cancel">cancel</a>',
			'</div>',
		'</div>'
	].join('')),

	// step container, all steps should be wrapped with this so it's easy to remove them when necessary
	step : $('<div class="jcsdl-step" />'),

	// target select
	target : $([
		'<div class="jcsdl-filter-target-wrap">',
			'<a href="#" class="jcsdl-carousel-scroll left"></a>',
			'<a href="#" class="jcsdl-carousel-scroll right"></a>',
			'<div class="jcsdl-carousel-wrap">',
				'<div class="jcsdl-filter-target jcsdl-carousel" />',
			'</div>',
		'</div>'
	].join('')),

	// target select option
	targetOption : $('<a href="#" class="jcsdl-icon target jcsdl-carousel-item"></a>'),

	// field select
	field : $([
		'<div class="jcsdl-filter-target-field-wrap">',
			'<a href="#" class="jcsdl-carousel-scroll left"></a>',
			'<a href="#" class="jcsdl-carousel-scroll right"></a>',
			'<div class="jcsdl-carousel-wrap">',
				'<div class="jcsdl-filter-target-field jcsdl-carousel" />',
			'</div>',
		'</div>'
	].join('')),

	// field select option
	fieldOption : $('<a href="#" class="jcsdl-icon field jcsdl-carousel-item"></a>'),

	// input select
	inputSelect : $([
		'<div class="jcsdl-filter-target-field-input-wrap">',
			'<a href="#" class="jcsdl-carousel-scroll left"></a>',
			'<a href="#" class="jcsdl-carousel-scroll right"></a>',
			'<div class="jcsdl-carousel-wrap">',
				'<div class="jcsdl-filter-target-field-input jcsdl-carousel" />',
			'</div>',
		'</div>'
	].join('')),

	// field select option
	inputSelectOption : $('<a href="#" class="jcsdl-icon input jcsdl-carousel-item"></a>'),

	// value input container
	valueInput : $([
		'<div class="jcsdl-filter-value-input">',
			'<div class="jcsdl-filter-value-input-operators"></div>',
			'<div class="jcsdl-filter-value-input-field"></div>',
		'</div>'
	].join('')),

	// operator select
	operatorSelect : $([
		'<div class="jcsdl-operator-select">',
			'<label><input type="radio" name="operator" /></label>',
		'</div>'
	].join('')),

	// case sensitivity toggle
	caseSensitivity : $([
		'<div class="jcsdl-operator-cs">',
			'<label><input type="checkbox" name="cs" value="true" /> Case Sensitive</label>',
		'</div>'
	].join('')),

	/* ##########################
	 * VALUE INPUT FIELDS
	 * ########################## */
	// text input
	valueInput_text : $([
		'<div class="jcsdl-input-text">',
			'<input type="text" placeholder="Type your desired value" />',
		'</div>'
	].join('')),

	// number input
	valueInput_number : $([
		'<div class="jcsdl-input-number">',
			'<input type="text" placeholder="e.g. 3.14" />',
		'</div>'
	].join('')),

	// select input
	valueInput_select : $([
		'<div class="jcsdl-input-select">',
		'</div>'
	].join('')),

	// select input option
	valueInput_select_option : $([
		'<div class="jcsdl-input-select-option">',
			'<label>',
				'<input type="checkbox" name="selectvalue[]" />',
				'<span />',
			'</label>',
		'</div>'
	].join(''))

};