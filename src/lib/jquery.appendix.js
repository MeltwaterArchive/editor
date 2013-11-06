/*! jQuery Appendix - v0.8.4-jcsdl
* A small set of functions appended to jQuery that make your life even easier.
*
* https://github.com/michaldudek/jQuery-Appendix
*
* Copyright (c) 2013 Michał Dudek, http://www.michaldudek.pl, michal@michaldudek.pl
* MIT License, https://github.com/michaldudek/jQuery-Appendix/blob/master/LICENSE.md
*/

JCSDL.Loader.addComponent(function($) {

/*global jQuery, Math*/
(function($, window, document, Math, undefined) {
    "use strict";

    // cache few helper variables
    var $body = $('body'),
        $html = $('html'),
        $htmlAndBody = $html.add($body),
        $win = $(window);

    $.extend($, {

        /*
         * TOOLS THAT EXTEND BASIC OBJECTS
         * but can't be in their prototypes
         */
        /*
         * STRING
         */
        string : {

            /**
             * Parses the string looking for variables to insert from the given set of variables.
             * Ie. looks for occurrences of {$foo} or {bar} and replaces them with values found
             * under 'foo' and 'bar' keys of the passed object.
             *
             * @param {String} str String to have the variables injected.
             * @param {Object} variables[optional] Object containing variables to be injected.
             * @return {String}
             */
            parseVariables : function(str, variables) {
                variables = variables || {};

                return str.replace(/\{(\$?[\w\d]+)\}/gi, function(match, key) {
                    var dollar = (key.substr(0, 1) === '$'); // has dollar sign?
                    if (dollar) {
                        key = key.substr(1);
                    }

                    if (variables[key] === null) {
                        return '';
                    }

                    if (variables[key] !== undefined) {
                        return variables[key];
                    }

                    if (!dollar) {
                        return '{' + key + '}';
                    }

                    return '';
                });
            },

            /**
             * Generate a random string of a given length.
             *
             * @param {Number} length[optional] Length of the string. Default: 16
             * @param {Boolean} capitals[optional] Should the string include capital letters? Default: true
             * @param {Boolean} punctuation[optional] Should the string include special characters like punctuation? Default: false
             * @return {String}
             */
            random : function(length, capitals, punctuation) {
                length = length || 16;
                capitals = !(!capitals || false);
                punctuation = punctuation || false;

                var str = '',
                    chars = '1234567890abcdefghijkmnopqrstuvwxyz';

                if (capitals) {
                    chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                }

                if (punctuation) {
                    chars += '?!.,;:^#@&';
                }

                for (var i = 1; i <= length; i++) {
                    str = str + chars.charAt(Math.floor(Math.random() * (chars.length - 1)));
                }

                return str;
            },

            /**
             * Trims the string of spaces or the given charlist.
             * This method is taked from PHP.JS project (phpjs.org)
             *
             * @param {String} str String to be trimmed.
             * @param {String} chars[optional] Optional list of characters that should be trimmed.
             * @return {String}
             */
            trim : function(str, chars) {
                var ws,
                    l = 0,
                    i = 0;
             
                if (!chars) {
                    // default list
                    ws = " \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000";
                } else {
                    // preg_quote custom list
                    chars += '';
                    ws = chars.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
                }
             
                l = str.length;
                for (i = 0; i < l; i++) {
                    if (ws.indexOf(str.charAt(i)) === -1) {
                        str = str.substring(i);
                        break;
                    }
                }
             
                l = str.length;
                for (i = l - 1; i >= 0; i--) {
                    if (ws.indexOf(str.charAt(i)) === -1) {
                        str = str.substring(0, i + 1);
                        break;
                    }
                }
             
                return ws.indexOf(str.charAt(0)) === -1 ? str : '';
            },

            /**
             * Truncates the string to a specific length.
             *
             * @param {String} str String to be truncated.
             * @param {Number} length[optional] Maximum length of the string. Default: 72.
             * @param {String} suffix[optional] String to append at the end. Default: '...'.
             * @return {String} Truncated string.
             */
            truncate : function(str, length, suffix) {
                length = length || 72;
                suffix = suffix || '...';

                if (str.length <= length) {
                    return str;
                }

                var res = str.substr(0, length);

                return res.substr(0, res.lastIndexOf(' ')) + suffix;
            },

            /**
             * Escapes HTML from the string.
             *
             * @param {String} str String to be HTML-escaped.
             * @return {String}
             */
            escapeHtml : function(str) {
                return str.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
            },

            /**
             * Unescapes HTML from the string.
             *
             * @param {String} str String to be HTML-unescaped.
             * @return {String}
             */
            unescapeHtml : function(str) {
                return str.replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"');
            }

        }

    });

    /* ################################################################
     * JQUERY EXTENSIONS
     * ################################################################ */
    /**
     * Extend with some more custom functionality.
     */
    $.fn.extend({


        /**
         * $.quickEach() replicates the functionality of $.each() but allows 'this'
         * to be used as a jQuery object without the need to wrap it using '$(this)'.
         * The performance boost comes from internally recycling a single jQuery
         * object instead of wrapping each iteration in a brand new one.
         *
         * @see https://gist.github.com/Striker21/1352993
         * 
         * @param  {[type]} f [description]
         * @return {[type]}   [description]
         */
        quickEach : function(f) {
            var j = $([0]),
                i = -1,
                l = this.length,
                c;

            while(++i < l && (c = j[0] = this[i]) && f.call(j, i, c) !== false) {}

            return this;
        },

        /**
         * Displays all elements in the collection by applying approprate CSS. Similiar to $.show() but with customizable 'display' value.
         * Most common use: show an element that should be 'inline-block' instead of 'block' (as $.show() would do).
         * Cannot use any FX tho.
         *
         * TODO: add fading FX by using $().css('opacity', 0.0000001).fadeTo(1);
         * 
         * @param {String} display[optional] CSS 'display' value, e.g. 'inline' or 'block'. Default: 'inline-block'.
         * @return {jQuery} jQuery object for chaining.
         */
        display : function(display) {
            return this.css('display', display || 'inline-block');
        },

        /**
         * Returns the HTML of the selected element including the element's tag.
         * 
         * @return {String}
         */
        outerHtml : function() {
            var $el = $(this);
            
            // use native .outerHTML (Chrome and IE)
            if ('outerHTML' in $el[0]) {
                return $el[0].outerHTML;
            }

            // use a hack
            var content = $el.wrap('<div></div>').parent().html();
            $el.unwrap();
            return content;
        },

        /**
         * Checks if the DOM object is after the element matched by the given selector.
         * 
         * @param {String|jQuery} selector jQuery selector. Can also be a jQuery DOM object.
         * @return {Boolean}
         */
        isAfter : function(selector) {
            return this.prevAll(selector).length > 0;
        },

        /**
         * Checks if the DOM object is before the element matched by the given selector.
         * 
         * @param {String|jQuery} selector jQuery selector. Can also be a jQuery DOM object.
         * @return {Boolean}
         */
        isBefore : function(selector) {
            return this.nextAll(selector).length > 0;
        },

        /**
         * Scrolls the element into view.
         * @return {jQuery}
         */
        scrollIntoView : function(container, hscroll) {
            var bd = document.body;
            var cEl = container && $(container).get(0) || bd;
            
            var isBody = (cEl === document.documentElement) || (cEl === document.body);
            
            var c =  isBody ? $(window) : $(cEl);       
            var el = $(this).get(0);

            var o = $(el).getOffsetsTo(cEl);
                
            // take borders into accounts
            if(bd !== cEl) {
                o[0] = o[0] - c.css('borderLeftWidth').replace('px', '');
                o[1] = o[1] - c.css('borderTopWidth').replace('px', '');            
            }

            var cScrollTop = c.scrollTop();
            var cScrollLeft = c.scrollLeft();
        
            var l = o[0] + (isBody ? 0 : cScrollLeft),
                t = o[1] + (isBody ? 0 : cScrollTop),
                b = t + el.offsetHeight,
                r = l + el.offsetWidth;
            
            var ch = c.height();
            var cw = c.width();
            
            var ct = parseInt(cScrollTop, 10);
            var cl = parseInt(cScrollLeft, 10);
            var cb = ct + ch;
            var cr = cl + cw;
            
            if(el.offsetHeight > ch || t < ct) {
                c.scrollTop(t);
            }
            else if(b > cb) {
                c.scrollTop(b-ch);
            }

            if(hscroll !== false) {
                if(el.offsetWidth > cw || l < cl) {
                    c.scrollLeft(l);
                }
                else if(r > cr) {
                    c.scrollLeft(r-cw);
                }
            }
            return this;
        },

        getOffsetsTo : function(el){
            el = $(el).get(0);
            
            var o = $(this).offset();
            var e = (document.documentElement === el || document.body === el) 
                ? {
                    top: 0,
                    left: 0
                } 
                : $(el).offset();       

            return [o.left - e.left, o.top - e.top];
        }

    });

})(jQuery, window, document, Math);

});