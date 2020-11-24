var language = 'it';
var minCharsToSearch = 3;
var isAjaxSearching = '';
var controller = '';
var mapContainer = document.getElementById('mapContainer');
var map = document.getElementById('map');
var originalTooltip = '';
var originalFloorsZoomSelector = '';
var originalSideGroups = '';
var clickedElementID = '';

var jsMediaQueryTester = '.js-media-query-tester';

var qrcode = null;

function setupMapBehaviours() {
	//Disable scroll (Safari zoom bug)
	$("#map").disablescroll();

	//Panzoom Map
	controller = panzoom(map, {
		zoomDoubleClickSpeed: 1, //disable doubleclick to zoom
		zoomSpeed: 0.04,
		maxZoom: 10,
		minZoom: 1,
		smoothScroll: true,
		bounds: true,
		boundsPadding: 1,
		boundsDisabledForZoom: true
	});
	controller.on('transform', function(e) {
		setTooltipPosition();
	});

	$(".loader-map").addClass('map-loaded');

	setMapZoom();	

	//Clickables
	//Tooltip & View floorplans
	clickableBehaviour();
	var hammertime = new Hammer(mapContainer, {});
	hammertime.off('tap');
	hammertime.on('tap', function(ev) {

		if( $(ev.target).parents('.tooltip.active').length==0 ) {
			$("#map .clickable").each(function(i) {
				var thisClickable = $(this);
				var oldClasses = thisClickable.attr('class');
				if(oldClasses.indexOf('active')!=-1) {
					oldClasses = oldClasses.replace(' active','');
					oldClasses = oldClasses.replace('active','');
					thisClickable.attr('class', oldClasses);
				}
			});
		}

		if(typeof(ev)!='undefined' && typeof(ev.target)!='undefined' && typeof(ev.target.className)!='undefined') {
			if( ev.target.className !== 'plus' && !ev.target.className !== 'minus' ) {
				closeTooltip(ev);
			}
			if( $(ev.target).hasClass('share-element') ) {
				closeTooltip(ev);
				$(".sharer-container").removeClass('hide').fadeIn();
				$(".sharer-container").find('input').val(location.origin+location.pathname+'?shared='+$(".share-element").attr('data-element-code')+'&lang='+language);
				$(".sharer-container").find('input').select();
			}
			if( !$("body").hasClass('totem') && ($(ev.target).hasClass('heading') || $(ev.target).parents('.heading').length>0 || $(ev.target).hasClass('expand-info')) && $(ev.target).parents('.tooltip').length>0 ) {
				$('.tooltip').find('.long-description').slideToggle();
			}
		}
		if(
			($(ev.target).hasClass('view-floorplan')) &&
			typeof($(ev.target).data('building-code'))!=='undefined' && $(ev.target).data('building-code')!==null && $(ev.target).data('building-code')!=='' &&
			typeof($(ev.target).data('building-floor'))!=='undefined' && $(ev.target).data('building-floor')!==null && $(ev.target).data('building-floor')!==''
		) {
			goToBuildingFloor($(ev.target).data('building-code'),$(ev.target).data('building-floor'));
		}
	});

	//Navbar
	$(".navbar-container a.site-title").click(function() {
		//console.log('GOING OUTSIDE..........');
		goToBuildingFloor('external','0');
		if(typeof(controller)!='undefined') {
			try {
				mapContainerHeight();
			}catch(err) {}
		}
	});

	//Zoom controls
	var hammertimeZoom = new Hammer($(".zoom-selector").get(0), {});
	hammertimeZoom.off('tap');
	hammertimeZoom.on('tap', function(evt) {
		if(evt.target.className == 'plus') {
			controller.smoothZoom($("#map").outerWidth()/2,$("#map").outerHeight()/2,1.5);
		}
		if(evt.target.className == 'minus') {
			controller.smoothZoom($("#map").outerWidth()/2,$("#map").outerHeight()/2,0.5);
		}
	});
}

function setMapZoom() {
	if(typeof(controller)!='undefined') {
		controller.zoomAbs(0, 0, 1);
		controller.moveBy(0.001, 0.001);

		if($(jsMediaQueryTester).outerWidth()<=30) {
			//controller.zoomAbs(0, 0, 1.6);
			setTimeout(function() {
				if($('.tooltip').hasClass('active') && typeof(clickedElementID)!='undefined' && $("#"+clickedElementID).length>0) {
					setTimeout(function() {
						var x = $("#"+clickedElementID).offset().left;
						var y = $("#"+clickedElementID).offset().top;

						if(x>$("#map").innerWidth()/2) {
							controller.smoothZoom(x+($("#mapContainer").innerWidth()/3),y,3);
						} else {
							controller.smoothZoom(x+($("#mapContainer").innerWidth()/16),y,3);
						}

						
					},500);
				} else {
					if($("#map #main-entrance").length>0) {
						controller.smoothZoom($("#map #main-entrance").offset().left+$("#map #main-entrance")[0].getBoundingClientRect().width/2, $("#map #main-entrance").offset().top,3);
					} else {
						if($("body").hasClass('external')) {
							controller.smoothZoom($("#map").outerWidth()/2,$("#map").outerHeight()/2,2);
						} else {
							controller.smoothZoom($("#map").outerWidth()/2,$("#map").outerHeight()/2,3);
						}
					}
				}
			},250);
		}

	}
}

function closeTooltip(ev) {
	var fadeSpeed = 200;
	if(typeof(ev)!='undefined' && ev!='' && ev!=null) {
		//Close popup only if : popup is active, element clicked parents are not clickable elements, element clicked is not tooltip or element clicked parents is not tooltip
		if(
			$('.tooltip').hasClass('active') &&
			$(ev.target).parents('.clickable').length==0 &&
			!$(ev.target).hasClass('tooltip') && $(ev.target).parents('.tooltip').length==0
		) {
			$('.tooltip').fadeOut(fadeSpeed, function() { $('.tooltip').removeClass('active').html(originalTooltip); });
		}
	} else {
		$('.tooltip').fadeOut(fadeSpeed, function() { $('.tooltip').removeClass('active').html(originalTooltip); });
	}
}

