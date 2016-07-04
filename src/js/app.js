/**
 * Mapping History App, calls all the other models
 * @author Gijs Wilbrink
 */
MapHist.App = function(elContainer) {
	// init
	this.theme_id = 0;
	this.oMap = new MapHist.Map(elContainer, this);
	this.oOverlay = new MapHist.Overlay(this.oMap.getGMap());

	// set initial state
	this.refreshState();

	// set events
	this.setEvents();

	// return
	return this;
};

/**
 * Map class methods
 */
MapHist.App.prototype = {

	/**
	 * Refresh the app state
	 * Retreives JSON by AJAX according to current url
	 * On load and possible to call after history pushstate
	 * Loads markers, year overlay and content
	 */
	refreshState: function() {
		var oInstance = this;

		Mobile_HideMap();

		var url = oInstance.updateQueryString(window.location.href, 'control', 'GetJsonData');
		if(url.indexOf('jaar') === -1) url = oInstance.updateQueryString(url, 'currentYear', oInstance.oOverlay.currentYear);
		// jQuery ajax call (why not?)
		jQuery.getJSON(url, function(oData){
			// use test data if ajax doesnt return json
			if(oData === null) return;

			// place markers
			if(typeof oData.aMarkers !== 'undefined') {
				oInstance.oMap.placeMarkers(oData.aMarkers);
			}

			// set zoom
			if(oData.theme_id != oInstance.theme_id) {
				oInstance.oMap.resetZoom();
				oInstance.theme_id = oData.theme_id;
			}

			// set year
			if(typeof oData.iYear !== 'undefined' && oData.iYear) {
				oInstance.oOverlay.loadYear(oData.iYear);
				document.querySelector(".year button").innerText = oData.iYear;
				document.querySelector(".year").innerHTML = document.querySelector(".year button").outerHTML + oData.yearMenu;
			}

			// show content
			if(typeof oData.content !== 'undefined') {
				// check if content needs to be refreshed
				var $main = jQuery("main");
				if($main.attr("id") != 'post-' + oData.post_id) {
					// refresh content
					$main.replaceWith(oData.content);

					// always show content div after reloading
					jQuery("main").css("display", "block");
				}
			}
		});
	},

	/**
	 * Events that should refresh the application state
	 */
	setEvents: function() {
		var oInstance = this;
		var $ = jQuery;
		// add click event to document, to catch current and future elements
		$(document).on('click', 'a', function(e){
				
			var $el = $(this);
			// click on relative link
			if(
				$el.attr("href") != '#' && $el.attr("href").substr(-4) != '.jpg' && $el.attr("href").substr(-4) != '.gif' && $el.attr("href").substr(-4) != '.png' && $el.attr("href").substr(-5) != '.jpeg' && // it's not a file
				($el.attr("href").substr(0, 4) != 'http' || $el.attr("href").indexOf(document.domain) > 0)) { // it's within the same domain
				
				// change window url
				var url = $el.attr("href");
				var oState = {};
				var title = $el.text();
				history.pushState(oState, title, url);

				// refresh app state
				oInstance.refreshState();

				// preload year if we already know it
				if(oInstance.getQueryString('jaar')) {
					var year = oInstance.getQueryString('jaar');
					oInstance.oOverlay.loadYear(year);
					document.querySelector(".year button").innerText = year;
				}

				// clear map while we wait
				oInstance.oMap.oGMap.getStreetView().setVisible(false);
				oInstance.oMap.clearMarkers();

				// don't follow link
				e.preventDefault();
				return;
			}			
		});

		// back button support
		window.addEventListener('popstate', function(){
			oInstance.refreshState();
		});
	},

	/**
	 * Small util function. Move on people, nothing to see here.
	 */
	updateQueryString: function (uri, key, value) {
		var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
		var separator = uri.indexOf('?') !== -1 ? "&" : "?";
		if (uri.match(re)) {
			return uri.replace(re, '$1' + key + "=" + value + '$2');
		} else {
			return uri + separator + key + "=" + value;
 		}
	},

	/**
	 * Small util function. Move on people, nothing to see here.
	 */
	getQueryString: function(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		    results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	},

	// appoint constructor
	constructor: MapHist.App
}
