var JCSDLGuiTemplates = {
	// editor container
	filter : $([
		'<div id="filter">',
		'</div>'
	].join('')),

	// step container, all steps should be wrapped with this so it's easy to remove them when necessary
	step : $('<div class="filter-step" />'),

	// target select
	target : $([
		'<div id="filter-target">',
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
		'<div id="filter-value-input">',
			'<div id="filter-value-input-operators"></div>',
			'<div id="filter-value-input-field"></div>',
		'</div>'
	].join('')),

	// text input
	valueInput_text : $([
		'<div class="input-text">',
			'<input type="text" placeholder="Type your desired value" />',
		'</div>'
	].join('')),

	// operator select
	operatorSelect : $([
		'<div class="operator-select">',
			'<input type="radio" name="operator" />',
			'<label />',
		'</div>'
	].join('')),

	// submit button
	submit : $('<input type="button" value="Convert to CSDL" />')
};