function clickableBehaviour() {
	if(typeof(NOIdata)==='undefined') {
		return;
	}


	//Clickable elements (building SVG - sidebar groups)
	$('.clickable a').unbind();
	$('.clickable').unbind();
	$('.clickable a').click(function(ev) { ev.preventDefault(); return false; });
	$('.clickable').each(function() {
		var thisEl = this;
		if(typeof($(this).data('clickable'))=='undefined') {
			$(this).data('clickable','true');
		} else {
			return true;
		}


		var hammertime = new Hammer(thisEl, {});
		hammertime.off('tap');
		hammertime.on('tap', function(ev) {
			var buildingCode = $(thisEl).data('building-code');
			var roomCode = $(thisEl).data('room-code');
			var floorCode = $(thisEl).data('floor-code');
			//console.log(buildingCode);
			//console.log(roomCode);
			//console.log(floorCode);

			$('.clickable').not('.floor').removeClass('active');

			//Close navigator
			if($(thisEl).parents('.building-select').length > 0) {
				$(thisEl).parents('.building-select').removeClass('open');
				$(thisEl).parents('.building-select').find('.dropdown-list').slideToggle('fast');
			}

			if(
				typeof(buildingCode)!=='undefined' && buildingCode!='' &&
				( (typeof(floorCode)!=='undefined' && floorCode!='') || (floorCode===0)) &&
				typeof(roomCode)!=='undefined' && roomCode!=''
			) {
				//console.log('clicked sidebar');
				setMapZoom();
				if($(jsMediaQueryTester).outerWidth()<=30) {
					$("body").removeClass('search-open');
				}
				//This is a room
				if($('body').attr('data-building')==buildingCode && $('body').attr('data-floor')==floorCode) {
					//We are in the same building or in the same floor as the clicked element
					//console.log('same floor same building');			
					clickedElement(roomCode, 'room');
				} else {
					//console.log('goto building '+buildingCode+' floor '+floorCode);				
					goToBuildingFloor(buildingCode, floorCode, false);
					clickedElement(roomCode, 'room');
				}
			} else if(typeof(buildingCode)!='undefined' && buildingCode!='' && typeof(floorCode)=='undefined') {
				//console.log('clicked building');

				//This is a building
				if($('body').attr('data-building')=='external') {
					var thisBuilding = typeof($(thisEl).data('building-code'))!=='undefined' && $(thisEl).data('building-code')!==null && $(thisEl).data('building-code')!=='' ? $(thisEl).data('building-code') : false;
					var thisFloor = typeof($(thisEl).data('building-floor'))!=='undefined' && $(thisEl).data('building-floor')!==null && $(thisEl).data('building-floor')!=='' ? $(thisEl).data('building-floor') : false;
					if(thisBuilding && thisFloor) {
						//We're in external mode, clicked an item with buildingcode and floor -> go directly
						goToBuildingFloor(thisBuilding, thisFloor);
					} else {
						//We're in external mode, open popup
						clickedElement(buildingCode, 'building');
					}

								
				} else {
					//console.log('not external');
					//We're inside some floor, goto building
					goToBuildingFloor(buildingCode, '0');
				}
			} else if(
				typeof(buildingCode)!=='undefined' && buildingCode!='' &&
				(
					typeof(floorCode)!=='undefined' || floorCode===0
				)
			) {
				//console.log('clicked something with BUILDING and FLOOR');
				if($('body').attr('data-building')!=buildingCode || $('body').attr('data-floor')!=floorCode) {
					goToBuildingFloor(buildingCode, floorCode);
				}
			}else {
				//console.log('Clicked something we dont know about');
				clickedElement($(thisEl).attr('id'),'room');
			}
		});
	});
}

