JCSDLTargets.Loader.addComponent(function($, undefined) {

	/**
	 * DataSift Query Editor (JCSDL).
	 * This is the main class of JCSDL/Query Editor. It bootstraps everything together.
	 *
	 * @param {mixed} el Element on which the query editor should be initialized. Can be a jQuery selector, jQuery object or a DOM object.
	 * @param {Object} cfg[optional] Custom configuration of the editor.
	 */
	this.GUI = function(el, cfg) {
		var $el = $(el); // ensure that the container element is a jQuery object
		if ($el.length == 0) return false; // break if no such element in DOM
		this.$el = $el.eq(0); // use only on the first matched element

		var self = this;

		/** @var {jQuery} jQuery object that holds the whole editor. */
		this.$container = null;

		/** @var {Object} GUI config object. */
		this.config = $.extend(true, {
			animate : 200,
			hideTargets : [],
            showTargets : [],
			definition : {},

			targetSelect : function(target) {},

			// grabbing target help url
			targetHelpUrl : function(target, fieldInfo) {
				if (fieldInfo.helpUrl) {
					return fieldInfo.helpUrl;
				}

				target = target.replace(/\./g, '-');
				return this.definition.targetHelpJsonpSource.replace(/\{target\}/g, target);
			}
		}, cfg);

		/** @var {Object} Definition of JCSDL, that can be altered via config. */
		this.definition = $.extend(true, JCSDLTargetsDefinition, this.config.definition);

		/** @var {JCSDLTargets.Parser} The actual JCSDL "parser". */
		this.parser = new JCSDLTargets.Parser(this);

		// data
		this.filters = [];

		// current choice data
		this.currentFilterIndex = null;

		// DOM elements
		this.$mainView = null;

		this.init();
	};

	this.GUI.prototype = {
		/*
		 * INITIALIZE THE EDITOR
		 */
		/**
		 * Initializes (or reinitializes) the JCSDL GUI Editor.
		 */
		init : function() {
			var self = this;

			// reset everything in case this is a reinitialization
			this.filters = [];

			this.currentFilterIndex = null;

			// and insert the editor into the container
			this.$mainView = $('<div />');

			this.$container = this.getTemplate('container');
			this.$container.html(this.$mainView);
			this.$el.html(this.$container);

			// add class for IE
            var match = /(msie) ([\w.]+)/.exec(navigator.userAgent.toLowerCase()) || [];
            if (match[1] !== undefined && match[1] === 'msie') {
                this.$container.addClass('msie');
                $('html').addClass('msie');
            }

            // already show filter editor
			self.showFilterEditor();
		},

		/**
		 * Resets the editor to clear state.
		 */
		reset : function() {
			this.init();
		},

		/**
		 * Adjusts the editor size to the container (in case it's size has changed).
		 */
		adjust : function() {
			if (this.editor) {
				this.editor.adjust();
			}
		},

		/**
		 * Hides the editor.
		 */
		hide : function() {
			this.$container.hide();
		},

		/**
		 * Shows the editor.
		 */
		show : function() {
			this.$container.show();
		},

		/**
		 * Trigger an event handler defined in the config.
		 *
		 * @param  {String} name Name of the event handler.
		 * @param  {Array} data[optional] Arguments to pass to the handler.
		 * @return {mixed} Whatever the handler returns.
		 */
		trigger : function(name, data) {
			data = data || [];

			this.$el.trigger(name.toLowerCase(), data);

			if (typeof(this.config[name]) == 'function') {
				return this.config[name].apply(this, data);
			}

			if ($.inArray(name, this.changeEvents) > -1) {
				this.trigger('change');
			}

			return null;
		},

		/* ##########################
		 * FILTER MANAGEMENT
		 * ########################## */
		/**
		 * Shows the filter editor.
		 */
		showFilterEditor : function(filter, filterIndex) {
			this.$mainView.hide();
			this.editor = new JCSDLTargets.GUIFilterEditor(this, this.$container, filter);
			this.trigger('filterNew');
		},

		/* ##########################
		 * SETTERS AND GETTERS
		 * ########################## */
		/**
		 * Returns a template (jQuery object) of the given name.
		 *
		 * @param  {String} name Name of the template to fetch.
		 * @return {jQuery}
		 */
		getTemplate : function(name) {
			if (JCSDLTargets.GUITemplates[name] !== undefined) {
				return JCSDLTargets.GUITemplates[name].clone();
			}

			return $();
		},

		/**
		 * Given the field name and it's definition decide what the icon for this field is.
		 *
		 * @param  {String} field     Name of the string.
		 * @param  {Object} fieldInfo Field definition.
		 * @return {String}
		 */
		getIconForField : function(field, fieldInfo) {
			return (fieldInfo.icon !== undefined) ? fieldInfo.icon : field;
		}

	};

	// register JCSDLTargets GUI as a jQuery plugin as well
	// the difference to using new JCSDLTargets.GUI() is that it will return {jQuery} instead of the editor
	$.fn.jcsdlTargetsGui = function(options) {
		function get($el) {
			var gui = $el.data('jcsdlTargetsGui');
			if (!gui) {
				gui = new JCSDLTargets.GUI($el, options);
				$el.data('jcsdlTargetsGui', gui);
			}
			return gui;
		}

		if (typeof(options) == 'string') {
			// call a public method
			if ($.inArray(options, ['adjust']) >= 0) {
				var argmns = [];
				$.each(arguments, function(i, arg) {
					if (i == 0) return true;
					argmns.push(arg);
				});

				this.each(function() {
					var gui = get($(this));
					gui[options].apply(gui, argmns);
				});
			}
			return this;
		}

		this.each(function() {get($(this));});
		return this;
	};

	// backward compatibility
	JCSDLTargetsGui = function($el, o) {
		return new JCSDLTargets.GUI($el, o);
	};

});
