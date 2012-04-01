$(function() {

	// tabs
	$('#tabs li a').click(function(ev) {
		ev.preventDefault();
		ev.target.blur();

		$('#tabs li a').removeClass('active');
		$(this).addClass('active');

		$('#content .tab-content').hide();
		$('#tab-' + $(this).data('tab')).show();
	});

	/*
	 * CREATE STREAM TAB
	 */
	var createEditor = new JCSDLGui('#jcsdl-create', {
		onSave : function(code) {
			$('#jcsdl-create-output').val(code);

			// read the title
			var title = $('#stream-title').val();
			if (title.length == 0) {
				alert('Stream title is required!');
				return;
			}

			// insert to the edit stream tab
			var $streamTemplate = $('#streams-list li:first').clone();
			$streamTemplate.find('h4').html(title);
			$streamTemplate.find('.jcsdl-source').val(code);
			$streamTemplate.find('.options .live').remove(); // impossible to see it live
			$streamTemplate.appendTo($('#streams-list'));

			// reset the editor
			$('#stream-title').val('');
			this.init();
		}
	});
	
	/*
	 * EDIT STREAM TAB
	 */
	var $currentStream = $();

	var editEditor = new JCSDLGui('#jcsdl-edit', {
		onSave : function(code) {
			// display the output
			$('#jcsdl-edit-output').val(code);

			// and save it as well
			$currentStream.find('.jcsdl-source').val(code);

			// hide the editor and show the list
			$('#streams-list').show();
			$('#jcsdl-edit-wrap').hide();
		}
	});

	$('#streams-list').on('click', '.edit', function(ev) {
		ev.preventDefault();
		ev.target.blur();

		$currentStream = $(this).closest('li');
		var code = $currentStream.find('.jcsdl-source').val();
		editEditor.loadJCSDL(code);

		// clear the output as well
		$('#jcsdl-edit-output').val('');

		// hide the list and show the editor
		$('#streams-list').hide();
		$('#jcsdl-edit-wrap').show();
	});

	$('#streams-list').on('click', '.source', function(ev) {
		ev.preventDefault();
		ev.target.blur();

		var code = $(this).closest('li').find('.jcsdl-source').val();
		$('#jcsdl-edit-output').val(code);
	});

	$('#jcsdl-edit-wrap .cancel').click(function(ev) {
		ev.preventDefault();
		ev.target.blur();

		// hide the editor and show the list
		$('#streams-list').show();
		$('#jcsdl-edit-wrap').hide();
	});

	/*
	 * DIFFERENT PAGE SIZES
	 */
	$('#disclaimer select').change(function(ev) {
		var newWidth = $(this).val();
		$('#wrap').width(newWidth).removeClass('width-1200 width-1000 width-800 width-600 width-480 width-320').addClass('width-' + newWidth);

		// reinitialize both editors
		createEditor.init();
		editEditor.init();
	});

	/*
	 * STYLING SHORTCUT
	 */
	//$('#jcsdl-create .filter-add').click();

});