function clickedElement(elementCode, type="room") {
	if(
		typeof(elementCode)!='undefined' && elementCode!=null &&
		typeof(type)!='undefined' && type!=null
	) {
		
		//console.log('clicked element '+elementCode+' of type '+type);
		$('.tooltip').html(originalTooltip);
		var icon_code = name = shortdesc = longdesc = '';

		if(type=="building") {
			if(typeof(buildings_summary[elementCode])!='undefined') {
				if(typeof(buildings_summary[elementCode]['Building Code'])!='undefined' && buildings_summary[elementCode]['Building Code']!='') {
					icon_code = "icon-building-"+buildings_summary[elementCode]['Building Code'];
					clickedElementID = 'building_'+buildings_summary[elementCode]['Building Code'];
					var oldClasses = $("#"+clickedElementID).attr('class');
					if(oldClasses.indexOf('active')==-1) {
						oldClasses += ' active';
						$("#"+clickedElementID).attr('class', oldClasses);
					}
				}
				if(typeof(buildings_summary[elementCode]['Building Name ('+language.toUpperCase()+')'])!='undefined' && buildings_summary[elementCode]['Building Name ('+language.toUpperCase()+')']!='') {
					name = buildings_summary[elementCode]['Building Name ('+language.toUpperCase()+')'];
				}
				if(typeof(buildings_summary[elementCode]['Building Short Description ('+language.toUpperCase()+')'])!='undefined' && buildings_summary[elementCode]['Building Short Description ('+language.toUpperCase()+')']!='') {
					shortdesc = buildings_summary[elementCode]['Building Short Description ('+language.toUpperCase()+')'];
				}
				if(typeof(buildings_summary[elementCode]['Building Description ('+language.toUpperCase()+')'])!='undefined' && buildings_summary[elementCode]['Building Description ('+language.toUpperCase()+')']!='') {
					longdesc = buildings_summary[elementCode]['Building Description ('+language.toUpperCase()+')'];
				}
			}
		}

		if(type=="room") {
			if(typeof(NOIdata)!='undefined' && NOIdata!=null && NOIdata!='' && typeof(categories_array)!='undefined' && categories_array!='') {
				for(var i in NOIdata) {
					if(typeof(NOIdata[i][elementCode])!='undefined') {
						if(
							typeof(NOIdata[i][elementCode]['Type'])!='undefined' && NOIdata[i][elementCode]['Type']!='' &&
							typeof(categories_array[NOIdata[i][elementCode]['Type']])!='undefined' && categories_array[NOIdata[i][elementCode]['Type']]!='' &&
							typeof(categories_array[NOIdata[i][elementCode]['Type']]['icon_code'])!='undefined' && categories_array[NOIdata[i][elementCode]['Type']]['icon_code']!=''
						) {
							icon_code = categories_array[NOIdata[i][elementCode]['Type']]['icon_code'];
							var building = '';
							var floor = '';
						}
						if(typeof(NOIdata[i][elementCode][language.toLowerCase()+':Name'])!='undefined' && NOIdata[i][elementCode][language.toLowerCase()+':Name']!='') {
							name = NOIdata[i][elementCode][language.toLowerCase()+':Name'];
						}
						if(typeof(NOIdata[i][elementCode][language.toLowerCase()+':Description'])!='undefined' && NOIdata[i][elementCode][language.toLowerCase()+':Description']!='') {
							longdesc = NOIdata[i][elementCode][language.toLowerCase()+':Description'];
						}
						if(typeof(NOIdata[i][elementCode]['Building Code'])!='undefined' && NOIdata[i][elementCode]['Building Code']!='') {
							shortdesc += '<span class="room-icon-building icon-building-'+NOIdata[i][elementCode]['Building Code']+'">'+NOIdata[i][elementCode]['Building Code']+'</span>';
							building = NOIdata[i][elementCode]['Building Code'];
						}
						if(typeof(NOIdata[i][elementCode]['Floor'])!='undefined' && NOIdata[i][elementCode]['Floor']!='') {
							shortdesc += '<span class="room-floor">'+NOIdata[i][elementCode]['Floor']+'</span>';
							floor = NOIdata[i][elementCode]['Floor'];
						}
						if(typeof(NOIdata[i][elementCode]['Room Number'])!='undefined' && NOIdata[i][elementCode]['Room Number']!='') {
							shortdesc += '<span class="room-number">'+NOIdata[i][elementCode]['Room Number']+'</span>';
						}

						//if the requested room is not the actual viewed building or floor, goto
						if(
							building!=='' && floor !== '' &&
							($("body").attr('data-building')!==building || $("body").attr('data-floor')!==floor)
						) {
							goToBuildingFloor(building, floor);
						}
					}
				}
				//setMapZoom();
			}
			clickedElementID = elementCode;
			//console.log('^^^^^^^^^^^^^^^^^^^^^^');
			//console.log(clickedElementID);
			//console.log('^^^^^^^^^^^^^^^^^^^^^^');			
			if($("#"+clickedElementID).length==0) {
				//alert('ATTENZIONE! Non è presente in alcuna mappa l\'elemento con codice:\n'+clickedElementID+'\nControllare SVG');
				closeTooltip();
				return true;
			}
		}

		//Tooltip data
		$('.tooltip .icon, .tooltip .name, .tooltip .short-description, .tooltip .long-description, .tooltip .lower, .tooltip .view-floorplan, .tooltip .share-element, .tooltip .expand-info').addClass('hide');
		if(icon_code==''&&name==''&&shortdesc==''&&longdesc=='') {
			//alert('ATTENZIONE! Nessuna informazione per l\'elemento cliccato:\n'+elementCode+'\nControllare il foglio Google');
			closeTooltip();
			return true;
		} else {
			$(".tooltip .view-floorplan").text(getTranslation($(".tooltip .view-floorplan").text()));
			if(icon_code!='') {
				//console.log('----------------elementCode');
				//console.log(elementCode);
				$(".tooltip .icon").removeClass().addClass('icon');
				if(type=='building') {
					$(".tooltip .icon").addClass(icon_code);
					$(".tooltip .icon").text(elementCode);
				} else {
					$(".tooltip .icon").addClass('icon-room');
					$(".tooltip .icon").html(icon_code);
				}				
			}
			//console.log('---------name');
			//console.log(name);
			if(name!='') {
				$(".tooltip .name").removeClass('hide');
				$(".tooltip .name").text(name);
			}
			if(shortdesc!='') {
				$(".tooltip .short-description").removeClass('hide');
				if(type=='building') {
					$(".tooltip .short-description").text(shortdesc);
				} else {
					$(".tooltip .short-description").html(shortdesc);
				}
			}
			if(longdesc!='') {
				$(".tooltip .long-description").removeClass('hide');
				$(".tooltip .expand-info").removeClass('hide');
				$(".tooltip .long-description").text(longdesc);
			}
			if(type=="building") {
				$(".tooltip .lower").removeClass('hide');
				$(".tooltip .lower .view-floorplan").removeClass('hide');
				$(".tooltip .lower .view-floorplan").attr('data-building-code',elementCode);
				var thisFloor = 0;
				if($("#building_"+elementCode).data('building-floor')!== 'undefined' && !isNaN($("#building_"+elementCode).data('building-floor'))) {
					thisFloor = $("#building_"+elementCode).data('building-floor');
				}
				$(".tooltip .lower .view-floorplan").attr('data-building-floor',thisFloor);
			}
			if(type=="room") {
				$(".tooltip .lower").removeClass('hide');
				$(".tooltip .lower .share-element").removeClass('hide');
				$(".tooltip .lower .share-element").attr('data-element-code',elementCode);
				$(".tooltip .room-url").text(location.origin+location.pathname+'?shared='+elementCode+'&lang='+language);
				if($('body').hasClass('totem') && typeof QRCode !== 'undefined') {
					roomQRCode();
					qrcode.clear(); // clear the code.
					qrcode.makeCode(location.origin+location.pathname+'?shared='+elementCode+'&lang='+language); // make another code.
					//new QRCode(document.getElementById("room-qrcode"), location.origin+location.pathname+'?shared='+elementCode+'&lang='+language);
				}
			}

			$(".tooltip").fadeIn(function() {});
			$(".tooltip").addClass('active');
		}
		setTooltipPosition();
		tooltipViewport();
	}
}

