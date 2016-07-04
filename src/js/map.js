/**
 * Historic map, wrapper for google map
 * @author Gijs Wilbrink
 */
MapHist.Map = function(elContainer, oApp) {
	// init
	this.oApp = oApp;
	this.elContainer = elContainer;
	this.oGMap = null;
	this.aGMarkers = [];
	this.zoom = 13;
	this.center = new google.maps.LatLng(51.9972792,4.1856514);
	this.searchMarker = new google.maps.Marker({
	    map: null,
	    draggable: false,
	    icon: '/wp-content/themes/westlandkaart/dist/svg/markersearch-result.svg',
	    cursor: 'hand'
	});

	// create google map
	this.createGMap(this.elContainer);

	// set events
	this.setEvents();

    // return
	return this;
};

/**
 * Map class methods
 */
MapHist.Map.prototype = {

	/**
	 * Create google map instance
	 */
	createGMap: function(elContainer) {
		// set zoom
		if(jQuery(window).width() <= 480) zoom = 11; // mobile is zoomed out

		// set map options
		var oMapOptions = {
			zoom: this.zoom,
			center: this.center,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false,
			panControl: false,
			zoomControl: false,
			minZoom:	11,
			maxZoom:	16,
			zoomControlOptions: {
			    position: google.maps.ControlPosition.RIGHT_BOTTOM,
			    style: google.maps.ZoomControlStyle.DEFAULT
			},
			streetViewControl: true,
			streetViewControlOptions: {
				position: google.maps.ControlPosition.LEFT_BOTTOM
			},
			styles: [
		  		{
					featureType: "poi",
					elementType: "labels",
					stylers: [{ visibility: "off" }]
				}, {
					featureType: "landscape",
					elementType: "labels",
					stylers: [{ visibility: "off" }]
				}
			]
		}

		// create map
		this.oGMap = new google.maps.Map(elContainer, oMapOptions);

		// set bounds
		this.setGMapBounds(new google.maps.LatLng(50.916994, 4.000932), new google.maps.LatLng(53.267986, 6.563359));

		// custom zoom controls
		this.customZoomControl();

		// prepare streetview
		this.prepareGMapStreetview();

		// return
		return this.oGMap;
	},

	/**
	 * Set all dom events related to this map
	 */
	setEvents: function(){
		var oInstance = this;

		// Search address form
		document.querySelector('.search-adress').addEventListener("submit", function(e) {
			// get address
			var address = document.getElementById('search').value.toLowerCase();

			// search address
			var oloc_gmaps_geocoder = new google.maps.Geocoder();
			oloc_gmaps_geocoder.geocode( {'address': address}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					// set center
					oInstance.oGMap.setCenter(results[0].geometry.location);
					// set zoom
					oInstance.oGMap.fitBounds(results[0].geometry.viewport);
					// place search marker
					oInstance.searchMarker.setPosition(results[0].geometry.location);
					oInstance.searchMarker.setMap(oInstance.oGMap);
				}
			});

			e.preventDefault();
		});

		// Map / satellite mode
		document.querySelector(".map-mode").addEventListener('click', function(){
			// set opacity
			var opacityOffset = 90;
			var desiredOpacity = 60;
			if(parseInt(jQuery("#contrast").val(), 10) > opacityOffset) {
				jQuery("#contrast").val(desiredOpacity).change();
			}

			if(this.dataset.mode == "HYBRID") {
				// set to sattelite
				this.innerHTML = this.dataset.maptext;
				this.dataset.mode = "ROADMAP";
			} else {
				// set to roadmap
				this.innerHTML = this.dataset.hybridtext;
				this.dataset.mode = "HYBRID";
			}

			// set map type
			oInstance.oGMap.setMapTypeId(google.maps.MapTypeId[this.dataset.mode]);
		});

		// streetview
		document.addEventListener('click', function(e){
			// init element
			var el = e.target;

			// click on relative link
			if(el.classList.contains("streetview-image") || el.classList.contains("streetview-text")) {


				var elImage = document.querySelector(".streetview-image");
				var elText = document.querySelector(".streetview-text");

				// show
				if(elText.innerText == elText.dataset.enabletxt) {

					// set text
					elText.innerText = elText.dataset.disabletxt;

					// prepare vars
					var zoom = elImage.dataset.zoom;
					if(typeof zoom == 'undefined') zoom = 1;
					var aLocation = oInstance.getParameterByName("location", elImage.src).split(",");

					// set streetview vars
					var panorama = oInstance.oGMap.getStreetView();
					panorama.setPosition(new google.maps.LatLng(aLocation[0],aLocation[1]));

					panorama.setPov({
					    heading: parseFloat(oInstance.getParameterByName("heading", elImage.src)),
					    pitch: parseFloat(oInstance.getParameterByName("pitch", elImage.src)),
					    zoom: zoom
					});

					// show streetview
					panorama.setVisible(true);
				}
				// hide
				else {


   					// set text
   					elText.innerText = elText.dataset.enabletxt;

   					// hide streetview
		   			oInstance.oGMap.getStreetView().setVisible(false);
		   		}
				Mobile_ShowMap();
		   	}
		});
	},

	/**
	 * Util function to get a variable form a querystring
	 */
	getParameterByName: function(name, url) {
	    if (!url) url = window.location.href;
	    name = name.replace(/[\[\]]/g, "\\$&");
	    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	        results = regex.exec(url);
	    if (!results) return null;
	    if (!results[2]) return '';
	    return decodeURIComponent(results[2].replace(/\+/g, " "));
	},

	/**
	 * Enable marker clustering
	 */
	setMarkerClustering: function(){
		var mcOptions = {
			gridSize: 20,
			maxZoom: 15,
			styles: [{
				url: '/wp-content/themes/westlandkaart/dist/svg/marker-cluster.svg',
				width: 33,
				height: 50,
				anchor: [3.5, 0],
				textColor: '#757172',
				textSize: 18
			}]
		};

		if(typeof this.oCluster != 'undefined') {
			this.oCluster.clearMarkers();
			this.oCluster.addMarkers(this.aGMarkers);
		} else {
			this.oCluster = new MarkerClusterer(this.oGMap, this.aGMarkers, mcOptions);
		}
	},
	/**
	 * Set google map bounds
	 */
	setGMapBounds: function(point1, point2) {
		var oInstance = this;
		var strictBounds = new google.maps.LatLngBounds(point1, point2);

		// Listen for the dragend event
		google.maps.event.addListener(oInstance.oGMap, 'dragend', function() {
			if (strictBounds.contains(oInstance.oGMap.getCenter())) return;

			// We're out of bounds - Move the map back within the bounds
			var c = oInstance.oGMap.getCenter(),
			x = c.lng(),
			y = c.lat(),
			maxX = strictBounds.getNorthEast().lng(),
			maxY = strictBounds.getNorthEast().lat(),
			minX = strictBounds.getSouthWest().lng(),
			minY = strictBounds.getSouthWest().lat();

			if (x < minX) x = minX;
			if (x > maxX) x = maxX;
			if (y < minY) y = minY;
			if (y > maxY) y = maxY;

			oInstance.oGMap.setCenter(new google.maps.LatLng(y, x));
		});
	},

	/**
	 * Prepare google maps for streetview
	 */
	prepareGMapStreetview: function() {
		// Get close button and insert it into streetView (same code as in markerlinks.js)
		// #button can be anyt dom element
		jQuery("body").append('<span id="customClose" class="customClose streetviewClose">&times;</span>');
		var customClose = document.getElementById("customClose");

		// set options for when in StreetView
		var panorama = this.oGMap.getStreetView();
		var panoOptions = {
			panControlOptions:  { position: google.maps.ControlPosition.LEFT_BOTTOM },
			zoomControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM },
			enableCloseButton: true,
		};
		panorama.setOptions(panoOptions);

		// Listen for click event on custom button
		google.maps.event.addDomListener(customClose, 'click', function(){
			panorama.setVisible(false);
		});

		panorama.controls[ google.maps.ControlPosition.TOP_RIGHT ].push( customClose );

		// add streetview close event listener
		google.maps.event.addListener(panorama, 'visible_changed', function() {
			var elText = document.querySelector(".streetview-text");
			if(typeof elText != 'undefined' && elText != null) {
		    	if (panorama.getVisible()) {
		    		elText.innerText = elText.dataset.disabletxt;
		    	} else {
				   	elText.innerText = elText.dataset.enabletxt;
			    }
			}
		});
	},

	/**
	 * Returns the google map instance
	 */
	getGMap: function() {
		if(this.oGMap == null || typeof this.oGMap == 'undefined') {
			this.createGMap(this.elContainer);
		}
		return this.oGMap;
	},

	/**
	 * Place markers onto the map by array
	 * @attr aJsonData an array with raw marker data to load into models
	 */
	placeMarkers: function (aJsonData){
		var iOldMarkers = this.aGMarkers.length;
		var iNewMarkers= aJsonData.length;

		this.clearMarkers();

		// loop markers
		for(var i = 0; i < aJsonData.length; i++) {
			// create new marker oInstance
			var oMarker = new MapHist.Marker(aJsonData[i], this.oApp);
			var oGMarker = oMarker.place(this);
			this.aGMarkers.push(oGMarker);
		}

		this.setMarkerClustering();

		// reset zoom and center so we can actually see the new markers
		/*if(iNewMarkers > iOldMarkers) {
			this.resetZoom();
		}*/
	},

	/**
	 * Reset the zoom level of the map
	 */
	resetZoom: function(){
		this.oGMap.setCenter(this.center);
		this.oGMap.setZoom(this.zoom);
	},

	/**
	 * Remove all markers
	 */
	clearMarkers: function() {
		// set markers to null map
		for(var key in this.aGMarkers) {
			this.aGMarkers[key].setMap(null);
		}
		// clear cluster
		if(typeof this.oCluster != 'undefined') {
			this.oCluster.clearMarkers();
		}

		// clear internal markers array
		delete this.aGMarkers;
		this.aGMarkers = [];
	},

	/**
	 * custom zoom controls
	 * @todo make this nicer and cleaner and shorter and evr'thang
	 */
	customZoomControl: function() {
	 	// init
		var oInstance = this;

		// Set CSS for the controls.
		var controlDiv = document.createElement('div');
		controlDiv.classList.add('zoomControls');
		controlDiv.index = -1;

		// zoom in
		var zoomin = document.createElement('div');
		zoomin.classList.add('zoomIn');
		zoomin.title = 'Click to zoom in';
		controlDiv.appendChild(zoomin);

		var zoominText = document.createElement('div');
		zoominText.classList.add('zoomText');
		zoominText.innerHTML = '<strong>+</strong>';
		zoomin.appendChild(zoominText);

		// zoom out
		var zoomout = document.createElement('div');
		zoomout.classList.add('zoomOut');
		zoomout.title = 'Click to zoom out';
		controlDiv.appendChild(zoomout);

		var zoomoutText = document.createElement('div');
		zoomoutText.classList.add('zoomText');
		zoomoutText.innerHTML = '<strong>-</strong>';
		zoomout.appendChild(zoomoutText);


		// Setup the click event listeners for zoom-in, zoom-out:
		google.maps.event.addDomListener(zoomout, 'click', function() {
		var currentZoomLevel = oInstance.oGMap.getZoom();
		if(currentZoomLevel != 0){
			oInstance.oGMap.setZoom(currentZoomLevel - 1);}
		});

		google.maps.event.addDomListener(zoomin, 'click', function() {
		var currentZoomLevel = oInstance.oGMap.getZoom();
		if(currentZoomLevel != 21){
			oInstance.oGMap.setZoom(currentZoomLevel + 1);}
		});


		var position = google.maps.ControlPosition.LEFT_BOTTOM;
		if(document.querySelector("html").classList.contains("touchscreen")) {
			position = google.maps.ControlPosition.BOTTOM_CENTER;
		}

		oInstance.oGMap.controls[position].push(controlDiv);
	},

	// appoint constructor
	constructor: MapHist.Map
};
