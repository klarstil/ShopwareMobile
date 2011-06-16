/**
 * ----------------------------------------------------------------------
 * models.js
 *
 * Provides the data structures for the application stores
 * ----------------------------------------------------------------------
 */

/**
 * Registers the application models to the global namespace
 * @class
 */
App.models = {};

/** Model for the promotion carousel */
App.models.Promotions = Ext.regModel('Promotion', {
	fields: [
		{ name: 'articleID', type: 'int' },
		{ name: 'id', type: 'int' },
		{ name: 'name', type: 'string' },
		{ name: 'supplier', type: 'string' },
		{ name: 'ordernumber', type: 'string' },
		{ name: 'desc', type: 'string' },
		{ name: 'img_url', type: 'string' },
		{ name: 'price', type: 'string' }
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getPromotions,
		reader: {
			type: 'json',
			root: 'promotion'
		}
	}
});

/** Model for the main categories - only used on the home view */
App.models.MainCategories = Ext.regModel('MainCategories', {
	fields: [
		{ name: 'id', type: 'int' },
		{ name: 'name', type: 'string' },
		{ name: 'desc', type: 'string' },
		{ name: 'sub', type: 'string'}
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getCategories,
		reader: {
			type: 'json',
			root: 'categories'
		}
	}
});
/** Model for the subcategories */
App.models.Categories = Ext.regModel('Categories', {
	idProperty: 'id',
	fields: [
		{ name: 'parentId', type: 'int' },
		{ name: 'text', type: 'string' },
		{ name: 'desc', type: 'string'},
		{ name: 'img', type: 'string' },
		{ name: 'count', type: 'int' },
		{ name: 'id', type: 'string' }
	],
	proxy: {
		type: 'ajax',
		url: '/MobileTemplate/getCategoriesTree',
		reader: {
			type: 'tree',
			root: 'categories'
		}
	}
});

/** Model for the article listing */
App.models.Articles = Ext.regModel('Articles', {
	fields: [
		{ name: 'articleID', type: 'int' },
		{ name: 'ordernumber', type: 'string' },
		{ name: 'datum', type: 'date' },
		{ name: 'instock', type: 'int' },
		{ name: 'description_long', type: 'string' },
		{ name: 'articleName', type: 'string' },
		{ name: 'price', type: 'string' },
		{ name: 'priceNumeric', type: 'float' },
		{ name: 'image_url', type: 'string' },
		{ name: 'priceStartingFrom', type: 'string' }
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getArticle,
		reader: {
			type: 'json',
			root: 'sArticles'
		}
	}
});

/** Model for the article details */
App.models.Detail = Ext.regModel('Detail', {
	fields: [
		{ name: 'articleID', type: 'int' },
		{ name: 'categoryID', type: 'int' },
		{ name: 'ordernumber', type: 'string' },
		{ name: 'additionaltext', type: 'string'},
		{ name: 'date', type: 'date' },
		{ name: 'description_long', type: 'string' },
		{ name: 'supplierName', type: 'string' },
		{ name: 'articleName', type: 'string' },
		{ name: 'price', type: 'string' },
		{ name: 'pseudoprice', type: 'string' },
		{ name: 'pseudopricePercent', type: 'array' },
		{ name: 'image_url', type: 'string' },
		{ name: 'small_image', type: 'string' },
		{ name: 'big_image', type: 'string' },
		{ name: 'sVoteComments', type: 'array' },
		{ name: 'sDownloads', type: 'array' },
		{ name: 'sLinks', type: 'array' },
		{ name: 'images', type: 'array' },
		{ name: 'sVariants', type: 'array'},
		{ name: 'sConfigurator', type: 'array'},
		{ name: 'sBundles', type: 'array' },
		{ name: 'priceNumeric', type: 'float'},
		{ name: 'pseudoPriceNumeric', type: 'float' },
		{ name: 'liveshoppingData', type: 'array' },
		{ name: 'purchaseunit', type: 'string' },
		{ name: 'referenceunit', type: 'string' },
		{ name: 'purchaseunit', type: 'string' },
		{ name: 'sUnit', type: 'array' },
		{ name: 'referenceprice', type: 'string'},
		{ name: 'mode', type: 'string' },
		{ name: 'instock', type: 'string' },
		{ name: 'laststock', type: 'string' },
		{ name: 'maxpurchase', type: 'string' },
		{ name: 'minpurchase', type: 'string' },
		{ name: 'purchasesteps', type: 'string' },
		{ name: 'sProperties', type: 'auto'}
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getDetail,
		reader: {
			type: 'json',
			root: 'sArticle'
		}
	}
});

