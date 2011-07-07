<?php
/**
 * [plugin]
 * @link http://www.shopware.de
 * @package Plugins
 * @subpackage [scope]
 * @copyright Copyright (c) [year], shopware AG
 * @version [version] [date] [revision]
 * @author [author]
 */
class Shopware_Plugins_Frontend_SwagMobileTemplate_Bootstrap extends Shopware_Components_Plugin_Bootstrap
{

	/* MobileTemplate Backend Icon */
	private static $icnBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABwElEQVQ4jY3SO6/TMBjG8b/jpAlJSi+0alVoYUEHmJC4iIlP0q1zJyYY+Q6Hjc6I4fA1GBAdGJCABVF0quoAp216cWI7DCAEDVLr0Xqen+zXFuys4+Nn+Ww2wxhDHIW4nodSCqVSms0Gw+FQ/J13d4Hx+C2vTk6o1qrcf/AQ13MZv3nNZDKh3+/vxotAkiTcvnOXXrfL5StdttstRzdv0Wp3UErtBxzp8eTpYxq1+E8h8APOFktePH+5HxACOldjKlEJbeSvkCvxqhdBFPpFwBiDsUu2uSQnR+CQ6pS1NhitD7iCgMn8A5dMiHAFYHE2Zc5PHfRBgOPwZfaO70uDyRVuZFGfGsSre2ht9gMgCIMQ31ekWY5aLXDKKxLxEWsPAIwxlCK4EHl4WuKlEr/uslydYa3dD2RZhso/Q64wQuP4gkRK1iWPTBef4b/A11Mol0NcE5JaSywVer0hVQecYLPZskk6eCIiME02WlNx55RWS7Jsuh+Yz88ZPXqPsWCFpFqtsfjxDaUUN46uFwBnd6NerxP4Pr7n0mm1uNbrEQYlKuWIOI4KQGEqo9Eon06nvz+NAHIApJS0220Gg8E/nZ864b4HQnsY4wAAAABJRU5ErkJggg==';

