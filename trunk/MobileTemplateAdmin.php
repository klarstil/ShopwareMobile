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
class Shopware_Controllers_Backend_MobileTemplate extends Enlight_Controller_Action
{
	protected $config;
	protected $db;
	protected $uploadPath;
	protected $maxFileSize;
	protected $fileExtensions;
	protected $maxLogoWidth;
	
	/**
	 * init()
	 *
	 * Initializiert die benoetigten Views und setzt globale Variablen
	 *
	 * @access public
	 * @return void
	 */
	public function init()
	{
		$this->config = Shopware()->Config();
		$this->uploadPath = Shopware()->DocPath() . '/images/swag_mobiletemplate';
		$this->db = Shopware()->Db();
		
		// Get max file upload size from the php.ini 
		$iniMaxSize = ini_get('post_max_size');
		$unit = strtoupper(substr($iniMaxSize, -1));
		$multiplier = ($unit == 'M' ? 1048576 : ($unit == 'K' ? 1024 : ($unit == 'G' ? 1073741824 : 1)));
		$maxFileSizeValue = substr($iniMaxSize, 0, -1);
		
		// Upload size in bytes
		$this->maxFileSize = $maxFileSizeValue * $multiplier;
		
		// Set allowed file extensions
		$this->fileExtensions = array("jpg", "jpeg", "tif", "tiff", "gif", 'png');
		
		// Set max logo width
		$this->maxLogoWidth = 320;
		
		$this->View()->addTemplateDir(dirname(__FILE__) . "/Views/");
	}
 	
 	/**
 	 * indexAction()
 	 *
 	 * Liest alle Plugin-Einstellungen aus und stellt diese der View
 	 * zur Verfuegung
 	 *
 	 * @access public
 	 * @return void
 	 */
	public function indexAction()
	{
		// Get all settings
		$props = $this->db->query('SELECT * FROM `s_plugin_mobile_settings`');
		$props = $props->fetchAll();
		
		// ...and assign them to the view
		foreach($props as $prop) {
			$this->View()->assign($prop['name'], $prop['value']);
		}
	}
 	
 	/**
 	 * skeletonAction()
 	 *
 	 * Leere Funktion
 	 *
 	 * @access public
 	 * @return void
 	 */
	public function skeletonAction()
	{
	}
	
	/**
	 * processGenerellFormAction()
	 *
	 * Verarbeitet die allgemeinen Einstellungen des Plugins
	 *
	 * @access public
	 * @return void
	 */
	public function processGenerellFormAction()
	{
		$request = $this->Request();
		
		// Supported devices
		$supportedDevices = array();
		$iphone = $request->getParam('iphone');
		if(!empty($iphone)) {
			$supportedDevices[] = 'iPhone';
		}
		
		$ipod = $request->getParam('ipod');
		if(!empty($ipod)) {
			$supportedDevices[] = 'iPod';
		}
		$ipad = $request->getParam('ipad');
		if(!empty($ipad)) {
			$supportedDevices[] = 'iPad';
		}
		$android = $request->getParam('android');
		if(!empty($android)) {
			$supportedDevices[] = 'Android';
		}
		$blackBerry = $request->getParam('blackberry');
		if(!empty($blackBerry)) {
			$supportedDevices[] = 'BlackBerry';
		}
		$supportedDevices = implode('|', $supportedDevices);
		$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$supportedDevices' WHERE `name` LIKE 'supportedDevices';");
		
		//Shopsite-ID AGB
		$agbInfoID = $request->getParam('agbInfoID');
		if(!empty($agbInfoID)) {
			$agbInfoID = (int) $agbInfoID;
			$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$agbInfoID' WHERE `name` LIKE 'agbInfoID';");
		}
		
		//Shopsite-ID Right of Revocation
		$cancelRightID = $request->getParam('cancelRightID');
		if(!empty($cancelRightID)) {
			$cancelRightID = (int) $cancelRightID;
			$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$cancelRightID' WHERE `name` LIKE 'cancelRightID';");
		}
		
		//Infosite group name
		$infoGroupName = $request->getParam('infoGroupName');
		if(!empty($infoGroupName)) {
			$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$infoGroupName' WHERE `name` LIKE 'infoGroupName';");
		}
		
		// Show normal version link
		$showNormalVersionLink = $request->getParam('showNormalVersionLink');
		if(!empty($showNormalVersionLink)) {
			if($showNormalVersionLink == 'on') {
				$showNormalVersionLink = 1;
			} else {
				$showNormalVersionLink = 0;
			}
			$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$showNormalVersionLink' WHERE `name` LIKE 'showNormalVersionLink';");
		}
		
		$message = 'Das Formular wurde erfolgreich gespeichert.';
		echo Zend_Json::encode(array('success' => true, 'message' => $message));
		die();
	}
	
