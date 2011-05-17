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
class Shopware_Controllers_Frontend_MobileTemplate extends Enlight_Controller_Action
{
	protected $senchaIo;
	protected $system;
	protected $config;
	protected $module;
	protected $plugin;
	protected $session;

	/**
	 * init()
	 *
	 * Dient als Konstruktor
	 *
	 * @access public
	 * @return void
	 */
	public function init()
	{
		$this->senchaIo = 'http://src.sencha.io/';
		$this->system = Shopware()->System();
		$this->config = Shopware()->Config();
		$this->module = Shopware()->Modules();
		$this->session = Shopware()->Session();
		$this->plugin = Shopware()->Plugins()->Frontend()->SwagMobileTemplate();
	}

	/**
	 * preDispatch()
	 *
	 * Wird bei jedem Request aufgerufen
	 *
	 * @return void
	 */
	public function preDispatch()
	{
		Shopware()->Plugins()->Controller()->ViewRenderer()->setNoRender();
	}

	/**
	 * getMainCategoriesAction()
	 *
	 * Liest alle Hauptkategorien des Shops aus
	 *
	 * @access public
	 * @return void
	 */
	public function getMainCategoriesAction()
	{
		$main_categories = Shopware()->Modules()->Categories()->sGetCategoriesAsArrayById();
		$i = 0;
		foreach($main_categories as $cat) {
			$categoryInfo = Shopware()->Modules()->Categories()->sGetCategoryContent((int) $cat['id']);
			$output[$i] = array(
				'id'     => $cat['id'],
				'name'   => utf8_encode($cat['description']),
				'desc'   => utf8_encode($this->truncate(strip_tags($categoryInfo['cmstext']), 100)),
				'sub'    => ($cat['hasSubCategories'] == 1) ? true : false
			);
			$i++;
		}
		$this->jsonOutput(array('categories' => $output));
	}

	/**
	 * getCategoriesTreeAction()
	 *
	 * Listet alle Unterkategorien einer gegebenen Kategorie-ID auf
	 *
	 * @return void
	 */
	public function getCategoriesTreeAction() {

		/* Set node */
		if(!empty($this->Request()->node) && $this->Request()->node !== 'root') {
			$node = intval($this->Request()->node);
		} else {
			$node = 3;
		}
		if(isset($this->Request()->categoryID) && !empty($this->Request()->categoryID)) {
			$node = intval($this->Request()->categoryID);
		}

		$nodes = array();
		$sql = "
			SELECT c.id, c.description, c.position, c.parent, COUNT(c2.id) as count,
			(
				SELECT categoryID
				FROM s_articles_categories
				WHERE categoryID = c.id
				LIMIT 1
			) as article_count
			FROM s_categories c
			LEFT JOIN s_categories c2 ON c2.parent=c.id
			WHERE c.parent=?
			GROUP BY c.id
			ORDER BY c.position, c.description
		";
		$getCategories = Shopware()->Db()->fetchAll($sql, array($node));

		if (!empty($getCategories)) {
			foreach($getCategories as $category) {

				$categoryInfo = Shopware()->Modules()->Categories()->sGetCategoryContent($category["id"]);

				/* Handle encoding */
				if(function_exists('mb_convert_encoding')) {
					$category["description"] = mb_convert_encoding($category["description"], 'UTF-8', 'HTML-ENTITIES');
					$categoryInfo['cmstext'] = mb_convert_encoding($categoryInfo['cmstext'], 'UTF-8', 'HTML-ENTITIES');
				} else {
					$category["description"] = utf8_encode($category["description"]);
					$categoryInfo['cmstext'] = utf8_encode($categoryInfo['cmstext']);
				}
				$category["description"] = html_entity_decode($category["description"]);
				$categoryInfo['cmstext'] = $this->truncate(strip_tags($categoryInfo['cmstext']), 100);
				$category['id'] = (int) $category['id'];

				/* Get first article image */
				$firstArticle = Shopware()->Modules()->Articles()->sGetArticlesByCategory($category['id'], false, 1);
				$firstArticle = $firstArticle['sArticles'][0];
				if(!empty($firstArticle['image'])) {
					$image = $this->stripBasePath($firstArticle['image']['src'][1]);
				} else {
					$image = false;
				}

				/* Fill return array */
				if(!empty($category["count"])) {
					$nodes[] = array(
						'id'       => $category["id"],
						'parentId' => $category["parent"],
						'text'     => $category["description"],
						'desc'     => $categoryInfo['cmstext'],
						'img'      => $image,
						'count'    => $category["article_count"]
					);
				} else {
					$nodes[] = array(
						'id'       => $category["id"],
						'parentId' => $category["parent"],
						'text'     => $category["description"],
						'desc'     => $categoryInfo['cmstext'],
						'img'      => $image,
						'count'    => $category["article_count"],
						'leaf'     => true
					);
				}
			}
		}
		$this->jsonOutput(array('categories' => $nodes));
	}
	
