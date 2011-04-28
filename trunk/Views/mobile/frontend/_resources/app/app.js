/**
 * ----------------------------------------------------------------------
 * app.js
 *
 * Register the application, set up router for history support
 * and provides request urls
 *
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * ----------------------------------------------------------------------
 */

Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');

/* Register application */
Ext.regApplication({

	/* Basic settings */
	name: 'App',
	glossOnIcon: false,
	autoInitViewport: true,
	
	/* History settings */
	basePath: '',
	defaultUrl: '#home',
	useHistory: true,

    launch: function () {
    	this.viewport = new App.views.Viewport;
    	App.stores.Cart.load();
    }
});

/* Set up router for history support */
Ext.Router.draw(function(map) {
	map.connect('home', { controller: 'home', action: 'show' });
	map.connect('category/:index', { controller: 'category', action: 'show' });
	map.connect('detail/:articleID', { controller: 'detail', action: 'show' });

	/* Fallback route - would match route like http://example.com/#basket/show to 'basket' controllers 'show' action */
	map.connect(':controller/:action');
});

/**
 * Providing request urls - needed for native application
 * */
App.RequestURL = {
	getPromotions: App.basePath + '/MobileTemplate/getPromotionCarousel',
	getCategories: App.basePath + '/MobileTemplate/getMainCategories',
	getArticle:    App.basePath + '/MobileTemplate/getArticlesByCategoryId',
	getDetail:     App.basePath + '/MobileTemplate/getArticleDetails',
	getPictures:   App.basePath + '/MobileTemplate/getArticleImages',
	getSearch:     App.basePath + '/AjaxSearch/jsonSearch',
	getInfo:       App.basePath + '/MobileTemplate/getInfoSites',
	getBasket:     App.basePath + '/MobileTemplate/getBasket',
	addArticle:    App.basePath + '/MobileTemplate/addArticleToCart',
	addBundle:     App.basePath + '/MobileTemplate/addBundleToCart',
	removeArticle: App.basePath + '/MobileTemplate/removeArticleFromCart',
	deleteBasket:  App.basePath + '/MobileTemplate/deleteBasket',
	addComment:    App.basePath + '/MobileTemplate/addComment'
};