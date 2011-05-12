/**
 * @file stores.js
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * @date 11-05-11
 */
App.stores.Categories = new Ext.data.Store({
	model: 'MainCategories',
	autoLoad: true
});
App.stores.CategoriesTree = new Ext.data.TreeStore({
	model: 'Categories',
	filterOnLoad: false,
	sortOnLoad: false,
	clearOnLoad: true
});

App.stores.Promotions = new Ext.data.Store({
	model: 'Promotion',
	autoLoad: true
});

App.stores.Listing = new Ext.data.Store({
	model: 'Articles',
	remoteSort: true,
	remoteFilter: true,
	pageSize: 12
});

App.stores.Detail = new Ext.data.Store({
	model: 'Detail'
});

App.stores.Picture = new Ext.data.Store({
	model: 'Picture'
});

App.stores.Search = new Ext.data.Store({
	model: 'Search',
	pageSize: 12
});

App.stores.Info = new Ext.data.Store({
	model: 'Static',
	autoLoad: true,
	sorter: 'name',

	getGroupString: function(record) {
		return record.get('groupName');
	}
});

App.stores.UserData = new Ext.data.Store({
	model: 'UserData'
});

App.CartClass = Ext.extend(Ext.util.Observable, {

	/**
	 * Variables
	 * @private
	 */
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
		var me = this, items = me.items;
		if(me.items.length) {
			me.items.clear();
		}
		
		App.Helpers.postRequest(App.RequestURL.getBasket, {}, function(data) {
			me.loopArticles(data.content);
		});
	},
	
	// adds one given article into the MixedCollection
	add: function(options) {
		var me = this;
		if(Ext.isDefined(options.sAdd)) {
			options.sOrdernumber = options.sAdd;
		}
		App.Helpers.postRequest(App.RequestURL.addArticle, {
			ordernumber: options.sOrdernumber,
			amount: options.sQuantity
		}, function(data) {
			var item = me.items.findBy(function(data) {
				if(data.ordernumber ==  options.sOrdernumber) {
					return true;
				}
			}, me);

			// Fire event to refresh card list
			App.Helpers.postRequest(App.RequestURL.getBasket, {}, function(data) {
				me.loopArticles(data.content);
			});
		});
		this.fireEvent('datachanged', this);
	},

	// adds a given bundle article to the basket
	addBundle: function(ordernumber, id) {
		var me = this;
		App.Helpers.postRequest(App.RequestURL.addBundle, {
			ordernumber: ordernumber,
			id: id
		}, function(data) {
			if(data === false) {
				Ext.Msg.alert('Fehler', 'Das ausgew&auml;hlte Bundle konnte nicht hinzugef&uuml;gt werden. Bitte probieren Sie es sp&auml;ter noch einmal.');
			} else {
				me.load();
			}
		})
	},
	
	// remove one given article from the MixedCollection
	remove: function(idx, ordernumber) {
		var me = this, items = me.items;
		App.Helpers.postRequest(App.RequestURL.removeArticle, {
			articleId: idx,
			orderNumber: ordernumber
		}, function(data) {
			console.log(data);
			items.removeByKey(idx);
			me.articleCount--;
			me.refreshAmount();
			me.changeBadgeText(me.articleCount);
			me.fireEvent('datachanged', me);
		});
	},
	
	// remove all articles from the MixedCollection
	removeAll: function(bundle) {
		var me = this, items = me.items;
		App.Helpers.postRequest(App.RequestURL.deleteBasket, {}, function(data) {
			if(data.success === true) {
				
				// reset cart state
				items.clear();

				// only change badge if it's not a bundle
				if(!Ext.isDefined(bundle)) {
					me.changeBadgeText(0);
				}
				me.amount = 0;
				me.articleCount = 0;
				
				me.fireEvent('datachanged', me);
			} else {
				Ext.Msg.alert('Fehler', 'Es ist ein Fehler bei einen AJAX-Request aufgetreten, bitte versuchen Sie es sp&auml;er erneut.');
			}
		});

	},

	loopArticles: function(data) {
		var me = this, items = me.items;

		/* Clear cart state */
		if(me.items.length) { me.items.clear(); }
		me.articleCount = 0;
		me.amount = 0;

		/* Loop through the articles */
		Ext.each(data, function(rec) {
			me.amount += parseFloat(rec.priceNumeric) * ~~rec.quantity;
			me.articleCount++;
			items.add(rec);
		});
		this.fireEvent('datachanged', this);
		this.changeBadgeText(me.articleCount);
		return true;
	},
	
	getCount: function() {
		return this.articleCount;
	},

	refreshAmount: function() {
		var me = this, el;
		App.Helpers.postRequest(App.RequestURL.basketAmount, {}, function(data) {
			me.amount = data.totalAmount;
			el = Ext.get('amount-display');

			if(el) {
				el.setHTML(((Math.round(me.amount * 100) / 100) + '&nbsp;&euro;*'));
			}
		});
	},
	
	changeBadgeText: function(val) {
		var cartBtn = Ext.getCmp('viewport').getCartButton();
		cartBtn.setBadge(val);
		return true;
	},

	/* Debug function */
	_debugAddExampleArticles: function() {
		var me = this;
		var articles = [
			'SW10009'/*,
			'SW10010',
			'SW10011',
			'SW10012',
			'SW10014',
			'SW10015',
			'SW10016',
			'SW10017',
			'SW10018',
			'SW10019',
			'SW10020',
			'SW10021',
			'SW10022',
			'SW10023',
			'SW10024',
			'SW10025',
			'SW10026',
			'SW10027',
			'SW10028',
			'SW10029',
			'SW10030',
			'SW10031',
			'SW10032',
			'SW10034',
			'SW10035',
			'SW10036',
			'SW10037',
			'SW10038',
			'SW10039',
			'SW10040',
			'SW10041',
			'SW10042',
			'SW10043',
			'SW10044',
			'SW10045',
			'SW10046',
			'SW10047',
			'SW10048' */
		];

		Ext.each(articles, function(article) {
			me.add( { sOrdernumber: article } );
		});
	}
});

App.stores.Cart = new App.CartClass();