	/**
	 * getPromotionCarouselActions()
	 *
	 * Gibt alle Promotion-Artikel der Hauptkategorie zurueck
	 *
	 * @access public
	 * @param  {int} $cat_id - KategorieID
	 * @return {string} $retPromo - Array mit den gefundenen Promotions
	 */
	public function getPromotionCarouselAction($cat_id = 3)
	{
		$cat_id = (int) $cat_id;
		$promotion_articles = Shopware()->Modules()->Articles()->sGetPromotions($cat_id);
		
		$i = 0;
		foreach($promotion_articles as $art) {
			if($art['mode'] === 'fix') {
				$retPromo['promotion'][$i] = array(
					'articleID'   => $art['articleID'],
					'id'          => $art['articleID'],
					'name'        => $this->truncate($art['articleName'], 15),
					'supplier'    => $art['supplierName'],
					'ordernumber' => $art['ordernumber'],
					'desc'        => $this->truncate($art['description_long'], 90),
					'img_url'     => $this->stripBasePath($art['image']['src'][2]),
					'price'       => $art['price']
				);
				$i++;
			}
		}

		if(!isset($retPromo) && empty($retPromo)) {
			$retPromo['promotion'] = array();
		}

		$this->jsonOutput($retPromo);
	}
	
	/**
	 * getBannersByCategoryIdAction()
	 *
	 * Liest alle Banner einer Kategorie aus und gibt diese per JSON String zurueck
	 *
	 * @access public
	 * @param  {int} $cat_id - KategorieID
	 * @param  {int} $limit - Maximalanzahl der Banner
	 * @return {string} $retBanners - Array mit den gefundenen Banner
	 */
	public function getBannersByCategoryIdAction($cat_id=3, $limit=10)
	{
		$params = Shopware()->Front()->Request();
		
		if(isset($params->cat_id) && !empty($params->cat_id)) { $cat_id = (int) $params->cat_id; }
		if(isset($params->limit) && !empty($params->limit)) { $limit = (int) $params->limit; }

		$banners = Shopware()->Modules()->Marketing()->sBanner($cat_id, $limit);
		
		$retBanners = array(
			'count'   => count($banners),
			'success' => true,
			'banners' => array()
		);
		
		$i = 0;
		foreach($banners as $banner) {
			$retBanners['banners'][$i] = array(
				'desc' => $banner['description'],
				'img' => $this->stripBasePath($banner['img']),
				'link' => $banner['link']
			);
			$i++;
		}
		
		$this->jsonOutput($retBanners);
	}
	