/** Model for the article pictures */
App.models.Pictures = Ext.regModel('Picture', {
	fields: [
		{ name: 'small_picture', type: 'string' },
        { name: 'big_picture', type: 'string' },
		{ name: 'desc', type: 'string' }
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getPictures,
		reader: {
			type: 'json',
			root: 'images'
		}
	}
});

/** Model for the search function */
App.models.Search = Ext.regModel('Search', {
	fields: [
		{ name: 'articleID', type: 'int' },
		{ name: 'relevance', type: 'int' },
		{ name: 'price', type: 'string' },
		{ name: 'datum', type: 'string' },
		{ name: 'sales', type: 'string' },
		{ name: 'articleName', type: 'string' },
		{ name: 'description', type: 'string' },
		{ name: 'img', type: 'string'},
		{ name: 'type', type: 'string' },
		{ name: 'priceStartingFrom', type: 'string' }
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getSearch,
		reader: {
			type: 'json',
			root: 'sResults'
		}
	}
});

/** Model for the static pages */
App.models.Static = Ext.regModel('Static', {
	fields: [
		{ name: 'name', type: 'string' },
		{ name: 'groupName', type: 'string' },
		{ name: 'content', type: 'string' },
		{ name: 'form', type: 'array' },
		{ name: 'link', type: 'string'},
		{ name: 'sFid', type: 'int' }
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getInfo,
		reader: {
			type: 'json',
			root: 'sStatics'
		}
	}
});

/** Model for the user data */
App.models.UserData = Ext.regModel('UserData', {
	fields: [
		{ name: 'billingaddress', type: 'array' },
		{ name: 'additional', type: 'array' },
		{ name: 'shippingaddress', type: 'array'}
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getUserData,
		reader: {
			type: 'json',
			root: 'sUserData'
		}
	}
});/**
 * ----------------------------------------------------------------------
 * models.js
 *
 * Provides the data structures for the application stores
 * ----------------------------------------------------------------------
 */

/**
 * Registers the application models to the global namespace
 * @class
 */
App.models = {};

/** Model for the promotion carousel */
App.models.Promotions = Ext.regModel('Promotion', {
	fields: [
		{ name: 'articleID', type: 'int' },
		{ name: 'id', type: 'int' },
		{ name: 'name', type: 'string' },
		{ name: 'supplier', type: 'string' },
		{ name: 'ordernumber', type: 'string' },
		{ name: 'desc', type: 'string' },
		{ name: 'img_url', type: 'string' },
		{ name: 'price', type: 'string' }
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getPromotions,
		reader: {
			type: 'json',
			root: 'promotion'
		}
	}
});

/** Model for the main categories - only used on the home view */
App.models.MainCategories = Ext.regModel('MainCategories', {
	fields: [
		{ name: 'id', type: 'int' },
		{ name: 'name', type: 'string' },
		{ name: 'desc', type: 'string' },
		{ name: 'sub', type: 'string'}
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getCategories,
		reader: {
			type: 'json',
			root: 'categories'
		}
	}
});
/** Model for the subcategories */
App.models.Categories = Ext.regModel('Categories', {
	idProperty: 'id',
	fields: [
		{ name: 'parentId', type: 'int' },
		{ name: 'text', type: 'string' },
		{ name: 'desc', type: 'string'},
		{ name: 'img', type: 'string' },
		{ name: 'count', type: 'int' },
		{ name: 'id', type: 'string' }
	],
	proxy: {
		type: 'ajax',
		url: '/MobileTemplate/getCategoriesTree',
		reader: {
			type: 'tree',
			root: 'categories'
		}
	}
});

