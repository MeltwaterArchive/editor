;JCSDL.Loader.addComponent(function($, undefined) {

	/**
	 * JCSDL Parser to be used with DataSift's Query Editor.
	 * 
	 * @param {JCSDL.GUI} gui GUI instance to which this filter editor belongs.
	 */
	this.Parser = function(gui) {
		this.gui = gui;
	};

	this.Parser.prototype = {
		v : '2.0',

		/* ##########################
		 * Loading JCSDL
		 * ########################## */
		/**
		 * Parses the given JCSDL code into and returns an object with the parsed filters and their logic.
		 * 
		 * @param  {String} code Full JCSDL code (with master lines and logic)
		 * @return {Object} Object that contains 'filters' Array and 'logic' String.
		 */
		parseJCSDL : function(code) {
			var lines = code.split("\n"),
				masterLine = lines.shift(),
				endLine = lines.pop();

			// verify the inputed JCSDL
			if (!this.verifyJCSDL(masterLine, lines)) {
				throw new JCSDL.ValidationException("The given JCSDL did not verify!", code);
			}

			// remove the version line
			var versionLine = lines.shift(),
				// get the logic
				logic = masterLine.split(' ')[3],
				// get the filters from the code
				filters = [];

			// potentially the 1st line now is also a logic line (if CSDL starts with parenthesis), so ignore it if so
			// (filter line always starts with //, otherwise it's a logic line)
			if (lines[0].substr(0, 2) !== '//') {
				lines.shift();
			}

			// go over all the lines in iterations of 3 in order to read all the filters (one filter takes 3 lines)
			while(lines.length > 1) {
				var jcsdlDescription = lines.shift(),
					csdl = lines.shift(),
					jcsdlEnd = lines.shift();

				// also, after the filter there might also be a logic line (or nothing if it's the last one)
				lines.shift(); // not doing anything with it here

				jcsdlDescription = jcsdlDescription.split(' ');
				var jcsdlHash = jcsdlDescription[2],
					jcsdlCode = jcsdlDescription[3],
					filterId = jcsdlDescription[4] || filters.length + 1;

				if (!this.verifyJCSDLFilter(jcsdlHash, csdl)) {
					throw new JCSDL.ValidationException("The given JCSDL Filter code did not verify!", csdl);
				}

				// parse the JCSDL filter code to a filter object
				var filter = this.filterFromJCSDL(jcsdlCode, csdl, filterId);

				// add the filter object to the list of filters
				filters.push(filter);
			}

			return {
				filters : filters,
				logic : logic
			};
		},

		/**
		 * Creates a filter object from the given JCSDL code and based on CSDL code.
		 * 
		 * @param  {String} jcsdlCode JCSDL Code / part of the JCSDL comment.
		 * @param  {String} csdl      The CSDL code related to this filter.
		 * @param  {Number} filterId  ID of the filter (for reference in advanced logic builder).
		 * @return {Object}
		 */
		filterFromJCSDL : function(jcsdlCode, csdl, filterId) {
			jcsdlCode = jcsdlCode.split(',');

			var fieldPath = jcsdlCode.shift().split('.'),
				target = fieldPath.shift(),
				fieldInfo = this.getFieldInfo(target, fieldPath);

			if (fieldInfo === false) return false;

			var operator = jcsdlCode.shift(),
				// prepare variables
				value = '',
				additional = {
					cs : false
				};

			if (operator !== 'exists') {
				var range = jcsdlCode.shift().split('-');
				value = this.valueFromCSDL(fieldInfo, csdl.substr(range[0], range[1]), operator);

				// also parse additional data
				$.each(jcsdlCode, function(i, code) {
					switch(code) {
						case 'cs':
							additional.cs = true;
						break;
					}
				});
			}

			return this.createFilter(target, fieldPath, operator, value, additional, filterId);
		},

		/* ##########################
		 * OUTPUTTING CSDL
		 * ########################## */
		/**
		 * Returns CSDL ready code from the previously added filters from the GUI.
		 * 
		 * @param  {Array}  filters Array of filters to be parsed.
		 * @param  {String} logic   Logic string that joins the filters together.
		 * @return {String}
		 */
		getJCSDLForFilters : function(filters, logic) {
			var self = this,
				filterCodes = {},
				filterLines = [],
				filtersCsdl = '';

			// go over each filter and parse it
			$.each(filters, function(i, filter) {
				var parsedFilter = self.filterToCSDL(filter);
				if (!parsedFilter) return true; // continue

				// ensure string for the key
				filterCodes[filter.id + ''] = parsedFilter;
			});

			// parse advanced logic
			if (logic != 'AND' && logic != 'OR') {
				var tokens = this.tokenizeLogicString(logic),
					logicLine = '';
				this.validateLogic(tokens, filters);

				$.each(tokens, function(i, token) {
					// parse based on what kind of token it is
					if (typeof token === 'number') {
						// if token is a number then it means it's a filter ID
						
						// push the logic line to the filter lines and reset it
						if (logicLine.length) {
							filterLines.push($.trim(logicLine));
						}
						logicLine = '';

						// now also push the related filter to the logic line
						if (filterCodes[token + ''] !== undefined) {
							filterLines.push(filterCodes[token + '']);
						} else {
							throw new JCSDL.LogicValidationException("A filter with ID '" + token + "' doesn't exist! You cannot use it in a logical expression", i);
						}

					} else if (token == '&' || token == '|') {
						// if token is a logical operator then push it to the logic line
						logicLine += (token == '|') ? ' OR ' : ' AND ';

					} else {
						// if anything else (only parenthesis left) then just add it to the logic line as well
						logicLine += token;
					}
				});

				// just in case remaining logic line is not empty, push it
				if (logicLine.length) {
					filterLines.push($.trim(logicLine));
				}

				filtersCsdl = filterLines.join("\n");

			} else {
				// "normal" logic, ie. not advanced, just join together the filter codes
				$.each(filterCodes, function(i, csdl) {
					filterLines.push(csdl);
				});
				filtersCsdl = filterLines.join("\n" + logic + "\n");
			}

			// create the final output of the JCSDL filters
			var output = '// JCSDL_VERSION ' + this.v + "\n" + filtersCsdl,
				// calculate the hash for security
				hash = this.encodeJCSDL(output, logic);

			// add master comments to the final output
			output = '// JCSDL_MASTER ' + hash + ' ' + logic + "\n" + output + "\n// JCSDL_MASTER_END";

			return output;
		},

		/**
		 * Parses a single filter from the filter object to a JCSDL output.
		 * 
		 * @param  {Object} filter Information about the filter.
		 * @return {String}
		 */
		filterToCSDL : function(filter) {
			var fieldInfo = this.getFieldInfo(filter.target, filter.fieldPath);
			if (fieldInfo === false) return false;

			var value = this.valueToCSDL(filter.value, fieldInfo, filter.operator);
			if (value === false) return false;

			var field = this.fieldToCSDL(filter.fieldPath);
			if (field === false) return false;

			var operatorCode = this.getOperatorCode(filter.operator);
			if (operatorCode === false) return false;

			var cs = (filter.cs) ? ' cs' : '';

			// create CSDL and JCSDL syntaxes
			var csdl = ((filter.target == 'augmentation') ? '' : filter.target + '.') + field.replace('-', '.') + cs + ' ' + operatorCode + ' ',
				jcsdlSyntax = filter.target + '.' + field + ',' + filter.operator;

			// for 'exists' operator the value and its range aren't included
			if (filter.operator !== 'exists') {
				var valueStart = (fieldInfo.type == 'string' || fieldInfo.type == 'geo') ? csdl.length + 1 : csdl.length,
					valueLength = (fieldInfo.type == 'string' || fieldInfo.type == 'geo') ? value.length - 2 : value.length;

				// add the value to CSDL and it's range to JCSDL
				csdl = csdl + value;
				jcsdlSyntax += ',' + valueStart + '-' + valueLength;

				// if case sensitivity on, then include it as well
				if (filter.cs) {
					jcsdlSyntax += ',cs';
				}
			}

			var hash = this.encodeJCSDLFilter(csdl),
				// JCSDL wrappers
				jcsdl_start = ['// JCSDL_START', hash, jcsdlSyntax, filter.id].join(' '),
				jcsdl_end = '// JCSDL_END';

			// return the final filter output
			return [jcsdl_start, csdl, jcsdl_end].join("\n");
		},

		/* ##########################
		 * HELPERS
		 * ########################## */
		/**
		 * Encodes the given JCSDL output and its logic to a hash that can later
		 * be used to verify if the JCSDL wasn't tampered with.
		 * 
		 * @param  {String} output JCSDL for all the filters.
		 * @param  {String} logic  Logic of the JCSDL.
		 * @return {String}
		 */
		encodeJCSDL : function(output, logic) {
			return Crypto.MD5(logic + "\n" + output);
		},

		/**
		 * Verifies that the whole JCSDL code wasn't altered in any way, based on hash in the master line.
		 * 
		 * @param  {String} masterLine The first line of the JCSDL code.
		 * @param  {Array}  lines      Array of all the remaining lines.
		 * @return {Boolean}
		 */
		verifyJCSDL : function(masterLine, lines) {
			// join all the lines to create a string
			var input = lines.join("\n"),

				// get logic and hash from the master line
				masterInfo = masterLine.split(' '),
				logic = masterInfo[3],
				hash = masterInfo[2],

				// recalculate the original hash and see if it matches
				jcsdlHash = this.encodeJCSDL(input, logic);

			return (hash == jcsdlHash);
		},

		/**
		 * Encodes the given CSDL filter to a hash that can later be used to verify
		 * if the CSDL wasn't tampered with.
		 * 
		 * @param  {String} csdl CSDL filter.
		 * @return {String}
		 */
		encodeJCSDLFilter : function(csdl) {
			return Crypto.MD5(csdl);
		},

		/**
		 * Verifies that a single JCSDL filter code wasn't altered in any way, based on hash in the filter's jcsdl line.
		 * 
		 * @param  {String} hash Hash from the first line of the JCSDL filter code.
		 * @param  {String} csdl Actual CSDL code for this filter.
		 * @return {Boolean}
		 */
		verifyJCSDLFilter : function(hash, csdl) {
			return (hash == this.encodeJCSDLFilter(csdl));
		},

		/**
		 * Changes the given field path to JCSDL output.
		 * 
		 * @param  {Array} fieldPath Array of field names, path to specific field.
		 * @return {String}
		 */
		fieldToCSDL : function(fieldPath) {
			return fieldPath.join('.');
		},

		/**
		 * Changes the given value into CSDL output based on the definition of its field.
		 * 
		 * @param  {String} value     
		 * @param  {Object} fieldInfo Field definition from JCSDL definition.
		 * @param  {String} operator  Operator used on this object.
		 * @return {String}
		 */
		valueToCSDL : function(value, fieldInfo, operator) {
			var parsedValue = '';
			
			if (fieldInfo.type == 'int' || fieldInfo.type == 'float') {
				if (operator !== 'in' && isNaN(value)) {
					this.error('This field value is suppose to be a Number, String given.', value, fieldInfo);
					return false;

				} else if (operator == 'in') {
					value = value.split(',');
					$.each(value, function(i, val) {
						value[i] == parseInt(val);
					});
					parsedValue = '[' + value.join(',') + ']';

				} else {
					parsedValue = value;
				}

			} else {
				var escapeRegEx = ($.inArray(operator, ['regex_partial', 'regex_exact']) >= 0) ? true : false;
				parsedValue = '"' + value.escapeCsdl(escapeRegEx) + '"';
			}

			return parsedValue;
		},

		/**
		 * Properly parses the value of the given field into something usable by the GUI.
		 * 
		 * @param  {Object} fieldInfo Field definition for the given value, taken from JCSDL definition.
		 * @param  {String} value     The value.
		 * @param  {String} operator  Operator used on this value.
		 * @return {mixed}
		 */
		valueFromCSDL : function(fieldInfo, value, operator) {
			if (fieldInfo.type == 'int') {
				if (operator == 'in') {
					value = value.substr(1, value.length - 2);
				}
				return value;

			} else {
				var escapeRegEx = ($.inArray(operator, ['regex_partial', 'regex_exact']) >= 0) ? true : false;
				return value.unescapeCsdl(escapeRegEx);
			}
		},

		/**
		 * Parses a logical string into an array of tokens.
		 * 
		 * @param  {String} logicString Logical string.
		 * @return {Array}
		 */
		tokenizeLogicString : function(logicString) {
			// ensure string (could be a single number as well)
			logicString = '' + logicString;

			// remove all spaces
			logicString = logicString.replace(/\s+/g, '');

			var tokens = [],
				wasNumber = false;

			for (var i = 0; i < logicString.length; i++) {
				var ch = logicString.charAt(i);

				// the character is a number
				if (ch.isNumeric()) {
					// if the previous character was also a number, then append it to the last item
					if (wasNumber) {
						tokens[tokens.length - 1] += '' + ch; // ensure string
						tokens[tokens.length - 1] = parseInt(tokens[tokens.length - 1]); // but after it's concatanated ensure int
					} else {
						tokens.push(parseInt(ch));
					}

					wasNumber = true;
				} else {
					// the character is not a number so just append it
					tokens.push(ch);
					wasNumber = false;
				}
			}

			return tokens;
		},

		/**
		 * Validates the given logical string if it's properly built.
		 * Throws {JCSDL.LogicValidationException} in cases of invalid elements.
		 * 
		 * @param  {mixed} logic Logical string or already tokenized logic.
		 * @param  {Array} availableFilters[optional] Array of available filters in the editor. If provided, it will also validate that all filters are used.
		 * @return {Boolean} True if successfully passed.
		 */
		validateLogic : function(logic, availableFilters) {
			// automatically tokenize the logic string if a string indeed supplied
			var tokens = (typeof logic === 'string' || typeof logic === 'number') ? this.tokenizeLogicString(logic) : logic;

			// cannot start with & or |
			if ($.inArray(tokens[0], ['&', '|']) >= 0) {
				throw new JCSDL.LogicValidationException('Logical query cannot start with logical operator "' + tokens[0] + '"!', 0);
			}

			// cannot end with & or |
			if ($.inArray(tokens[tokens.length - 1], ['&', '|']) >= 0) {
				throw new JCSDL.LogicValidationException('Logical query cannot end with logical operator "' + tokens[tokens.length - 1] + '"!', tokens.length - 1);
			}

			var prev = null,
				filters = [],
				level = 0,
				filterIds = [];

			if (availableFilters && availableFilters.length) {
				$.each(availableFilters, function(i, filter) {
					filterIds.push(parseInt(filter.id));
				});
			}

			$.each(tokens, function(i, token) {
				// "(" cannot open immediately after ")"
				if (token == '(' && prev == ')') throw new JCSDL.LogicValidationException('You cannot use opening parenthesis "(" right after a closing parenthesis ")"!', i);

				// ")" cannot close immediately after "("
				if (token == ')' && prev == '(') throw new JCSDL.LogicValidationException('You cannot use closing parenthesis ")" right after an opening parenthesis "("!', i);

				// cannot close bracket immediately after a logical operator
				if (token == ')' && $.inArray(prev, ['&', '|']) >= 0) throw new JCSDL.LogicValidationException('You cannot use closing parenthesis ")" right after a logical operator!', i);

				// cannot use logical sign "&" or "|" right after opening a bracket
				if ($.inArray(token, ['&', '|']) >= 0 && prev == '(') throw new JCSDL.LogicValidationException('You cannot use logical operator "' + token + '" right after opening brackets!', i);

				// cannot open a bracket right after a filter number
				if (token == '(' && typeof prev == 'number') throw new JCSDL.LogicValidationException('You cannot open a parenthesis right after filter ID! You need to use a logical operator "&" or "|"!', i);

				// cannot use a filter ID right after closing a bracket
				if (typeof token == 'number' && prev == ')') throw new JCSDL.LogicValidationException('You cannot use filter ID right after closing a parenthesis! You need to use a logical operator "&" or "|"!', i);

				// there can't be two logical operators next to each other
				if ($.inArray(token, ['&', '|']) >= 0 && $.inArray(prev, ['&', '|']) >= 0) throw new JCSDL.LogicValidationException('You cannot use two logical operators next to each other!', i);

				// if a number then it's a filter ID then add it to the list of filters
				if (typeof token == 'number') {
					if (typeof prev == 'number') {
						throw new JCSDL.LogicValidationException('Cannot use two filter ID\'s next to each other!', i);
					}

					// validate that this filter exists
					if ($.inArray(token, filterIds) == -1) throw new JCSDL.LogicValidationException('The filter ID "' + token + '" doesn\'t exist! You can only use filters from the list of filters.', i);

					// validate that this filter hasn't been used before (ie. one filter can only be used once)
					if ($.inArray(token, filters) >= 0) throw new JCSDL.LogicValidationException('The filter with ID "' + token + '" has already been used in the logical expression! You can only use one filter once.', i);

					filters.push(token);
				}

				// calculate nesting level
				if ($.inArray(token, ['(', ')']) >= 0) {
					level = (token == '(') ? level + 1 : level - 1;
					if (level < 0) {
						throw new JCSDL.LogicValidationException('Parentheses do not create a logical expression, i.e. there are too many closing parenthesis that close a nested expression that was never opened!', i);
					}
				}

				prev = token;
			});

			if (level !== 0) {
				throw new JCSDL.LogicValidationException('You have\'t closed some parentheses!');
			}

			return true;
		},

		/**
		 * Shows an error.
		 * 
		 * @param  {String} message Error message to be displayed.
		 * @param  {String} code    Code that caused the error.
		 */
		error : function(message, code) {
			this.gui.showError.apply(this.gui, arguments);
		},

		/* ##########################
		 * SETTERS AND GETTERS, ETC.
		 * ########################## */
		/**
		 * Creates a filter object from the given parameters (coming from the GUI filter editor most probably).
		 * 
		 * @param {String} target    CSDL target.
		 * @param {Array} fieldPath  Array of fields and subfields, path to a field.
		 * @param {String} operator  Name of the operator.
		 * @param {String} value     Value.
		 * @param {Object} additional Object of any additional filter data.
		 * @param {Number} filterId  ID of the filter (for reference in advanced logic builder).
		 * @return {Object} Filter object.
		 */
		createFilter : function(target, fieldPath, operator, value, additional, filterId) {
			additional = additional || {};
			var filter = {
				id : filterId,
				target : target,
				fieldPath : fieldPath,
				operator : operator,
				value : value,
				cs : additional.cs
			}
			return filter;
		},

		/**
		 * Returns code of the operator under the given name.
		 * 
		 * @param  {String} operatorName
		 * @return {String}
		 */
		getOperatorCode : function(operatorName) {
			return this.gui.definition.operators[operatorName].code;
		},

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

	/**
	 * Exception thrown when loaded JCSDL fails to validate.
	 * 
	 * @param {String} message Exception message.
	 * @param {String} code[optional] JCSDL code that failed the validation.
	 */
	this.ValidationException = function(message, code) {
		this.message = message;
		this.code = code;
	};

	/**
	 * Exception thrown when logic string fails to validate.
	 * 
	 * @param {String} message Exception message.
	 * @param {Number} index[optional] Index of the token that failed the validation.
	 */
	this.LogicValidationException = function(message, index) {
		this.message = message;
		this.index = index;
	};

});
