var JCSDLGuiTemplates = {
	// container of the whole thing
	container : $('<div class="jcsdl-container" />'),

	// editor
	editor : $([
		'<div class="jcsdl-editor">',
			'<h3>Filters:</h3>',
			'<ul class="filters-logic">',
				'<li><label><input type="radio" name="logic" value="AND" checked="checked" /> ALL of the following:</label></li>',
				'<li><label><input type="radio" name="logic" value="OR" /> ANY of the following:</label></li>',
			'</ul>',
			'<div class="filters-list">',
			'</div>',
			'<input type="button" class="filter-add" value="Add Filter" />',
			'<input type="button" class="jcsdl-editor-save" value="Save" />',
		'</div>'
	].join('')),

	// filter row
	filter : $([
		'<div class="filter">',
			'<div class="filter-description">',
				'<div class="j-target info"></div>',
				'<div class="j-field info"></div>',
				'<div class="j-operator info"></div>',
				'<div class="j-value info"></div>',
			'</div>',
			'<div class="options">',
				'<a href="#" class="j-edit">Edit</a>',
				'<a href="#" class="j-delete">Delete</a>',
			'</div>',
		'</div>'
	].join('')),

	/* ##########################
	 * SINGLE FILTER EDITOR
	 * ########################## */
	// filter editor container
	filterEditor : $([
		'<div class="filter-editor">',
			'<div class="steps">',
			'</div>',
			'<input type="button" class="filter-save" value="Save Filter" />',
			'<input type="button" class="filter-cancel" value="Cancel" />',
		'</div>'
	].join('')),

	// step container, all steps should be wrapped with this so it's easy to remove them when necessary
	step : $('<div class="filter-step" />'),

	// target select
	target : $([
		'<div class="filter-target">',
			'<h2>Choose Stream Source:</h2>',
			'<select name="target">',
				'<option disabled="true" selected="selected">Select Data Source...</option>',
			'</select>',
		'</div>'
	].join('')),

	// target select option
	targetOption : $('<option />'),

	// field select
	field : $([
		'<div class="filter-target-field">',
			'<select name="field[]">',
				'<option disabled="true" selected="selected">Select Field...</option>',
			'</select>',
		'</div>'
	].join('')),

	// field select option
	fieldOption : $('<option />'),

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