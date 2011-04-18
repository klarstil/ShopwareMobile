/*	REGISTER APPLICATION	
	-------------------------------------------- */
Ext.regApplication({
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

/*	APP HELPERS	
	-------------------------------------------- */
App.Helpers = {
	
	// Send post request
	postRequest: function(url, params, callback, scope) {
		this.request(url, 'POST', params, callback, scope);
	},
	
	// Send get request
	getRequest: function(url, params, callback, scope) {
		this.request(url, 'GET', params, callback, scope);
	},
	
	// generell request method
	request: function(url, method, params, callback, scope) {
		scope = scope || this;
		Ext.Ajax.request({
			url: url,
			method: method,
			disableCaching: false,
			params: params,
			success: function(response, options) {
				try {
					this.data = Ext.util.JSON.decode(response.responseText)
				} catch(err) {
					Ext.Msg.alert('Fehler', 'Es ist ein Fehler bei einen AJAX-Request aufgetreten, bitte versuchen Sie es sp&auml;er erneut.');
				}
				
				if(Ext.isFunction(callback)) {
					callback.call(scope, this.data);
				}
			}
		});
	}
};

/*	REGISTER NAMESPACES	
	-------------------------------------------- */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');

/*	REGISTER MODELS	
	-------------------------------------------- */
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
		url: '/MobileTemplate/getPromotionCarousel',
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
		url: '/MobileTemplate/getMainCategories',
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
		url: '/MobileTemplate/getArticlesByCategoryId',
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
		{ name: 'date', type: 'date' },
		{ name: 'description_long', type: 'string' },
		{ name: 'supplierName', type: 'string' },
		{ name: 'articleName', type: 'string' },
		{ name: 'price', type: 'string' },
		{ name: 'image_url', type: 'string' },
		{ name: 'sVoteComments', type: 'array' },
		{ name: 'sDownloads', type: 'array' },
		{ name: 'sLinks', type: 'array' },
		{ name: 'images', type: 'array' }
	],
	proxy: {
		type: 'ajax',
		url: '/MobileTemplate/getArticleDetails',
		reader: {
			type: 'json',
			root: 'sArticle'
		}
	}
});

Ext.regModel('Picture', {
	fields: [
		{ name: 'image_url', type: 'string' },
	],
	proxy: {
		type: 'ajax',
		url: '/MobileTemplate/getArticleImages',
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
		url: '/AjaxSearch/jsonSearch',
		reader: {
			type: 'json',
			root: 'sResults'
		}
	}
});

Ext.regModel('Static', {
	fields: [
		{ name: 'description', type: 'string' },
		{ name: 'html', type: 'string' }
	],
	proxy: {
		type: 'ajax',
		url: '/MobileTemplate/getInfoSites',
		reader: {
			type: 'json',
			root: 'sStatics'
		}
	}
})

/*	REGISTER STORES	
	-------------------------------------------- */
App.stores.Categories = new Ext.data.Store({
	model: 'MainCategories',
	autoLoad: true
});

App.stores.Promotions = new Ext.data.Store({
	model: 'Promotion',
	autoLoad: true
});

App.stores.Listing = new Ext.data.Store({
	model: 'Articles'
});

App.stores.Detail = new Ext.data.Store({
	model: 'Detail'
});

App.stores.Picture = new Ext.data.Store({
	model: 'Picture'
});

App.stores.Search = new Ext.data.Store({
	model: 'Search'
});

App.stores.Info = new Ext.data.Store({
	model: 'Static',
	autoLoad: true
});

/*	REGISTER CONTROLLERS	
	-------------------------------------------- */
/* Categories controller */
Ext.regController('categories', {
    show: function(options) {
    	var store, rec;
    	store = options.store;
    	rec = store.getAt(options.idx);
    	
    	App.stores.Listing.load({
    		params: {
    			categoryId: rec.data.id
    		}
    	});
    	Ext.getCmp('shop').setActiveItem('listing', 'slide');
    }
});