	/**
	 * install()
	 *
	 * Installationsroutine des Plugins
	 * 
	 * @return bool
	 */
	public function install()
	{
		$this->deletePreviousEntries();
		$this->createEvents();
		$this->createBackendMenuEntry();
		
		// Create database table
		Shopware()->Db()->query("CREATE TABLE `s_plugin_mobile_settings` (
			`id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY ,
			`name` VARCHAR( 255 ) NOT NULL ,
			`value` VARCHAR( 255 ) NOT NULL
			) ENGINE = MYISAM ;"
		);
		
		// Fill database table fields
		Shopware()->Db()->query("INSERT INTO `s_plugin_mobile_settings` (`name` ,`value`)
			VALUES 
			('supportedDevices', 'iPhone|iPod|Android'),
			('supportedPayments', '3|4|5'),
			('agbInfoID', '4'),
			('cancelRightID', '8'),
			('infoGroupName', 'gMobile'),
			('showNormalVersionLink', '1'),
			('useAsSubshop', '0'),
			('subshopID', '2'),
			('useSenchaIO', '0'),
			('useVoucher', '0'),
			('useNewsletter', '0'),
			('useComment', '0'),
			('colorTemplate', 'default'),
			('logoUpload', ''),
			('logoHeight', ''),
			('additionalCSS', ''),
			('iconUpload', ''),
			('startupUpload', ''),
			('statusbarStyle', 'default'),
			('glossOnIcon', '1');"
		);

		return true;
	}

	/**
	 * uninstall()
	 *
	 * Deinstallationsroutine des Plugins
	 *
	 * @return void
	 */
	public function uninstall()
	{
		// Delete settings table
		Shopware()->Db()->query('DROP TABLE IF EXISTS  `s_plugin_mobile_settings`;');
		
		// Delete menu entry
		Shopware()->Db()->query(" DELETE IGNORE FROM `s_core_menu` WHERE `name` = 'Shopware Mobile'");
		
		// Delete previous entries
		$this->deletePreviousEntries();
		
		return true;
	}

	/**
	 * createEvents()
	 *
	 * Erstellt die benoetigten Events fuer dieses Plugin
	 *
	 * @return void
	 */
	public function createEvents()
	{
		/* Subscribe events */
		$event = $this->createEvent(
	 		'Enlight_Controller_Dispatcher_ControllerPath_Frontend_MobileTemplate',
	 		'onGetControllerPath'
	 	);
	 	$this->subscribeEvent($event);

		$event = $this->createEvent(
 			'Enlight_Controller_Dispatcher_ControllerPath_Backend_MobileTemplate',
 			'onGetControllerPathBackend'
	 	);
	 	$this->subscribeEvent($event);

		$event = $this->createEvent(
			'Enlight_Controller_Action_PostDispatch',
			'onPostDispatch'
		);
		$this->subscribeEvent($event);

		$event = $this->createEvent(
			'Enlight_Controller_Action_PostDispatch_Frontend_Register',
			'onPostDispatchRegister'
		);
		$this->subscribeEvent($event);


		$event = $this->createEvent(
			'Shopware_Modules_Admin_SaveRegister_Start',
			'onSaveRegisterStart'
		);
		$this->subscribeEvent($event);
	}

	/**
	 * deletePreviousEntries()
	 *
	 * Loescht alte Eintraege in der DB
	 *
	 * @return void
	 */
	public function deletePreviousEntries()
	{
		$sql = "DELETE FROM s_core_subscribes WHERE listener LIKE 'Shopware_Plugins_Frontend_SwagMobileTemplate_Bootstrap%';";
		Shopware()->Db()->query($sql);
	}

	/**
	 * createBackendMenuEntry()
	 *
	 * Erstellt einen neuen Eintrag im Backendmenu
	 *
	 * @return void
	 */
	public function createBackendMenuEntry()
	{
		$parent = $this->Menu()->findOneBy('label', 'Marketing');
        $item = $this->createMenuItem(array(
		        'label' => 'Shopware Mobile',
	            'onclick' => 'openAction(\'MobileTemplate\');',
	            'class' => 'ico2 iphone',
	            'active' => 1,
	            'parent' => $parent,
	            'style' => 'background-position: 5px 5px;'
		));
		$this->Menu()->addItem($item);
		$this->Menu()->save();
	}


	/**
	 * getInfo()
	 *
	 * Gibt alle Meta-Daten des Plugins zurueck
	 * 
	 * @return mixed
	 */
	public function getInfo()
    {
    	return include(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'Meta.php');
    }
    
	/**
	 * onPostDispatch()
	 *
	 * Stellt den Template alle wesentlichen Konfigurationsoptionen
     * zur Verfuegung
	 *
	 * @static
	 * @param Enlight_Event_EventArgs $args
	 * @return
	 */
    public static function onPostDispatch(Enlight_Event_EventArgs $args)
    {	
    	$request = $args->getSubject()->Request();
		$response = $args->getSubject()->Response();
		$view = $args->getSubject()->View();

		$config = Shopware()->Db()->fetchAll('SELECT * FROM `s_plugin_mobile_settings`');
		$properties = array();
		foreach($config as $prop) {
			$properties[$prop['name']] = $prop['value'];
		}
		$config = $properties;

		$version = self::checkForMobileDevice($config['supportedDevices']);

		if(!$request->isDispatched()||$response->isException()){
			return;
		}

	    // Set session value
	    if($config['useAsSubshop'] == 1) {
		    if(Shopware()->System()->sLanguage == $config['subshopID']) {
			    Shopware()->Session()->Mobile = 1;
		    } else {
			    Shopware()->Session()->Mobile = 0;
		    }
	    } else {
			if($request->sMobile == '1' && $request->sAction == 'useNormal') {
				Shopware()->Session()->Mobile = 0;
			} else if($request->sMobile == '1') {
				Shopware()->Session()->Mobile = 1;
			}
	    }


	    // Add icon for Backend module
		if($request->getModuleName() != 'frontend') {
			$view->extendsBlock('backend_index_css', '<style type="text/css">a.iphone { background-image: url("'. self::$icnBase64 .'"); background-repeat: no-repeat; }</style>', 'append');
			return;
		}
	    
	    // Merge template directories
	    $mobileSession = Shopware()->Session()->Mobile;
		if($version === 'mobile' && $mobileSession === 1) {
			$dirs = Shopware()->Template()->getTemplateDir();
			$newDirs = array_merge(array(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'Views' . DIRECTORY_SEPARATOR), $dirs);
			Shopware()->Template()->setTemplateDir($newDirs);

			$basepath = Shopware()->Config()->BasePath;

			// Assign plugin configuration
			$view->assign('shopwareMobile', array(
				'additionalCSS'  => $config['additionalCSS'],
				'isUserLoggedIn' => Shopware()->Modules()->sAdmin()->sCheckUser(),
				'useNormalSite'  => $config['showNormalVersionLink'],
				'template'       => 'frontend'. DIRECTORY_SEPARATOR . '_resources'.DIRECTORY_SEPARATOR.'styles' . DIRECTORY_SEPARATOR . trim($config['colorTemplate']) . '.css',
				'useVoucher'     => $config['useVoucher'],
				'useNewsletter'  => $config['useNewsletter'],
				'useComment'     => $config['useComment'],
				'logoPath'       => $config['logoUpload'],
				'logoHeight'     => $config['logoHeight'],
				'iconPath'       => $config['iconUpload'],
				'glossOnIcon'    => $config['glossOnIcon'],
				'startUpPath'    => $config['startupUpload'],
				'statusBarStyle' => $config['statusbarStyle'],
				'payments'       => $config['supportedPayments'],
				'agbID'          => $config['agbInfoID'],
				'cancellationID' => $config['cancelRightID'],
				'basePath'       => $basepath
			));

		} else {
			if(!empty($mobileSession) && $mobileSession == 0) { $active = 1; } else { $active = 0; }

			$view->addTemplateDir(dirname(__FILE__) . DIRECTORY_SEPARATOR . 'Views' . DIRECTORY_SEPARATOR);
			$view->assign('shopwareMobile', array(
				'active'     => $active,
				'useSubShop' => $config['useAsSubshop'],
				'subShopId'  => $config['subshopID'],
				'userAgents' => $config['supportedDevices'],
				'basePath'   => $request->getBasePath()
			));

			$view->extendsTemplate('frontend' . DIRECTORY_SEPARATOR . 'plugins' . DIRECTORY_SEPARATOR . 'swag_mobiletemplate' . DIRECTORY_SEPARATOR . 'index.tpl');
		}
    }

	/**
	 * onGetControllerPath()
     *
     * Stellt die komplette Frontendlogik zur Verfuegung
	 *
	 * @static
	 * @return string
	 */
    public static function onGetControllerPath()
    {
    	return dirname(__FILE__) . DIRECTORY_SEPARATOR . 'MobileTemplate.php';
    }
    
    /**
     * onGetControllerPathBackend()
     *
     * Stellt die komplette Backendlogik zur Verfuegung
     *
	 * @static
     * @access public
     * @return mixed
     */
    public static function onGetControllerPathBackend()
    {
    	return dirname(__FILE__) . DIRECTORY_SEPARATOR . 'MobileTemplateAdmin.php';
    }

	/**
	 * onPostDispatchRegister()
	 *
	 * Stellt die Fehlermeldungen bei der Registrierung
	 * als einzelnen String zu Verf&uuml;gung
	 *
	 * @static
	 * @param Enlight_Event_EventArgs $args
	 * @return 
	 */
	public static function onPostDispatchRegister(Enlight_Event_EventArgs $args)
	{
		$request = $args->getSubject()->Request();
		$response = $args->getSubject()->Response();
		$view = $args->getSubject()->View();
		$mobileSession = Shopware()->Session()->Mobile;

		if(!$mobileSession) {
			return;
		}

		if(!empty($view->register->personal->error_messages)) {
			$errors = '';
			foreach($view->register->personal->error_messages as $k => $v) {
				$errors = $errors . '<br/>' . utf8_encode($v);
			}
			$view->registerErrors = $errors;
		}
	}

	/**
	 * onSaveRegisterStart
	 *
	 * Event-Methode - Setzt das richtige Encoding fuer die Registrierungsdaten
	 *
	 * @static
	 * @param Enlight_Event_EventArgs $args
	 * @return void
	 */
	public static function onSaveRegisterStart(Enlight_Event_EventArgs $args)
	{
		$subject = $args->getSubject();
		$session = Shopware()->Session();

		if(Shopware()->Session()->Mobile == 1 && !empty($session['sRegister']['billing'])) {
			foreach($session['sRegister']['billing'] as $key => $value) {
				$value = utf8_decode($value);
				$value = htmlentities($value);
				$session['sRegister']['billing'][$key] = $value;
			}
		}
	}

	/**
	 * checkForMobileDevice()
     *
     * Untersucht den User Agent nach Mobilen Endgeraeten
	 *
	 * @param str $devices
	 * @return str
	 */
    private function checkForMobileDevice($devices) {
    	$agent = $_SERVER['HTTP_USER_AGENT'];
    	$device = 'desktop';

    	if(preg_match('/(' . $devices . ')/i', $agent)) {
    		$device = 'mobile';
    	}

		return $device;
    }
}