	/**
	 * getArticlesByCategoryIdAction()
	 *
	 * Laedt alle Artikel einer bestimmten Kategorie
	 *
	 * @access public
	 * @param  {int} $_GET['categoryId']
	 * @return {string} json string
	 */
	public function getArticlesByCategoryIdAction()
	{
		// Handle category id
		$id = $this->Request()->getParam('categoryID');
		if(empty($id)) {
			$id = 3;
		}
		$id = (int) $id;

		// Handle page
		$page = $this->Request()->getParam('page');
		if(!empty($page)) {
			$this->system->_GET['sPage'] = (int) $page;
		}

		// Handle article per page
		$limit = $this->Request()->getParam('limit');
		if(!empty($limit)) {
			$this->system->_GET['sPerPage'] = (int) $limit;
		}

		// Handle article sorting
		$sort = $this->Request()->getParam('sSort');
		if(!empty($sort)) {
			$this->system->_POST['sSort'] = $sort;
		}

		// Handle supplier
		$supplier = $this->Request()->getParam('sSupplier');
		if(!empty($supplier)) {
			$this->system->_GET['sSupplier'] =(int) $supplier;
		}

		// Fetch data
		$articles  = Shopware()->Modules()->Articles()->sGetArticlesByCategory($id);
		$suppliers = Shopware()->Modules()->Articles()->sGetAffectedSuppliers($id);
		$banner   = Shopware()->Modules()->Marketing()->sBanner($id);
		
		$i = 0;
		foreach($articles['sArticles'] as $article) {
			$articles['sArticles'][$i]['image_url'] = '';
			$articles['sArticles'][$i]['articleName'] = utf8_encode($article['articleName']);
			$articles['sArticles'][$i]['description_long'] = utf8_encode($this->truncate($article['description_long'], 80));
			if(isset($article['image']['src'])) {
				$articles['sArticles'][$i]['image_url'] = $this->stripBasePath($article['image']['src'][1]);
			}
			$i++;
		}

		$articles = array_merge($articles, array('sSuppliers' => $suppliers), array('sBanner' => $banner));
		$this->jsonOutput($articles);
	}
	
	/**
	 * getArticleDetailsAction()
	 *
	 * Liest alle Artikeldetails aus
	 *
	 * @access public
	 * @param  {int} $_GET['articleId']
	 * @return {string} json string
	 */
	public function getArticleDetailsAction()
	{
		$id = (int) $this->Request()->getParam('articleId');
		$article = Shopware()->Modules()->Articles()->sGetArticleById($id);

		$article['articleName'] = utf8_encode($this->truncate($article['articleName'], 30));
		$article['priceNumeric'] = preg_replace('/,/', '.', $article['price']);
		if(!empty($article['pseudoprice'])) {
			$article['pseudoPriceNumeric'] = preg_replace('/,/', '.', $article['pseudoprice']);
		}

		// Images
		if(isset($article['image']['src'])) {
			$article['small_image'] = $this->stripBasePath($article['image']['src'][2]);
			$article['image_url'] = $this->stripBasePath($article['image']['src'][3]);
		}

		// Comments
		if(!empty($article['sVoteComments'])) {
			$i = 0;
			foreach($article['sVoteComments'] as $comment) {
				$article['sVoteComments'][$i]['headline'] = utf8_encode($comment['headline']);
				$article['sVoteComments'][$i]['comment'] = utf8_encode($comment['comment']);
				$i++;
			}
		}

		if(!empty($article['sUnit'])) {
			$article['sUnit']['description'] = utf8_encode($article['sUnit']['description']);
		}

		// Bundles
		$bundle = Shopware()->Modules()->Articles()->sGetArticleBundlesByArticleID($id);
		if(!empty($bundle)) {
			$i = 0;
			foreach($bundle as $item) {
				$j = 0;
				foreach($item['sBundleArticles'] as $art) {
					$bundle[$i]['sBundleArticles'][$j]['sDetails']['image_url'] = $this->stripBasePath($art['sDetails']['image']['src'][2]);
					$j++;
				}
				$i++;
			}
			$article['sBundles'] = $bundle;
		}
		
		$this->jsonOutput(array('sArticle' => array($article)));
	}

