JCSDL.Loader.addComponent(function($, undefined) {

	this.GUITemplates = {
		// container of the whole thing
		container : $('<div class="jcsdl-container" />'),

		// editor
		editor : $([
			'<div class="jcsdl-mainview">',

				'<div class="jcsdl-header">',
					'<div class="jcsdl-row">',
						'<h3>Filters</h3>',
						'<div class="jcsdl-actions">',
                            '<a href="#" class="jcsdl-button jcsdl-elements-sprite jcsdl-editor-cancel">Cancel</a>',
							'<a href="#" class="jcsdl-button jcsdl-elements-sprite jcsdl-editor-save">Save and Preview</a>',
						'</div>',
					'</div>',

					'<div class="jcsdl-advanced-container jcsdl-bordered" style="display: none;">',
						'<div class="jcsdl-advanced-gui-container">',
							'<ul class="jcsdl-advanced-gui" />',
							'<a href="#" class="jcsdl-advanced-gui-arrow left off"><span class="jcsdl-elements-sprite" /></a>',
							'<a href="#" class="jcsdl-advanced-gui-arrow right off"><span class="jcsdl-elements-sprite" /></a>',
						'</div>',
						'<div class="jcsdl-advanced-manual" style="display: none;">',
							'<input type="text" name="advanced" placeholder="1&(2|3)..." />',
						'</div>',
					'</div>',

					'<div class="jcsdl-row">',
						'<div class="jcsdl-filters-logic">',
							'<a href="#" class="jcsdl-btn jcsdl-filters-logic-option jcsdl-and active disabled" data-logic="AND" data-text-long="ALL of the following" data-text-short="ALL">ALL of the following</a>',
							'<a href="#" class="jcsdl-btn jcsdl-filters-logic-option jcsdl-or disabled" data-logic="OR" data-text-long="ANY of the following" data-text-short="ANY">ANY of the following</a>',
							'<a href="#" class="jcsdl-btn jcsdl-filters-logic-option jcsdl-advanced disabled" data-logic="ADVANCED">',
								'ADVANCED',
								'<span class="jcsdl-logic-help" data-text-general="Use the advanced option to create logical expressions." data-text-gui="Drag and drop the tiles to create an advanced query." data-text-manual="Type a logical expression to create an advanced query.">?</span>',
							'</a>',

							'<a href="#" class="jcsdl-btn jcsdl-filters-logic-option jcsdl-advanced-option jcsdl-advanced-add-brackets">+ [ ]</a>',
                            '<a href="#" class="jcsdl-btn jcsdl-filters-logic-option jcsdl-advanced-option jcsdl-advanced-add-not">+ NOT</a>',
							'<a href="#" class="jcsdl-btn jcsdl-filters-logic-option jcsdl-advanced-option jcsdl-advanced-manual-edit" data-text-gui="Manual Edit" data-text-manual="Graphical Edit">Manual Edit</a>',
						'</div>',

						'<div class="jcsdl-mainview-actions">',
                            '<a href="#" class="jcsdl-btn jcsdl-mainview-action jcsdl-editor-preview">',
                                '<div class="jcsdl-picto jcsdl-elements-sprite"></div>',
                            '</a>',
							'<a href="#" class="jcsdl-btn jcsdl-mainview-action jcsdl-add-filter">',
								'<div class="jcsdl-picto jcsdl-elements-sprite"></div>',
								'Create New Filter',
							'</a>',
						'</div>',
						'<div class="jcsdl-mainview-mode">',
							'<div class="jcsdl-label">View as:</div>',
							'<div class="jcsdl-bordered jcsdl-mainview-mode-options">',
								'<a href="#" class="jcsdl-mainview-mode-option jcsdl-elements-sprite jcsdl-expanded active" data-mode="expanded"></a>',
								'<a href="#" class="jcsdl-mainview-mode-option jcsdl-elements-sprite jcsdl-collapsed" data-mode="collapsed"></a>',
							'</div>',
						'</div>',
					'</div>',
				'</div>',

				'<div class="jcsdl-filters-list expanded" />',

				'<div class="jcsdl-footer">',
					'<div class="jcsdl-actions">',
						'<a href="#" class="jcsdl-button jcsdl-elements-sprite jcsdl-editor-save">Save and Preview</a>',
						'<a href="#" class="jcsdl-button jcsdl-elements-sprite jcsdl-editor-cancel">Cancel</a>',
					'</div>',

					'<div class="jcsdl-mainview-actions">',
						'<a href="#" class="jcsdl-btn jcsdl-mainview-action jcsdl-add-filter">',
							'<div class="jcsdl-picto jcsdl-elements-sprite"></div>',
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
					'<div class="jcsdl-filter-info jcsdl-bordered id" />',
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
			'<div class="jcsdl-error jcsdl-elements-sprite">',
				'<strong>Error:</strong>',
				'<span />',
			'</div>'
		].join('')),

		/* ##########################
		 * LOGIC GUI EDITOR TOKENS
		 * ########################## */
		logicToken_operatorAnd : $('<div href="#" class="jcsdl-logic-token operator" data-token="&">AND</div>'),
		logicToken_operatorOr : $('<div href="#" class="jcsdl-logic-token operator" data-token="|">OR</div>'),
        logicToken_operatorNot : $('<div href="#" class="jcsdl-logic-token operator" data-token="!">NOT<a href="#" class="jcsdl-delete-token"><span class="jcsdl-elements-sprite" /></a></div>'),
		logicToken_bracketOpen : $('<div href="#" class="jcsdl-logic-token bracket" data-token="(">[<a href="#" class="jcsdl-delete-token"><span class="jcsdl-elements-sprite" /></a></div>'),
		logicToken_bracketClose : $('<div href="#" class="jcsdl-logic-token bracket" data-token=")">]<a href="#" class="jcsdl-delete-token"><span class="jcsdl-elements-sprite" /></a></div>'),
		logicToken_filter : $('<div href="#" class="jcsdl-logic-token filter" data-token="#">#</div>'),

		/* ##########################
		 * SINGLE FILTER EDITOR
		 * ########################## */
		// filter editor container
		filterEditor : $([
			'<div class="jcsdl-filter-editor">',
                '<div class="jcsdl-search">',
                    '<input type="text" placeholder="Search for a target...">',
                    '<a href="#" class="jcsdl-search-arrow jcsdl-elements-sprite"></a>',
                    '<ul class="jcsdl-search-results" />',
                '</div>',
				'<div class="jcsdl-steps">',
				'</div>',
				'<div class="jcsdl-footer">',
					'<a href="#" class="jcsdl-button jcsdl-elements-sprite jcsdl-filter-save">Save and Preview</a>',
					'<span style="display: none;">or</span> <a href="#" class="jcsdl-filter-cancel">cancel</a>',
				'</div>',
			'</div>'
		].join('')),

        filterEditor_searchItem : $([
            '<li>',
                '<div class="jcsdl-icon target" />',
                '<span class="jcsdl-search-item-name" />',
            '</li>'
        ].join('')),

		// step container, all steps should be wrapped with this so it's easy to remove them when necessary
		step : $('<div class="jcsdl-step" />'),

		// target select
		target : $([
			'<div class="jcsdl-filter-target-wrap">',
				'<a href="#" class="jcsdl-carousel-scroll jcsdl-elements-sprite left"></a>',
				'<a href="#" class="jcsdl-carousel-scroll jcsdl-elements-sprite right"></a>',
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
				'<a href="#" class="jcsdl-carousel-scroll jcsdl-elements-sprite left"></a>',
				'<a href="#" class="jcsdl-carousel-scroll jcsdl-elements-sprite right"></a>',
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
				'<a href="#" class="jcsdl-carousel-scroll jcsdl-elements-sprite left"></a>',
				'<a href="#" class="jcsdl-carousel-scroll jcsdl-elements-sprite right"></a>',
				'<div class="jcsdl-carousel-wrap">',
					'<div class="jcsdl-filter-target-field-input jcsdl-carousel" />',
				'</div>',
			'</div>'
		].join('')),

		// field select option
		inputSelectOption : $('<a href="#" class="jcsdl-icon input jcsdl-carousel-item" />'),

		// target help trigger
		targetHelp : $('<a href="#" class="jcsdl-target-help">Learn More</a>'),

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
				'<div class="jcsdl-dropdown-icon jcsdl-elements-sprite" />',
			'</div>'
		].join('')),

		textOperatorsDropdown : $('<div class="jcsdl-dropdown jcsdl-operators-dropdown" />'),

		textOperatorOption : $([
			'<div class="jcsdl-dropdown-option">',
				'<div class="jcsdl-icon operator" />',
				'<a href="#" class="jcsdl-dropdown-details-trigger jcsdl-elements-sprite">?</a>',
				'<div class="jcsdl-dropdown-option-desc">',
					'<div class="jcsdl-operator-label">',
						'<span /> ',
						'<a href="#" class="jcsdl-operator-help">(?)</a>',
					'</div>',
					'<div class="jcsdl-operator-desc" />',
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
			'<a href="#" class="jcsdl-btn jcsdl-input-select-option">',
				'<span />',
			'</a>'
		].join('')),

		// select input more indicator
		valueInput_select_more : $('<span class="jcsdl-input-select-more">and <span class="count"></span> more...</span>'),

		// slider
		valueInput_slider : $([
			'<div class="jcsdl-input-slider">',
				'<div class="jcsdl-slider-controls">',
					'<a href="#" class="jcsdl-slider-minus jcsdl-elements-sprite" />',
					'<a href="#" class="jcsdl-slider-plus jcsdl-elements-sprite" />',
					'<input type="text" name="value" class="jcsdl-slider-input" placeholder="0" />',
				'</div>',
				'<div class="jcsdl-slider-wrap">',
					'<div class="jcsdl-slider-icon min" />',
					'<div class="jcsdl-slider-icon max" />',
					'<div class="jcsdl-slider-container">',
						'<div class="jcsdl-slider-label min" />',
						'<div class="jcsdl-slider-label max" />',
						'<div class="jcsdl-slider jcsdl-elements-sprite" />',
						'<div class="jcsdl-slider-bottom">',
							'<div class="jcsdl-slider-bottom-left jcsdl-elements-sprite" />',
							'<div class="jcsdl-slider-bottom-right jcsdl-elements-sprite" />',
							'<div class="jcsdl-slider-bottom-line jcsdl-elements-sprite" />',
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
		].join('')),

        /* ##########################
         * LIST EDITOR
         * ########################## */
        listEditor : [
            '<div class="jcsdl-list jcsdl-row">',
                '<div class="jcsdl-list-bar jcsdl-row">',
                    '<a href="#" class="jcsdl-btn jcsdl-edit jcsdl-active" data-list-mode="edit"><i class="jcsdl-picto" /></a>',
                    '<a href="#" class="jcsdl-btn jcsdl-move" data-list-mode="move"><i class="jcsdl-picto" /></a>',
                    '<a href="#" class="jcsdl-btn jcsdl-delete" data-list-mode="delete"><i class="jcsdl-picto" /></a>',
                    '<a href="#" class="jcsdl-btn jcsdl-import" data-import><i class="jcsdl-picto" />Import</a>',
                    '<a href="#" class="jcsdl-btn jcsdl-sort-az" data-sort><i class="jcsdl-picto" />Sort A-Z</a>',
                    '<a href="#" class="jcsdl-btn jcsdl-copy" data-copy><i class="jcsdl-picto" /><span>Copy to Clipboard</span></a>',
                    '<input type="text" name="search" placeholder="Search..." class="jcsdl-list-search">',
                '</div>',
                '<div class="jcsdl-list-container jcsdl-row">',
                    '<div class="jcsdl-list-cta jcsdl-row" data-list-cta>',
                        'The first step in creating a list is to add or import data. To get going, look for the <strong>Import</strong> button above this message.',
                    '</div>',
                    '<div class="jcsdl-list-info" data-list-info style="display: none;">',
                        '<strong>Current List (<span data-counter>0</span> elements)</strong><br />',
                        '<span data-mode-info="move" style="display: none;"><strong>Did you know</strong> you can re-order items in this list simply by dragging them into new position?</span>',
                        '<span data-mode-info="delete" style="display: none;"><strong>Did you know</strong> you can click on an item to remove it from the list?</span>',
                        '<span data-mode-info="edit"><strong>Did you know</strong> you can click on an item to edit it?</span>',
                    '</div>',
                    '<ol class="jcsdl-list-elements clearfix">',
                        '<li class="jcsdl-list-add" data-add-item>',
                            '<input type="text" name="item" class="jcsdl-list-add-input" placeholder="Add to list..." />',
                        '</li>',
                    '</ol>',
                '</div>',
            '</div>'
        ].join(''),

        listElement : [
            '<li class="jcsdl-list-item" data-handle data-item data-value="{value}">',
                '<div class="jcsdl-list-item-mode-bar" />',
                '<span class="jcsdl-list-item-label">{value}</span>',
                '<input class="jcsdl-list-item-input" type="text" placeholder="Enter a value..." value="{value}">',
            '</li>'
        ].join(''),

        listEditor_import : [
            '<div class="jcsdl-import-view jcsdl-row">',
                '<div class="jcsdl-row" data-step-one>',
                    '<h4>Paste the contents of your CSV below:</h4>',
                    '<textarea name="import" class="jcsdl-import-input" placeholder="Paste your data here..."></textarea>',
                '</div>',
                '<div class="jcsdl-row">',
                    '<label><input type="checkbox" name="replace" value="1"> Replace the current list?</label>',
                '</div>',
                '<div class="jcsdl-row jcsdl-import-buttons">',
                    '<a href="#" class="jcsdl-btn" data-import-csv>Import</a>',
                    '<a href="#" class="jcsdl-btn" data-import-cancel>Cancel</a>',
                '</div>',
            '</div>'
        ].join(''),

        listEditor_import_error : '<div class="jcsdl-import-error" data-csv-error>{error}</div>',

        listEditor_import_file : [
            '<div class="jcsdl-draganddrop" data-import-file>',
                '<input type="file" name="csvfile" style="display: none;">',
                '<p>Drag and drop a CSV file here</p>',
                '<a href="#" class="jcsdl-btn" data-select-file>Select File</a>',
            '</div>'
        ].join(''),

        listEditor_import_table : [
            '<div class="jcsdl-row" data-step-two>',
                '<h4>Select column(s) to add</h4>',
                '<p data-info>The values in the columns you select will be inserted into a list according to their order. If you\'d like to re-order these items in the next step you can.</p>',
                '<div class="jcsdl-table-container">',
                    '<table>',
                        '<thead>',
                            '<tr />',
                        '</thead>',
                        '<tbody />',
                        '<tfoot />',
                    '</table>',
                '</div>',
                '<div class="jcsdl-row">',
                    '<label><input type="checkbox" name="ignoreheaders" value="1" checked="checked"> First row is table header</label>',
                '</div>',
            '</div>'
        ].join(''),

        listEditor_import_tableHeader : '<th><input type="checkbox" name="column" value="{i}"></th>',

        listEditor_import_tableFooter : '<tr><td colspan="{width}">{more} more rows found</td></tr>'

	};

});