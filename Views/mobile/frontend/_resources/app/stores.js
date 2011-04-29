/**
 * ----------------------------------------------------------------------
 * stores.js
 *
 * Contains the application stores
 *
 * @link http://www.shopware.de
 * @author S.Pohl <stp@shopware.de>
 * ----------------------------------------------------------------------
 */

App.stores.Categories = new Ext.data.Store({
	model: 'MainCategories',
	autoLoad: true,
});
App.stores.CategoriesTree = new Ext.data.TreeStore({
	model: 'Categories',
	filterOnLoad: false,
	sortOnLoad: false
});

App.stores.Promotions = new Ext.data.Store({
	model: 'Promotion',
	autoLoad: true
});

App.stores.Listing = new Ext.data.Store({
	model: 'Articles',
	remoteSort: true,
	remoteFilter: true,
	currentPage: true,
	pageSize: 12
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
	autoLoad: true,
	sorter: 'name',

	getGroupString: function(record) {
		return record.get('groupName');
	}
});

/**
 * TODO: Konfigurator-Support einbauen
 * Bei Konfigurator-Artikel kommt es zur Zeit noch zu Konflikten bei der jetzigen Implementierung....
 */
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
		var me = this, items = me.items;
		if(me.items.length) {
			me.items.clear();
		}
		App.Helpers.postRequest(App.RequestURL.getBasket, {}, function(data) {
			Ext.each(data.content, function(rec) {
				me.amount = (rec.priceNumeric * rec.quantity) + me.amount;
				me.articleCount++;
				items.add(rec);
			});
			me.changeBadgeText(me.articleCount);
			me.fireEvent('datachanged', this);
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

			if(item) {
				item.quantity = parseInt(item.quantity) + 1;
				item.amount = App.Helpers.number_format(Math.round((parseFloat(item.priceNumeric) * parseInt(item.quantity)) * 100) / 100, 2, ',', '.');
			} else {
				data.sArticle.amount = App.Helpers.number_format(data.sArticle.amount, 2, ',', '.');
				me.items.add(data.sArticle);
				me.articleCount++;
				me.changeBadgeText(me.articleCount);
			}
			me.fireEvent('datachanged', me);
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
	remove: function(idx) {
		var me = this, items = me.items;
		App.Helpers.postRequest(App.RequestURL.removeArticle, {
			articleId: idx
		}, function(data) {
			items.removeByKey(idx);
			me.articleCount--;
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

				// Only change badge if it's not a bundle
				if(!Ext.isDefined(bundle)) {
					me.changeBadgeText(0);
				}
				me.amount = 0.0;
				me.articleCount = 0;
				
				me.fireEvent('datachanged', me);
			} else {
				Ext.Msg.alert('Fehler', 'Es ist ein Fehler bei einen AJAX-Request aufgetreten, bitte versuchen Sie es sp&auml;er erneut.');
			}
		});

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