function setTooltipPosition() {
	currentMediaQuery = $(jsMediaQueryTester).outerWidth();
	if($("#"+clickedElementID).length>0) {

		var jsElem = $("#"+clickedElementID)[0];
		if(!$("body").hasClass('external')) {
			jsElem = $("#"+clickedElementID).children()[0];
		}

		
		//console.log(jsElem);
		if(currentMediaQuery >= 50){
			//console.log('AAAA');
			$(".tooltip").css({
				left: $("#"+clickedElementID).offset().left + (jsElem.getBoundingClientRect().width/2),
				top: $("#"+clickedElementID).offset().top + (jsElem.getBoundingClientRect().height/2)-8
			});
		} else {
			$(".tooltip").css({
				left: ($("#"+clickedElementID).offset().left + (jsElem.getBoundingClientRect().width/2))-15,
				top: ($("#"+clickedElementID).offset().top + (jsElem.getBoundingClientRect().height/2))-45
			});
		}
	}
}

function goToBuildingFloor(buildingCode, buildingFloor, close = true) {
	if(
		typeof(buildingCode)!=='undefined' && buildingCode!==null && buildingCode!=='' &&
		typeof(buildingFloor)!=='undefined' && buildingFloor!==null && buildingFloor!=='' &&
		typeof(maps_svgs)!=='undefined' && maps_svgs!==null && maps_svgs!==''
	) {
		//console.log('--------------');
		//console.log('goToBuildingFloor '+buildingCode+' '+buildingFloor);
		//console.log('--------------');
		//Check if requested building and requested floor are keys of maps_svgs array

		//if floor 0 is not defined, try with -1
		if(typeof(maps_svgs[buildingCode]['floors'][buildingFloor])==='undefined' || maps_svgs[buildingCode]['floors'][buildingFloor]===null || maps_svgs[buildingCode]['floors'][buildingFloor]==='') {
			buildingFloor = -1;
		}


		if(
			typeof(maps_svgs[buildingCode])!=='undefined' && maps_svgs[buildingCode]!==null && maps_svgs[buildingCode]!=='' &&
			typeof(maps_svgs[buildingCode]['floors'][buildingFloor])!=='undefined' && maps_svgs[buildingCode]['floors'][buildingFloor]!==null && maps_svgs[buildingCode]['floors'][buildingFloor]!==''
		) {
			if(close) {
				closeTooltip();
			}
			$('#map').html(maps_svgs[buildingCode]['floors'][buildingFloor]);			
			clickableBehaviour();
			navBars(buildingCode,buildingFloor);
			floorsZoomSelector(buildingCode,buildingFloor);
			drawRoomsCategoryIcons();
			setMapZoom();
		}
	}
}

function floorsZoomSelector(buildingCode,buildingFloor) {
	if(
		typeof(buildingCode)!=='undefined' && buildingCode!==null && buildingCode!=='' &&
		typeof(buildingFloor)!=='undefined' && buildingFloor!==null && buildingFloor!==''
	) {
		var selector = $('.floors-zoom-selector');
		if(buildingCode!='external') {
			selector.find('.floors-selector').removeClass('hide');
			selector.find('.icon-building').addClass('icon-building-'+buildingCode);
			selector.find('.icon-building').text(buildingCode);
			for(var i in maps_svgs) {
				if(i!='external' && i==buildingCode) {
					if(typeof(maps_svgs[i]['floors'])!='undefined' ) {
						var floorsList = selector.find('.floors-list');
						floorsList.empty();
						for(var j in maps_svgs[i]['floors']) {
							////console.log(j);
							var item = $('<li/>', {
								text: j,
								class: 'clickable floor',
								'data-building-code': buildingCode,
								'data-floor-code': j,
							})
							/* item.addClass('floor');
							item.attr('data-building',buildingCode);
							item.attr('data-floor',j); */
							if(j == buildingFloor) {
								item.addClass('active');
							}
							floorsList.append(item);
						}
					}
				}
			}

			selector.find('.floors-list li').sort(function (a, b) {
				return $(b).attr('data-floor-code') - $(a).attr('data-floor-code');
			})
			.appendTo('.floors-list');

			clickableBehaviour();
		} else {
			selector.find('.icon-building').removeClass().addClass('icon-building').empty();
			selector.find('.floors-list').empty();
			selector.find('.floors-selector').addClass('hide');
		}
	}
}

