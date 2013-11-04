JCSDLTargets.Loader.addComponent(function($, undefined) {

	/**
	 * JCSDL Parser to be used with DataSift's Query Editor.
	 * 
	 * @param {JCSDLTargets.GUI} gui GUI instance to which this filter editor belongs.
	 */
	this.Parser = function(gui) {
		this.gui = gui;
	};

	this.Parser.prototype = {
		v : '2.1',

		/**
		 * Returns definition of the specific given target or (bool) false it it doesn't exist.
		 * 
		 * @param  {String} target CSDL target.
		 * @return {Object}
		 */
		getTargetInfo : function(target) {
			if (this.gui.definition.targets[target] !== undefined) {
				return this.gui.definition.targets[target];
			}
			this.error('Such target does not exist!', target);
			return false;
		},

		/**
		 * Returns definition of the specific given field or (bool) false if it doesn't exist.
		 * 
		 * @param  {String} target    CSDL target.
		 * @param  {Array} fieldPath  Array of field names, path to the specific field.
		 * @return {Object}
		 */
		getFieldInfo : function(target, fieldPath) {
			var self = this;

			// starting field is naturally the current target
			var field = this.gui.definition.targets[target];
			if (field === undefined) {
				this.error('Such target does not exist!', target);
				return false;
			}

			// get to the end of the path
			$.each(fieldPath, function(i, fieldName) {
				if (field.fields !== undefined) {
					// get the next field definition in line
					if (field.fields[fieldName] !== undefined) {
						field = field.fields[fieldName];
					} else {
						self.error('Invalid path to a field (#1)!', target, fieldPath, field);
						field = false;
						return false; // break the $.each
					}

				} else {
					self.error('Invalid path to a field (#2)!', target, fieldPath, field);
					field = false;
					return false; // break the $.each
				}
			});

			return field;
		}
	};

});
