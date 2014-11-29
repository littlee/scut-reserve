$(document).ready(function () {
	var d = new Date();
	var time = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
	$('#date').text(time);
});