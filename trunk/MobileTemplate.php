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
			$categoryInfo = Shopware()->Modules()->Categories()->sGetCategoryContent($cat['id']);
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
		
		if(isset($params->cat_id) && !empty($params->cat_id)) { $cat_id = $params->cat_id; }
		if(isset($params->limit) && !empty($params->limit)) { $limit = $params->limit; }
		
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
		$id = $this->Request()->getParam('categoryId');
		if(empty($id)) { $id = 3; }
		$articles = Shopware()->Modules()->Articles()->sGetArticlesByCategory($id);
		
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
		$id = $this->Request()->getParam('articleId');
		$article = Shopware()->Modules()->Articles()->sGetArticleById($id);

		$article['articleName'] = utf8_encode($article['articleName']);
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
		$id = $this->Request()->getParam('articleId');
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
		$articleID = $this->Request()->getParam('articleID');
		Shopware()->System()->_POST["sVoteName"] = $this->utf8decode(Shopware()->System()->_POST["sVoteName"]);
		Shopware()->System()->_POST["sVoteSummary"] = $this->utf8decode(Shopware()->System()->_POST["sVoteSummary"]);
		Shopware()->System()->_POST["sVoteComment"] = $this->utf8decode(Shopware()->System()->_POST["sVoteComment"]);
		Shopware()->Modules()->Articles()->sSaveComment($articleID);

		$this->jsonOutput('{success: true}');
	}
	
	/**
	 * addArticleToCartAction()
	 *
	 * Fuegt einen Artikel zum Warenkorb hinzu
	 *
	 * @access public
	 * @param {int} $_GET['articleID']
	 * @return {string} json string
	 */
	public function addArticleToCartAction()
	{
		$id = $this->Request()->getParam('ordernumber');
		$amount = $this->Request()->getParam('amount');

		$insertId = Shopware()->Modules()->Basket()->sAddArticle($id, $amount);
		
		$sql = "SELECT * FROM s_order_basket AS ob
			    LEFT JOIN s_articles AS a ON ob.articleID = a.id
			    LEFT JOIN s_articles_supplier AS s ON a.supplierID = s.id  
			    WHERE ob.id = ?
			    AND ob.sessionID = ?";
		
		$row = Shopware()->Db()->fetchRow($sql, array(
			$insertId,
			Shopware()->SessionID(),
		));
		
		$imgs = Shopware()->Modules()->Articles()->sGetArticlePictures($row['articleID'], true, 1);
		if(isset($imgs['src']) && !empty($imgs['src'][1])) {
			$row['image_url'] = $this->stripBasePath($imgs['src'][1]);
		}
		$row['supplierName'] = $row['name'];
		$row['amount'] = $row['price'] * $row['quantity'];
		$row['articlename'] = utf8_encode($row['articlename']);
		
		$this->jsonOutput(array('sArticle' => $row));
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
		$id = $this->Request()->getParam('id');
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
		$id = $this->Request()->getParam('articleId');
		
		$remove = Shopware()->Modules()->Basket()->sDeleteArticle($id);
		
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
					if(!empty($site['link'])) {
						preg_match('/\?sViewport=ticket&sFid=([0-9])/i', $site['link'], $id);
						$forms = Shopware()->Modules()->CmsSupport()->sConstruct($id[1]);
						if($forms) {
							$forms = Shopware()->Modules()->CmsSupport()->sELEMENTS;
						}
					}
					$output[] = array(
						'name'      => utf8_encode($site['description']),
						'content'   => $site['html'],
						'groupName' => $name . ' (' . $count . ' Seiten)',
						'form'      => $forms,
						'link'      => $site['link'],
						'sFid'      => $id[1]
					);
					$forms = array();
					Shopware()->Modules()->CmsSupport()->sELEMENTS = null;
				}
			}
		}
		$this->jsonOutput(array('sStatics' => $output));
	}

	/**
	 * processFormAction
	 *
	 * Verarbeitet Formulare
	 *
	 * @return void
	 */
	public function processFormAction() {
		if(!empty($this->Request()->Submit)) {
			die('Form submitted');
		} else {
			die('Form NOT submitted');
		}
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
		$this->jsonOutput($userData);
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
		$userloggedin = Shopware()->Modules()->Admin()->sCheckUser();
		$this->jsonOutput($userloggedin);
	}
	
	/**
	 * loginUserAction()
	 *
	 * Loggt einen Benutzer ein
	 *
	 * @access public
	 * @return {string} Benutzerdaten
	 */
	public function loginUserAction() 
	{
		if($this->Request()->isPost()) {
			$checkUser = Shopware()->Modules()->Admin()->sLogin();
		}
		
		$this->jsonOutput($checkUser);
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
		return $url = preg_replace("/http:\/\/".Shopware()->Config()->BasePath."/i", '', $url);
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
		die(json_encode($json_str));
	}
	
	/**
     * checkForMobileDevice()
     *
     * Untersucht den User Agent nach Mobilen Endgeraeten
     *
     * @access private
     * @return {string} $device - mobile oder desktop
     */
    private function checkForMobileDevice() 
    {
    	$agent = $_SERVER['HTTP_USER_AGENT'];
    	$device = 'desktop';
    	
    	if(stristr($agent,'ipad') || stristr($agent,'iphone') || strstr($agent,'iphone') || stristr($agent,'android')) {
    		$device = 'mobile';
    	}
		return $device;
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