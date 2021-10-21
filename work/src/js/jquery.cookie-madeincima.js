(function ($) {
	$.cookieMadeincima = function (js_config) {
		if (typeof cookie_config === "undefined" || cookie_config === null) { 
			return false;
		}
		config = cookie_config;

		var cookieAcceptedName = config.cookieAcceptedName;
		var cookieDeclinedName = config.cookieDeclinedName;

		
		//convert config
		var cookiePosition = config.cookiePosition;
		var cookieActivation = config.cookieActivation;
		var cookieMainContainerClasses = config.cookieMainContainerClasses;
		var cookieBodyClasses = config.cookieBodyClasses;
		
        //convert strings
		var cookieMessage = config.cookieMessage;
		var cookieErrorMessage = config.cookieErrorMessage;
		var cookieAcceptButtonText = config.cookieAcceptButtonText;
		var cookieDeclineButtonText = config.cookieDeclineButtonText;


        // cookie identifier
        $.cookieMadeincima.accepted = $.cookieMadeincima.GetCookie(cookieAcceptedName) == cookieAcceptedName;
        $.cookieMadeincima.declined = $.cookieMadeincima.GetCookie(cookieDeclinedName) == cookieDeclinedName;


        var $cookieAccepted = $.cookieMadeincima.GetCookie(cookieAcceptedName) == cookieAcceptedName;
        $.cookieAccepted = function () {
            return $cookieAccepted;
        };
	
        var $cookieDeclined = $.cookieMadeincima.GetCookie(cookieDeclinedName) == cookieDeclinedName;
        $.cookieDeclined = function () {
            return $cookieDeclined;
        };

		// write cookie accept button
		var cookieAccept = '<span id="cm-accept" class="cm-button cm-cookie-accept">'+cookieAcceptButtonText+'</span>';

		// write cookie decline button
		var cookieDecline = '<span id="cm-decline" class="cm-button cm-cookie-decline">'+cookieDeclineButtonText+'</span>';

		var cmMainClasses = '';
		if(cookieMainContainerClasses.length > 0){
			cmMainClasses = cmMainClasses + cookieMainContainerClasses + ' ';
		}
		cmMainClasses = cmMainClasses + 'cm-cookies cm-' + cookiePosition;
		
		var cmBodyClasses = '';
		if(cookieBodyClasses.length > 0){
			cmBodyClasses = cmBodyClasses + cookieBodyClasses + ' ';
		}
		cmBodyClasses = cmBodyClasses + 'cm-banner-active cm-body-' + cookiePosition;
		if ($cookieAccepted == false && $cookieDeclined == false) {
			$('body').append('<div id="cm-cookies" class="' + cmMainClasses + '"><div class="cm-centre"><div class="cm-text">' + cookieMessage + '</div><div class="cm-buttons">' + cookieAccept + cookieDecline + '</div></div></div>');
			$('body').addClass(cmBodyClasses);
		}
		
		$('.cm-cookie-accept, .cm-cookie-decline').click(function (e) {
            if ($(this).hasClass('cm-cookie-decline')) {
            	$.cookieMadeincima.SetCookie(cookieAcceptedName, null, "/");
                $.cookieMadeincima.SetCookie(cookieDeclinedName, cookieDeclinedName, "/");
            } else {
            	$.cookieMadeincima.SetCookie(cookieDeclinedName, null, "/");
                $.cookieMadeincima.SetCookie(cookieAcceptedName, cookieAcceptedName, "/");
            }
            $(".cm-cookies").fadeOut(function () {
                // reload page to activate cookies
                location.reload();
            });
        });
		
		$(cookieActivation).not('.cm-privacy-link').click(function(){
			if($.cookieMadeincima.GetCookie(cookieDeclinedName) != cookieDeclinedName){
				$.cookieMadeincima.SetCookie(cookieDeclinedName, null, "/");
	            $.cookieMadeincima.SetCookie(cookieAcceptedName, cookieAcceptedName, "/");
				if (!$(this).is( "a" ) ) {
					$(".cm-cookies").fadeOut(function () {
						// reload page to activate cookies
						location.reload();
					});
				}
			}
		});
		
		$.cookieMadeincima.SetBody(false);
    };
	
	$.cookieMadeincima.SetCookie = function(name, value, path) {
		var expires = '';
		if(value != null){
			cmToday = new Date();
			cmExpire = new Date();
			cmExpire.setTime(cmToday.getTime() + 3600000*24*365);
			
			expires = ';expires='+cmExpire.toGMTString();
		}else{				
			expires = ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
			value = '';
		}
		document.cookie = name + '=' +escape(value) + ';path='+path + expires;
	}; 
	
	$.cookieMadeincima.GetCookie = function(name) 
	{
		if(name.length > 0)
		{
			var cookies = ' ' + document.cookie;
			var start = cookies.indexOf(' ' + name + '=');

			if(start == -1)
			{
				start = cookies.indexOf(';' + name + '=');

				if(start == -1)
				{
					return '';
				}            
			}

			var end = cookies.indexOf(';', start + 1);

			if(end == -1)
			{
				end = cookies.length;
			}

			return unescape(cookies.substring(start + name.length + 2, end));
		}
	};
	
	$.cookieMadeincima.SetBody = function(animation){
		if($('body').hasClass('cm-banner-active')){
			paddingBody = $('.cm-cookies').outerHeight();
			if(animation){
				if($('body').hasClass('cm-body-bottom')){
					$('body').animate({
						'padding-bottom': paddingBody + 'px'
					});
				}else{
					$('body').animate({
						'padding-top': paddingBody + 'px'
					});
				}
			}else{
				if($('body').hasClass('cm-body-bottom')){
					$('body').css({
						'padding-bottom': paddingBody + 'px'
					});
				}else{
					$('body').css({
						'padding-top': paddingBody + 'px'
					});
				}
			}
		}
	}
	
	$.cookieMadeincima.resizeEndActionsCm = function(){
		$.cookieMadeincima.SetBody(true);
	}

	//Google Tag Manager trigger custom MIC event
	$.cookieMadeincima.gtmCustomMICEvent = function() {
		try {
			if(typeof $.cookieMadeincima.accepted != 'undefined' && $.cookieMadeincima.accepted){
				window.dataLayer = window.dataLayer || [];
				window.dataLayer.push({
					'event': 'mic_cookie_accepted'
				});
			}		
		} catch(err) {
			console.log('Errore trigger GTM')
		}
	}
	
	// temporarily set variables for first load
	$.cookieMadeincima.accepted = $.cookieMadeincima.GetCookie('cc_cookie_accept') == "cc_cookie_accept";
	$.cookieMadeincima.declined = $.cookieMadeincima.GetCookie('cc_cookie_decline') == "cc_cookie_decline";

	$.cookieMadeincima.readCookieCustom = function(name){
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
	$.cookieMadeincima.decodeEntities = function(str) {
		// this prevents any overhead from creating the object each time
		var element = document.createElement('div');
		if(str && typeof str === 'string') {
		// strip script/html tags
		str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
		str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
		element.innerHTML = str;
		str = element.textContent;
		element.textContent = '';
		}
		return str;
	}
	
	$(document).ready(function(){
		$.cookieMadeincima();
		$(window).resize(function() {
			clearTimeout(window.resizedFinishedCm);
			window.resizedFinishedCm = setTimeout(function(){
				$.cookieMadeincima.resizeEndActionsCm();
			}, 250);
		});
	});
})(jQuery);