	/**
	 * processSubshopFormAction()
	 *
	 * Verarbeitet die Subshop Einstellungen des Plugins
	 *
	 * @access public
	 * @return void
	 */
	public function processSubshopFormAction()
	{
		$request = $this->Request();
		
		// Use Shopware Mobile as Subshop
		$useAsSubshop = $request->getParam('useAsSubshop');
		if(!empty($useAsSubshop)) {
			if($useAsSubshop == 'on') {
				$useAsSubshop = 1;
			} else {
				$useAsSubshop = 0;
			}
			$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$useAsSubshop' WHERE `name` LIKE 'useAsSubshop';");
		}
		
		//Subshop-ID
		$subshopID = $request->getParam('subshopID');
		if(!empty($subshopID)) {
			$subshopID = (int) $subshopID;
			$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$subshopID' WHERE `name` LIKE 'subshopID';");
		}
		
		$message = 'Das Formular wurde erfolgreich gespeichert.';
		echo Zend_Json::encode(array('success' => true, 'message' => $message));
		die();
	}
	
	/**
	 * processDesignFormAction()
	 *
	 * Verarbeitet die allgemeinen Einstellungen des Plugins
	 *
	 * @access public
	 * @return void
	 */
	public function processDesignFormAction()
	{
		$logoUpload    = $_FILES['logoUpload'];
		$startupUpload = $_FILES['startupUpload'];
		$iconUpload    = $_FILES['iconUpload'];
		$request       = $this->Request();
		
		// Check if the user chooses a new logo
		if(is_array($logoUpload) && !empty($logoUpload) && $logoUpload['size'] > 0) {
			$this->processUpload($logoUpload, 'logo', 'logo');
		}
		
		// Check if the user chooses a new icon
		if(is_array($iconUpload) && !empty($iconUpload) && $iconUpload['size'] > 0) {
			$this->processUpload($iconUpload, 'icon', 'icon');
		}
		
		// Check if the user chooses a new startup screen
		if(is_array($startupUpload) && !empty($startupUpload) && $startupUpload['size'] > 0) {
			$this->processUpload($startupUpload, 'startip', 'startup');
		}
		
		// Sencha.IO
		$useSenchaIO = $request->getParam('useSenchaIO');
		if(!empty($useSenchaIO)) {
			if($useSenchaIO == 'on') {
				$useSenchaIO = 1;
			} else {
				$useSenchaIO = 0;
			}
			$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$useSenchaIO' WHERE `name` LIKE 'useSenchaIO';");
		}
		
		// Voucher on confirm page
		$useVoucher = $request->getParam('useVoucher');
		if(!empty($useVoucher)) {
			if($useVoucher == 'on') {
				$useVoucher = 1;
			} else {
				$useVoucher = 0;
			}
			$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$useVoucher' WHERE `name` LIKE 'useVoucher';");
		}
		
		// Newsletter signup on confirm page
		$useNewsletterr = $request->getParam('useNewsletter');
		if(!empty($useNewsletter)) {
			if($useNewsletter == 'on') {
				$useNewsletter = 1;
			} else {
				$useNewsletter = 0;
			}
			$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$useNewsletter' WHERE `name` LIKE 'useNewsletter';");
		}
		
		// Commentfield on confirm page
		$useComment = $request->getParam('useComment');
		if(!empty($useComment)) {
			if($useComment == 'on') {
				$useComment = 1;
			} else {
				$useComment = 0;
			}
			$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$useComment' WHERE `name` LIKE 'useComment';");
		}
		
		// TODO: Colortemplate ...need some work :(
		
		// Additional CSS
		$additionalCSS = $request->getParam('additionalCSS');
		if(!empty($additionalCSS)) {
			$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$additionalCSS' WHERE `name` LIKE 'additionalCSS';");
		}
		
		// TODO: Statusbar style ...need some work :(
		
		// Gloss on icon
		$glossOnIcon = $request->getParam('glossOnIcon');
		if(!empty($glossOnIcon)) {
			if($glossOnIcon == 'on') {
				$glossOnIcon = 1;
			} else {
				$glossOnIcon = 0;
			}
			$this->db->query("UPDATE `s_plugin_mobile_settings` SET `value` = '$uglossOnIcon' WHERE `name` LIKE 'glossOnIcon';");
		}
		
		$message = 'Das Formular wurde erfolgreich gespeichert.';
		echo Zend_Json::encode(array('success' => true, 'message' => $message));
		die();
	}
	
