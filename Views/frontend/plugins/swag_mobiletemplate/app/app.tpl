<script type="text/javascript">
/**
 * ----------------------------------------------------------------------
 * app.js
 *
 * Register the application, set up router for history support
 * and provides request urls
 * ----------------------------------------------------------------------
 */


Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info', 'App.views.Checkout');

/** @private */
var userLoggedIn = false;

/** @private */
payments = payments.split('|');

/**
 * Register Application in global namespace
 *
 * @author S.Pohl info@shopware.de
 * @date 05-11-11
 * @class
 */
App = Ext.regApplication(
	/** @lends App# */
	{
		/** Name of the application */
		name: 'App',

		/** Path to icon - iOS only, Size 72px x 72px */
		icon: (!Ext.isEmpty(iconPath)) ? iconPath : false,

		/** Splashscreen - iOS only, Size 320px x 460px */
		phoneStartupScreen: (!Ext.isEmpty(startUpPath)) ? startUpPath : false,

		/** Set gloss on icon - iOS only */
		glossOnIcon: false,

		/** Auto create basic viewport */
		autoInitViewport: true,

		/** Is the user online */
		isUserOnline: true,

		/** Base path - will be needed for the native app */
		basePath: 'http://'+basePath,
		/** Default URL for the router */
		defaultUrl: '#home',
		/** Activate histroy support */
		useHistory: true,

		/**
		 * Will be called when the application is initialized
		 * @returns void
		 */
	    launch: function () {
			this.launched = true;
		    this.mainLaunch();
	    },

		/**
		 * Will be called if the application
		 * is packed as an native app
		 * @returns void
		 */
		mainLaunch: function() {
			var loadingMask, msg = false;

			/** Create basic viewport */
	    	this.viewport = new App.views.Viewport;

		    /** Load cart content from server */
	    	App.stores.Cart.load();

			/** Event listener which checks if the user is online */
			window.setInterval(function() {
				this.isUserOnline = navigator.onLine;

				if(!this.isUserOnline) {
					loadingMask = Ext.getCmp('viewport').setLoading(true);
					loadingMask.msg = '{s name="MobileGlobalConnectionLost" force}Verbindung unterbrochen{/s}';

					if(!msg) {
						msg = Ext.Msg.alert('{s name="MobileGlobalConnectionLost"}{/s}', '{s name="MobileGlobalConnectionLostText"}Bitte verbinden Sie sich wieder mit dem Internet um fortzufahren.{/s}', Ext.emptyFn);
					}
				} else {
					Ext.getCmp('viewport').setLoading(false);
					msg = false;
				}
			}, 1500);
		}
	}
);

/**
 * Register namespace for the application views
 *
 * @namespace
 */
App.views = {};

/**
 * Set up router for history support
 *
 * @param fn - The fn to call
 * @class
 */
App.router = Ext.Router.draw(function(map)
	/** @lends App.router# */
	{
		/** URL pattern to match the home controller */
		map.connect('home', { controller: 'home', action: 'show' });

		/** URL pattern to match the category controller */
		map.connect('category/:index', { controller: 'category', action: 'show' });

		/** URL pattern to match the detail controller */
		map.connect('detail/:articleID', { controller: 'detail', action: 'show' });

		/** Fallback route - would match route like http://example.com/#basket/show to 'basket' controllers 'show' action */
		map.connect(':controller/:action');
	}
);

/**
 * Provides the request urls which are needed for the native application
 */
App.RequestURL = {
	getPromotions: App.basePath + '/MobileTemplate/getPromotionCarousel',
	getCategories: App.basePath + '/MobileTemplate/getMainCategories',
	getArticle:    App.basePath + '/MobileTemplate/getArticlesByCategoryId',
	getDetail:     App.basePath + '/MobileTemplate/getArticleDetails',
	getPictures:   App.basePath + '/MobileTemplate/getArticleImages',
	getSearch:     App.basePath + '/MobileTemplate/search',
	getInfo:       App.basePath + '/MobileTemplate/getInfoSites',
	getBasket:     App.basePath + '/MobileTemplate/getBasket',
	addArticle:    App.basePath + '/checkout/addArticle',
	addBundle:     App.basePath + '/MobileTemplate/addBundleToCart',
	removeArticle: App.basePath + '/MobileTemplate/removeArticleFromCart',
	deleteBasket:  App.basePath + '/MobileTemplate/deleteBasket',
	addComment:    App.basePath + '/MobileTemplate/addComment',
	login:         App.basePath + '/MobileTemplate/login',
	register:      App.basePath + '/register/saveRegister',
	useNormalSite: App.basePath + '/useNormal',
	userLoggedIn:  App.basePath + '/MobileTemplate/isUserLoggedIn',
	getUserData:   App.basePath + '/MobileTemplate/getUserData',
	getPayment:    App.basePath + '/MobileTemplate/getPaymentMethods',
	saveOrder:     App.basePath + '/checkout/finish',
	basketAmount:  App.basePath + '/MobileTemplate/getBasketAmount',
	logout:        App.basePath + '/MobileTemplate/logout',
	confirm:       App.basePath + '/checkout/confirm',
	changePayment: App.basePath + '/account/savePayment',
	customSite:    App.basePath + '/custom/',
	getTree: 	   App.basePath + '/MobileTemplate/getCategoriesTree'
};
</script>