function drawRoomsCategoryIcons() {
	if(typeof(categories_array)!='undefined' && categories_array!='') {
		var currentBuilding = $('body').attr('data-building');
		if (
			typeof(currentBuilding)!='undefined' && currentBuilding!='' &&
			currentBuilding!=='external' &&
			typeof(NOIdata[currentBuilding])!='undefined' && NOIdata[currentBuilding]!=''
		) {
			$(mapContainer).find('.clickable').each(function() {
				var thisEl = $(this);
				var thisRoomID = thisEl.attr('id');
				if(
					typeof(NOIdata[currentBuilding][thisRoomID])!='undefined' && NOIdata[currentBuilding][thisRoomID]!=''
					
				) {
					var thisSVG = '';
					if(
						typeof(NOIdata[currentBuilding][thisRoomID]['Type'])!='undefined' && NOIdata[currentBuilding][thisRoomID]['Type']!='' &&
						typeof(categories_array[NOIdata[currentBuilding][thisRoomID]['Type']])!='undefined' && categories_array[NOIdata[currentBuilding][thisRoomID]['Type']]!='' &&
						typeof(categories_array[NOIdata[currentBuilding][thisRoomID]['Type']]['icon_code'])!='undefined' && categories_array[NOIdata[currentBuilding][thisRoomID]['Type']]['icon_code']!='' &&
						categories_array[NOIdata[currentBuilding][thisRoomID]['Type']]['show_icon_on_map'] &&
						categories_array[NOIdata[currentBuilding][thisRoomID]['Type']]['show_icon_on_map'] === true
					) {
						thisSVG = $(categories_array[NOIdata[currentBuilding][thisRoomID]['Type']]['icon_code']);

						if(typeof categories_array[NOIdata[currentBuilding][thisRoomID]['Type']]['ID']!=='undefined' && categories_array[NOIdata[currentBuilding][thisRoomID]['Type']]['ID'].length>0 ) {
							thisEl.attr('data-category',categories_array[NOIdata[currentBuilding][thisRoomID]['Type']]['ID']);
						}


					} else {
						thisSVG = $(categories_array['generic_label']['icon_code']);
						if(typeof(NOIdata[currentBuilding][thisRoomID]['Beacon ID'])!='undefined' && NOIdata[currentBuilding][thisRoomID]['Beacon ID']!='' ) {
							thisSVG.find('text').text(NOIdata[currentBuilding][thisRoomID]['Beacon ID']);
						} else {
							thisSVG.find('text').text(thisRoomID);
						}
					}

					var thisSVGWidth = thisSVG.attr('width');
					var thisSVGHeight = thisSVG.attr('height');

					if(typeof(thisSVGWidth)=='undefined' || thisSVGWidth==null || thisSVGWidth == '') {
						thisSVGWidth = '30';
					}
					if(typeof(thisSVGHeight)=='undefined' || thisSVGHeight==null || thisSVGHeight == '') {
						thisSVGHeight = '30';
					}
					var svgElement = document.getElementById(thisRoomID);

					if(thisSVGWidth>(svgElement.getBBox().width*0.75)) {
						thisSVG.attr('width',svgElement.getBBox().width*0.75);
						x = (svgElement.getBBox().x + (svgElement.getBBox().width/2)) - (thisSVG.attr('width')/2);
					} else {
						x = (svgElement.getBBox().x + (svgElement.getBBox().width/2)) - (thisSVGWidth/2);
					}

					if(thisSVGHeight>(svgElement.getBBox().height*0.75)) {
						thisSVG.attr('height',svgElement.getBBox().height*0.75);
						y = (svgElement.getBBox().y + (svgElement.getBBox().height/2)) - (thisSVG.attr('height')/2);
					} else {
						y = (svgElement.getBBox().y + (svgElement.getBBox().height/2)) - (thisSVGHeight/2);
					}
					
					//y = (svgElement.getBBox().y + (svgElement.getBBox().height/2)) - (thisSVGHeight/2);
					thisSVG.attr('x',x);
					thisSVG.attr('y',y);
					thisEl.append(thisSVG);
				}
			});
		}

/*		for(var i in categories_array) {
			if(
				typeof(NOIdata[i][elementCode]['Type'])!='undefined' && NOIdata[i][elementCode]['Type']!='' &&
				typeof(categories_array[NOIdata[i][elementCode]['Type']])!='undefined' && categories_array[NOIdata[i][elementCode]['Type']]!='' &&
				typeof(categories_array[NOIdata[i][elementCode]['Type']]['icon_code'])!='undefined' && categories_array[NOIdata[i][elementCode]['Type']]['icon_code']!=''
			) {
				icon_code = categories_array[NOIdata[i][elementCode]['Type']]['icon_code'];
				var building = '';
				var floor = '';
			}
		}*/
	}
}

function navBars(buildingCode,buildingFloor) {
	//Breadcrumbs and selectors
	if(
		typeof(buildingCode)!=='undefined' && buildingCode!==null && buildingCode!=='' &&
		typeof(buildingFloor)!=='undefined' && buildingFloor!==null && buildingFloor!==''
	) {
		//console.log('navBars changing body....');
		$('body').attr('data-building',buildingCode);
		$('body').attr('data-floor',buildingFloor);
		
		if(buildingCode!='external') {
			$('body').removeClass('external');
			$(".main-site-title").addClass("hide");
			$(".navbar-container, .navbar-container *").removeClass("hide");
			$(".navbar-container .dropdown-trigger, .filters-dropdown.building-select .dropdown-trigger").text(buildingCode);
			$(".navbar-container .dropdown-list, .filters-dropdown.building-select .dropdown-list").empty();
			for(var i in maps_svgs) {
				if(i!='external' && i!=buildingCode) {
					$(".navbar-container .dropdown-list, .filters-dropdown.building-select .dropdown-list").append('<li><a href="#" class="clickable" data-building-code="'+i+'">'+i+'</a></li>');
				}
			}
			clickableBehaviour();
		} else {
			$('body').addClass('external');
			$(".main-site-title").removeClass("hide");
			$(".navbar-container, .navbar-container .site-title").addClass("hide");
		}
	}
}

function searchElementsStarter() {
	$('.search-container .search').unbind('keyup');
	$('.search-container .search').keyup(function() { $(".search-container .loader").fadeIn(); } );
	$('.search-container .search').keyup(delay(function(){		
		var searchFieldVal = $(this).val();
		searchElements(searchFieldVal);
	}, 1500));
}

