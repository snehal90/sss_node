$(document).ready(function() {
	var page_url = window.location.href;
	$('#fb_share').attr('href', "https://www.facebook.com/sharer/sharer.php?u=" + page_url);
});