	/**
	 * searchAction()
	 *
	 * Fuehrt eine Suche aus und gibt das Ergebnis als JSON String zurueck
	 *
	 * @return void
	 */
	public function searchAction() {

		// Handle page
		$page = $this->Request()->getParam('page');
		if(!empty($page)) {
			$this->system->_GET['sPage'] = (int) $page;
		}

		// Handle article per page
		$limit = $this->Request()->getParam('limit');
		if(!empty($limit)) {
			$this->system->_GET['sPerPage'] = (int) $limit;
		}
		$limit = (int) $limit;

		if ($this->Request()->sSearchMode=="supplier"){
			$variables = Shopware()->Modules()->Articles()->sGetArticlesByName("a.name ASC","","supplier",urldecode($this->Request()->sSearch));
			$this->Request()->setParam('sSearch',urldecode($this->Request()->sSearchText));
		} elseif ($this->Request()->sSearchMode=="newest"){
			$variables = Shopware()->Modules()->Articles()->sGetArticlesByName("a.datum DESC","","newest",urldecode($this->Request()->sSearch));
			$this->Request()->setParam('sSearch',urldecode($this->Request()->sSearchText));
		} else {
			$variables = Shopware()->Modules()->Articles()->sGetArticlesByName("a.topseller DESC","","",urldecode($this->Request()->sSearch));
		}
		foreach ($variables["sPerPage"] as $perPageKey => &$perPage){
			$perPage["link"] = str_replace("sPage=".$this->Request()->sPage,"sPage=1",$perPage["link"]);
		}
		if (!empty($variables["sArticles"])){
			$searchResults = $variables["sArticles"];
		}else {
			$searchResults = $variables;
		}

		foreach ($searchResults as $searchResult){
			if (is_array($searchResult)) $searchResult = $searchResult["id"];
			$article = Shopware()->Modules()->Articles()->sGetPromotionById ('fix',0,$searchResult);

			if (!empty($article["articleID"])){
				$article['articleName'] = utf8_encode($article['articleName']);
				if(!empty($article['description'])) {
					$article['description'] = utf8_encode(strip_tags($article['description']));
				} else {
					$article['description'] = $this->truncate(utf8_encode(strip_tags($article['description_long'])), 100);
				}
				if(!empty($article['image']['src'])) {
					$article['img'] = $this->stripBasePath($article['image']['src'][1]);
				}
				$articles[] = $article;
			}
		}
		$output = array(
			'success'      => (count($articles)) ? true : false,
			'sResults'     => (count($articles)) ? $articles : '',
			'resultNum'    => empty($variables["sNumberArticles"]) ? count($articles) : $variables["sNumberArticles"],
			'sNumberPages' => $variables["sNumberPages"]
		);

		$this->jsonOutput($output);
	}
	
	/**
	 * getArticleImagesAction()
	 *
	 * Liest alle Bilder eines Artikels aus
	 *
	 * @access public
	 * @param  {int} $_GET['articleId']
	 * @return {string} json string 
	 */
	public function getArticleImagesAction()
	{
		$id = (int) $this->Request()->getParam('articleId');
		$article = Shopware()->Modules()->Articles()->sGetArticleById($id);
		$images = array();

		// Main image
		if(!empty($article['image'])) {
			$images[] = array(
				'desc' => $this->utf8decode($article['image']['res']['description']),
				'small_picture' => $this->stripBasePath($article['image']['src'][4]),
				'big_picture'   => $this->stripBasePath($article['image']['src'][5]),
			);
		}

		if(!empty($article['images'])) {
			foreach($article['images'] as $img) {
				$images[] = array(
					'desc' => $this->utf8decode($img['description']),
					'small_picture'	=> $this->stripBasePath($img['src'][4]),
					'big_picture'   => $this->stripBasePath($img['src'][5])
				);
			}
		}
		
		$this->jsonOutput(array('images' => $images));
	}

