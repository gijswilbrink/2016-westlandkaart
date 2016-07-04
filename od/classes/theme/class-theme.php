<?php

/**
 * Custom Post Type subclass
 */
class Theme extends PostType
{
	/**
	 * Required variables
	 */
	protected $post_type = 'theme';
	protected $label_name = 'Kaartthema\'s';
	protected $label_name_singular = 'Kaartthema';
	protected $args = array(
		'labels' 		=> array(
			'add_new' 		=> 'Nieuw kaartthema',
			'add_new_item' 	=> 'Nieuw kaartthema',
		),
		'menu_icon' => 'dashicons-tag',

		'capability_type' 	=> 'theme',
		'capabilities' 			=> array(
			'publish_posts' 		=> 'publish_theme',
			'edit_posts' 			=> 'edit_theme',
			'edit_others_posts' 	=> 'edit_others_theme',
			'delete_posts' 			=> 'delete_theme',
			'delete_others_posts' 	=> 'delete_others_theme',
			'read_private_posts' 	=> 'read_private_theme',
			'edit_post' 			=> 'edit_theme',
			'delete_post' 			=> 'delete_theme',
			'read_post' 			=> 'read_marker',
		),
	);

	/**
	 * Get markers in this theme
	 */
	public function GetMarkers()
	{

		// init
		$aMarkers = array();

		// get marker post objects
		$aPosts = get_posts(array(
			'posts_per_page' => -1,
			'post_type' => 'marker',
			'meta_query' => array(
				array(
					'key' => 'theme', // name of custom field
					'value' => $this->Get('ID'), // matches exaclty "123", not just 123. This prevents a match for "1234"
					'compare' => '='
				)
			)
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
	 * Output HTML snippet
	 */
	public function GetHtml()
	{
		// init
		global $post;
		$post = $this->post;
		setup_postdata($post);

		// thumbnail
		$oThumb = new stdClass;
		$oThumb->exists = has_post_thumbnail();
		$oThumb->img = get_the_post_thumbnail($post, 'header_image');
		$oThumb->url = $this->GetThumbnailUrl();
		$oThumb->caption = get_the_post_thumbnail_caption();

		$aActiveYears = $this->getYears();

		$sSocial = Template::Get('snippet-social.php', $this->Get('ID'));

		// prepare vars
		$aVars = array(
			'classes' 		=> implode(" ", get_post_class()),
			'id' 			=> $this->Get('ID'),
			'title'			=> get_the_title(),
			'content'		=> apply_filters('the_content',get_the_content()),
			'thumbnail'		=> $oThumb,
			'years' 		=> $aActiveYears,
			'social'		=> $sSocial,
		);

		// reset postdata
		wp_reset_postdata();

		// return template
		return Template::Get('snippet-theme.php', $aVars);
	}

	/**
	 * Get the default year of this theme
	 */
	public function GetDefaultYear()
	{
		// get field
		$term = get_field('defaultYear', $this->Get('ID'));

		// return year model
		return new Taxonomy_Year($term);
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
	 * Get years connected to the markers in this theme
	 */
	public function GetYears()
	{
		// init
		$aYears = array();

		// get all markers
		$aMarkers = $this->GetMarkers();

		// loop all connected markers
		foreach ( $aMarkers as $iMarkerID => $oMarker ) {

			// get year term objects
			$aTerms = wp_get_post_terms($iMarkerID, 'year');
			foreach($aTerms as $oTerm) {
				$aYears[$oTerm->term_id] = $oTerm->name; // just return year, not whole object
			}
		}		

		return $aYears;
	}
}