/* Detail controller */
Ext.regController('detail', {
	show: function(options) {
		var store, rec, pictures;
		store = options.store;
		rec = store.getAt(options.idx);
		
		App.stores.Detail.load({
			params: {
				articleId: rec.data.articleID
			}
		});
		
		App.stores.Picture.load({
			params: {
				articleId: rec.data.articleID
			},
			scope: this,
			callback: function() {
				pictures = new App.views.Shop.pictures;
				
				Ext.getCmp('detail').add(pictures);
			}
		});
		
		this.segBtn = new Ext.SegmentedButton({
			id: 'detailSegBtn',
			allowMultiple: false,
			ui: 'light',
			items: [{
				text: 'Detail',
				pressed: true
			}, {
				text: 'Kommentare'
			}, {
				text: 'Bilder'
			}],
			listeners: {
				toggle: function(pnl, btn, pressed) {
					if(pressed === true) {
						if(btn.text === 'Detail') {
							Ext.getCmp('detail').setActiveItem('detailInfo', 'fade');
						}
						if(btn.text === 'Kommentare') {
							Ext.getCmp('detail').setActiveItem('votes', 'fade');
						}
						if(btn.text === 'Bilder') {
							Ext.getCmp('detail').setActiveItem('pictures', 'fade');
						}
					}
					Ext.getCmp('detailInfo').doLayout();
				}
			}
		});
		
		// modify toolbar
		var toolbar = Ext.getCmp('shop_toolbar');
		toolbar.add({xtype: 'spacer'}, this.segBtn);
		toolbar.doLayout();
		
		if(options.searchCall) {
			Ext.getCmp('viewport').setActiveItem(0);
			Ext.getCmp('shop').setActiveItem('listing');
		}
		
		Ext.getCmp('shop').setActiveItem('listing');
		Ext.getCmp('listing').setActiveItem('detail', 'slide');
		Ext.getCmp('detail').setActiveItem('detailInfo');
	},
	
	hide: function(options) {
		Ext.getCmp('detailSegBtn').destroy();
	}
});

App.CartClass = Ext.extend(Ext.util.Observable, {
	
	//Properties
	articleCount: 0,
	amount: 0.0,

	constructor: function() {
		
		Ext.apply(this, {
			items: new Ext.util.MixedCollection
		});
		
		this.addEvents('datachanged');
		App.CartClass.superclass.constructor.call(this);
	},
	
	// loads the whole basket and adds it into the MixedCollection
	load: function() {
		var items = this.items, scope = this;
		App.Helpers.postRequest('/MobileTemplate/getBasket', {}, function(data) {
			Ext.each(data.content, function(rec) {
				scope.amount = (rec.priceNumeric * rec.quantity) + scope.amount;
				scope.articleCount++;
				items.add(rec);
			});
			
			scope.changeBadgeText(scope.articleCount);
			scope.fireEvent('datachanged', this);
		});
	},
	
	// adds one given article into the MixedCollection
	add: function() {
		var rec = App.stores.Detail.getAt(0), scope = this;
		
		App.Helpers.postRequest('/MobileTemplate/addArticleToCart', {
			articleId: rec.data.ordernumber
		}, function(data) {
			var item = scope.items.findBy(function(data) {
				if(data.ordernumber == rec.data.ordernumber) {
					return true;
				}
			}, scope);
			
			if(item) {
				item.quantity = parseInt(item.quantity) + 1;
				item.amount = Math.round((parseFloat(item.priceNumeric) * parseInt(item.quantity)) * 100) / 100;
			} else {
				scope.items.add(data.sArticle);
				scope.articleCount++;
				scope.changeBadgeText(scope.articleCount);
			}
			scope.fireEvent('datachanged', scope);
		});
		this.fireEvent('datachanged', this);
	},
	
	// remove one given article from the MixedCollection
	remove: function(idx) {
		var scope = this, items = this.items;
		App.Helpers.postRequest('/MobileTemplate/removeArticleFromCart', {
			articleId: idx
		}, function(data) {
			items.removeByKey(idx);
			scope.articleCount--;
			scope.changeBadgeText(scope.articleCount);
			scope.fireEvent('datachanged', scope);
		});
	},
	
	// remove all articles from the MixedCollection
	removeAll: function() {
		var scope = this, items = this.items;
		
		App.Helpers.postRequest('/MobileTemplate/deleteBasket', {}, function(data) {
			if(data.success === true) {
				
				// reset cart state
				this.items.clear();
				this.changeBadgeText(0);
				this.amount = 0.0;
				this.articleCount = 0;
				
				this.fireEvent('datachanged', this);
			} else {
				Ext.Msg.alert('Fehler', 'Es ist ein Fehler bei einen AJAX-Request aufgetreten, bitte versuchen Sie es sp&auml;er erneut.');
			}
		});
		
		this.fireEvent('datachanged', this);	
	},
	
	getCount: function() {
		return this.articleCount;
	},
	
	changeBadgeText: function(val) {
		var cartBtn = Ext.getCmp('viewport').getCartButton();
		cartBtn.setBadge(val);
		return true;
	}
});

