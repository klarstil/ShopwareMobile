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
		)),
		'1.0.7'=>array('releasedate'=>'2011-05-19', 'lines' => array(
			'Enhance and proper format the price box on the checkout view ',
			'Change number format on cart summary',
			'Fix configurator articles',
			'Fix registration encoding'
		)),
		'1.0.8'=>array('releasedate'=>'2011-05-19', 'lines' => array(
			'Auto destroy registration and login after deactivate',
			'Fix small bug on the checkout section',
			'Fix bug in the customer center'
		)),
		'1.1.0'=> array('releasedate'=>'2011-06-03', 'lines' => array(
			'Feature: All texts are snippets now and could be edit in the backend',
			'Feature: Ext.XTemplate in Smarty Block-Tags for easier customizing',
			'Feature: Blog categories are official supported now',
			'Feature: Add support for min. purchase, max. purchase, sale function and purchase steps',
			'Feature: Dynamic price changing on amount, configurator and variant change',
 			'Bugfix: Proper encoding for article informations on the detail view',
			'Bugfix: Remove "/mobile" from URL',
			'Bugfix: Localization for the components Ext.Picker, Ext.DatePicker, Ext.form.DatePicker and Ext.form.Select',
			'Bugfix: Add right of revocation button on the checkout view',
			'Bugfix: Hide price in blog categories',
			'Bugfix: Proper hiding of inactive categories',
			'Bugfix: Remove delete button from rate decrease, rate increase and delivery costs articles in the cart view'
		)),
		'1.1.1'=> array('releasedate'=>'2011-06-16', 'lines' => array(
			'Remove debug message in locale.js'
		)),
		'1.1.2'=> array('releasedate'=>'2011-06-27', 'lines' => array(
			'Improve support for shops in subdirectories',
			'Fix encoding bug in registration process'
		)),
		'1.1.3'=> array('releasedate'=>'2011-06-27', 'lines' => array(
			'Fix basepath issue'
		)),
		'1.1.4'=>array('releasedate'=>'2011-06-29', 'lines' => array(
			'Fix smarty plugin problem on windows servers',
			'Fix 500 http error code if a previous version was installed',
			'Setting absolute basepath for proper subfolder handling',
			'Remove loadFile-Action',
			'Use events instead of hooks',
			'Replace static directory seperators witht the php constants "DIRECTORY_SEPERATOR"'
		)),
		'1.1.5'=>array('releasedate'=>'2011-06-29', 'lines' => array(
			'Fix install order'
		)),
		'1.1.6'=>array('releasedate'=>'2011-07-07', 'lines' => array(
			'Add backend module',
			'Change Bootstrap and MobileTemplate Frontend Controller to use the new features from the backend module',
			'Replace complete plugin configuration for with just one controller button',
			'Set required shopware version to >= 3.5.4',
			'Fix liveshopping counter'
		)),
		'1.1.7'=>array('releasedate'=>'2011-07-07', 'lines' => array(
			'Add missing uploader files',
			'Fix uninstall bug'
		))
	)
);