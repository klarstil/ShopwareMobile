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
	/**
	 * init()
	 *
	 * Initializiert die benoetigten Views
	 *
	 * @access public
	 * @return void
	 */
	public function init()
	{
		$this->View()->addTemplateDir(dirname(__FILE__) . "/Views/");
	}
 	
 	/**
 	 * indexAction()
 	 *
 	 * Leere Funktion
 	 *
 	 * @access public
 	 * @return void
 	 */
	public function indexAction()
	{
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
}