App.stores.Cart = new App.CartClass();

/*	XTEMPLATES	
	-------------------------------------------- */
App.views.Shop.detailTpl = new Ext.XTemplate(
	'<tpl for=".">',
	
		// Image
		'<tpl if="image_url">',
			'<div class="image" style="background-image: url({image_url})">&nbsp;</div>',
		'</tpl>',
		
		// Infos
		'<div class="info">',
			'<strong class="name">{articleName}</strong>',
			'<span class="supplier">von {supplierName}</span>',
			'<span class="ordernumber">Bestell-Nr.: {ordernumber}</span>',
			'<strong class="price">{price} &euro;*</strong>',
			'<span class="tax">Preise inkl. gesetzlicher MwSt. zzgl. Versandkosten</span>',
		'</div>',
		'<div class="clear">&nbsp;</div>',
	'</tpl>'
);

App.views.Shop.descTpl = new Ext.XTemplate(
	'<tpl for=".">',
		'<div class="clear">&nbsp;</div>',
		'<div class="desc">',
			'<h2>Beschreibung:</h2>',
			'<p>{description_long}</p>',
		'</div>',
	'</tpl>'
);

App.views.Shop.emptyTpl = new Ext.XTemplate(
	'<div class="emptyComments">',
		'<p>',
			'Es liegen zur Zeit keine Kommentare f&uuml;r diesen Artikel vor.',
		'</p>',
	'</div>', {
		compiled: true
	}
);

App.views.Shop.commentsTpl = new Ext.XTemplate(
	'<tpl for=".">',
		'<tpl for="sVoteComments">',
			'<div class="comment">',
				'<div class="stars star{points}"></div>',
				'<h2 class="headline"><strong>{headline}</strong></h2>',
				'<span class="name">von {name}</span>',
				'<div class="desc top"><div class="inner">{comment}</div>',
			'</div>',
		'</tpl>',
	'</tpl>', { compiled: true }
);

App.views.Cart.indexTpl = new Ext.XTemplate(
	'<tpl for="items.items">',
		'<div class="item" rel="{ordernumber}">',
			'<div class="image" style="background-image: url({image_url})"></div>',
			'<div class="info">',
				'<span class="supplier">{supplierName}</span>',
				'<strong class="name">{articlename}</strong>',
				'<span class="ordernumber"><strong>Bestell-Nr.:</strong> {ordernumber}</span>',
				'<span class="quantity"><strong>Anzahl:</strong> {quantity}x {price} &euro;</span>',
				'<strong class="price">{amount} &euro;</strong>',
			'</div>',
			'<div class="clear">&nbsp;</div>',
			'<div class="action">',
				'<div class="x-button x-button-decline round x-iconalign-left deleteBtn" rel="{id}">',
					'<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAC8ElEQVR42u3aT0iTYRzA8XcztTaMdhihpYJYztRmhw4RHSU6FPbHg1JdKm9F4Emiuphk0CW6CF3aSuwf/REDMeiSRFCEIf7JbBc1kkZqkebm1vewwXh43mS97/a+i+cHn9vDeL97X/c++L5aPB43kxMlaMQRA46iHi5oZjLzwwpwGiHEYHRWcAvFdgx24izmYeZEcB9ldgouSMQuIhMTxQuzos2IbUMYmZwIHqHM6uDGNc7sD8ynKfqX6H54rQp24IHOAa5iAGdwDE1rYh2acRUzkM0vNFkV7MQIxFnCdXgMfO4ejOv8ct+Ew6rgYckt6KMJt5J8tGJRclnftVvwMxM2DA6UY1oSHLAoGPLgh4aDgSKEJMG3M/03nIdyVMGHqhRjEGcQflQZtEtyhqN4KllbCY8ZwSXoxghC+Cz4DXF+JtcaFEJEdquTrJ3ES5w0EuxGJxaRC7OKUfj/NbgBX5FLs4QeeNMNLkUfosi1mccpONIJbkcYuTrvUZ1O8D6cQxvOI4AFiPMdPQhmQQCPsQxxFtCHAIK4jNJ0gh0pNDRL9rcxXMImuLPABS96Jccxid1wwY3C9C5pkX7wcayDliWF6JIcxwRqxfWZCD4hBG/GNmyHR+dbLoYPlXDrXF1b4EMF8oXgazrBddkOrsNzfMIUelEsRO/A65TNQrfwheVhL4YTa8bQZdfgQ5hDcqZQIwQfEPbeH1AELWEDLgqbiTd2DT6ImZSgcUnwfuFX9i02Qktw4YoQ/Op/D+5QwSpYBatgFayCVbAKVsEqWAWrYBWsglWwClbBKlgFq2AVrILVP+LlwbNIzoRO8AqS804IXo8LQvCQXYNrMIRvCKNf8kaeH6MIJ9bdgVN4mNaAWYTxBTfsGQx4UIs6eHUel5ajHj7k67zhVwE/qqHZKbjFggfinZYEJ6YdBVkMdmPAyuA5PEEAwSwYxLIFwdaOCs5AcEsOBO80M/gwphGz8UulW80M9uAelmx4dufQASe0tfwBaKrLkw66AkcAAAAASUVORK5CYII=" />',
				'</div>',
			'</div>',
		'</div>',
	'</tpl>'
);

