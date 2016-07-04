<?php

/**
 * Year class
 */
class Taxonomy_Year extends Taxonomy 
{
	/**
	 * Required variables
	 */
	protected $taxonomy = 'year';
	protected $label_name = 'Jaartallen';
	protected $label_name_singular = 'Jaartal';
	protected $aPostTypes = array('marker');
	protected $args = array(
	);


	static public function CreateBySlug($slug)
	{
		$term = get_term_by('slug', $slug, 'year');
		return new Taxonomy_Year($term);
	}

	static public function CreateByTermArray(array $aTerms)
	{
		$aYears = array();
		
		// loop terms and create year models
		foreach($aTerms as $term) {
			$oYear = new Taxonomy_Year($term);
			$aYears[$oYear->Get('slug')] = $oYear;
		}

		// sort by actual years, desc
		krsort($aYears);

		// return
		return $aYears;
	}
}