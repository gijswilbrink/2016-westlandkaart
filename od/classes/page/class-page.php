<?php

/**
 * Custom Post Type subclass
 */
class Page extends Post
{
	/**
	 * Required variables
	 */
	protected $post_type = 'page';

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

		$sSocial = Template::Get('snippet-social.php', $this->Get('ID'));

		// prepare vars
		$aVars = array(
			'classes' 		=> implode(" ", get_post_class()),
			'id' 			=> $this->Get('ID'),
			'title'			=> get_the_title(),
			'content'		=> apply_filters('the_content',get_the_content()),
			'thumbnail'		=> $oThumb,
			'social'		=> $sSocial,
		);

		// reset postdata
		wp_reset_postdata();

		$template = 'snippet-page.php';
		if($this->post->ID == get_option('page_on_front')) $template = 'snippet-home.php';

		// return template
		return Template::Get($template, $aVars);
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
}
