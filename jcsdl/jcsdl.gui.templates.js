var JCSDLGuiTemplates = {
	// container of the whole thing
	container : $('<div class="jcsdl-container" />'),

	// editor
	editor : $([
		'<div class="jcsdl-mainview">',

			'<div class="jcsdl-header">',
				'<h3>Filters</h3>',
				'<div class="jcsdl-mainview-mode">',
					'<div class="jcsdl-label">View as:</div>',
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
				'<div class="jcsdl-filter-info target" />',
				'<div class="jcsdl-filter-info field" />',
				'<div class="jcsdl-filter-info operator" />',
				'<div class="jcsdl-filter-info jcsdl-bordered value" />',
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
	filterFieldInput : $([
		'<div class="jcsdl-filter-info input">',
			'<div class="jcsdl-filter-field-input jcsdl-icon input" />',
		'</div>'
	].join('')),
	filterOperator : $('<div class="jcsdl-filter-operator jcsdl-icon operator" />'),
	filterValue : $('<div class="jcsdl-filter-value" />'),

	error : $([
		'<div class="jcsdl-error">',
			'<strong>Error:</strong>',
			'<span />',
		'</div>'
	].join('')),

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
	fieldOption : $('<a href="#" class="jcsdl-icon field jcsdl-carousel-item" />'),

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
	inputSelectOption : $('<a href="#" class="jcsdl-icon input jcsdl-carousel-item" />'),

	// value input container
	valueInput : $([
		'<div class="jcsdl-filter-value-input">',
			'<div class="jcsdl-filter-value-input-operators" />',
			'<div class="jcsdl-filter-value-input-field" />',
		'</div>'
	].join('')),

	// operator select
	operatorOption : $('<a href="#" class="jcsdl-icon operator" />'),

	// operator selection for text inputs is done via dropdown
	textOperatorsSelect : $([
		'<div class="jcsdl-operators-select">',
			'<div class="jcsdl-operator-label" />',
			'<div class="jcsdl-dropdown-icon" />',
		'</div>'
	].join('')),

	textOperatorsDropdown : $('<div class="jcsdl-dropdown jcsdl-operators-dropdown" />'),

	textOperatorOption : $([
		'<div class="jcsdl-dropdown-option">',
			'<div class="jcsdl-dropdown-option-main">',
				'<div class="jcsdl-icon operator" />',
				'<a href="#" class="jcsdl-dropdown-details-trigger"><span /></a>',
				'<div class="jcsdl-dropdown-option-desc">',
					'<div class="jcsdl-operator-label">',
						'<span /> ',
						'<a href="#" class="jcsdl-operator-help">(?)</a>',
					'</div>',
					'<div class="jcsdl-operator-desc" />',
				'</div>',
			'</div>',
			'<div class="jcsdl-dropdown-option-details">',
				'<p />',
				'<a href="#" class="jcsdl-doc-url">Learn more</a>',
			'</div>',
		'</div>'
	].join('')),

	// case sensitivity toggle
	caseSensitivity : $('<a class="jcsdl-operator-cs jcsdl-icon icon-cs operator" title="Case Sensitive" />'),

	/* ##########################
	 * VALUE INPUT FIELDS
	 * ########################## */
	// text input
	valueInput_text : $([
		'<div class="jcsdl-input-text">',
			'<input type="text" placeholder="Type your desired value..." class="orig" />',
			'<div class="jcsdl-containsnear-distance">',
				'<span>Distance:</span>',
				'<input type="text" placeholder="e.g. 0" value="2" class="dist" />',
			'</div>',
		'</div>'
	].join('')),

	// number input
	valueInput_number : $([
		'<div class="jcsdl-input-number">',
			'<input type="text" placeholder="e.g. 3.14" />',
		'</div>'
	].join('')),

	// select input
	valueInput_select : $('<div class="jcsdl-input-select" />'),

	// select input option
	valueInput_select_option : $([
		'<a href="#" class="jcsdl-input-select-option">',
			'<span />',
		'</a>'
	].join('')),

	// select input more indicator
	valueInput_select_more : $('<span class="jcsdl-input-select-more">and <span class="count"></span> more...</span>'),

	// slider
	valueInput_slider : $([
		'<div class="jcsdl-input-slider">',
			'<div class="jcsdl-slider-controls">',
				'<a href="#" class="jcsdl-slider-minus" />',
				'<a href="#" class="jcsdl-slider-plus" />',
				'<input type="text" name="value" class="jcsdl-slider-input" placeholder="0" />',
			'</div>',
			'<div class="jcsdl-slider-wrap">',
				'<div class="jcsdl-slider-icon min" />',
				'<div class="jcsdl-slider-icon max" />',
				'<div class="jcsdl-slider-container">',
					'<div class="jcsdl-slider-label min" />',
					'<div class="jcsdl-slider-label max" />',
					'<div class="jcsdl-slider" />',
					'<div class="jcsdl-slider-bottom">',
						'<div class="jcsdl-slider-bottom-left" />',
						'<div class="jcsdl-slider-bottom-right" />',
						'<div class="jcsdl-slider-bottom-line" />',
					'</div>',
				'</div>',
			'</div>',
		'</div>'
	].join('')),

	// map for geo
	valueInput_geo_map : $([
		'<div class="jcsdl-map">',
			'<input type="text" name="location" class="jcsdl-map-search" placeholder="Search for location..." />',
			'<div class="jcsdl-map-canvas" />',
			'<a href="#" class="jcsdl-clear-map">clear coordinates</a>',
			'<p class="jcsdl-map-instructions" />',
			'<div class="jcsdl-map-coordinates" />',
			'<div class="jcsdl-map-area">',
				'<label>Area:</label>',
				'<span>0 km<sup>2</sup></span>',
			'</div>',
		'</div>'
	].join('')),

	// geo box
	valueInput_geobox : $([
		'<div class="jcsdl-input-geo jcsdl-geo-box" />'
	].join('')),

	valueInput_geobox_coordinates : $([
		'<ul>',
			'<li class="nw"><label>NW:</label><span /></li>',
			'<li class="ne"><label>NE:</label><span /></li>',
			'<li class="se"><label>SE:</label><span /></li>',
			'<li class="sw"><label>SW:</label><span /></li>',
		'</ul>'
	].join('')),

	// geo box
	valueInput_georadius : $([
		'<div class="jcsdl-input-geo jcsdl-geo-radius" />'
	].join('')),

	valueInput_georadius_coordinates : $([
		'<ul>',
			'<li class="center"><label>Center:</label><span /></li>',
			'<li class="radius"><label>Radius:</label><span /></li>',
		'</ul>'
	].join('')),

	// geo box
	valueInput_geopolygon : $([
		'<div class="jcsdl-input-geo jcsdl-geo-polygon" />'
	].join('')),

	valueInput_geopolygon_coordinates : $([
		'<ul />'
	].join(''))

};