/**
 * ----------------------------------------------------------------------
 * app.js
 *
 * Registriert die Applikation, richtet den Router ein und
 * setzt die Request URLs und Namespaces
 *
 * @link http://www.shopware.de
 * @package Plugins
 * @author S.Pohl <stp@shopware.de>
 * ----------------------------------------------------------------------
 */

// Set namespaces
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');

// Register application
Ext.regApplication({

	// Basic setup
	name: 'App',
	glossOnIcon: false,
	autoInitViewport: true,
	
	// History support
	basePath: '',
	defaultUrl: '#',
	useHistory: true,

    launch: function () {
    	this.viewport = new App.views.Viewport;
    	App.stores.Cart.load();

    },
    isPhone: function () {
		if(Ext.is.Phone)
			return true;
	    
		return false;
    }
});

// Set up router for history support
Ext.Router.draw(function(map) {

	//Fallback route - would match route like http://example.com/#basket/show to 'basket' controllers 'show' action
	map.connect(':controller/:action');
});

// Building up the request urls - needed for native app
App.RequestURL = {

	// Basic + Listing
	getPromotions: App.basePath + '/MobileTemplate/getPromotionCarousel',
	getCategories: App.basePath + '/MobileTemplate/getMainCategories',
	getArticle:    App.basePath + '/MobileTemplate/getArticlesByCategoryId',
	getDetail:     App.basePath + '/MobileTemplate/getArticleDetails',
	getPictures:   App.basePath + '/MobileTemplate/getArticleImages',
	getSearch:     App.basePath + '/AjaxSearch/jsonSearch',
	getInfo:       App.basePath + '/MobileTemplate/getInfoSites',

	// Basket
	getBasket:     App.basePath + '/MobileTemplate/getBasket',
	addArticle:    App.basePath + '/MobileTemplate/addArticleToCart',
	addBundle:     App.basePath + '/MobileTemplate/addBundleToCart',
	removeArticle: App.basePath + '/MobileTemplate/removeArticleFromCart',
	deleteBasket:  App.basePath + '/MobileTemplate/deleteBasket',

	// Detail
	addComment:    App.basePath + '/MobileTemplate/addComment'
};