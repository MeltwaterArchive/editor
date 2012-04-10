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
		'<div class="filter">',
			'<div class="filter-description">',
				'<div class="target info"></div>',
				'<div class="field info"></div>',
				'<div class="operator info"></div>',
				'<div class="value info"></div>',
			'</div>',
			'<div class="options">',
				'<a href="#" class="edit">Edit</a>',
				'<a href="#" class="delete">Delete</a>',
			'</div>',
		'</div>'
	].join('')),

	filterTarget : $('<div class="filter-target icon target" />'),
	filterField : $('<div class="filter-field icon field" />'),
	filterOperator : $('<div class="filter-operator" />'),
	filterValue : $('<div class="filter-value" />'),

	/* ##########################
	 * SINGLE FILTER EDITOR
	 * ########################## */
	// filter editor container
	filterEditor : $([
		'<div class="filter-editor">',
			'<div class="steps">',
			'</div>',
			'<input type="button" class="filter-save" value="Save Filter" />',
			'<input type="button" class="filter-cancel" value="Cancel Filter" />',
		'</div>'
	].join('')),

	// step container, all steps should be wrapped with this so it's easy to remove them when necessary
	step : $('<div class="filter-step" />'),

	// target select
	target : $([
		'<div class="filter-target-wrap">',
			'<a href="#" class="carousel-scroll left"></a>',
			'<a href="#" class="carousel-scroll right"></a>',
			'<div class="carousel-wrap">',
				'<div class="filter-target carousel" />',
			'</div>',
		'</div>'
	].join('')),

	// target select option
	targetOption : $('<a href="#" class="icon target carousel-item"></a>'),

	// field select
	field : $([
		'<div class="filter-target-field-wrap">',
			'<a href="#" class="carousel-scroll left"></a>',
			'<a href="#" class="carousel-scroll right"></a>',
			'<div class="carousel-wrap">',
				'<div class="filter-target-field carousel" />',
			'</div>',
		'</div>'
	].join('')),

	// field select option
	fieldOption : $('<a href="#" class="icon field carousel-item"></a>'),

	// value input container
	valueInput : $([
		'<div class="filter-value-input">',
			'<div class="filter-value-input-operators"></div>',
			'<div class="filter-value-input-field"></div>',
		'</div>'
	].join('')),

	// operator select
	operatorSelect : $([
		'<div class="operator-select">',
			'<label><input type="radio" name="operator" /></label>',
		'</div>'
	].join('')),

	/* ##########################
	 * VALUE INPUT FIELDS
	 * ########################## */
	// text input
	valueInput_text : $([
		'<div class="input-text">',
			'<input type="text" placeholder="Type your desired value" />',
		'</div>'
	].join('')),

	// number input
	valueInput_number : $([
		'<div class="input-number">',
			'<input type="text" placeholder="Type your desired value" />',
		'</div>'
	].join('')),

	// select input
	valueInput_select : $([
		'<div class="input-select">',
		'</div>'
	].join('')),

	// select input option
	valueInput_select_option : $([
		'<div class="input-select-option">',
			'<label>',
				'<input type="checkbox" name="selectvalue[]" />',
				'<span />',
			'</label>',
		'</div>'
	].join(''))

};