function searchElements(string) {	
	var founds = [];
	if(string.length>=minCharsToSearch) {
		if(typeof(NOIdata)!='undefined') {
			for(var building in NOIdata) {
				if(typeof(NOIdata[building])!='undefined') {
					for(var room in NOIdata[building]) {
						if(typeof(NOIdata[building][room])!='undefined') {
							var found = false;
							for(var property in NOIdata[building][room]) {								
								if(typeof(NOIdata[building][room][property])!='undefined') {
									if((NOIdata[building][room][property].toLowerCase()).indexOf(string.toLowerCase())!=-1) {
										found = true;
									}
								}
							}
							if(found) {
								founds.push(NOIdata[building][room]);
							}
						}
					}
				}
			}
		}
	} else {
		$(".search-container .loader").slideToggle(100,function(){$(".search-container .loader").hide();});
		$(".category-group-container").hide().html(originalSideGroups).fadeIn();
		dropdownToggle();
		clickableBehaviour();
	}
	if(string.length>=minCharsToSearch && founds.length == 0) {
		$(".search-container .loader").slideToggle(100,function(){$(".search-container .loader").hide();});
		$(".category-group-container").html('<p class="no-results translatable">'+getTranslation('Nessun risultato')+'</p>');
	}
	if(founds.length>0 && !isAjaxSearching) {
		loadAfterSearch( JSON.stringify(founds) );
	}
}

function delay(callback, ms) {
	var timer = 0;
	return function() {
		var context = this, args = arguments;
		clearTimeout(timer);
		timer = setTimeout(function () {
			callback.apply(context, args);
		}, ms || 0);
	};
}

// *******************************************
// ************ AJAX START *******************
// *******************************************
function loadFullNoiDataAjax() {
	$.ajax({
		type: "POST",
		data: {
			action: 'getFullNoiData'
		},
		url: "./bin/ajaxDataHandlers.php",
		success: function(data) {
			NOIdata = JSON.parse(data);
			loadDefaultSideGroups();
		},
		error: function() {
			console.log('Errore '+action);
		}
	}).done(function(data) {
		$('.search-container .loader').fadeOut();
		$('#mapContainer .loader').fadeOut();
		searchElementsStarter();
		clickableBehaviour();

		if(typeof(requestedLang)!='undefined' && requestedLang!=null && requestedLang!='') {
			//console.log(requestedLang);
			if(JSON.parse(requestedLang)!=language) {
				if($(".language-selector a[data-language='"+JSON.parse(requestedLang)+"']").length>0) {					
					$(".language-selector .dropdown-trigger").click();
					$(".language-selector a[data-language='"+JSON.parse(requestedLang)+"']").eq(0).click();
				}
			}
		}

		if(typeof(requestedElement)!='undefined' && requestedElement!=null && requestedElement!='') {
			clickedElement((JSON.parse(requestedElement)).toUpperCase());
		}
	});
}
function loadDefaultSideGroups() {
	$.ajax({
		beforeSend: function(xhr) {
			isAjaxSearching = true;
		},
		type: "POST",
		data: {
			action: 'getSearchResult',
			language: language
		},
		url: "./bin/ajaxDataHandlers.php",
		success: function(data) {			
			try {
				$(".category-group-container").hide().empty();
				var html = JSON.parse(data);
				originalSideGroups = html;
				$(".category-group-container").html(html).fadeIn();
			}catch(err){}
			dropdownToggle();
			clickableBehaviour();
			$(".search-container .loader").slideToggle(100,function(){$(".search-container .loader").hide();});
		}
	})
	.fail(function(jqXHR, status, errorThrown) {
		console.log(jqXHR.responseText);
		console.log(status);
		console.log(errorThrown);
	})
	.always(function() {
		isAjaxSearching = false;
	});
}
function loadAfterSearch(foundedRooms) {
	if(typeof(foundedRooms)!='undefined') {
		ajaxSearch = $.ajax({
			beforeSend: function(xhr) {
				isAjaxSearching = true;
			},
			type: "POST",
			data: {
				action: 'getSearchResult',
				rooms: foundedRooms,
				language: language
			},
			url: "./bin/ajaxDataHandlers.php",
			success: function(data) {
				try {
					$(".category-group-container").hide().empty();
					var html = JSON.parse(data);
					$(".category-group-container").html(html).fadeIn();
				}catch(err){}

				dropdownToggle();
				clickableBehaviour();
			}
		})
		.fail(function(jqXHR, status, errorThrown) {
			console.log(jqXHR.responseText);
			console.log(status);
			console.log(errorThrown);
		})
		.always(function() {
			isAjaxSearching = false;
			$(".loader").slideToggle(100,function(){$(".loader").hide();});
		});
	}
}
// *******************************************
// ************ AJAX END *********************
// *******************************************