	/**
	 * addCommentAction()
	 *
	 * Speichert ein Benutzerkommentar
	 * 
	 * @access public
	 * @return void
	 */
	public function addCommentAction()
	{
		$articleID = (int) $this->Request()->getParam('articleID');
		Shopware()->System()->_POST["sVoteName"] =  $this->utf8decode(Shopware()->System()->_POST["sVoteName"]);
		Shopware()->System()->_POST["sVoteSummary"] = $this->utf8decode(Shopware()->System()->_POST["sVoteSummary"]);
		Shopware()->System()->_POST["sVoteComment"] = $this->utf8decode(Shopware()->System()->_POST["sVoteComment"]);
		Shopware()->Modules()->Articles()->sSaveComment($articleID);

		$this->jsonOutput('{success: true}');
	}

	/**
	 * addBundleToCartAction
	 *
	 * Fuegt ein Bundle zum Warenkorb hinzu
	 *
	 * @access public
	 * @return void
	 */
	public function addBundleToCartAction()
	{
		$id = (int) $this->Request()->getParam('id');
		$ordernumber = $this->Request()->getParam('ordernumber');

		$bundle = Shopware()->Modules()->Basket()->sAddBundleArticle($ordernumber, $id);
		$this->jsonOutput($bundle);
	}
	
	/**
	 * getBasketAction()
	 *
	 * Liest alle Artikel im Warenkorb aus und gibt diese als
	 * JSON String zurueck
	 *
	 * @access public
	 * @param  void
	 * @return {string} json string
	 */
	public function getBasketAction() {
		$basket = Shopware()->Modules()->Basket()->sGetBasket();
		
		$i = 0;
		foreach($basket['content'] as $item) {
		
			$sql = "SELECT * FROM s_articles AS a
					LEFT JOIN s_articles_supplier AS s ON s.id = a.supplierID
					WHERE a.id = ?";
			$row = Shopware()->Db()->fetchRow($sql, array(
				$item['articleID']
			));
			$basket['content'][$i]['supplierName'] = utf8_encode($row['name']);
			$basket['content'][$i]['articlename'] = utf8_encode($item['articlename']);
			$basket['content'][$i]['image_url'] = $this->stripBasePath($item['image']['src'][1]);
			$i++;
		}
		$this->jsonOutput($basket);
	}


	/**
	 * getBasketAmountAction()
	 *
	 * Gibt den gesamten Warenkorbwert als JSON String zurueck
	 *
	 * @access public
	 * @return void
	 */
	public function getBasketAmountAction() {
		$amount = Shopware()->Modules()->Basket()->sGetAmountArticles();
		$this->jsonOutput($amount);
	}
	
	/**
	 * removeArticleFromCartAction()
	 *
	 * Loescht einen Artikel aus dem Warenkorb
	 *
	 * @access public
	 * @param  {int} $_POST['articleId']
	 * @return {string} json string
	 */
	public function removeArticleFromCartAction()
	{
		$id = (int) $this->Request()->getParam('articleId');
		Shopware()->Modules()->Basket()->sDeleteArticle($id);
		
		$this->jsonOutput(array('success' => true));
	}
	
	/**
	 * deleteBasketAction()
	 *
	 * Loescht den gesamten Warenkorb
	 *
	 * @access public
	 * @param  void
	 * @return {string} json string
	 */
	public function deleteBasketAction()
	{
		Shopware()->Modules()->Basket()->sDeleteBasket();
		Shopware()->Modules()->Order()->sDeleteTemporaryOrder();
		
		$this->jsonOutput(array('success' => true));
	}
	
	/**
	 * getInfoSitesAction()
	 *
	 * Liest alle statischen Seiten einer Gruppe aus
	 *
	 * @access public
	 * @param  {string} $group
	 */
	public function getInfoSitesAction()
	{
		$config = Shopware()->Plugins()->Frontend()->SwagMobileTemplate()->Config();
		if(!empty($config->staticgroup)) {
			$menu = $this->getMenu($config->staticgroup);
		} else {
			$plugin = Shopware()->Plugins()->Core()->ControllerBase();
			$menu = $plugin->getMenu();
		}

		$output = array();
		foreach($menu as $name => $groups) {
			if($name !== 'gDisabled' && $name === $config->staticgroup) {
				$count = count($groups);
				foreach($groups as $site) {
					if(empty($site['link'])) {
						$output[] = array(
							'name'      => utf8_encode($site['description']),
							'content'   => $site['html'],
							'groupName' => $name . ' (' . $count . ' Seiten)',
							'form'      => '',
							'link'      => $site['link']
						);
					}
				}
			}
		}
		$this->jsonOutput(array('sStatics' => $output));
	}

