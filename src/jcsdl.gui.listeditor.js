/*global JCSDL, Math, FileReader, ZeroClipboard*/
JCSDL.Loader.addComponent(function($, undefined) {
    "use strict";

    /* define some static private vars */
    var

    /** @type {Object} A map of keys used for better readability. */
    KEYS = {
        BACKSPACE : 8,
        TAB : 9,
        DELETE : 46,
        ENTER : 13,
        ESC : 27,
        UP : 38,
        DOWN : 40,
        LEFT : 37,
        RIGHT : 39
    };

    /**
     * Constructor.
     *
     * @param  {jQuery} $view View for the list editor.
     */
    this.ListEditor = function($inputEl) {
        var self = this;

        this.$inputEl = $inputEl;
        this.$view = this.getTemplate('listEditor').insertAfter($inputEl);
        this.$list = this.$view.find('.jcsdl-list-elements');
        this.$listAddInput = this.$view.find('.jcsdl-list-elements [data-add-item] input');
        this.$listAddButton = this.$view.find('.jcsdl-list-elements [data-add-item] .jcsdl-btn-add');

        /* setup links to important elements */
        this.$copyBtn = this.$view.find('a[data-copy]').attr('id', 'jcsdl-copy-to-clipboard-' + Math.floor(Math.random() * 10000));
        this.$importBtn = this.$view.find('a[data-import]');
        this.$modeBtns = this.$view.find('a[data-list-mode]');
        this.$searchInput = this.$view.find('input[name="search"]');
        this.$counter = this.$view.find('[data-counter]');

        /* make the list sortable */
        this.$list.html5sortable({
            cursor : 'move',
            items : 'li:not(.jcsdl-list-add)',
            placeholder : 'sortable-placeholder'
        }).on('sortupdate', function() {
            self.updateValue();
        });
        // disabled until switched to move mode (timeout for a workaround)
        setTimeout(function() {
            self.$list.html5sortable('disable');
        }, 100);

        /*
         * REGISTER LISTENERS
         */
        this.$inputEl.on('change.jcsdllisteditor', function() {
            if (!self.silentUpdate) {
                self.update();
            }
        });

        /**
         * Adds an item to the list based on an input event
         */
        var addItem = function(val) {
            if (!$.string.trim(val).length) {
                return;
            }
            self.addItem(val, self.$list.find('.jcsdl-list-add'));
        };

        /**
         * When pressed ENTER in the add new input then add new item.
         */
        this.$list.on('keypress', '[data-add-item] input', function(ev) {
            if (ev.which !== KEYS.ENTER) {
                return;
            }

            addItem(this.value);
            $(this).val('');
        });

        /**
         * Add button for list editor
         */
        this.$list.on('click', '[data-add-item] a', function(ev) {
            addItem(self.$listAddInput.val())
            self.$listAddInput.val('');
            return false;
        });

        /**
         * When clicked on a list item then perform action appropriate to the current editing mode.
         */
        this.$list.on('click', 'li:not([data-add-item])', function() {
            var $el = $(this),
                spanWidth = $el.find('span').width();

            self.$list.find('li.jcsdl-list-active').removeClass('jcsdl-list-active');

            // enable edit when in edit mode
            if (self.mode === self.EDIT_MODE) {
                $el.addClass('jcsdl-list-active')
                    .find('.jcsdl-list-item-input').width(spanWidth).focus();

            // delete when in delete mode
            } else if (self.mode === self.DELETE_MODE) {
                $el.remove();
                self.updateCounter();
                self.updateValue();
            }

            return false;
        });

        /**
         * Pressing ENTER inside of an item input will blur it.
         */
        this.$list.on('keypress', 'li:not([data-add-item]) input', function(ev) {
            if (ev.which === KEYS.ENTER) {
                $(this).blur();
            }
        });

        /**
         * When blurred an item input then check if it's not empty and if it is remove it.
         */
        this.$list.on('blur', 'li:not([data-add-item]) input', function() {
            var $li = $(this).closest('li');

            if (!$.string.trim(this.value).length) {
                $li.remove();
                self.updateCounter();
                self.updateValue();
                return;
            }

            $li.removeClass('jcsdl-list-active').data('value', this.value)
                .find('.jcsdl-list-item-label').text(this.value);

            self.updateValue();
        });

        /**
         * Navigate with TAB key (press SHIFT to just to prev) and blur on ESCAPE.
         */
        this.$list.on('keydown', 'li:not([data-add-item]) input', function(ev) {
            if ($.inArray(ev.which, [KEYS.TAB, KEYS.ESC]) === -1) {
                return;
            }

            var $el = $(this),
                $li = $el.closest('li'),
                ret;

            switch(ev.which) {
                case KEYS.TAB:
                    var $next = (ev.shiftKey) ? $li.prev('li') : $li.next('li');
                    if ($next.length) {
                        $next.click();
                    }
                    ret = false;
                break;

                case KEYS.ESC:
                    $el.blur();
                break;
            }

            return ret;
        });

        /**
         * Sort the list alphabetically when clicked on the sort button.
         */
        this.$view.find('a[data-sort]').click(function() {
            var items = self.$list.children().not('[data-add-item]').get();

            items.sort(function(a, b) {
                return $(a).find('input').val().toUpperCase().localeCompare($(b).find('input').val().toUpperCase());
            });

            $.each(items, function(i, item) {
                self.$list.append(item);
            });

            self.updateValue();

            return false;
        });

        /**
         * Shows the import window.
         */
        this.$importBtn.click(function() {
            self.showImportView();
            return false;
        });

        /**
         * Handle searching in the search input.
         *
         * Blur and clear when pressed ESCAPE inside of it.
         */
        this.$searchInput.on('keyup', function(ev) {
            // when pressed ESCAPE then reset the search
            if (ev.which === KEYS.ESC) {
                self.$searchInput.val('').blur();
                self.$list.children().show();
                return;
            }

            var search = self.$searchInput.val(),
                regexPattern = new RegExp('^' + search, 'i');

            self.$list.children().not('[data-add-item]').quickEach(function() {
                if (regexPattern.test(this.data('value'))) {
                    this.show();
                } else {
                    this.hide();
                }
            });
        });

        /**
         * Set list editing mode when clicked on one of the mode buttons.
         */
        this.$modeBtns.click(function() {
            self.setMode($(this).data('listMode'));
            return false;
        });

        // disable by default
        this.disable();
    };

    this.ListEditor.prototype = {
        /** @var {Boolean} Is silent update in progress? */
        silentUpdate : false,
        /** @var {jQuery} View of the current import process. */
        $importView : null,
        /** @var {JCSDLPopup} Import popup */
        importPopup : null,

        /** @var {String} Current list mode. */
        mode : 'edit',

        /** @var {String} Available list modes. */
        EDIT_MODE : 'edit',
        MOVE_MODE : 'move',
        DELETE_MODE : 'delete',

        /**
         * Adds an item to the list.
         *
         * @param  {String} val Value of the item.
         * @param  {jQuery|null} $after [optional] If specified, the item will be added after this element.
         *                              Otherwise it will be appended to the end of the list. Default: null.
         * @param  {Boolean} refresh Should some meta data about the list be refreshed? Used internally. Default: true.
         * @return {jQuery} The newly added item.
         */
        addItem : function(val, $after, refresh) {
            $after = $after || null;
            refresh = refresh === undefined ? true : refresh;

            var $item = this.getTemplate('listElement', {
                value : $.string.escapeHtml(val)
            });

            if ($after && $after.length) {
                $item.insertAfter($after);
            } else {
                $item.appendTo(this.$list);
            }

            if (refresh) {
                this.$list.html5sortable('refresh');
                this.updateCounter();
                this.updateValue();
            }

            return $item;
        },

        /**
         * Adds multiple items to the list.
         *
         * @param  {Array} items List of items to be added.
         * @param  {Boolean} replace [optional] Should the list be cleared first? Default: false.
         */
        addItems : function(items, replace) {
            if (replace) {
               this.$list.find('li:not([data-add-item])').remove();
            }

            for(var i = 0; i < items.length; i++) {
                this.addItem(items[i], null, false);
            }

            this.$list.html5sortable('refresh');
            this.updateCounter();
            this.updateValue();
        },

        /**
         * Sets the value for the list. Takes a single CSDL string that will be comma-exploded.
         *
         * @param  {String} val Value to be set.
         */
        setValue : function(val) {
            var self = this,
                escapedToken = '::__ESC_TOKEN__::' + $.string.random() + '::',
                escapedTokenRegEx = new RegExp(escapedToken, 'gi'),
                values = val.replace(/\\,/gi, escapedToken).split(',');

            // clear previous
            this.$list.find('li:not([data-add-item])').remove();

            $.each(values, function(i, item) {
                item = $.string.trim(item.replace(escapedTokenRegEx, ','));

                if (!item.length) {
                    return true;
                }

                // do not refresh sortable while setting the value
                self.addItem(item, null, false);
            });

            // now that all data is there, refresh the sortable
            this.$list.html5sortable('refresh');
            this.updateCounter();
            this.updateValue();
        },

        /**
         * Returns the CSDL usable value from the list as a comma-separated list.
         *
         * @return {String}
         */
        getValue : function() {
            var values = [];

            this.$list.find('li:not([data-add-item]) input').quickEach(function() {
                var val = this.val();
                if (!$.string.trim(val).length) {
                    return true;
                }

                values.push(val.replace(/,/gi, '\\,'));
            });

            return values.join(',');
        },

        /**
         * Update the value in the original input.
         */
        updateValue : function() {
            this.silentUpdate = true;
            this.$inputEl.val(this.getValue());
            this.silentUpdate = false;
        },

        /**
         * Update the items counter with number of list items in the editor.
         *
         * Also returns the number.
         *
         * @return {Number}
         */
        updateCounter : function() {
            var count = this.$list.find('li:not([data-add-item])').length;
            this.$counter.html(count);

            if (count) {
                this.$view.find('[data-list-cta]').hide();
                this.$view.find('[data-list-info]').show();
            } else {
                this.$view.find('[data-list-cta]').show();
                this.$view.find('[data-list-info]').hide();
            }

            return count;
        },

        /* ##########################
         * LIST EDITING MODES
         * ########################## */
        /**
         * Sets current editing mode.
         *
         * @param {String} mode Mode to enable.
         */
        setMode : function(mode) {
            if ($.inArray(mode, [this.EDIT_MODE, this.DELETE_MODE, this.MOVE_MODE]) === -1) {
                throw new Error('Unrecognized mode "' + mode + '".');
            }

            this.$modeBtns.removeClass('jcsdl-active')
                .filter('[data-list-mode="' + mode + '"]').addClass('jcsdl-active');

            this.$list.removeClass('jcsdl-mode-edit jcsdl-mode-move jcsdl-mode-delete')
                .addClass('jcsdl-mode-' + mode);

            // display appropriate info box
            this.$view.find('[data-mode-info]').hide();
            this.$view.find('[data-mode-info="' + mode + '"]').show();

            // turn sortable on and off
            this.$list.html5sortable(mode === this.MOVE_MODE ? 'enable' : 'disable');

            this.mode = mode;
        },

        /* ##########################
         * IMPORTING LISTS
         * ########################## */
        /**
         * Shows the import window.
         */
        showImportView : function() {
            var self = this,
                $view = this.$importView = this.getTemplate('listEditor_import'),
                $replaceCheckbox = $view.find('input[name="replace"]');

            this.importPopup = $.jcsdlPopup({
                title : 'Import CSV List',
                content : $view
            });

            // should we also display the file upload? check for availability
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                var $fileUploadView = this.getTemplate('listEditor_import_file')
                        .prependTo($view.find('[data-step-one]')).filter('[data-import-file]'),
                    $fileUploadButton = $fileUploadView.find('input[type="file"]'),
                    /**
                     * Read a CSV file and parse it.
                     */
                    readFile = function(file) {
                        // if no file or not a csv file then ignore
                        if (file === undefined || file.type !== 'text/csv') {
                            return;
                        }

                        // read the CSV file into a string now
                        var reader = new FileReader();
                        reader.onload = function(e) {
                            self.parseCsv(e.target.result.replace(/\r\n|\r/g, "\n"), $replaceCheckbox.is(':checked'));
                        };
                        reader.readAsText(file);
                    };

                /**
                 * Trigger file selector dialog when clicked on the select file button.
                 */
                $fileUploadView.find('a[data-select-file]').click(function() {
                    $fileUploadButton.click();
                    return false;
                });

                /**
                 * When dragged a file over the drop area mark it.
                 *
                 * Had to use native event subscriber as jQuery doesn't seem to support this event.
                 */
                $fileUploadView[0].addEventListener('dragover', function(ev) {
                    ev.stopPropagation();
                    ev.preventDefault();
                    ev.dataTransfer.dropEffect = 'copy';
                    $fileUploadView.addClass('over');
                }, false);

                /**
                 * Toggle 'over' class when dragged over the drop area.
                 */
                $fileUploadView[0].addEventListener('dragenter', function() {
                    $fileUploadView.addClass('over');
                }, false);

                /**
                 * Toggle 'over' class when dragged over the drop area.
                 */
                $fileUploadView[0].addEventListener('dragleave', function() {
                    $fileUploadView.removeClass('over');
                }, false);

                /**
                 * Handle file drop in the drop area.
                 *
                 * Had to use native event subscriber as jQuery doesn't seem to support this event.
                 */
                $fileUploadView[0].addEventListener('drop', function(ev) {
                    ev.stopPropagation();
                    ev.preventDefault();
                    readFile(ev.dataTransfer.files[0]);
                }, false);

                /**
                 * Trigger parsing of a CSV file when it was selected.
                 */
                $fileUploadButton.change(function(ev) {
                    readFile(ev.target.files[0]);

                });
            }

            /**
             * Cancel the import process when clicked the cancel button.
             */
            $view.on('click', 'a[data-import-cancel]', function() {
                self.hideImportView();
                return false;
            });

            /**
             * Parse the CSV from the import when clicked on the import button.
             */
            $view.find('a[data-import-csv]').on('click', function() {
                var csv = $view.find('textarea[name="import"]').val();
                self.parseCsv(csv, $replaceCheckbox.is(':checked'));
                return false;
            });
        },

        /**
         * Hides the import window.
         */
        hideImportView : function() {
            if (this.$importView && this.$importView.length) {
                this.$importView.remove();
                this.$importView = null;
            }

            this.importPopup.close();
        },

        /**
         * Shows an error during CSV import.
         *
         * @param  {String} error Error message.
         */
        showCSVImportError : function(error) {
            this.clearCSVImportError();
            this.$importView.find('[data-step-one]').append(this.getTemplate('listEditor_import_error', {
                error : error
            }));
        },

        /**
         * Clears any CSV import errors from view.
         */
        clearCSVImportError : function() {
            this.$importView.find('[data-csv-error]').remove();
        },

        /**
         * Parses the given CSV string and either imports it straight away (if a simple data structure)
         * or calls configureDataImport().
         *
         * @param  {String} csv CSV string.
         * @param  {Boolean} replace [optional] If the import will happen straight away, should the current list
         *                           in the editor be replaced with the new one or just appended? Default: false.
         */
        parseCsv : function(csv, replace) {
            replace = replace || false;
            var lines = csv.split("\n");

            // single line of values?
            if (lines.length === 1) {
                try {
                    this.addItems($.csv.toArray(lines[0]), replace);
                    this.hideImportView();
                } catch(e) {
                    this.showCSVImportError(e.message);
                }
                return;
            }

            // read full data structure
            var data = [],
                maxInRow = 1,
                l = 0;

            try {
                $.each(lines, function(i, line) {
                    l = i;
                    var items = $.csv.toArray(line);

                    if (items.length > maxInRow) {
                        maxInRow = items.length;
                    }

                    data.push(items);
                });
            } catch(e) {
                this.showCSVImportError(e.message + ' on line ' + (l + 1) + '.');
                return;
            }

            // only one item per row, so treat all of them as a list
            if (maxInRow === 1) {
                var items = [];
                $.each(data, function(i, row) {
                    items.push(row[0]);
                });
                this.addItems(items, replace);
                this.hideImportView();
                return;
            }

            // and if more complicated data structure then we need to display a configuration view
            this.configureDataImport(data, maxInRow);
        },

        /**
         * Show a window to the user where they can configure which columns will be imported.
         *
         * @param {Array} data The data set to be configured for import.
         * @param {Number} width Maximum width (number of columns) in the data set.
         */
        configureDataImport : function(data, width) {
            var self = this;

            // remove the previous import step
            this.$importView.find('[data-step-one]').remove();

            // setup the import view and data table
            var $importTableView = this.getTemplate('listEditor_import_table').prependTo(this.$importView),
                $importTableHeadRow = $importTableView.find('table thead tr:first'),
                $importTableFoot = $importTableView.find('table tfoot'),
                $importTableBody = $importTableView.find('table tbody'),
                $ignoreHeadersCheckbox = $importTableView.find('input[name="ignoreheaders"]');

            // build the header and footer rows
            for(var i = 0; i < width; i++) {
                this.getTemplate('listEditor_import_tableHeader', {
                    i : i
                }).appendTo($importTableHeadRow);
            }

            if (data.length > 5) {
                this.getTemplate('listEditor_import_tableFooter', {
                    width : width,
                    more : data.length - 5
                }).appendTo($importTableFoot);
            }

            // build the actual data table
            $.each(data, function(i, items) {
                // show only top 5
                if (i > 5) {
                    return false; // break
                }

                // using a for(;;) loop in order to have the same number of cells in each row, even if some rows
                // might have less data in them
                var $row = $('<tr>');
                for(var j = 0; j < width; j++) {
                    $row.append('<td>' + (items[j] !== undefined ? items[j] : '') + '</td>');
                }
                $row.appendTo($importTableBody);

                if (!i) {
                    $row.addClass('ignored');
                }
            });

             // reposition the popup as size has changed
            this.importPopup.reposition();

            /**
             * Mark the first row as ignored or not, based on the checkbox.
             */
            $ignoreHeadersCheckbox.change(function() {
                $importTableBody.find('tr:first')[this.checked ? 'addClass' : 'removeClass']('ignored');
            });

            /**
             * Remove the old click event handler from the import button and add a new one that will import the data
             * based on the configuration.
             */
            this.$importView.find('a[data-import-csv]').off('click').on('click', function() {
                // check which columns should be imported
                var columns = [];
                $importTableHeadRow.find('input[name="column"]:checked').each(function() {
                    columns.push(parseInt(this.value, 10));
                });

                // need to select at least one
                if (!columns.length) {
                    self.$importView.find('thead').addClass('csdl-error');
                    return false;
                }

                // ignore the first row?
                if ($ignoreHeadersCheckbox.is(':checked')) {
                    data.shift();
                }

                // prepare the list that will be imported
                var toImport = [];
                $.each(data, function(i, items) {
                    // select only the selected columns from the row
                    $.each(columns, function(j, column) {
                        if (items[column] !== undefined) {
                            toImport.push(items[column]);
                        }
                    });
                });

                // finally add the items
                self.addItems(toImport, self.$importView.find('input[name="replace"]').is(':checked'));

                // and finish the import
                self.hideImportView();
                return false;
            });
        },

        /* ##########################
         * TOOLS
         * ########################## */
        /**
         * Returns a template (jQuery object) of the given name with inserted variables.
         *
         * @param  {String} name Name of the template to fetch.
         * @param  {Object} params [optional] Optional object containing params that should be inserted into the template.
         * @param  {Boolean} raw [optional] Should return raw output (String) rather than jQuery object?
         * @return {jQuery|String}
         */
        getTemplate : function(name, params, raw) {
            params = params || {};
            raw = raw || false;

            if (JCSDL.GUITemplates[name] === undefined) {
                throw new Error("No JCSDL.GUITemplate named '" + name + "' found!");
            }

            var tpl = JCSDL.GUITemplates[name];
            if (typeof tpl !== 'string') {
                tpl = tpl.outerHtml();
            }

            var template = $.string.parseVariables(tpl, params);
            return raw ? template : $(template);
        },

        /* ##########################
         * PUBLIC API
         * ########################## */
        enable : function() {
            var self = this;

            this.$inputEl.data('jcsdlListEditorEnabled', true)
                .data('jcsdlTagInputEnabled', true);
            this.$inputEl.hide();
            this.$view.show();

            setTimeout(function() {
                // copying to clipboard must be here, when the whole list editor is already visible
                // helper variable for copying to clipboard
                var copyButtonTransitionTimeout;

                /**
                 * Make the copy to clipboard button working.
                 */
                var copyClip = new ZeroClipboard(self.$copyBtn[0], {
                    moviePath: JCSDL.zeroClipboard
                });

                self.$copyBtn.click(function() {
                    return false;
                });

                copyClip.on('complete', function() {
                    clearTimeout(copyButtonTransitionTimeout);
                    copyClip.setText(null);
                    self.$copyBtn.find('span').html('Copied');
                    copyButtonTransitionTimeout = setTimeout(function() {
                        self.$copyBtn.find('span').html('Copy to Clipboard');
                    }, 3000);
                });

                copyClip.on('dataRequested', function() {
                    copyClip.setText(self.getValue());
                });
            }, 100);
        },

        disable : function() {
            this.$inputEl.data('jcsdlListEditorEnabled', false)
                .data('jcsdlTagInputEnabled', false);
            this.$inputEl.show();
            this.$view.hide();
        },

        update : function() {
            this.setValue(this.$inputEl.val());
        }
    };

    // add as jQuery plugin
    // the proper plugin
    $.fn.jcsdlListEditor = function(options) {
        function get($el) {
            var listEditor = $el.data('jcsdlListEditor');
            if (!listEditor) {
                listEditor = new JCSDL.ListEditor($el, options);
                $el.data('jcsdlListEditor', listEditor);
            }
            return listEditor;
        }

        if (typeof options === 'string') {
            // call a public method
            if ($.inArray(options, ['enable', 'disable', 'update']) >= 0) {
                var argmns = [];
                $.each(arguments, function(i, arg) {
                    if (!i) {
                        return true;
                    }
                    argmns.push(arg);
                });

                this.each(function() {
                    var listEditor = get($(this));
                    listEditor[options].apply(listEditor, argmns);
                });
            }
            return this;
        }

        options = $.extend({}, {
            // any default options?
        }, options);

        this.each(function() {get($(this));});
        return this;
    };

});