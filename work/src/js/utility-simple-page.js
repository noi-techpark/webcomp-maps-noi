var language = 'it';
var jsMediaQueryTester = '.js-media-query-tester';


function mapContainerMargin(){
	var headerH = $(".header").outerHeight() + $(".intro").outerHeight();
	var footerH = $(".header").outerHeight();
	var windowH = window.innerHeight ? window.innerHeight : $(window).height();
	//$("map-view").css('margin-top',headerH);
	var mapH = windowH;
	if($(".header").is(':visible')) {
		mapH -= headerH;
	}
	if($(jsMediaQueryTester).outerWidth() >= 50) {
		mapH -= footerH;
	}
	$("map-view").css('height',mapH);
}



function resizeEndActions(){
	mapContainerMargin();
}


$(document).ready(function() {
	if(!!('ontouchstart' in window)){ //check for touch device
		$('html').addClass('touch');
	} else{ //behaviour and events for pointing device like mouse
		$('html').addClass('no-touch');
	}

	mapContainerMargin();


	


	$(window).resize(function() {
		clearTimeout(window.resizedFinished);
		window.resizedFinished = setTimeout(function(){
			resizeEndActions();
		}, 250);
	});

});