function languageSelector() {
	$(".language-selector:not(.language-selector-desktop) a").click(function(e) {
	//console.log('qui');
		$(".loader:not(.loader-map)").fadeIn();
		var thisEl = $(this);
		language = thisEl.attr('data-language');
		if(typeof(language)!='undefined' && typeof(translations)!='undefined') {
			closeTooltip();
			var prevLang = thisEl.parents('.dropdown').find('.dropdown-trigger').attr('data-language');
			thisEl.parents('.dropdown').find('.dropdown-trigger').attr('data-language',language);
			thisEl.parents('.dropdown-list').find('li a').each(function() {
				//console.log($(this).attr('data-language'));
				if($(this).attr('data-language') != language) {
					return true;
				}
				$(this).attr('data-language',prevLang);
			});
			$('.translatable').each(function() {
				$(this).text(getTranslation($(this).text()));
				if(typeof($(this).attr('placeholder'))!=='undefined' && $(this).attr('placeholder').length>0) {
					//console.log($(this).attr('placeholder'));
					$(this).attr('placeholder', getTranslation($(this).attr('placeholder')));
				}
			});

			if(typeof($(".search-container .search").val())!='undefined' && $(".search-container .search").val().length>minCharsToSearch) {
				searchElements($(".search-container .search").val());
			} else {
				loadDefaultSideGroups();
			}

			translateLinks();
		}
		//console.log(thisEl.parents('.dropdown').find('.dropdown-list'));
		thisEl.parents('.dropdown').find('.dropdown-list').slideUp('fast',function(){
			thisEl.parents('.dropdown').removeClass('open');
			$(".language-selector-desktop li").removeClass('active');
			$(".language-selector-desktop li a[data-language='"+language+"']").parent('li').addClass('active');
		});
		e.preventDefault();
		return false;
	});
	
	$(".language-selector-desktop li a").click(function(e) {
		$(".language-selector-desktop li").removeClass('active');
		$(this).parent().addClass('active');
		$(".language-selector:not(.language-selector-desktop) a[data-language='"+$(this).attr('data-language')+"']").click();
		e.preventDefault();
		return false;
	});
}

function translateLinks() {
	if(typeof(language)!=='undefined' && typeof(localizedLinks)!=='undefined' && localizedLinks!==null) {
		$("a.link-translatable").each(function() {
			var thisLink = $(this);
			var thisLinkTraslationID = thisLink.data('link-traslation');
			if(
				typeof thisLinkTraslationID !== 'undefined' && thisLinkTraslationID !== null &&
				typeof localizedLinks[thisLinkTraslationID] !== 'undefined' && localizedLinks[thisLinkTraslationID] !== null &&
				typeof localizedLinks[thisLinkTraslationID][language] !== 'undefined' && localizedLinks[thisLinkTraslationID][language] !== null
			) {
				thisLink.attr('href',localizedLinks[thisLinkTraslationID][language]);
			}
		});
	}
}

function getTranslation(string) {
	if(typeof(string)!='undefined' && string.length>0) {
		var index2 = translations.findIndex(function(item, index) {
			return (item.it === string) || (item.en === string) || (item.de === string) ? true : false;
		});
		if(typeof(index2)!='undefined' && index2!==-1) {
			return translations[index2][language];
		} else {
			console.error('Nessuna traduzione per '+string);
		}
	}
	return string;
}

function langSwitcherLabels() {
	$(".language-tag").each(function() {
		var thisEl = $(this);
		if(typeof thisEl.attr('data-language') !== 'undefined' && thisEl.attr('data-language')!=='' ) {
			if(typeof jsMediaQueryTester!== 'undefined' && $(jsMediaQueryTester).length>0 && $(jsMediaQueryTester).outerWidth()<=30) {
				switch(thisEl.attr('data-language')) {
					case 'it':
						thisEl.text(getTranslation('Italiano'));
					break;
					case 'en':
						thisEl.text(getTranslation('Inglese'));
					break;
					case 'de':
						thisEl.text(getTranslation('Tedesco'));
					break;
				}
			} else {
				switch(thisEl.attr('data-language')) {
					case 'it':
						thisEl.text('IT');
					break;
					case 'en':
						thisEl.text('EN');
					break;
					case 'de':
						thisEl.text('DE');
					break;
				}
			}
		}
	});
}

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
		var thisEl = $(this);
		var thisElText = thisEl.text();		
		var current = thisEl.parents('.dropdown').find('.dropdown-trigger');
		var currentText = current.text();
		current.text(thisElText);
		thisEl.text(currentText);
	});
}
function mapContainerHeight(){
	var headerH = $(".header").outerHeight();
	var footerH = $(".panel-footer-container").outerHeight();

	var cookieH = $(".cm-cookies").outerHeight();

	var windowH = $(window).height();
		

	currentMediaQuery = $(jsMediaQueryTester).outerWidth();
	
		
	console.log(currentMediaQuery);
	if ($('body').hasClass('cm-banner-active')) {
		if(currentMediaQuery < 50){
			$("#mapContainer").css('height',windowH-headerH-cookieH);
			$("#mapContainer").css('margin-top',headerH);
			$(".panel-footer-container").css('bottom','');
		} else {
			$("#mapContainer").css('height',windowH-headerH-footerH-cookieH);
			$("#mapContainer").css('margin-top',headerH);
			$(".panel-footer-container").css('bottom',cookieH);
		}
	} else {
		if(currentMediaQuery < 50){
			$("#mapContainer").css('height',windowH-headerH);
			$("#mapContainer").css('margin-top',headerH);
		} else {
			$("#mapContainer").css('height',windowH-headerH-footerH);
			$("#mapContainer").css('margin-top',headerH);
		}
	}
}

function sharerBehaviours() {
	$("#copy-sharer-url").click(function() {
		var copyText = document.getElementById("sharer-url-input");
		copyText.select();
		document.execCommand("copy");

		var originalText = $("#copy-sharer-url").text();
		var copiedText = getTranslation('Copiato!');

		$("#copy-sharer-url").text(copiedText);
		setTimeout(function() {
			$("#copy-sharer-url").text(originalText);
		},1000);
	});
	$('.sharer-container').click(function(evt) {
		if(typeof(evt)!='undefined' && typeof(evt.target)!='undefined' && !$(evt.target).hasClass('sharer') && !$(evt.target).parents('.sharer').length>0 ) {
			$('.sharer-container').fadeOut(function() {
				$('.sharer-container').addClass('hide');
			});
		}
	});
}

function tooltipViewport(){
	$('.tooltip .card').removeClass('overflow-right');
	$('.tooltip .card').removeClass('overflow-bottom');

	if($('.tooltip').hasClass('active')) {
		if( ($('.tooltip').position().left+$('.tooltip .card').outerWidth()) > $('#mapContainer').innerWidth()) {
			$('.tooltip .card').addClass('overflow-right');
		}
		if( ($('.tooltip').position().top+$('.tooltip .card').outerHeight()) > $('#mapContainer').innerHeight()) {
			$('.tooltip .card').addClass('overflow-bottom');
		}
	}
}

