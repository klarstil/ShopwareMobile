 <?php
return array(
	'author'=>'st.pohl',
	'authorMail'=>'stp@shopware.de',
	'ioncube'=>false,
	'zend'=>false,
	'plain'=>true,
	'email'=>true,
	'store'=>true,
	'getmeta'=>true,
	'changelog'=>array(
		'1.0.0'=>array('releasedate'=>'2011-05-16', 'lines' => array(
			'First beta release'
		)),
		'1.0.1'=>array('releasedate'=>'2011-05-17', 'lines' => array(
			'Add ability to change the payment method in the checkout section',
			'Add base price to the detail view',
			'Fix layout problem if the paging toolbar is hidden',
			'Change event listener for the promotions carousel',
			'Change confirm text'
		)),
		'1.0.2'=>array('releasedate'=>'2011-05-17', 'lines' => array(
			'Refactor the registration'
		)),
		'1.0.3'=>array('releasedate'=>'2011-05-17', 'lines' => array(
			'Improved checkout section and registration'
		)),
		'1.0.4'=>array('releasedate'=>'2011-05-18', 'lines' => array(
			'Fix session problem',
			'Remove layout problem in cart',
			'Better view handling in the checkout section',
			'Fix layout problem at the detail view'
		)),
		'1.0.5'=>array('releasedate'=>'2011-05-18', 'lines' => array(
			'Fix encoding problem',
			'Add error messages if the registration was not successful',
			'Add missing stars behind prices',
			'Add and format agb box',
			'Add total sum and shipping costs box'
		)),
		'1.0.6'=>array('releasedate'=>'2011-05-18', 'lines' => array(
			'Add star notice on all sites with prices'
		))
	)
);