	/**
	 * getPaymentMethodsAction()
	 *
	 * Liest alle verfuegbaren Zahlungsarten aus und gibt diese per
	 * JSON zurueck
	 *
	 * @return void
	 */
	public function getPaymentMethodsAction() {
		$paymentMethods = Shopware()->Modules()->Admin()->sGetPaymentMeans();
		$this->jsonOutput(array('sPaymentMethods' => $paymentMethods));
	}

	/**
	 * getActiveDispatchMethod
	 *
	 * Gibt die aktuelle Versandart zurueck
	 *
	 * @return bool|mixed
	 */
	private function getActiveDispatchMethod()
	{
		if(empty(Shopware()->Session()->sCountry)) {
			return false;
		}

		$dispatches = Shopware()->Modules()->Admin()->sGetDispatches(Shopware()->Session()->sCountry);
		if(empty($dispatches))
		{
			unset(Shopware()->Session()->sDispatch);
			return false;
		}

		foreach ($dispatches as $dispatch)
		{
			if($dispatch['id'] == Shopware()->Session()->sDispatch)
			{
				return $dispatch;
			}
		}
		$dispatch = reset($dispatches);
		Shopware()->Session()->sDispatch = (int) $dispatch['id'];
		return $dispatch;
	}
	
	/**
	 * isUserLoggedInAction()
	 *
	 * Prueft ob ein Benutzer eingeloggt ist
	 *
	 * @access public
	 * @return {string} Loginstatus
	 */
	public function isUserLoggedInAction()
	{
		$userLoggedIn = Shopware()->Modules()->Admin()->sCheckUser();

		if($userLoggedIn) {
			$userData = Shopware()->Modules()->Admin()->sGetUserData();
			if(isset($userData['additional']) && !empty($userData['additional'])) {
				Shopware()->Session()->sCountry = $userData['additional']['country']['id'];
			}
		}

		$this->jsonOutput($userLoggedIn);
	}
	
	/**
	 * getUserDataAction()
	 *
	 * Gibt die Benuterdaten eines eingeloggten Benutzers per JSON
	 * zurueck
	 *
	 * @access public
	 * @return {string} Benutzerdaten
	 */
	public function getUserDataAction()
	{
		$userData = Shopware()->Modules()->Admin()->sGetUserData();

		foreach($userData as $group => $values) {
			if($group !== 'additional') {
				foreach($values as $k => $v) { $return[$group][$k] = htmlentities($v); }
			} else { $return[$group] = $values; }
		}

		if(isset($userData['additional']) && !empty($userData['additional'])) {
			Shopware()->Session()->sCountry = $userData['additional']['country']['id'];
		}

		$return['activeDispatch'] = $this->getActiveDispatchMethod();
		$this->jsonOutput(array('sUserData' => $return));
	}
	
	/**
	 * loginAction()
	 *
	 * Loggt einen Benutzer ein
	 *
	 * @access public
	 * @return {string} Benutzerdaten
	 */
	public function loginAction()
	{
		if($this->Request()->isPost()) {
			$login = Shopware()->Modules()->Admin()->sLogin();
		}

		$basket = Shopware()->Modules()->Basket()->sCountArticles();

		if(!empty($login['sErrorMessages']) && !Shopware()->Modules()->Admin()->sCheckUser()) {
			$output = array(
				'success' => false,
				'msg'     => 'Ihre Zugangsdaten konnten keinem Benutzer zugeordnet werden.'
			);
		} else {
			$output = array(
				'success' => true,
				'msg'     => 'Ihr Login war erfolgreich. Bitte klicken Sie auf "Ok" um fortzufahren.',
				'basket'  => $basket
			);
		}

		$this->jsonOutput($output);
	}
	