App.views.Cart.emptyTpl = new Ext.XTemplate(
	'<div class="emptyCart">',
		'<p>',
			'In Ihren Warenkorb befinden sich zur Zeit noch keine Artikel.',
		'</p>',
		'<p>',
			'Entdecken Sie Ihr Wunschprodukt im <strong>Shop</strong> oder finden Sie ein spezielles Produkt &uuml;ber die integrierte <strong>Suche</strong>.',
		'</p>',
	'</div>',
	{
		compiled: true
	}
);

/*	MAIN VIEWPORT PANEL	
	-------------------------------------------- */
App.views.Viewport = Ext.extend(Ext.TabPanel, {
    fullscreen: true,
    id: 'viewport',
    cls: 'viewport',
    ui: 'dark',
    layout: 'card',
    cardSwitchAnimation: {
        type: 'slide',
        direction: 'left'
    },
    
    tabBar: {
        id: 'tabbar',
        dock: 'bottom',
        layout: {
            pack: 'center'
        }
    },
    listeners: {
    	scope: this,
    	cardswitch: function() {
    		Ext.getCmp('detailInfo').doLayout();
    	}
    },
    
    initComponent: function () {
        Ext.apply(this, {
            items: [
            	new App.views.Shop.index,
            	new App.views.Search.index,
            	new App.views.Cart.index,
            	new App.views.Account.index,
            	new App.views.Info.index
            ]
        });
        this.constructor.superclass.initComponent.call(this);
    },
    
    getCartButton: function () {
        return this.tabBar.items.getAt(2)
    }
});

/*	MAIN SHOP PANEL
	-------------------------------------------- */
App.views.Shop.index = Ext.extend(Ext.Panel, {
    id: 'shop',
    title: 'Shop',
    iconCls: 'home',
    layout: 'card',
    initComponent: function () {
        Ext.apply(this, {
            items: [new App.views.Shop.home, new App.views.Shop.listing]
        });
        App.views.Shop.index.superclass.initComponent.call(this);
    }
});

/* Panel */
App.views.Shop.home = Ext.extend(Ext.Panel, {
	id: 'home',
	scroll: 'vertical',
	layout: 'vbox',
	initComponent: function() {
		 Ext.apply(this, {
            items: [
            	new App.views.Shop.logo,
            	new App.views.Shop.promotions,
            	new App.views.Shop.categories
            ]
        });
        App.views.Shop.home.superclass.initComponent.call(this);
	}
});

/* Logo */
App.views.Shop.logo = Ext.extend(Ext.Panel, {
	id: 'logo',
	scroll: false,
	autoHeight: true,
	initComponent: function() {
		App.views.Shop.logo.superclass.initComponent.call(this);
	}
});

/* Promotions carousel */
App.views.Shop.promotions = Ext.extend(Ext.Carousel, {
	id: 'promotion',
	store: App.stores.Promotions,
	height: 150,
	width: '100%',
	direction: 'horizontal',
	style: 'border-bottom: 1px solid #c7c7c7',
	/*listeners: {
		scope: this,
		afterrender: function(cmp) {
			cmp.body.on('dblclick', function() {
				var idx = Ext.getCmp('promotion').getActiveIndex();
				Ext.dispatch({
					controller: 'detail',
					action: 'show',
					idx: idx,
					store: App.stores.Promotions
				});
				
				Ext.getCmp('backBtn').setHandler(function() {
					Ext.getCmp('shop').setActiveItem('home', { type: 'slide', direction: 'right' });
					Ext.getCmp('listing').setActiveItem(0);
				});
			});
		}
	}, */
	initComponent: function() {
		
		this.store.on({
			scope: this,
			load: function() {
				Ext.getCmp('promotion').doLayout();
			}
		});
		
		var items = this.getPromotionItems(this.store);
		
		Ext.apply(this, {
			items: [items]
		});
		this.doLayout();
		
		App.views.Shop.promotions.superclass.initComponent.call(this);
	},
	
	getPromotionItems: function(store) {
		var items = [];
		store.each(function(rec) {
			items.push({
				html: '<div class="slideArticle"><div class="art_thumb" style="background-image: url('+rec.get('img_url')+')"></div><div class="name">'+rec.get('name')+'</div><div class="price">'+rec.get('price')+' &euro;</div><div class="desc">'+rec.get('desc')+'</div></div>',
				cls: 'slideArticle',
			});
		});
		return items;
	}
});

