<?php
	if (isset($_POST['html'])) {
		echo 'jcsdlJSONP('. json_encode(array(
			'html' => stripslashes($_POST['html'])
		)) .');';
		die();
	}
?>
<html>
	<head>
		<title>HTML to JSONP</title>
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>

		<script type="text/javascript">
			$(function() {
				$('#parse-form').submit(function(ev) {
					ev.preventDefault();
					ev.target.blur();

					$.ajax({
						url : 'parse.php',
						data : {
							html : $('#input').val()
						},
						type : 'POST',
						dataType : 'text',
						success : function(data) {
							$('#output').val(data);
						}
					})
				});
			});
		</script>
	</head>
<body>

	<form action="parse.php" method="post" id="parse-form">
		<textarea style="width: 90%; height: 400px; padding: 5px; margin: 10px auto;" id="input"></textarea>
		<br /><br />
		<input type="submit" value="Parse!" />
	</form>

	<h2>Output:</h2>
	<textarea style="width: 90%; height: 400px; padding: 5px; margin: 10px auto;" id="output"></textarea>

</body>
</html>