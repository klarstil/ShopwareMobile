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
	/** {str} sencha io url */
	protected $senchaIo;

	/** {obj} shopware system */
	protected $system;

	/** {obj} shopware config */
	protected $config;

	/** {obj} shopware module */
	protected $module;

	/** {obj} session object */
	protected $session;

	/** {obj} generell view renderer */
	protected $ViewRenderer;
	
	/** {arr} Plugin configuration */
	protected $props;

	/**
	 * Constructor method which gets the configuration
	 * and sets some class properties to save keystrokes.
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
		$this->ViewRenderer = Shopware()->Plugins()->Controller()->ViewRenderer();

		// Get all settings
		$props = Shopware()->Db()->query('SELECT * FROM `s_plugin_mobile_settings`');
		$props = $props->fetchAll();

		$properties = array();
		foreach($props as $prop) {
			$properties[$prop['name']] = $prop['value'];
		}

		$this->props = $properties;
	}

	/**
	 * Get all main categories for the main page
	 * of the mobile template.
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
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

			/** Get article count to hide empty categories */
			$count = Shopware()->Db()->fetchRow("
				SELECT COUNT(*) as count FROM s_articles_categories WHERE categoryID=?
			",array($cat['id']));
			$count = (int) $count['count'];

			if($count > 0) {
				$output[$i] = array(
					'id'     => $cat['id'],
					'name'   => utf8_encode($cat['description']),
					'desc'   => utf8_encode($this->truncate(strip_tags($categoryInfo['cmstext']), 100)),
					'sub'    => ($cat['hasSubCategories'] == 1) ? true : false
				);
				$i++;
			}
		}
		$this->jsonOutput(array('categories' => $output));
	}

	/**
	 * Get all subcategories based on the
	 * passed category id.
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
	 */
	public function getCategoriesTreeAction()
	{
		/* Set node */
		if(!empty($this->Request()->node) && $this->Request()->node !== 'root') {
			$node = intval($this->Request()->node);
		} else {
			$node = 3;
		}
		if(isset($this->Request()->categoryID) && !empty($this->Request()->categoryID)) {
			$node = intval($this->Request()->categoryID);
		}

		if($this->Request()->node === 'root' && empty($this->Request()->categoryID)) {
			$this->jsonOutput(array('categories' => ''));
			exit();
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
			AND c.active = 1
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

				if($category['article_count'] > 0 && $categoryInfo['blog'] == '0') {
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
		}
		$this->jsonOutput(array('categories' => $nodes));
	}
	
	/**
	 * Gets all promotions articles from the given
	 * category id (default 3 = german).
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @param int $cat_id
	 * @return void
	 */
	public function getPromotionCarouselAction($cat_id = 3)
	{
		$languageData = Shopware()->System()->sLanguageData;
		$activeLanguage = $languageData[Shopware()->System()->sLanguage];
		$cat_id = $activeLanguage['parentID'];
		
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
	 * Gets all banners for a subcategory
	 * based on the passed category id (default = 3)
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @param int $cat_id
	 * @param int $limit
	 * @return void
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

			list($width, $height, $type, $attr) = getimagesize($banner['img']);
			$retBanners['banners'][$i] = array(
				'desc'   => $banner['description'],
				'img'    => $this->stripBasePath($banner['img']),
				'link'   => $banner['link'],
				'height' => $height
			);
			$i++;
		}
		
		$this->jsonOutput($retBanners);
	}
	
	/**
	 * Get all articles (with pagination) from a
	 * given category id.
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
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
			$articles['sArticles'][$i]['articleName'] = $this->utf8encode($article['articleName']);
			$articles['sArticles'][$i]['description_long'] = $this->utf8encode($this->truncate(strip_tags($article['description_long']), 80));
			if(isset($article['image']['src'])) {
				$articles['sArticles'][$i]['image_url'] = $this->stripBasePath($article['image']['src'][1]);
			}
			$i++;
		}

		/** Handle banner size */
		if(isset($banner) && is_array($banner)) {
			list($width, $height, $type, $attr) = getimagesize($banner['img']);
			$banner['height'] = $height;
			$banner['width'] = $width;
		}

		/** Remove some unneeded junk =)  */
		if(!empty($articles['sPerPage'])) {
			unset($articles['sPerPage']);
		}
		if(!empty($articles['sPropertiesGrouped'])) {
			unset($articles['sPropertiesGrouped']);
		}
		if(!empty($articles['sPropertiesOptionsOnly'])) {
			unset($articles['sPropertiesOptionsOnly']);
		}
		if(!empty($articles['sPages'])) {
			unset($articles['sPages']);
		}

		$articles = array_merge($articles, array('sSuppliers' => $suppliers), array('sBanner' => $banner));
		$this->jsonOutput($articles);
	}
	
	/**
	 * Get the article details based on the
	 * passed article id. The data will be optimized for a smaller
	 * response size.
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
	 */
	public function getArticleDetailsAction()
	{

		$id = $this->Request()->getParam('articleId');

		/** Replace configurator groups due to a bug in safari mobile
		 *  which fires the following JS error:
		 *  Invalid ComponentQuery selector: "]" */
		if(isset($_POST) && !empty($_POST)) {
			foreach($this->system->_POST as $key => $value) {
				preg_match('/group.([0-9]+)/i', $key, $matches);
				if(!empty($matches)) {
					$this->system->_POST['group'][$matches[1]] = $value;
					unset($this->system->_POST[$key]);
				}
			}
		}
		
		$article = Shopware()->Modules()->Articles()->sGetArticleById($id);
		
						
		$article['mode'] = (int) $article['mode'];
		if($article['mode'] !== 1) {
			$article['articleName'] = $this->utf8encode($this->truncate($article['articleName'], 30));
		} else {
			$article['articleName'] = $this->utf8encode($article['articleName']);
		}
		$article['description_long'] = $this->utf8encode($article['description_long']);
		
		$article['priceNumeric'] = preg_replace('/,/', '.', $article['price']);
		if(!empty($article['pseudoprice'])) {
			$article['pseudoPriceNumeric'] = preg_replace('/,/', '.', $article['pseudoprice']);
		}

		// Images
		if(isset($article['image']['src'])) {
			$article['small_image'] = $this->stripBasePath($article['image']['src'][2]);
			if($article['mode'] !== 1) {
				$article['image_url'] = $this->stripBasePath($article['image']['src'][3]);
			} else {
				$article['image_url'] = $this->stripBasePath($article['image']['src'][4]);
			}
		}

		// Comments
		if(!empty($article['sVoteComments'])) {
			$i = 0;
			foreach($article['sVoteComments'] as $comment) {
				$article['sVoteComments'][$i]['headline'] = $this->utf8encode($comment['headline']);
				$article['sVoteComments'][$i]['comment'] = $this->utf8encode($comment['comment']);
				$i++;
			}
		}

		// Base price
		if(!empty($article['sUnit'])) {
			$article['sUnit']['description'] = $this->utf8encode($article['sUnit']['description']);
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

		// Configurator
		if(!empty($article['sConfigurator'])) {
			foreach($article['sConfigurator'] as $id => $configurator) {
				$article['sConfigurator'][$id]['groupname'] = $this->utf8encode($configurator['groupname']);
				$article['sConfigurator'][$id]['groupdescription'] = $this->utf8encode($configurator['groupdescription']);
				foreach($configurator['values'] as $key => $value) {
					$article['sConfigurator'][$id]['values'][$key]['optionname'] = $this->utf8encode($value['optionname']);
				}
			}
		}

		// Variants
		if(!empty($article['additionaltext'])) {
			$article['additionaltext'] = $this->utf8encode($article['additionaltext']);
		}
		if(!empty($article['sVariants'])) {
			foreach($article['sVariants'] as $id => $variant) {
				$article['sVariants'][$id]['additionaltext'] = $this->utf8encode($variant['additionaltext']);
			}
		}
		
		$this->jsonOutput(array('sArticle' => array($article)));
	}

	/**
	 * Processes a search request on the based
	 * of the normal search (no fuzzy search license needed).
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
	 */
	public function searchAction()
	{

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

		// Support umlauts
		$search = (string) $this->Request()->sSearch;
		$search = urldecode($search);
		$search = $this->utf8decode($search);

		if ($this->Request()->sSearchMode=="supplier"){
			$variables = Shopware()->Modules()->Articles()->sGetArticlesByName("a.name ASC","","supplier", $search);
			$this->Request()->setParam('sSearch',urldecode($this->Request()->sSearchText));
		} elseif ($this->Request()->sSearchMode=="newest"){
			$variables = Shopware()->Modules()->Articles()->sGetArticlesByName("a.datum DESC","","newest", $search);
			$this->Request()->setParam('sSearch',urldecode($this->Request()->sSearchText));
		} else {
			$variables = Shopware()->Modules()->Articles()->sGetArticlesByName("a.topseller DESC","","", $search);
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
	 * Get all articles images based on the passed
	 * article id.
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
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
	 * Saves a user comment in the database with
	 * standard method from shopware
	 *
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
	 * Adds a bundle to the basket and
	 * returns the placed bundle as a json string
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
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
	 * Gets the whole basket from the DB and adds the
	 * supplier name to it.
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
	 */
	public function getBasketAction()
	{
		$basket = Shopware()->Modules()->Basket()->sGetBasket();
		
		$i = 0;
		foreach($basket['content'] as $item) {
		
			$sql = "SELECT * FROM s_articles AS a
					LEFT JOIN s_articles_supplier AS s ON s.id = a.supplierID
					WHERE a.id = ?";
			$row = Shopware()->Db()->fetchRow($sql, array(
				$item['articleID']
			));
			$basket['content'][$i]['supplierName'] = $this->utf8encode($row['name']);
			$basket['content'][$i]['articlename'] = $this->utf8encode($item['articlename']);
			$basket['content'][$i]['image_url'] = $this->stripBasePath($item['image']['src'][0]);
			$i++;
		}
		$this->jsonOutput($basket);
	}


	/**
	 * Returns the basket amount as a json string
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
	 */
	public function getBasketAmountAction()
	{

		$amount = Shopware()->Modules()->Basket()->sGetAmountArticles();
		$this->jsonOutput($amount);
	}
	
	/**
	 * Removes an article from the basket based
	 * on the passed article id.
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
	 */
	public function removeArticleFromCartAction()
	{

		$id = (int) $this->Request()->getParam('articleId');
		Shopware()->Modules()->Basket()->sDeleteArticle($id);
		
		$this->jsonOutput(array('success' => true));
	}
	
	/**
	 * Deletes the whole basket and returns
	 * an json string as the result
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
	 */
	public function deleteBasketAction()
	{

		Shopware()->Modules()->Basket()->sDeleteBasket();
		Shopware()->Modules()->Order()->sDeleteTemporaryOrder();
		
		$this->jsonOutput(array('success' => true));
	}
	
	/**
	 * Returns a list of all avaible information pages
	 * based on the backend module settings
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
	 */
	public function getInfoSitesAction()
	{

		if(!empty($this->props['infoGroupName'])) {
			$menu = $this->getMenu($this->props['infoGroupName']);
		} else {
			$plugin = Shopware()->Plugins()->Core()->ControllerBase();
			$menu = $plugin->getMenu();
		}

		$output = array();
		foreach($menu as $name => $groups) {
			if($name !== 'gDisabled' && $name === $this->props['infoGroupName']) {
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
	 * Returns all available payment methods
	 * as a json string
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
	 */
	public function getPaymentMethodsAction()
	{

		$paymentMethods = Shopware()->Modules()->Admin()->sGetPaymentMeans();
		
		$paymentmeans = Shopware()->Db()->query("SELECT `id`, `name`, `description`, `additionaldescription` FROM `s_core_paymentmeans`");
		$paymentmeans = $paymentmeans->fetchAll();
		
		foreach($paymentmeans as &$payments) {
			$payments['description'] = $this->utf8encode($payments['description']);
			$payments['name'] = $this->utf8encode($payments['name']);
		}
		
		$this->jsonOutput(array('sPaymentMethods' => $paymentmeans));
	}

	/**
	 * Returns the currently active dispatch method
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
	 * Checks if the user is logged in and returns the state
	 * as a json string
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
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
	 * Returns the user informations if the
	 * user is logged into the system
	 *
	 * Note that the data which will be passed
	 * to the view are utf8 encoded
	 *
	 * @return void
	 */
	public function getUserDataAction()
	{
		$userData = Shopware()->Modules()->Admin()->sGetUserData();

		if(!empty($userData['additional']['countryShipping']))
		{
			$sTaxFree = false;
			if (!empty( $userData['additional']['countryShipping']['taxfree'])){
				$sTaxFree = true;
			} elseif (
				(!empty($userData['additional']['countryShipping']['taxfree_ustid']) || !empty($userData['additional']['countryShipping']['taxfree_ustid_checked']))
				&& !empty($userData['billingaddress']['ustid'])
				&& $userData['additional']['country']['id'] == $userData['additional']['countryShipping']['id']) {
				$sTaxFree = true;
			}
			if(!empty($sTaxFree))
			{
				Shopware()->System()->sUSERGROUPDATA['tax'] = 0;
				Shopware()->System()->sCONFIG['sARTICLESOUTPUTNETTO'] = 1;
				Shopware()->System()->_SESSION['sUserGroupData'] = Shopware()->System()->sUSERGROUPDATA;
				$userData['additional']['charge_vat'] = false;
				$userData['additional']['show_net'] = false;
			}
			else
			{
				$userData['additional']['charge_vat'] = true;
				$userData['additional']['show_net'] = !empty(Shopware()->System()->sUSERGROUPDATA['tax']);
			}
		}

		if(isset($userData['additional']) && !empty($userData['additional'])) {
			Shopware()->Session()->sCountry = $userData['additional']['country']['id'];
		}

		$userData['activeDispatch'] = $this->getActiveDispatchMethod();

		// Proper handle encoding
		foreach($userData as $group => $array) {
			foreach($array as $key => $value) {
				if(is_array($value)) {
					foreach($value as $k => $v)	{
						$userData[$group][$key][$k] = $this->utf8encode($v);
					}
				} else {
					$userData[$group][$key] = $this->utf8encode($value);
				}
			}
		}

		$this->View()->assign('sUserData', $userData);
		$path = dirname(__FILE__) . DIRECTORY_SEPARATOR . 'Views' . DIRECTORY_SEPARATOR . 'frontend' . DIRECTORY_SEPARATOR . 'plugins' . DIRECTORY_SEPARATOR . 'swag_mobiletemplate' . DIRECTORY_SEPARATOR;
		$this->View()->loadTemplate($path . 'get_user_data.tpl');
	}
	
	/**
	 * Logs in the user into the system and
	 * returns a json string as a response
	 *
	 * @return void
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
	 * Logs out a user from the system and returns
	 * a json string as a response
	 *
	 * @return void
	 */
	public function logoutAction()
	{
		Shopware()->Modules()->Admin()->sLogout();

		$output = array(
			'success' => true,
			'msg'     => 'Ihr Logout war erfolgreich.'
		);

		$this->jsonOutput($output);
	}
	
	/**
	 * Strips the base path from the passed url. This method
	 * is a helper method to enable the usage of sencha.io
	 *
	 * @param $url
	 * @return mixed
	 */
	private function stripBasePath($url)
	{
		$request = Enlight::Instance()->Front()->Request();
		$basePath = $request->getScheme().'://'. $request->getHttpHost() . $request->getBasePath() . '/';

		$url = str_ireplace($basePath, '', $url);
		return $url;
	}
	
	/**
	 * Returns a json string with the suitable
	 * MIME type and if needed with a JSONP callback
	 *
	 * @param $json_str
	 * @return void
	 */
	private function jsonOutput($json_str)
	{
		/* No view needed */
		$this->ViewRenderer->setNoRender();

		/* Set proper mime type for json reponse */
		$this->Response()->setHeader('Content-Type', 'application/json');

		/* Add callback for jsonp requests */
		$callback = $this->Request()->getParam('callback');
		if(!empty($callback)) {
			$callback = preg_replace('#[^0-9a-z]+#i', '', (string) $callback);
			echo $callback."(" . json_encode($json_str) . ");";
		} else {
			echo json_encode($json_str);
		}
	}
    
    /**
	 * Truncates a string based on the passed length (default 10
	 * characters) and appends a trailing string (default ...)
	 * to the end of the passed string
	 *
	 * @param $str
	 * @param int $length
	 * @param string $trailing
	 * @return string
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
	 * Converts a string with ISO-8859-1 characters encoded with UTF-8
	 * to single-byte ISO-8859-1.
	 * If the function "mb_convert_encoding" is available this method
	 * will be used rather than "utf8_decode".
	 *
	 *
	 * @param $str
	 * @return string
	 */
	private function utf8decode($str) {
		if(function_exists('mb_convert_encoding')) {
			$str = mb_convert_encoding($str, 'HTML-ENTITIES', 'UTF-8');
			$str = html_entity_decode($str, ENT_NOQUOTES);
		} else {
			$str = utf8_decode($str);
		}
		return $str;
	}

	/**
	 * Encodes an ISO-8859-1 string to UTF-8. This function encodes
	 * the string data to UTF-8, and returns the encoded version.
	 *
	 * If the function "mb_convert_encoding" is available this method
	 * will be used rather than "utf8_encode".
	 *
	 * @param $str
	 * @return string
	 */
	private function utf8encode($str) {
		if(function_exists('mb_convert_encoding')) {
			$str = mb_convert_encoding($str, 'UTF-8', 'HTML-ENTITIES');
		} else {
			$str = utf8_encode($str);
		}
		return $str;
	}

	/**
	 * Loads the informations based on the passed
	 * group name. The returned data will be used
	 * in the information section of the mobile template.
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