/* Main Categories list */
App.views.Shop.categories = Ext.extend(Ext.List, {
	id: 'categories',
	store: App.stores.Categories,
	scroll: false,
	loadingText: 'L&auml;dt...',
	itemTpl: '<strong>{name}</strong> <span class="count">({count} Artikel)</span><tpl if="desc"><div class="desc">{desc}</div></tpl>',
	listeners: {
		scope: this,
		selectionchange: function(selModel, recs) {
			selModel.deselect(recs);
		},
		itemtap: function(pnl, idx, el, event) {
			Ext.dispatch({
				controller: 'categories',
				action: 'show',
				idx: idx,
				store: App.stores.Categories
			});
		}
	},
	initComponent: function() {
		App.views.Shop.categories.superclass.initComponent.call(this);
	}
});

/* Product listing */
App.views.Shop.listing = Ext.extend(Ext.Panel, {
	id: 'listing',
	layout: 'card',
	initComponent: function() {
		Ext.apply(this, {
			dockedItems: [new App.views.Shop.toolbar],
			items: [new App.views.Shop.listingList, new App.views.Shop.detailPnl] 
		});
		App.views.Shop.listing.superclass.initComponent.call(this);
	}
});

App.views.Shop.listingList = Ext.extend(Ext.List, {
	id: 'listingList',
	fullscreen: true,
	store: App.stores.Listing,
	itemTpl: '<div class="image"<tpl if="image_url"> style="background-image:url({image_url})"</tpl>></div><strong>{articleName}</strong><span class="price">{price} &euro;</span><div class="desc">{description_long}</div>',
	listeners: {
		scope: this,
		active: function(cmp) {
			cmp.scroller.scrollTo({
			    x: 0,
			    y: 0
			});
		},
		itemtap: function(pnl, idx, el, event) {
			Ext.dispatch({
				controller: 'detail',
				action: 'show',
				idx: idx,
				store: App.stores.Listing
			});
		}
	},
	initComponent: function() {
		App.views.Shop.listingList.superclass.initComponent.call(this);
	}
});

App.views.Shop.toolbar = Ext.extend(Ext.Toolbar, {
	id: 'shop_toolbar',
	dock: 'top',
	initComponent: function() {
		Ext.apply(this, {
			items: [{
				id: 'backBtn',
				xtype: 'button',
				text: 'Zur&uuml;ck',
				ui: 'back',
				scope: this,
				handler: this.onBackBtn
			}]
		});
		
		App.views.Shop.toolbar.superclass.initComponent.call(this);
	},
	
	onBackBtn: function() {
		try {
			this.ownerCt.layout.prev({
	            type: 'slide',
	            direction: 'right'
	        });
        } catch(err) {
        	Ext.getCmp('shop').setActiveItem('home', {direction: 'right', type: 'slide'});
        }
	}
});

/* Detail */
App.views.Shop.detailPnl = Ext.extend(Ext.Panel, {
	id: 'detail',
	layout: 'card',
		listeners: {
		scope: this,
		beforedeactivate: function() {
			Ext.dispatch({
				controller: 'detail',
				action: 'hide'
			});
		},
	},
	initComponent: function() {
		Ext.apply(this, {
			items: [
				new App.views.Shop.info,
				new App.views.Shop.comments
			]
		})
		App.views.Shop.detailPnl.superclass.initComponent.call(this);
	}
});

/* General article information panel */
App.views.Shop.info = Ext.extend(Ext.Panel, {
	id: 'detailInfo',
	layout: 'vbox',
	autoHeight: '100%',
	scroll: 'vertical',
	listeners: {
		scope: this,
	},
	initComponent: function() {
		Ext.apply(this, {
			items: [new App.views.Shop.detail, new App.views.Shop.buyBtn, new App.views.Shop.desc]
		});
		App.views.Shop.info.superclass.initComponent.call(this);
	}	
});

