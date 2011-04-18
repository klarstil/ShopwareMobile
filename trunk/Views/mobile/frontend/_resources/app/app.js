Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');

Ext.regApplication({

	// Native app - set basepath here
	basePath: '',
    name: 'App',
    glossOnIcon: false,
    launch: function () {
    	this.viewport = new App.views.Viewport;
    	App.stores.Cart.load();

    },
    isPhone: function () {
		if(Ext.is.Phone) {
			return true;
		} else {
			return false;
		}
    }
});

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