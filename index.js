$(function() {
	
	var theEditor = new JCSDLGui('#jcsdl-gui', {
		outputTo : '#jcsdl-output'
	});

	$('#jcsdl-input-button').click(function(ev) {
		var code = $('#jcsdl-input').val();
		theEditor.loadJCSDL(code);
	});

});