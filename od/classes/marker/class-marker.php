<?php

/**
 * Custom Post Type subclass
 */
class Marker extends PostType
{
	/**
	 * Required variables
	 */
	protected $post_type = 'marker';
	protected $label_name = 'Markers';
	protected $label_name_singular = 'Marker';
	protected $args = array(
		'menu_icon' => 'dashicons-location',
		'capability_type' 	=> 'marker',
		'capabilities' 			=> array(
			'publish_posts' 		=> 'publish_marker',
			'edit_posts' 			=> 'edit_marker',
			'edit_others_posts' 	=> 'edit_others_marker',
			'delete_posts' 			=> 'delete_marker',
			'delete_others_posts' 	=> 'delete_others_marker',
			'read_private_posts' 	=> 'read_private_marker',
			'edit_post' 			=> 'edit_marker',
			'delete_post' 			=> 'delete_marker',
			'read_post' 			=> 'read_marker',
		),
	);
	private $oTheme = null;

	/**
	 * Output Marker HTML snippet
	 */
	public function GetHtml()
	{
		// init
		global $post;
		$post = $this->post;
		setup_postdata($post);

		// theme
		$oTheme = new stdClass;
		$oTheme->id = $this->GetTheme()->Get('ID');
		$oTheme->title = $this->GetTheme()->Get('post_title');
		$oTheme->permalink = get_the_permalink($this->GetTheme()->Get('ID'));

		// thumbnail
		$oThumb = new stdClass;
		$oThumb->exists = has_post_thumbnail();
		$oThumb->img = get_the_post_thumbnail($post, 'header_image');
		$oThumb->url = $this->GetThumbnailUrl();
		$oThumb->caption = get_the_post_thumbnail_caption();

		// related markers
		$aRelated = array();
		if(is_array(get_field('marker_related'))) {
			foreach(get_field('marker_related') as $oRelated) {
				if ($oRelated->post_status == 'publish' && $oRelated->ID != $this->Get('ID')) {
					$aMarker = array(
						'imageSrc' => reset(wp_get_attachment_image_src(get_post_thumbnail_id($oRelated->ID), 'related')),
						'year' 		=> get_field('image_year', $oRelated->ID),
						'url' 		=> get_permalink($oRelated->ID),
					);
					$aRelated[] = $aMarker;
				}
			}
		}

		$aActiveYears = $this->getYears();

		$sSocial = Template::Get('snippet-social.php', $this->Get('ID'));

		// prepare vars
		$aVars = array(
			'classes' 		=> implode(" ", get_post_class()),
			'id' 			=> $this->Get('ID'),
			'content'		=> apply_filters('the_content',get_the_content()),
			'aRelated' 		=> $aRelated,
			'theme' 		=> $oTheme,
			'thumbnail'		=> $oThumb,
			'imageSV'		=> get_field('image_sv'),
			'aYears'		=> $aActiveYears,
			'social'		=> $sSocial,
		);

		// reset postdata
		wp_reset_postdata();

		// return template
		return Template::Get('snippet-marker.php', $aVars);
	}

	/**
	 * Get theme connected to this marker
	 */
	public function GetTheme()
	{
		// try object cache
		if(is_null($this->oTheme)) {
			// get theme post object
			$post = get_field('theme', $this->Get('ID'));

			$this->oTheme = new Theme($post);
		}

		// return
		return $this->oTheme;
	}

	/**
	 * Get marker json for ajax respons
	 */
	public function GetJson()
	{
		// init
		$oJson = new stdClass();
		$aLocation = get_field( 'marker_location', $this->Get('ID') );

		// set json
		$oJson->title = $this->Get('post_title');
		$oJson->thumbnailUrl = $this->GetThumbnail();
		$oJson->photoYear = get_field('image_year', $this->Get('ID'));
		$oJson->lat = $aLocation['lat'];
		$oJson->lng = $aLocation['lng'];
		$oJson->url = get_permalink($this->Get('ID'));

		return $oJson;
	}

	/**
	 * Get years connected to this marker
	 */
	public function GetYears($return = 'name')
	{
		// init
		$aYears = array();

		// get year term objects
		$aTerms = wp_get_post_terms($this->Get('ID'), 'year');
		foreach($aTerms as $oTerm) {
			if($return == 'object') {
				$aYears[$oTerm->slug] = new Taxonomy_Year($oTerm);
			} else {
				$aYears[$oTerm->term_id] = $oTerm->name; // just return year, not whole object
			}
		}

		return $aYears;
	}

	/**
	 * Get image connected to this marker
	 */
	public function GetThumbnail()
	{
		// set thumbnailsize
		$sThumbnailSize = 'marker_hover';

		// get thumbnail url
		$iThumbnailID = get_post_thumbnail_id($this->Get('ID'));
		$aThumbnail = wp_get_attachment_image_src($iThumbnailID, $sThumbnailSize);

		// return
		return $aThumbnail[0];
	}

	/**
	 * Get image url connected to this page in order to display in fancybox
	 */
	public function GetThumbnailUrl()
	{
		// set thumbnailsize
		$sThumbnailSize = 'fancybox';

		// get thumbnail url
		$iThumbnailID = get_post_thumbnail_id($this->Get('ID'));
		$aThumbnail = wp_get_attachment_image_src($iThumbnailID, $sThumbnailSize);

		// return
		return $aThumbnail[0];
	}

	/**
	 * Get all markers
	 */
	public static function CreateAll()
	{
		// init
		$aMarkers = array();

		// get marker post objects
		$aPosts = get_posts(array(
			'posts_per_page' => -1,
			'post_type' 	=> 'marker',
    		'post_status' 	=> 'publish',
		));

		// create theme models and add to array
		foreach($aPosts as $post) {
			$oMarker = new Marker($post);
			$aMarkers[$oMarker->Get('ID')] = $oMarker;
		}

		// return
		return $aMarkers;
	}

	/**
	 * Get new markers
	 */
	public static function CreateRecent()
	{
		// init
		$aMarkers = array();

		// get marker post objects
		$aPosts = wp_get_recent_posts(array(
			'posts_per_page' => 10, /* nieuw op de kaart */
			'post_type' 	=> 'marker',
			'orderby' 		=> 'post_date',
    		'order' 		=> 'DESC',
    		'post_status' 	=> 'publish',
		), OBJECT);

		// create theme models and add to array
		foreach($aPosts as $post) {
			$oMarker = new Marker($post);
			$aMarkers[$oMarker->Get('ID')] = $oMarker;
		}

		// return
		return $aMarkers;
	}

}