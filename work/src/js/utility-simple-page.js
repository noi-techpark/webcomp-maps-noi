var language = 'it';
var jsMediaQueryTester = '.js-media-query-tester';


// ---- Dropdown ---------------------------------------------
function dropdownToggle(){
	$(".dropdown-trigger").unbind('click');
	$(".dropdown-trigger").click(function() {
		var thisEl = $(this);
		thisEl.parents('.dropdown').toggleClass('open');
		thisEl.parent().find('.dropdown-list').slideToggle(300);
	});
}
function dropdownSelection(){
	$(".dropdown").find('.dropdown-list a:not(.clickable)').click(function() {
		console.log('click dropdown');
		var thisEl = $(this);
		var thisElText = thisEl.text();		
		var current = thisEl.parents('.dropdown').find('.dropdown-trigger');
		var currentText = current.text();
		current.text(thisElText);
		thisEl.text(currentText);
	});
}
function mapContainerMargin(){
	var headerH = $(".header").outerHeight();
	var footerH = $(".panel-footer-container").outerHeight();
	var windowH = window.innerHeight ? window.innerHeight : $(window).height();
	$("map-view").css('margin-top',headerH);
	var mapH = windowH;
	if($(".header").is(':visible')) {
		mapH -= headerH;
	}
	if($(jsMediaQueryTester).outerWidth() >= 50) {
		mapH -= footerH;
	}
	$("map-view").css('height',mapH);


	setTimeout(function() {
		if($('body').hasClass('cm-banner-active')) {
			var cookieH = $(".cm-cookies").outerHeight();
			if($(jsMediaQueryTester).outerWidth() < 50){
				$(".panel-footer-container").css('bottom','');
			} else {
				$(".panel-footer-container").css('bottom',cookieH);
			}
		}
	},50);
}

function totemChangeLinks() {
	if($('body').hasClass('totem')) {
		var querystring = 'totem=1';
		$('a').filter( function(i,el) {
		var startofurl = location.protocol+'//'+location.hostname;
			return el.href.indexOf(startofurl)===0;
		}).each(function() {
			var href = $(this).attr('href');
			if (href) {
				href += (href.match(/\?/) ? '&' : '?') + querystring;
				$(this).attr('href', href);
			}
		});
	}
}

function languageSelector() {
	if(typeof($('html').attr('lang'))!=='undefined' && $('html').attr('lang')!=null) {
		language = $('html').attr('lang');
	}

	$('.translatable').each(function() {
		$(this).text(getTranslation($(this).text()));
		if(typeof($(this).attr('placeholder'))!=='undefined' && $(this).attr('placeholder').length>0) {
			$(this).attr('placeholder', getTranslation($(this).attr('placeholder')));
		}
	});
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
	dropdownToggle();
	dropdownSelection();
	//languageSelector();
	//translateLinks();
	//totemChangeLinks();

	$('.menu-trigger').on('click',function(){
		$('body').toggleClass('menu-open');
	});
	$('.panel-footer-overlay').on('click',function(){
		$('body').removeClass('menu-open');
	});
	$('.option-trigger').on('click',function(){
		$('body').addClass('option-open');
	});
	$('.option-close').on('click',function(){
		$('body').removeClass('option-open');
	});
	$('.search-trigger').on('click',function(){
		$('body').toggleClass('search-open');
	});
	$('.lang-trigger').on('click',function(){
		$('body').toggleClass('lang-open');
	});
	$('.lang-close').on('click',function(){
		$('body').removeClass('lang-open');
	});


	$(window).resize(function() {
		clearTimeout(window.resizedFinished);
		window.resizedFinished = setTimeout(function(){
			resizeEndActions();
		}, 250);
	});

});

(function(e){"use strict";function r(t,n){this.opts=e.extend({handleKeys:!0,scrollEventKeys:[]},n);this.$container=t;this.$document=e(document);this.lockToScrollPos=[0,0];this.disable()}var t,n;n=r.prototype;n.disable=function(){var e=this;e.lockToScrollPos=[e.$container.scrollLeft(),e.$container.scrollTop()];e.$container.on("mousewheel.disablescroll DOMMouseScroll.disablescroll touchmove.disablescroll",e._handleWheel);e.$container.on("scroll.disablescroll",function(){e._handleScrollbar.call(e)});e.opts.handleKeys&&e.$document.on("keydown.disablescroll",function(t){e._handleKeydown.call(e,t)})};n.undo=function(){var e=this;e.$container.off(".disablescroll");e.opts.handleKeys&&e.$document.off(".disablescroll")};n._handleWheel=function(e){e.preventDefault()};n._handleScrollbar=function(){this.$container.scrollLeft(this.lockToScrollPos[0]);this.$container.scrollTop(this.lockToScrollPos[1])};n._handleKeydown=function(e){for(var t=0;t<this.opts.scrollEventKeys.length;t++)if(e.keyCode===this.opts.scrollEventKeys[t]){e.preventDefault();return}};e.fn.disablescroll=function(e){!t&&(typeof e=="object"||!e)?t=new r(this,e):t&&t[e]&&t[e].call(t)};window.UserScrollDisabler=r})(jQuery);