/** Model for the article listing */
App.models.Articles = Ext.regModel('Articles', {
	fields: [
		{ name: 'articleID', type: 'int' },
		{ name: 'ordernumber', type: 'string' },
		{ name: 'datum', type: 'date' },
		{ name: 'instock', type: 'int' },
		{ name: 'description_long', type: 'string' },
		{ name: 'articleName', type: 'string' },
		{ name: 'price', type: 'string' },
		{ name: 'priceNumeric', type: 'float' },
		{ name: 'image_url', type: 'string' },
		{ name: 'priceStartingFrom', type: 'string' }
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getArticle,
		reader: {
			type: 'json',
			root: 'sArticles'
		}
	}
});

/** Model for the article details */
App.models.Detail = Ext.regModel('Detail', {
	fields: [
		{ name: 'articleID', type: 'int' },
		{ name: 'categoryID', type: 'int' },
		{ name: 'ordernumber', type: 'string' },
		{ name: 'additionaltext', type: 'string'},
		{ name: 'date', type: 'date' },
		{ name: 'description_long', type: 'string' },
		{ name: 'supplierName', type: 'string' },
		{ name: 'articleName', type: 'string' },
		{ name: 'price', type: 'string' },
		{ name: 'pseudoprice', type: 'string' },
		{ name: 'pseudopricePercent', type: 'array' },
		{ name: 'image_url', type: 'string' },
		{ name: 'small_image', type: 'string' },
		{ name: 'sVoteComments', type: 'array' },
		{ name: 'sDownloads', type: 'array' },
		{ name: 'sLinks', type: 'array' },
		{ name: 'images', type: 'array' },
		{ name: 'sVariants', type: 'array'},
		{ name: 'sConfigurator', type: 'array'},
		{ name: 'sBundles', type: 'array' },
		{ name: 'priceNumeric', type: 'float'},
		{ name: 'pseudoPriceNumeric', type: 'float' },
		{ name: 'liveshoppingData', type: 'array' },
		{ name: 'purchaseunit', type: 'string' },
		{ name: 'referenceunit', type: 'string' },
		{ name: 'purchaseunit', type: 'string' },
		{ name: 'sUnit', type: 'array' },
		{ name: 'referenceprice', type: 'string'},
		{ name: 'mode', type: 'string' },
		{ name: 'instock', type: 'string' },
		{ name: 'laststock', type: 'string' },
		{ name: 'maxpurchase', type: 'string' },
		{ name: 'minpurchase', type: 'string' },
		{ name: 'purchasesteps', type: 'string' }
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getDetail,
		reader: {
			type: 'json',
			root: 'sArticle'
		}
	}
});

/** Model for the article pictures */
App.models.Pictures = Ext.regModel('Picture', {
	fields: [
		{ name: 'small_picture', type: 'string' },
        { name: 'big_picture', type: 'string' },
		{ name: 'desc', type: 'string' }
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getPictures,
		reader: {
			type: 'json',
			root: 'images'
		}
	}
});

/** Model for the search function */
App.models.Search = Ext.regModel('Search', {
	fields: [
		{ name: 'articleID', type: 'int' },
		{ name: 'relevance', type: 'int' },
		{ name: 'price', type: 'string' },
		{ name: 'datum', type: 'string' },
		{ name: 'sales', type: 'string' },
		{ name: 'articleName', type: 'string' },
		{ name: 'description', type: 'string' },
		{ name: 'img', type: 'string'},
		{ name: 'type', type: 'string' },
		{ name: 'priceStartingFrom', type: 'string' }
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getSearch,
		reader: {
			type: 'json',
			root: 'sResults'
		}
	}
});

/** Model for the static pages */
App.models.Static = Ext.regModel('Static', {
	fields: [
		{ name: 'name', type: 'string' },
		{ name: 'groupName', type: 'string' },
		{ name: 'content', type: 'string' },
		{ name: 'form', type: 'array' },
		{ name: 'link', type: 'string'},
		{ name: 'sFid', type: 'int' }
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getInfo,
		reader: {
			type: 'json',
			root: 'sStatics'
		}
	}
});

/** Model for the user data */
App.models.UserData = Ext.regModel('UserData', {
	fields: [
		{ name: 'billingaddress', type: 'array' },
		{ name: 'additional', type: 'array' },
		{ name: 'shippingaddress', type: 'array'}
	],
	proxy: {
		type: 'ajax',
		url: App.RequestURL.getUserData,
		reader: {
			type: 'json',
			root: 'sUserData'
		}
	}
});