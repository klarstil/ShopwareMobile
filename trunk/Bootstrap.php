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

	// MobileTemplate Backend Icon
	private static $icnBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABwElEQVQ4jY3SO6/TMBjG8b/jpAlJSi+0alVoYUEHmJC4iIlP0q1zJyYY+Q6Hjc6I4fA1GBAdGJCABVF0quoAp216cWI7DCAEDVLr0Xqen+zXFuys4+Nn+Ww2wxhDHIW4nodSCqVSms0Gw+FQ/J13d4Hx+C2vTk6o1qrcf/AQ13MZv3nNZDKh3+/vxotAkiTcvnOXXrfL5StdttstRzdv0Wp3UErtBxzp8eTpYxq1+E8h8APOFktePH+5HxACOldjKlEJbeSvkCvxqhdBFPpFwBiDsUu2uSQnR+CQ6pS1NhitD7iCgMn8A5dMiHAFYHE2Zc5PHfRBgOPwZfaO70uDyRVuZFGfGsSre2ht9gMgCIMQ31ekWY5aLXDKKxLxEWsPAIwxlCK4EHl4WuKlEr/uslydYa3dD2RZhso/Q64wQuP4gkRK1iWPTBef4b/A11Mol0NcE5JaSywVer0hVQecYLPZskk6eCIiME02WlNx55RWS7Jsuh+Yz88ZPXqPsWCFpFqtsfjxDaUUN46uFwBnd6NerxP4Pr7n0mm1uNbrEQYlKuWIOI4KQGEqo9Eon06nvz+NAHIApJS0220Gg8E/nZ864b4HQnsY4wAAAABJRU5ErkJggg==';

	/**
	 * install()
	 *
	 * Installationsroutine des Plugins
	 *
	 * @access public
	 * @return {boolean} true
	 */
	public function install()
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

		$hook = $this->createHook(
			'Shopware_Controllers_Frontend_Register',
			'saveRegisterAction',
			'onSaveRegisterAction',
			Enlight_Hook_HookHandler::TypeAfter,
			0
		);
		$this->subscribeHook($hook);

		/* Add menu entry */
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

		$form = $this->Form();
		$form->setElement('checkbox', 'useSubshop', array('label'=>'Shopware Mobile als Subshop verwenden','value'=>'1'));
		$form->setElement('text', 'subshopId', array('label'=>'Subshop ID','value'=>'1'));
		$form->setElement('text', 'supportedDevices', array('label'=>'Unterstützte Geräte (mit Pipe getrennt)','value'=>'Android|BlackBerry|iPhone|iPod'));
		$form->setElement('text', 'staticGroup', array('label'=>'Shopseiten-Gruppe, die für den Informations-Bereich genutzt werden soll','value'=>'gLeft'));
		$form->setElement('checkbox', 'useNormalSite', array('label'=>'Link zur normalen Ansicht anzeigen','value'=>'1'));
		$form->setElement('text', 'logoPath', array('label'=> 'Logo-Pfad (bitte achten Sie darauf, dass das Logo nicht breiter als 320px ist)','value'=>''));
		$form->setElement('text', 'colorTemplate', array('label'=> 'Farbtemplate (wählbar: android, blue, brown, default, green, grey, ios, orange, pink, red, turquoise)','value'=>'default'));
		$form->setElement('textarea', 'additionalCSS', array('label'=>'Zusätzliche CSS-Eigenschaften','value'=>''));
		$form->save();

		return true;
	}
	
	/**
	 * getInfo()
	 *
	 * Gibt alle Meta-Datem des Plugins zurueck 
	 *
	 * @access public
	 * @return {array} meta_data
	 */
	public function getInfo()
    {
    	return include(dirname(__FILE__).'/Meta.php');
    }
    
    /**
     * onPostDispatch()
     *
     * Stellt den Template alle wesentlichen Konfigurationsoptionen
     * zur Verfuegung
     *
     * @access public
     * @return {void}
     */
    public static function onPostDispatch(Enlight_Event_EventArgs $args)
    {	
    	$request = $args->getSubject()->Request();
		$response = $args->getSubject()->Response();
		$view = $args->getSubject()->View();
		$version = self::checkForMobileDevice();
		$config = Shopware()->Plugins()->Frontend()->SwagMobileTemplate()->Config();

		if(!$request->isDispatched()||$response->isException()){
			return;
		}

	    // Set session value
	    if($config->useSubshop == 1) {
		    if(Shopware()->System()->sLanguage == $config->subshopId) {
			    Shopware()->Session()->Mobile = 1;
		    } else {
			    Shopware()->Session()->Mobile = 0;
		    }
	    } else {
			if($request->sViewport == 'mobile' && $request->sAction == 'useNormal') {
				Shopware()->Session()->Mobile = 0;
			} else if($request->sViewport == 'mobile') {
				Shopware()->Session()->Mobile = 1;
			}
	    }

	    // Add icon for Backend module
		if($request->getModuleName() != 'frontend') {
			$view->extendsBlock('backend_index_css', '<style type="text/css">a.iphone { background-image: url("'. self::$icnBase64 .'"); background-repeat: no-repeat; }</style>', 'append');
			return;
		}

	    $mobileSession = Shopware()->Session()->Mobile;
	    
	    // Merge template directories
		if($version === 'mobile' && $mobileSession === 1) {
			$dirs = Shopware()->Template()->getTemplateDir();
			$newdirs = array_merge(array(dirname(__FILE__) . '/Views/mobile/'), $dirs);
			Shopware()->Template()->setTemplateDir($newdirs);

			$view->assign('shopwareMobile', array(
				'additionalCSS'  => $config->additionalCSS,
				'isUserLoggedIn' => Shopware()->Modules()->sAdmin()->sCheckUser(),
				'useNormalSite'  => $config->useNormalSite,
				'colorTemplate'  => $config->colorTemplate
			));

		} else {
			if(!empty($mobileSession) && $mobileSession == 0) { $active = 1; } else { $active = 0; }

			$view->addTemplateDir(dirname(__FILE__). '/Views/');
			$view->assign('shopwareMobile', array(
				'active'     => $active,
				'useSubShop' => $config->useSubshop,
				'subShopId'  => $config->subshopId,
				'userAgents' => $config->supportedDevices,
				'basePath'   => $request->getBasePath()
			));

			$view->extendsTemplate('mobile/frontend/plugins/swag_mobiletemplate/index.tpl');
		}
    }

    /**
     * onGetControllerPath()
     *
     * Stellt die komplette Frontendlogik zur Verfuegung
     *
     * @access public
     * @return {string} path
     */
    public static function onGetControllerPath()
    {
    	return dirname(__FILE__) . '/MobileTemplate.php';
    }
    
    /**
     * onGetControllerPathBackend()
     *
     * Stellt die komplette Backendlogik zur Verfuegung
     *
     * @access public
     * @return {string} path
     */
    public static function onGetControllerPathBackend()
    {
    	return dirname(__FILE__) . '/MobileTemplateAdmin.php';
    }


	/**
	 * onSaveRegisterAction()
	 *
	 * Gibt das Ergebnis der Registrierung in einen JSON String wieder
	 *
	 * @static
	 * @param Enlight_Hook_HookArgs $args
	 * @return void
	 */
	public static function onSaveRegisterAction(Enlight_Hook_HookArgs $args) {
		$subject = $args->getSubject();
		$view = $subject->View();

		$errors = 0;
		foreach($view->register as $steps) {
			if(isset($steps['error_flags'])) {
				$errors++;
			}
		}

		if($errors > 0) {
			$return = array(
				'success' => false,
				'msg'     => 'Es ist ein Fehler aufgetreten, pr&uuml;fen Sie bitte Ihre Eingaben'
			);
		} else {
			$return = array(
				'success' => true,
				'msg'     => 'Hallo ' . $view->register['form_data']['firstname'] . ' ' . $view->register['form_data']['lastname'] .
							 '. Danke f&uuml;r Ihr Registierung bei' . Shopware()->Config()->Shopname
			);
		}

		die(json_encode($return));
	}
    
    /**
     * checkForMobileDevice()
     *
     * Untersucht den User Agent nach Mobilen Endgeraeten
     *
     * @access private
     * @return {string} $device
     */
    private function checkForMobileDevice() {
	    $config = Shopware()->Plugins()->Frontend()->SwagMobileTemplate()->Config();
    	$agent = $_SERVER['HTTP_USER_AGENT'];
    	$device = 'desktop';

    	if(preg_match('/(' . $config->supportedDevices . ')/i', $agent)) {
    		$device = 'mobile';
    	}

		return $device;
    }
 
}