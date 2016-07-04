/**
 * Marker on a google map
 * @author Gijs Wilbrink
 */
MapHist.Marker = function(oJsonData, oApp) {
	// init
	this.oApp = oApp;
	this.oJsonData = null;
	this.oGMarker = null;

	// set icons
	var iconDir = '/wp-content/themes/westlandkaart/dist/svg';
	this.oIcons = {
		active: iconDir + '/marker.svg',
		inactive: iconDir + '/marker-inactive.svg',
		hover: iconDir + '/marker-hover.svg',
		current: iconDir+ '/marker-current.svg'
	}
	this.defaultIcon = this.oIcons.active;

	// immediately load data
	this.loadData(oJsonData);

	// return
	return this;
};

/**
 * Marker class methods
 */
MapHist.Marker.prototype = {

	/**
	 * load json data
	 */
	loadData: function(oJsonData){
		// clear old data
		delete this.oJsonData;

		// set new data
		this.oJsonData = oJsonData;
		for(var key in oJsonData) {
			this[key] = oJsonData[key];
		}
	},

	/**
	 * place the marker onto the screen
	 */
	place: function(oMap) {
		// init
		var oGMap = oMap.getGMap();

		// chose icon file
		if(this.current == true) {
			this.defaultIcon = this.oIcons.current;
		} else if(this.active == true) {
			this.defaultIcon = this.oIcons.active;
		} else {
			this.defaultIcon = this.oIcons.inactive;
		}

		// add marker to map
		this.oGMarker = new google.maps.Marker({
			map: oGMap,
			position: new google.maps.LatLng(this.lat,this.lng),
			draggable: false,
			icon: this.defaultIcon
		});

		// create infowinfow
		this.infoWindow = this.createInfoWindow();

		// add events
		this.addEvents(oMap);

		return this.oGMarker;
	},

	/**
	 * Set all dom events related to this marker
	 */
	addEvents: function(oMap) {
		// init
		var oGMap = oMap.getGMap();
		var oInstance = this;

		// mouse over: show infowindow
		google.maps.event.addListener(this.oGMarker, "mouseover", function(){
			// close any currently open windows
			if(typeof oMap.currentInfoWindow == 'object') {
				oMap.currentInfoWindow.close(oGMap);
			}
			// open window
			oMap.currentInfoWindow = oInstance.infoWindow;
			oMap.currentInfoWindow.open(oGMap, oInstance.oGMarker);

			// change icon
			oInstance.oGMarker.setIcon(oInstance.oIcons.hover);
		});

		// mouse out: hide infowindow
		google.maps.event.addListener(this.oGMarker, "mouseout", function(){
			// hide infowindow
			oInstance.infoWindow.close();

			// change icon
			oInstance.oGMarker.setIcon(oInstance.defaultIcon);
		});

		// click: go to marker
		google.maps.event.addListener(this.oGMarker, "click", function(){
			// change window url
			var url = oInstance.url;
			var oState = {};
			var title = oInstance.title;
			history.pushState(oState, title, url);

			if(typeof oMap.currentInfoWindow == 'object') {
				oMap.currentInfoWindow.close(oGMap);
			}

			// refresh app state
			oInstance.oApp.refreshState();
		});
	},

	/**
	 * create info window
	 */
	createInfoWindow: function() {
		// set data
		var infoWindow = new InfoBox({
			content: MapHist.Template('template-infowindow', this)
			,disableAutoPan: true
			,maxWidth: 0
			,pixelOffset: new google.maps.Size(-140, 0)
			,zIndex: null
			,boxStyle: {}
			,closeBoxMargin: ""
			,closeBoxURL: "/wp-content/themes/westlandkaart/dist/img/close.png"
			,infoBoxClearance: new google.maps.Size(1, 1)
			,isHidden: false
			,pane: "floatPane"
			,enableEventPropagation: false
		});

		return infoWindow;
	},

	// appoint constructor
	constructor: MapHist.Marker
};