/* Detail view */
App.views.Shop.detail = Ext.extend(Ext.DataView, {
	id: 'teaser',
	store: App.stores.Detail,
	tpl: App.views.Shop.detailTpl,
	itemSelector: '#buyBtn',
	scroll: false,
	autoWidth: true,
	
	initComponent: function() {
	
		this.store.on({
			scope: this,
			datachanged: this.onDataChanged
		});
		
		App.views.Shop.detail.superclass.initComponent.call(this);
	},
	
	onDataChanged: function(store) {
		this.refresh();
	}
});

App.views.Shop.buyBtn = Ext.extend(Ext.Button, {
	id: 'buyBtn',
	ui: 'confirm round',
	text: 'In den Warenkorb',
	handler: function() {
		App.stores.Cart.add();
	},
	scope: this,
	initComponent: function() {
		App.views.Shop.buyBtn.superclass.initComponent.call(this);
	}
});

App.views.Shop.desc = Ext.extend(Ext.DataView, {
	id: 'desc',
	scroll: false,
	autoHeight: true,
	store: App.stores.Detail,
	tpl: App.views.Shop.descTpl,
	itemSelector: '.superingo',
	initComponent: function() {
		App.views.Shop.desc.superclass.initComponent.call(this);
	}
});

/* Comments view */
App.views.Shop.comments = Ext.extend(Ext.DataView, {
	id: 'votes',
	store: App.stores.Detail,
	tpl: App.views.Shop.commentsTpl,
	itemSelector: '.headline',
	emptyText: 'Super Ingo',
	
	initComponent:  function() {
		
		this.store.on({
			datachanged: this.onDataChanged,
			scope: this
		});
	
		App.views.Shop.comments.superclass.initComponent.call(this);
	},
	
	onDataChanged: function(store) {
		this.update(store);
		this.refresh();
	},
	
	update: function(store) {
		var item = store.getAt(0);
		if(item.data.sVoteComments.length > 0) {
			this.tpl = App.views.Shop.commentsTpl;
		} else {
			this.tpl = App.views.Shop.emptyTpl;
		}
		App.views.Shop.comments.superclass.update.apply(this, arguments);
	}
});

/* Pictures carousel */
App.views.Shop.pictures = Ext.extend(Ext.Carousel, {
	id: 'pictures',
	store: App.stores.Picture,
	width: '100%',
	direction: 'horizontal',
	initComponent: function() {
		
		this.store.addListener('datachanged', this.getImages);
		
		var items = this.getImages(this.store);
		
		Ext.apply(this, {
			items: [items]
		});
		this.doLayout();
		
		App.views.Shop.pictures.superclass.initComponent.call(this);
	},
	getImages: function(store) {
		var items = [];
		
		store.each(function(rec) {
			items.push({
				html: '<div class="img_container" style="background-image: url('+ rec.get('image_url') +')"></div>',
				cls: 'slideArticle'
			});
		});
		
		return items;
	}
});

/*	MAIN SEARCH PANEL	
	-------------------------------------------- */
App.views.Search.index = Ext.extend(Ext.Panel, {
	id: 'search',
	title: 'Suche',
	iconCls: 'search',
	layout: 'card',
	html: 'Suche',
	initComponent: function() {
		Ext.apply(this, {
			dockedItems: [new App.views.Search.toolbar],
			items: [new App.views.Search.list]
		});
		App.views.Search.index.superclass.initComponent.call(this);
	}
});

/*	SEARCH PANEL - TOOLBAR	
	-------------------------------------------- */
App.views.Search.toolbar = Ext.extend(Ext.Toolbar, {
	ui: 'dark',
	dock: 'top',
	initComponent: function() {
		Ext.apply(this, {
			items: [{
				id: 'searchfield',
				xtype: 'searchfield',
				name: 'search_query',
				autoFocus: true,
				hasFocus: true,
				width: '65%',
				placeHolder: 'Ihr Suchbegriff',
				listeners: {
					scope: this,
					keyup: this.onKeyUp
				}
			}, { xtype: 'spacer' }, {
				id: 'searchBtn',
				xtype: 'button',
				text: 'Suchen',
				ui: 'action small',
				scope: this,
				handler: this.onSearch
			}]
		});

		this.constructor.superclass.initComponent.call(this);
	},
	
	onKeyUp: function(cmp, event) {
		var val = cmp.getValue();
		if(event.browserEvent.keyCode == 13) {
			cmp.blur();
			this.onSearch(val);
		}
	},
	
	onSearch: function(val) {
		App.stores.Search.load({
			params: {
				sSearch: val
			}
		});
	},
});