function filtersBehaviours() {
	$(".all-filters-checkbox").click(function(){
		if($(this).is(':checked')) {
			$(".filter-container .single-filter .filter-trigger").prop( "checked", true );
		} else {
			$(".filter-container .single-filter .filter-trigger").prop( "checked", false );
		}
		$(".filter-container .single-filter .filter-trigger").trigger('change');
	});

	$(".filters .single-filter .filter-trigger").change(function(){
		var thisEl = $(this);
		if(typeof thisEl.data('category')!== 'undefined' && thisEl.data('category').length>0 ) {
			if($(this).is(':checked')) {
				$('g[data-category="'+thisEl.data('category')+'"] svg').fadeIn('fast');
			} else {
				$('g[data-category="'+thisEl.data('category')+'"] svg').fadeOut('fast');
			}
		}		
	});
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

function roomQRCode() {
	if($('body').hasClass('totem') && typeof QRCode !== 'undefined') {
		qrcode = new QRCode(document.getElementById("room-qrcode"), {
			text: location.origin+location.pathname,
			width: 100,
			height: 100,
			colorDark : "#000000",
			colorLight : "#ffffff",
			correctLevel : QRCode.CorrectLevel.L
		});
	}
}

function resizeEndActions(){
	setTooltipPosition();
	mapContainerHeight();
	tooltipViewport();
	//langSwitcherLabels();
	if(typeof controller === 'object' && controller !== null && typeof controller.moveBy!='undefined') {
		try {
			controller.moveBy(0.001, 0.001);
		}catch(err) {}
	}
}


//Everything's ready and loaded
$(window).load(function() {
	loadFullNoiDataAjax();
});

$(document).ready(function() {
	$('body').addClass(bodyClassesUA());
	
	if(typeof(mapContainer) == 'undefined' || mapContainer == null || mapContainer == '') {
		return false;
	}
	originalTooltip = $('.tooltip').html();
	originalFloorsZoomSelector = $('.floors-zoom-selector').html();

	setupMapBehaviours();
	filtersBehaviours();

	languageSelector();
	translateLinks();
	//langSwitcherLabels();
	mapContainerHeight();

	sharerBehaviours();
	dropdownToggle();
	dropdownSelection();
	tooltipViewport();

	totemChangeLinks();
	roomQRCode();

	if(!!('ontouchstart' in window)){ //check for touch device
		$('html').addClass('touch');
	} else{ //behaviour and events for pointing device like mouse
		$('html').addClass('no-touch');
	}

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
		if($('body').hasClass('search-open')) {
			$("input.search").focus();
		}
		setTimeout(function() {
			setTooltipPosition();
		},300);
	});
	$('.lang-trigger').on('click',function(){
		$('body').toggleClass('lang-open');
	});
	$('.lang-close').on('click',function(){
		$('body').removeClass('lang-open');
	});

	$("a.logo, a.site-title").click(function(){
		if($('body').hasClass('external')) {
			return false;
		}
	})


	$(window).resize(function() {
		clearTimeout(window.resizedFinished);
		window.resizedFinished = setTimeout(function(){
			resizeEndActions();
		}, 250);
	});

});

(function(e){"use strict";function r(t,n){this.opts=e.extend({handleKeys:!0,scrollEventKeys:[]},n);this.$container=t;this.$document=e(document);this.lockToScrollPos=[0,0];this.disable()}var t,n;n=r.prototype;n.disable=function(){var e=this;e.lockToScrollPos=[e.$container.scrollLeft(),e.$container.scrollTop()];e.$container.on("mousewheel.disablescroll DOMMouseScroll.disablescroll touchmove.disablescroll",e._handleWheel);e.$container.on("scroll.disablescroll",function(){e._handleScrollbar.call(e)});e.opts.handleKeys&&e.$document.on("keydown.disablescroll",function(t){e._handleKeydown.call(e,t)})};n.undo=function(){var e=this;e.$container.off(".disablescroll");e.opts.handleKeys&&e.$document.off(".disablescroll")};n._handleWheel=function(e){e.preventDefault()};n._handleScrollbar=function(){this.$container.scrollLeft(this.lockToScrollPos[0]);this.$container.scrollTop(this.lockToScrollPos[1])};n._handleKeydown=function(e){for(var t=0;t<this.opts.scrollEventKeys.length;t++)if(e.keyCode===this.opts.scrollEventKeys[t]){e.preventDefault();return}};e.fn.disablescroll=function(e){!t&&(typeof e=="object"||!e)?t=new r(this,e):t&&t[e]&&t[e].call(t)};window.UserScrollDisabler=r})(jQuery);
function bodyClassesUA(){var e=new UAParser,r=e.getResult();if("object"==typeof e){var s=[],o="";if(void 0!==r.browser.name)switch(o=r.browser.name.toLowerCase().replace(" ","-")){case"edge":o="browser-ie browser-edge browser-ie-edge";break;case"ie":o="browser-ie ",void 0!==r.browser.version&&(o+="browser-ie-"+r.browser.version.toLowerCase().replace(" ","-").replace(".0",""));break;case"safari":case"mobile-safari":o="browser-safari";break;case"waterfox":o="browser-waterfox browser-firefox";break;default:o="browser-"+o}else o="browser-unknown";if(s.push(o),void 0!==r.os.name){var a=r.os.name.toLowerCase().replace(" ","-");switch(a){case"ios":case"mac-os":a="osx"}s.push("os-"+a)}return void 0!==r.device.model&&s.push(r.device.model.toLowerCase().replace(" ","-")),s=s.join(" ")}}