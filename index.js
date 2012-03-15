$(function() {
	
	var theEditor = new JCSDLGui('#jcsdl-gui', {
		onSave : function(code) {
			$('#jcsdl-output').val(code);
		}
	});

	$('#jcsdl-input-button').click(function(ev) {
		var code = $('#jcsdl-input').val();
		theEditor.loadJCSDL(code);
	});

});