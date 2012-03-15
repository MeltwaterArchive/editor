$(function() {
	
	var theEditor = new JCSDLGui('#jcsdl-editor', {
		animationSpeed : 500
	});
	//theEditor.initFilterEditor();

	$('#filter-jcsdl-input').click(function(ev) {
		var code = $('#filter-jcsdl').val();
		theEditor.loadJCSDL(code);
	});

});