
<?php

class Control_GetJsonData {
	public function __construct()
	{
		// init
		$cleanUrl = strtok($_SERVER['REQUEST_URI'], '?');
		$oResponse = new StdClass();
		$oTheme = null;

		// get context (marker, theme, all themes, new markers)
		global $post;
		$post = get_post(url_to_postid($cleanUrl));
		if(is_null($post)) $post = get_page_by_path($cleanUrl);
		setup_postdata($post);

		// marker details
		if(get_post_type() == 'marker') {
			// load this marker's theme model
			$oMarker = new Marker($post);
			$oTheme = $oMarker->GetTheme();

			// load years
			$aYears = $oMarker->GetYears('object');

			// is current year in year array? pick that one
			$oYear = $aYears[$_GET['currentYear']];

			// is it not there? pick the most recent year
			if(is_null($oYear)) {
				$oYear = reset($aYears);
			}

			// content
			$oResponse->content = $oMarker->GetHtml();
		} 
		// theme details
		else if(get_post_type() == 'theme') {
			// load theme model
			$oTheme = new Theme($post);

			// load year
			$oYear = $oTheme->GetDefaultYear();

			// content
			$oResponse->content = $oTheme->GetHtml();
		}
		// page
		else {
			// load homepage is page not found
			if(is_null($post)) {
				$post = get_post(get_option('page_on_front'));
			}
			
			// year
			$oYear = Taxonomy_Year::CreateBySlug(2015);

			// content
			$oPage = new Page($post);
			$oResponse->content = $oPage->GetHtml();

			// new markers
			if($post->ID == NEWONMAP) {
				$oResponse->aMarkers = $this->ResponseMarkers(Marker::CreateRecent(), $oYear);
			} 

			// all markers
			else if($post->ID == ALLMARKERS) {
				$oResponse->aMarkers = $this->ResponseMarkers(Marker::CreateAll(), $oYear);
			}
		}

		// add theme to response
		if(is_object($oTheme)) {
			$oResponse->theme_id = $oTheme->Get('ID');
		} else {
			$oResponse->theme_id = 0;
		}

		// set post id
		$oResponse->post_id = $post->ID;

		// explicit year set? override year
		if(isset($_GET['jaar'])) {
			$oYear = Taxonomy_Year::CreateBySlug($_GET['jaar']);
		}

		// add markers and year
		if(is_object($oYear)) {
			// remember year
			$_SESSION['yearId'] = $oYear->Get('ID');

			// set theme
			if(is_object($oTheme)) {
				$oResponse->aMarkers = $this->ResponseMarkers($oTheme->GetMarkers(), $oYear, $oTheme);
			}

			// add year to response
			$oResponse->iYear = $oYear->Get('slug');
		}

		// get year output
		$oResponse->yearMenu = Template::Get('snippet-menu-year');

		// output
		die(json_encode($oResponse));
	}

	private function ResponseMarkers($aMarkers, $oYear, $oTheme = null)
	{
		// init
		global $post;
		$aResponse = array();


		// loop markers
		foreach($aMarkers as $oMarker) {
			// init
			$oJson = new stdClass;
			$aMarkerYears = $oMarker->GetYears('object');
			
			// get marker json
			$oJson = $oMarker->GetJson();

			// is this the current marker?
			if($oMarker->Get('ID') == $post->ID) {
				$oJson->active = true;
				$oJson->current = true;
			} 
			// is current year in marker years?
			else if(isset($aMarkerYears[$oYear->Get('slug')])) {
				$oJson->active = true;
			} 
			// marker not found in this year? is it at least the theme's default year
			else if(!is_null($oTheme) && $oYear->Get('slug') == $oTheme->GetDefaultYear()->Get('slug')) {
				$oJson->active = false;
			} 
			// post is no marker-posttype (but page)
			else if ($post->post_type == 'page') {

			}
			// no theme default and current year not connected to marker? skip marker
			else {
				unset($oJson);
				continue;
			}

			// add json
			$aResponse[] = $oJson;
		}

		return $aResponse;
	}
}