	/**
	 * getSupportedDevicesAction()
	 *
	 * Gibt die unterstuetzten als JSON String zurueck
	 *
	 * @access public
	 * @return void
	 */
	public function getSupportedDevicesAction()
	{
		//.. empty	
	}
	
	////////////////////////////////////////////
    //Helper Functions
    ////////////////////////////////////////////
    
    /**
     * processUpload()
     *
     * Laedt die angegeben Datei hoch und validiert diese
     *
     * @access private
     * @param $upload - $_FILES array
     * @param $filename - Der zuverwendene Dateiname
     * @param $imageType - Typ des Bildes (Logo, Icon, Startup-Screen)
     * @return bool
     */
    private function processUpload($upload, $filename, $imageType)
    {
    	// Check upload path
    	if(!is_dir($this->uploadPath)) {
			if(!mkdir($this->uploadPath, 0777)) {
				$message = 'Das Uploadverzeichnis "' . $this->uploadPath . '" ben&ouml;tigt die Rechte 0777.';
				echo Zend_Json::encode(array('success' => false, 'message' => $message));
				die();
			}
		}
		
		// Validate file size
		$file_size = @filesize($upload["tmp_name"]);
		if (!$file_size || $file_size > $this->maxFileSize) {
			$message = 'Die von Ihnen gew&auml;hlte Datei &uuml;bersteigt das Uploadlimit.';
			echo Zend_Json::encode(array('success' => false, 'message' => $message));
			die();
		}
		if ($file_size <= 0) {
			$message = 'Die von Ihnen gew&auml;hlte Datei konnte nicht hochgeladen werden.';
			echo Zend_Json::encode(array('success' => false, 'message' => $message));
			die();
		}
		
		// Validate file extension
		$path_info = pathinfo($upload['name']);
		$file_extension = $path_info["extension"];
		$is_valid_extension = false;
		foreach ($this->fileExtensions as $extension) {
			if (strcasecmp($file_extension, $extension) == 0) {
				$is_valid_extension = true;
				$file_extension = $extension;
				break;
			}
		}
		if (!$is_valid_extension) {
			$message = 'Die Datei besitzt einen Dateitypen der nicht unterst&uuml;tzt wird';
			echo Zend_Json::encode(array('success' => false, 'message' => $message));
			die();
		}
		
		// Check image size
		list($width, $height, $type, $attr) = getimagesize($upload['tmp_name']);
		if($width <= 0) {
			$message = 'Das Bild hat eine Breite von weniger als 0 Pixel.';
			echo Zend_Json::encode(array('success' => false, 'message' => $message));
			die();
		}
		
		// Image type related size checking
		switch($imageType) {
			case 'icon':
				if($width != 57 || $height != 57) {
					$message = 'Das Icon muss eine Gr&ouml;&szlig;e von 57 Pixel x 57 Pixel aufweisen. Bitte w&auml;hlen Sie ein anderes Bild als Icon.';
					echo Zend_Json::encode(array('success' => false, 'message' => $message));
					die();
				}
				break;
			case 'startup':
				if($width > 640 || $height > 960) {
					$message = 'Der Startup-Screen muss eine maximale Gr&ouml;&szlig;e von 640 Pixel x 960 Pixel aufweisen. Bitte w&auml;hlen Sie ein anderes Bild als Startup-Screen.';
					echo Zend_Json::encode(array('success' => false, 'message' => $message));
					die();
				}
				break;
			case 'logo':
			default:
				if($width > 320) {
					$message = 'Das Logo darf maximal eine Gr&ouml;&szlig;e von maximal 320 Pixeln aufweisen. Bitte w&auml;hlen Sie ein anderes Bild als Logo.';
					echo Zend_Json::encode(array('success' => false, 'message' => $message));
					die();
				}
				break;
		}
		
		// Set generic file name
		$upload['name'] = $filename . '.' . $file_extension;
		
		// Process the file
		if (!@move_uploaded_file($upload["tmp_name"], $this->uploadPath."/".$upload['name'])) {
			$message = 'Die Datei konnte nicht gespeichert werden.';
			echo Zend_Json::encode(array('success' => false, 'message' => $message));
			die();
		}
		
		return true;
    }
}