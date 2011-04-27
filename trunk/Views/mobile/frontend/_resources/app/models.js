Ext.regModel('Promotion', {
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

Ext.regModel('MainCategories', {
	fields: [
		{ name: 'id', type: 'int' },
		{ name: 'name', type: 'string' },
		{ name: 'desc', type: 'string' },
		{ name: 'count', type: 'int'}
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

Ext.regModel('Articles', {
	fields: [
		{ name: 'articleID', type: 'int' },
		{ name: 'ordernumber', type: 'string' },
		{ name: 'datum', type: 'date' },
		{ name: 'instock', type: 'int' },
		{ name: 'description_long', type: 'string' },
		{ name: 'articleName', type: 'string' },
		{ name: 'price', type: 'string' },
		{ name: 'image_url', type: 'string' }
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

Ext.regModel('Detail', {
	fields: [
		{ name: 'articleID', type: 'int' },
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
		{ name: 'liveshoppingData', type: 'array' }
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

Ext.regModel('Picture', {
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

Ext.regModel('Search', {
	fields: [
		{ name: 'articleID', type: 'int' },
		{ name: 'relevance', type: 'int' },
		{ name: 'price', type: 'string' },
		{ name: 'datum', type: 'string' },
		{ name: 'sales', type: 'string' },
		{ name: 'name', type: 'string' },
		{ name: 'description', type: 'string' },
		{ name: 'image', type: 'string'},
		{ name: 'type', type: 'string' }
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

Ext.regModel('Static', {
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