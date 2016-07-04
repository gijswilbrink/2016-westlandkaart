/**
 *	Mapping History overlay of a certain year
 *	@author Gijs Wilbrink
 */

/**
 * Map overlay of a certain year
 * @author Gijs Wilbrink
 */
MapHist.Overlay = function(oGMap) {
	// init
	this.baseUrl = "https://s3.eu-central-1.amazonaws.com/mh-westland/tiles"
	this.oGMap = oGMap;
	this.currentYear = 0;
	this.opacity = 1;
	this.oGMapType = google.maps.MapTypeId.ROADMAP;
	this.oOverlay = null;

	this.setEvents();

	// return
	return this;
};

/**
 * Map class methods
 */
MapHist.Overlay.prototype = {

	/**
	  * Get current year
	  */
	getCurrentYear: function() {
		return this.currentYear;
	},

	setOpacity: function(opacity){
		if(this.oOverlay != null) {
			this.opacity = opacity;
			this.oOverlay.setOpacity(this.opacity);
		}
	},

	/**
	 * Set all dom events related to this overlay
	 */
	setEvents: function(){
		var oInstance = this;
		document.getElementById("contrast").addEventListener('input', function() {
			var value = Math.round(jQuery(this).val());
			jQuery("#contrast-value").text(value);
			oInstance.setOpacity(value / 100);
		});
	},

	/**
	 * Load overlay tiles of a year
	 * @attr year the year to load
	 * @attr force reload tiles, even though the year is already the current overlay
	 */
	loadYear: function(year, force) {
		// check
		if(this.currentYear == year && force !== true) return;

		// set current year
		var instance = this;
		year = parseInt(year, 10);
		this.currentYear = year;
		var instance = this;
		// load overlay
		this.oOverlay = new google.maps.ImageMapType({
			getTileUrl: function(coord,zoom){
				var url = instance.baseUrl + "/" + year + "/" + instance.getPngFile(coord.x, coord.y, zoom);
				return url;
			},
			tileSize: new google.maps.Size(256,256),
			opacity: this.opacity,
			isPng: true
		});

		// reset zoom
		this.oGMap.overlayMapTypes.setAt(0, this.oOverlay);
		//this.oGMap.setZoom(parseInt(this.oGMap.getZoom()));
	},

	/**
	 * Refresh the current year
	 */
	refresh: function() {
		this.loadYear(this.currentYear);
	},

	/**
	 * Get the filename of the tiles png
	 */
	getPngFile: function(tx, ty, zl) {
		quad = "";
		for (var i = zl; i > 0; i--) {
			var mask = 1 << (i - 1);
			var cell = 0;
			if ((tx & mask) !== 0) { cell++; }
			if ((ty & mask) !== 0) { cell += 2; }
			quad += cell;
		}
		return quad + '.png';
	},

	// appoint constructor
	constructor: MapHist.Year
};