App.views.Search.list = Ext.extend(Ext.List, {
	store: App.stores.Search,
	itemTpl: '<div class="image" style="background-image:url({image})"></div><strong class="name">{name}</strong><span class="price">{price} &euro;</span>',
	itemtap: this.onItemTap,
	scope: this,
	initComponent: function() {
		
		this.store.on({
			scope: this,
			datachanged: this.onDataChanged
		});
		App.views.Search.list.superclass.initComponent.call(this);
	},
	
	onDataChanged: function(store) {
		this.refresh();
	},
	
	onItemTap: function(view, idx, item, event) {
		Ext.dispatch({
			controller: 'detail',
			action: 'show',
			idx: idx,
			store: this.store,
			searchCall: true
		})
	}
	
});

/*	MAIN CART PANEL	
	-------------------------------------------- */
App.views.Cart.index = Ext.extend(Ext.Panel, {
	id: 'cart',
	title: 'Warenkorb',
	iconCls: 'cart',
	autoHeight: true,
	scroll: 'vertical',
	initComponent: function() {
	
		this.toolbar = new Ext.Toolbar({
			dock: 'top',
			title: this.title
		});
	
		this.checkoutBtn = new Ext.Button({
			id: 'checkout',
			ui: 'confirm',
			text: 'Zur Kasse gehen',
			disabled: true,
			style: 'margin: 0.5em'
		});
		
		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [new App.views.Cart.list, this.checkoutBtn]
		});
		App.views.Cart.index.superclass.initComponent.call(this);
	}
});

App.views.Cart.list = Ext.extend(Ext.Panel, {
	id: 'cartlist',
	scroll: 'vertical',
	layout: 'fit',
	autoHeight: true,
	flex: 1,
	initComponent: function() {
		
		Ext.apply(this, {
			tpl: App.views.Cart.indexTpl,
			data: App.stores.Cart,
			store: App.stores.Cart,
			autoHeight: true,
			scroll: false,
			listeners: {
				el: {
	                tap: this.onDeleteBtn,
	                delegate: '.deleteBtn',
	                scope: this
	            },
	            scope: this
	        }
		});
		
		this.store.on({
            datachanged: this.onDataChanged,
            scope: this
        });
		
		App.views.Cart.list.superclass.initComponent.call(this);
	},
	
	onDataChanged: function(store) {
		console.log('yes');
		this.update(this.store);
	},
	
	update: function (store) {
		if(store.items.length) {
			this.tpl = App.views.Cart.indexTpl;
			this.hideCheckoutBtn(false);
		} else {
			this.tpl = App.views.Cart.emptyTpl;
			this.hideCheckoutBtn(true);
		}
        App.views.Cart.list.superclass.update.apply(this, arguments);
    },
	
	onDeleteBtn: function(event, el) {
		var el = Ext.get(el), val;
		val = el.dom.attributes[1].nodeValue;
		App.stores.Cart.remove(val);
		return false;
	},
	
	hideCheckoutBtn: function(state) {
		var btn = Ext.getCmp('checkout');
		if(state === true) {
			btn.hide()
		} else {
			btn.show();
		}
	}
});

/*	MAIN ACCOUNT PANEL	
	-------------------------------------------- */
App.views.Account.index = Ext.extend(Ext.Panel, {
	id: 'account',
	title: 'Registierung',
	iconCls: 'user',
	layout: 'card',
	scroll: false,
	flex: 1,
	initComponent: function() {
	
		this.toolbar = new Ext.Toolbar({
			dock: 'top',
			title: this.title
		});
		
		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [new App.views.Account.register]
		});
		App.views.Account.index.superclass.initComponent.call(this);
	}
});

