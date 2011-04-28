/**
 * ----------------------------------------------------------------------
 * shop.js
 *
 * Views fuer das Kategorielisting und die Startseite
 * ----------------------------------------------------------------------
 */
Ext.ns('App.views.Viewport', 'App.views.Shop', 'App.views.Search', 'App.views.Cart', 'App.views.Account', 'App.views.Info');
App.views.Shop.index = Ext.extend(Ext.Panel, {
	id: 'shop',
	title: 'Shop',
	iconCls: 'home',
	layout: 'card',
	initComponent: function () {
		Ext.apply(App.views, {
			home: new App.views.Shop.home
		});
		Ext.apply(this, {
			items: [
				App.views.home
			]
		});
		App.views.Shop.index.superclass.initComponent.call(this);
	}
});

/* Shop - Startseite */
App.views.Shop.home = Ext.extend(Ext.Panel, {
	id: 'home',
	scroll: 'vertical',
	layout: 'vbox',

	initComponent: function() {
		var me = this,
			items;

		/* Shoplogo */
		me.logo = new Ext.Panel({
			id: 'logo',
			scroll: false,
			autoHeight: true
		});

		/* Einkaufsweltencarousel */
		me.promotions = new Ext.Carousel({
			id: 'promotions',
			store: App.stores.Promotions,
			height: 150,
			width: '100%',
			direction: 'horizontal',
			style: 'border-bottom: 1px solid #c7c7c7'
		});

		/* Hauptkategorien */
		me.list = new Ext.List({
			id: 'categories',
			store: App.stores.Categories,
			scroll: false,
			height: '100%',
			itemTpl: '<strong>{name}</strong><tpl if="desc"><div class="desc">{desc}</div></tpl>',
			listeners: {
				scope: this,
				selectionchange: me.onSelectionChange,
				itemtap: me.onItemTap
			}
		});

		/* Link zur normalen View */
		me.normalView = new Ext.Panel({
			fullscreen: false,
			cls: 'normalView',
			html: 'Zur normalen Ansicht wechseln',
			listeners: {
				scope: this,
				click: { el: 'body', fn: me.onNormalView }
			}
		});

		/* Render Einkaufswelten, wenn der Store geladen ist */
		me.promotions.store.on({
			scope: this,
			load: function() { me.promotions.doLayout() }
		});

		/* Einkaufswelten auslesen */
		items = this.getPromotionItems(me.promotions.store);
		me.promotions.add(items);

		Ext.apply(this, {
			items: [
				me.logo,
				me.promotions,
				me.list,
				me.normalView
			]
		});

		App.views.Shop.home.superclass.initComponent.call(this);
	},

	onItemTap: function(pnl, idx) {
		Ext.dispatch({
			controller: 'category',
			action: 'show',
			historyUrl: 'category/'+ idx,
			index: idx
		});
	},

	onSelectionChange: function(selModel, recs) {
		selModel.deselect(recs);
	},

	onNormalView: function() {
		window.location.href = App.RequestURL.useNormalSite;
	},

	getPromotionItems: function(store) {
		var items = [];
		store.each(function(rec) {
			items.push({
				html: '<div class="slideArticle"><div class="art_thumb" style="background-image: url(' + rec.get('img_url') + ')"></div><div class="name">' + rec.get('name') + '</div><div class="price">' + rec.get('price') + ' &euro;</div><div class="desc">' + rec.get('desc') + '</div></div>',
				cls: 'slideArticle'
			});
		});
		return items;
	}
});

App.views.Shop.listing = Ext.extend(Ext.Panel, {
	id: 'listing',
	layout: 'card',
	listeners: {
		scope: this,
		deactivate: function(me) {
			me.destroy();
		}
	},

	initComponent: function() {
		var me = this;
		
		/* Kategorietoolbar - Back Button */
		me.backBtn = new Ext.Button({
			id: 'backBtn',
			text: 'Zur&uuml;ck',
			ui: 'back',
			scope: this,
			handler: me.onBackBtn
		});

		/* Kategorietoolbar */
		me.toolbar = new Ext.Toolbar({
			id: 'shop_toolbar',
			dock: 'top',
			items: [me.backBtn]
		});

		App.views.Shop.listing.superclass.initComponent.call(me);
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
	},
	
	getToolbar: function() {
		return this.list.toolbar;
	}
});

App.views.Shop.artListing = Ext.extend(Ext.List, {
	id: 'artListing',
	store: App.stores.Listing,
	itemTpl: '<div class="image"<tpl if="image_url"> style="background-image:url({image_url})"</tpl>></div><strong>{articleName}</strong><span class="price">{price} &euro;</span><div class="desc">{description_long}</div>',
	listeners: {
		scope: this,
		activate: function(me) {
			me.scroller.scrollTo({
				x: 0,
				y: 0
			})
		},
		itemtap: function(me, idx) {
			var tmpRec = me.store.getAt(idx);
			Ext.dispatch({
				controller: 'detail',
				action: 'show',
				historyUrl: 'detail/'+tmpRec.data.articleID,
				articleID: tmpRec.data.articleID,
				store: me.store,
				type: 'slide',
				direction: 'left'
			});
		}
	},
	initComponent: function() {
		App.views.Shop.artListing.superclass.initComponent.call(this);
	}
});

/* Subcategory list */
App.views.Shop.subListing = Ext.extend(Ext.NestedList, {
	id: 'subListing',
	store: App.stores.CategoriesTree,
	scroll: false,
	height:  '100%',
	displayField: 'text',
	title: 'Kategorien',
	toolbar: { ui: 'dark' },
	getItemTextTpl: function(node) {
		return '<div class="info"><span class="title">{text}</span></div>'
			+ '<tpl if="desc"><p class="desc">{desc}</p></tpl>';
	},
	listeners: {
		scope: this,
		deactivate: function(me) {
			me.destroy();
		},
		leafitemtap: function(me, idx) {
			Ext.dispatch({
				controller: 'category',
				action: 'show',
				index: idx,
				store: me.store,
				last: true
			});
		}
	},
	initComponent: function() {
		App.views.Shop.subListing.superclass.initComponent.call(this);
	}
});