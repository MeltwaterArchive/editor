JCSDLTargets.Loader.addComponent(function($, undefined) {

	this.GUITemplates = {
		// container of the whole thing
		container : $('<div class="jcsdl-container" />'),

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

		targetInfo : $([
            '<div class="jcsdl-row jcsdl-filter-target-info">',
                '<h2 data-target-name />',
                '<h3 data-target><a href="#" data-docs-url target="_blank" /></h3>',
                '<div class="jcsdl-row">',
                    '<div class="jcsdl-column eight">',
                        '<h4>Description</h4>',
                        '<div class="jcsdl-target-description" data-description>',
                            '<div class="jcsdl-loading" />',
                        '</div>',
                        '<a href="#" data-docs-url target="_blank" class="jcsdl-big-link">More Information</a>',
                    '</div>',
                    '<div class="jcsdl-column four jcsdl-filter-operators">',
                        '<h4>Operators allowed</h4>',
                        '<div class="jcsdl-operators-list" data-operators />',
                    '</div>',
                '</div>',
            '</div>'
        ].join('')),

        targetInfo_operator : $([
            '<div class="jcsdl-row jcsdl-filter-target-operator-info">',
                '<div class="jcsdl-icon operator" />',
                '<div class="jcsdl-filter-target-operator-desc">',
                    '<span class="jcsdl-operator-label"><span data-operator /><span class="jcsdl-operator-default" data-operator-default> (default)</span></span>',
                    '<p data-operator-desc />',
                '</div>',
            '</div>'
        ].join(''))

	};

});