App.views.Account.register = Ext.extend(Ext.form.FormPanel, {
	id: 'register',
	autoHeight: true,
	scroll: 'vertical',
	items: [
		{
			xtype: 'fieldset',
			title: 'Pers&ouml;nliche Angaben',
			defaults: {
				labelWidth: '38%'
			},
			items: [
				{
		    		xtype: 'selectfield',
		    		label: 'Ich bin',
		    		required: true,
		    		name: 'iam',
		    		options: [
		    			{ text: 'Privatkunde', value: 'private' },
		    			{ text: 'Firma', value: 'company' }
		    		]
		    	}, {
		    		xtype: 'selectfield',
		    		label: 'Anrede',
		    		required: true,
		    		name: 'salutation',
		    		options: [
		    			{ text: 'Herr', value: 'mr' },
		    			{ text: 'Frau', value: 'mrs' }
		    		]
		    	}, {
		    		xtype: 'textfield',
		    		label: 'Vorname',
		    		required: true,
		    		placeHolder: 'Max'
		    	}, {
		    		xtype: 'textfield',
		    		label: 'Nachname',
		    		required: true,
		    		placeHolder: 'Mustermann'
		    	}, {
		    		xtype: 'emailfield',
		    		label: 'E-Mail',
		    		required: true,
		    		placeHolder: 'me@shopware.de'
		    	}, {
		    		xtype: 'passwordfield',
		    		label: 'Passwort',
		    		required: true,
		    	}, {
		    		xtype: 'textfield',
		    		label: 'Telefon',
		    		required: true,
		    		placeHolder: '02555997500'
		    	}, {
		    		xtype: 'datepickerfield',
		    		label: 'Geburtstag',
		    		picker: {
		    			name: 'birthday',
		    			yearFrom: 1900,
		    			yearTo: 1999,
		    			dayText: 'Tag',
		    			yearText: 'Jahr',
		    			monthText: 'Monat',
		    			slotOrder: ['day', 'month', 'year']
		    		}
		    	}
			]
		},{
			xtype: 'fieldset',
			title: 'Ihre Adresse',
			defaults: {
				labelWidth: '38%'
			},
			items: [
				{
					xtype: 'textfield',
					label: 'Stra&szlig;e',
					required: true
				}, {
					xtype: 'textfield',
					label: 'Hausnr.',
					required: true
				}, {
					xtype: 'textfield',
					label: 'PLZ',
					required: true
				}, {
					xtype: 'textfield',
					label: 'Ort',
					required: true,
				}, {
					xtype: 'selectfield',
					label: 'Land',
					required: true,
					name: 'country',
					options: [
						{text: 'Deutschland', value: 'germany'},
						{text: '&Ouml;sterreich', value: 'austria'},
						{text: 'Schweiz', value: 'swiss'}
					]
				}
			]
		}, {
			xtype: 'button',
			text: 'Registierung absenden',
			style: 'margin: 0.5em',
			ui: 'confirm',
			disabled: true
		}
    ],
	initComponent: function() {
		App.views.Account.register.superclass.initComponent.call(this);
	}
});

/*	MAIN INFO PANEL	
	-------------------------------------------- */
App.views.Info.index = Ext.extend(Ext.Panel, {
	id: 'info',
	title: 'Informationen',
	iconCls: 'info',
	layout: 'card',
	initComponent: function() {
		
		this.toolbar = new Ext.Toolbar({
			dock: 'top',
			title: 'Informationen',
			id: 'info_toolbar',
			items: [{
				xtype: 'button',
				id: 'info_backBtn',
				text: 'Zur&uuml;ck',
				handler: this.onBackBtn,
				ui: 'back',
				hidden: true
			}]
		});
		
		Ext.apply(this, {
			dockedItems: [this.toolbar],
			items: [new App.views.Info.list, new App.views.Info.Detail]
		});
		App.views.Info.index.superclass.initComponent.call(this);
	},
	
	onBackBtn: function() {
		Ext.getCmp('info').getToolbar().setTitle('Informationen');
		Ext.getCmp('info').setActiveItem('static_list', { type: 'slide', direction: 'right' });
	},
	getToolbar: function() {
		return this.toolbar;
	}
});

App.views.Info.list = Ext.extend(Ext.List, {
	store: App.stores.Info,
	itemTpl: '{description}',
	id: 'static_list',
	listeners: {
		scope: this,
		activate: function() {
			var backbtn = Ext.getCmp('info_backBtn');
			backbtn.hide();
		},
		deactivate: function() {
			var backbtn = Ext.getCmp('info_backBtn');
			backbtn.show();
		}
	},
	initComponent: function() {
		
		this.on({
			scope: this,
			itemtap: this.onItemTap
		})
	
		App.views.Info.list.superclass.initComponent.call(this);
	},
	onItemTap: function(pnl, idx, item, event) {
		var item = App.stores.Info.getAt(idx);
		var detail = Ext.getCmp('infoDetail');
		detail.update('<div class="inner">'+item.data.html+'</div>');
		
		Ext.getCmp('info').getToolbar().setTitle(item.data.description);
		Ext.getCmp('info').setActiveItem('infoDetail', { type: 'slide' });
	},
});

App.views.Info.Detail = Ext.extend(Ext.Panel, {
	id: 'infoDetail',
	height: '100%',
	scroll: 'vertical'
});