	/**
	 * stripBasePath()
	 *
	 * Entfernt den BasePath aus einer URL
	 *
	 * @access private
	 * @param  {string} $url
	 * @return {string} stripped url
	 */
	private function stripBasePath($url)
	{
		/* Sencha.io "Src" service */
		if($this->plugin->Config()->useSrc) {
			$url = $this->senchaIo . $url;
		}
		return $url;
	}
	
	/**
	 * jsonOutput()
	 *
	 * Gibt einen formatierten JSON String zurueck und unterbindet die Ausgabe eines Templates
	 *
	 * @access private
	 * @param  {string} $json_str - Auszugebener String
	 * @return void
	 */
	private function jsonOutput($json_str)
	{
		$callback = $this->Request()->getParam('callback');
		$callback = preg_replace('#[^0-9a-z]+#i', '', (string) $callback);
		if(!empty($callback)) {
			echo $callback."(" . json_encode($json_str) . ");";
		} else {
			echo json_encode($json_str);
		}
	}
    
    /**
     * truncate()
     *
     * Kuerzt einen String auf die gegebene Laenge
     *
     * @access private
     * @param  {string} $str - zu kuerzender String
     * @param  {string} $length - Laenge des Strings
     * @param  {string} $trailing - Zeichen die am Ende des String eingefuegt werden
     * @return {string} $res - gekuerzter String mit Trailing
     */
    private function truncate($str, $length=10, $trailing='...')
    {
    	$length-=mb_strlen($trailing);
	     if (mb_strlen($str)> $length)
	     {
	        // string exceeded length, truncate and add trailing dots
	        return mb_substr($str,0,$length).$trailing;
	     }
	     else
	     {
	        // string was already short enough, return the string
	        $res = $str;
	     }
	 
	     return $res;
	}
	
	/**
	 * utf8decode()
	 *
	 * Decodiert einen UTF8 String
	 *
	 * @access private
	 * @param  {string} $str - zu decodierender String
	 * @return {string} $str - decodierter String
	 */
	private function utf8decode($str) {
		if(function_exists('mb_convert_encoding')) {
		   $str = mb_convert_encoding($str, 'HTML-ENTITIES', 'UTF-8');
		   $str = html_entity_decode($str, ENT_NOQUOTES);
		  } else {
		   $str = utf8_decode($str );
		 }
		return $str;
	}

	/**
	 * getMenu
	 *
	 * Laedt die angegebene Gruppe von statischen Shopseiten
	 * 
	 * @param string $groupName
	 * @return array
	 */
	private function getMenu($groupName = '') {
		$menu = array();
		$sql = 'SELECT `id`, `description`, `html`, `grouping`, `link` FROM s_cms_static WHERE grouping!=\'\' ORDER BY position ASC';
		if(!empty($groupName)) {
			$sql = "SELECT `id`, `description`, `html`, `grouping`, `link` FROM `s_cms_static` WHERE `grouping` LIKE '%".$groupName."%' GROUP BY id ORDER BY position ASC";
		}

		$links = Shopware()->Db()->fetchAll($sql);
		foreach ($links as $link)
		{
			$groups = explode('|', $link['grouping']);
			foreach ($groups as $group)
			{
				$group = trim($group);
				if(empty($group)) continue;
				$menu[$group][] = $link;
			}
		}

		if (!empty(Shopware()->System()->sSubShop['navigation']))
		{
			foreach (explode(';', Shopware()->System()->sSubShop['navigation']) as $group)
			{
				$group = explode(':', $group);
				if(empty($group[0])||empty($group[1])||empty($menu[$group[1]])) continue;
				$menu[$group[0]] = $menu[$group[1]];
			}
		}

		return $menu;
	}
}