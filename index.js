var winSizes = [320, 480, 600, 800, 1000, 1200];
var getWindowSize = function() {
	var winWidth = jQuery(window).width();
	var windowSize = 320;
	jQuery.each(winSizes, function(i, size) {
		if (winWidth >= size) {
			windowSize = size;
		}
	});
	return windowSize;
}

var setWindowSize = function(size) {
	size = (jQuery.inArray(size, winSizes)) ? size : getWindowSize();

	var $bd = jQuery(document.body);
	jQuery.each(winSizes, function(i, winSize) {
		$bd.removeClass('width-' + winSize);
	});

	$bd.addClass('width-' + size);
}

var adjustWindowSize = function() {
	var size = getWindowSize();
	setWindowSize(size);
}


jQuery(function() {

	adjustWindowSize();
	jQuery(window).resize(function(ev) {
		adjustWindowSize();
	});

	// tabs
	jQuery('#tabs li a').click(function(ev) {
		ev.preventDefault();
		ev.target.blur();

		jQuery('#tabs li a').removeClass('active');
		jQuery(this).addClass('active');

		jQuery('#content .tab-content').hide();
		jQuery('#tab-' + jQuery(this).attr('title')).show();
	});

	/*
	 * CREATE STREAM TAB
	 */
	var createEditor = new JCSDLGui('#jcsdl-create', {
		cancelButton : false,
		save : function(code) {
			jQuery('#jcsdl-create-output').val(code);

			// read the title
			var title = jQuery('#stream-title').val();
			if (title.length == 0) {
				alert('Stream title is required!');
				return;
			}

			// insert to the edit stream tab
			var $streamTemplate = jQuery('#streams-list li:first').clone();
			$streamTemplate.find('h4').html(title);
			$streamTemplate.find('.jcsdl-source').val(code);
			$streamTemplate.find('.options .live').remove(); // impossible to see it live
			$streamTemplate.appendTo(jQuery('#streams-list'));

			// reset the editor
			jQuery('#stream-title').val('');
			this.reset();
		}
	});
	
	/*
	 * EDIT STREAM TAB
	 */
	var $currentStream = jQuery();

	jQuery('#jcsdl-edit').jcsdlGui({
	//var editEditor = new JCSDLGui('#jcsdl-edit', {
		hideTargets : ['twitter', 'digg.item', 'digg.user.icon', 'facebook.author', 'newscred', 'facebook.og'],
		save : function(code) {
			// display the output
			jQuery('#jcsdl-edit-output').val(code);

			// and save it as well
			$currentStream.find('.jcsdl-source').val(code);

			// hide the editor and show the list
			jQuery('#streams-list').show();
			jQuery('#jcsdl-edit-wrap').hide();
		},
		cancel : function() {
			this.$container.fadeOut(this.config.animationSpeed, function() {
				jQuery('#streams-list').show();
			});
		}
	});

	jQuery('#streams-list .edit').live('click', function(ev) {
		ev.preventDefault();
		ev.target.blur();

		$currentStream = jQuery(this).closest('li');
		var code = $currentStream.find('.jcsdl-source').val();
		//editEditor.loadJCSDL(code);
		jQuery('#jcsdl-edit').jcsdlGui('loadJCSDL', code);

		// clear the output as well
		jQuery('#jcsdl-edit-output').val('');

		// hide the list and show the editor
		jQuery('#streams-list').hide();
		jQuery('#jcsdl-edit-wrap').show();
	});

	jQuery('#streams-list .source').live('click', function(ev) {
		ev.preventDefault();
		ev.target.blur();

		var code = jQuery(this).closest('li').find('.jcsdl-source').val();
		jQuery('#jcsdl-edit-output').val(code);
	});

	/*
	 * STYLING SHORTCUT
	 */
	//jQuery('#jcsdl-create .filter-add').click();

});